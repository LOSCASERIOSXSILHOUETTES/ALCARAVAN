/**
 * ALCARAVAN — Módulo de Autenticación, Sesión y Control de Acceso Granular (ACL)
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Baúl Offline SHA-256 + Supabase Auth)
 */
(function defineHaciendaAuth(global) {
    "use strict";

    const SESSION_KEY = 'hacienda_auth_session';
    const VAULT_KEY = 'hacienda_vault_users';

    // Generador de hash seguro SHA-256 para contraseñas en baúl offline
    async function hashPassword(text) {
        if (!crypto || !crypto.subtle) {
            try { return btoa(unescape(encodeURIComponent(text))); } catch (_) { return btoa(text); }
        }
        const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Baúl Offline de Credenciales (Persistencia local para 0ms sin internet)
    async function getVault() {
        try {
            const raw = localStorage.getItem(VAULT_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (_) {
            return [];
        }
    }

    async function saveVaultUser(email, password, userObj) {
        if (!email || !password) return;
        try {
            const vault = await getVault();
            const hash = await hashPassword(password);
            const normEmail = email.toLowerCase().trim();
            const idx = vault.findIndex(u => u.email === normEmail);
            const entry = {
                email: normEmail,
                hash: hash,
                user: userObj,
                updated_at: Date.now()
            };
            if (idx >= 0) {
                vault[idx] = entry;
            } else {
                vault.push(entry);
            }
            localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
        } catch (err) {
            console.warn('[HaciendaAuth] Error guardando usuario en baúl:', err);
        }
    }

    async function verifyVaultUser(email, password) {
        if (!email || !password) return null;
        try {
            const vault = await getVault();
            const hash = await hashPassword(password);
            const normEmail = email.toLowerCase().trim();
            const entry = vault.find(u => u.email === normEmail && u.hash === hash);
            return entry ? entry.user : null;
        } catch (_) {
            return null;
        }
    }

    function safeParsePerms(perms) {
        if (!perms) return {};
        if (typeof perms === 'object' && !Array.isArray(perms)) return perms;
        try { return JSON.parse(perms); } catch (_) { return {}; }
    }

    const Auth = {
        _user: null,
        _profile: null,

        init: async function() {
            // Sembrar credencial maestra inicial en el baúl si está vacío
            const vault = await getVault();
            if (vault.length === 0) {
                await saveVaultUser('systemsatrimg@gmail.com', 'Venezuela28754133', {
                    id: 'usr_superadmin_satrimg_001',
                    email: 'systemsatrimg@gmail.com',
                    user_metadata: {
                        nombre: 'Administrador General SATRIMG',
                        cargo: 'Superintendente Tributario Municipal',
                        rol: 'admin',
                        permisos: { admin_todo: true, admin_usuarios: true }
                    }
                });
            }

            // Restaurar sesión de localStorage
            try {
                const saved = localStorage.getItem(SESSION_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    this._user = parsed.user || parsed;
                    this._profile = parsed.profile || null;
                }
            } catch (e) {
                this._user = null;
                this._profile = null;
            }

            // Si hay cliente Supabase en línea, verificar sesión remota
            if (global.supabaseClient && typeof global.supabaseClient.auth?.getSession === 'function') {
                try {
                    const { data, error } = await global.supabaseClient.auth.getSession();
                    if (!error && data?.session?.user) {
                        this._user = data.session.user;
                        await this.cargarPerfil(this._user);
                    }
                } catch (err) {
                    console.warn('[HaciendaAuth] Falló verificación remota, usando sesión local:', err);
                }
            }

            if (this._user && !this._profile) {
                await this.cargarPerfil(this._user);
            }

            this.actualizarUI();
            return this.isLoggedIn();
        },

        cargarPerfil: async function(user) {
            if (!user) return null;
            let profile = null;

            // 1. Buscar en LocalForage a 0ms
            if (global.HaciendaStore) {
                const perfiles = global.HaciendaStore.get('user_profiles') || [];
                profile = perfiles.find(p => 
                    (p.user_id && String(p.user_id) === String(user.id)) ||
                    (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
                );
            }

            // 2. Si no está en LocalForage y hay red, consultar Supabase
            if (!profile && global.supabaseClient && navigator.onLine) {
                try {
                    const { data } = await global.supabaseClient
                        .from('user_profiles')
                        .select('*')
                        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
                        .limit(1)
                        .maybeSingle();

                    if (data) {
                        profile = data;
                        if (global.HaciendaStore) {
                            global.HaciendaStore.upsert('user_profiles', data).catch(() => {});
                        }
                    }
                } catch (_) {}
            }

            // 3. Fallback a metadata de Auth
            if (!profile) {
                const meta = user.user_metadata || {};
                profile = {
                    user_id: user.id || 'usr_local',
                    email: user.email,
                    nombre: meta.nombre || user.email?.split('@')[0] || 'Funcionario',
                    cargo: meta.cargo || 'Funcionario Público',
                    rol: meta.rol || (user.email?.toLowerCase().includes('admin') ? 'admin' : 'recaudador'),
                    permisos: safeParsePerms(meta.permisos),
                    activo: true
                };
            }

            this._profile = profile;
            this.guardarSesion();
            return profile;
        },

        guardarSesion: function() {
            if (this._user) {
                const sesion = {
                    user: this._user,
                    profile: this._profile,
                    rol: this.getRol(),
                    permisos: this.getPermisos()
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
            } else {
                localStorage.removeItem(SESSION_KEY);
            }
        },

        getUser: function() {
            return this._user;
        },

        getProfile: function() {
            return this._profile;
        },

        getRol: function() {
            return (this._profile?.rol || this._user?.user_metadata?.rol || 'recaudador').toLowerCase();
        },

        getPermisos: function() {
            return safeParsePerms(this._profile?.permisos || this._user?.user_metadata?.permisos);
        },

        isLoggedIn: function() {
            return !!this._user;
        },

        isFuncionario: function() {
            return this.isLoggedIn();
        },

        // Verificador Maestro de Permisos ACL
        hasPermission: function(permId) {
            if (!this.isLoggedIn()) return false;

            const rol = this.getRol();
            const email = (this._user?.email || '').toLowerCase();
            const perms = this.getPermisos();

            // Administrador o Superadmin tiene pase total
            if (rol === 'admin' || rol === 'superadmin' || perms.admin_todo === true || perms.admin === true || email === 'systemsatrimg@gmail.com') {
                return true;
            }

            // Permiso granular específico
            return perms[permId] === true;
        },

        // Iniciar Sesión (Sincronizado Supabase Auth + Fallback Baúl Offline)
        loginFuncionario: async function(email, password) {
            const cleanEmail = String(email || '').trim().toLowerCase();
            const cleanPass = String(password || '').trim();

            if (!cleanEmail || !cleanPass) {
                return { success: false, message: 'Ingresa correo institucional y contraseña.' };
            }

            let targetEmail = cleanEmail;
            if (targetEmail === 'admin' || targetEmail === 'satrimg') {
                targetEmail = 'systemsatrimg@gmail.com';
            }

            const esMasterAdmin = (targetEmail === 'systemsatrimg@gmail.com' || cleanEmail === 'admin' || cleanEmail === 'satrimg')
                               && (cleanPass === 'Venezuela28754133' || cleanPass === 'hacienda2026');

            // Modo en línea con Supabase Auth si tiene formato de correo válido
            if (global.supabaseClient && navigator.onLine && targetEmail.includes('@')) {
                try {
                    const { data, error } = await global.supabaseClient.auth.signInWithPassword({
                        email: targetEmail,
                        password: cleanPass
                    });

                    if (error) {
                        // Si son credenciales maestras de contingencia, usar pase offline directo sin bloquear
                        if (esMasterAdmin) {
                            return await this.loginOffline(targetEmail, cleanPass);
                        }
                        // Si da error de red, probar fallback al baúl offline
                        const msg = String(error.message || '').toLowerCase();
                        if (msg.includes('fetch') || msg.includes('network') || error.status === 0) {
                            return await this.loginOffline(targetEmail, cleanPass);
                        }
                        return { success: false, message: 'Credenciales incorrectas: ' + error.message };
                    }

                    if (data?.user) {
                        this._user = data.user;
                        await this.cargarPerfil(this._user);

                        if (this._profile && this._profile.activo === false) {
                            this.logout();
                            return { success: false, message: 'Tu cuenta ha sido desactivada por el Administrador Tributario.' };
                        }

                        // Guardar en baúl para permitir acceso 0ms offline posterior
                        await saveVaultUser(targetEmail, cleanPass, data.user);
                        this.actualizarUI();
                        return { success: true, user: this._user, profile: this._profile };
                    }
                } catch (err) {
                    console.warn('[HaciendaAuth] Error en login online, intentando offline:', err);
                    return await this.loginOffline(targetEmail, cleanPass);
                }
            }

            // Modo offline sin internet o credenciales maestras
            return await this.loginOffline(targetEmail, cleanPass);
        },

        loginOffline: async function(email, password) {
            // Verificar contra el baúl de hashes SHA-256
            const vaultUser = await verifyVaultUser(email, password);
            if (vaultUser) {
                this._user = vaultUser;
                await this.cargarPerfil(this._user);

                if (this._profile && this._profile.activo === false) {
                    this.logout();
                    return { success: false, message: 'Usuario desactivado por la administración.' };
                }

                this.actualizarUI();
                return { success: true, user: this._user, profile: this._profile, offline: true };
            }

            // Credenciales maestras locales de contingencia
            const esAdminEmail = (email === 'systemsatrimg@gmail.com' || email === 'admin@satrimg.gob.ve' || email === 'admin' || email === 'satrimg');
            const esAdminClave = (password === 'Venezuela28754133' || password === 'hacienda2026');

            if (esAdminEmail && esAdminClave) {
                this._user = {
                    id: 'usr_superadmin_satrimg_001',
                    email: 'systemsatrimg@gmail.com',
                    user_metadata: {
                        nombre: 'Administrador General SATRIMG',
                        cargo: 'Superintendente Tributario',
                        rol: 'admin',
                        permisos: { admin_todo: true, admin_usuarios: true }
                    }
                };
                await this.cargarPerfil(this._user);
                await saveVaultUser('systemsatrimg@gmail.com', 'Venezuela28754133', this._user);
                this.actualizarUI();
                return { success: true, user: this._user, profile: this._profile, offline: true };
            }

            return { success: false, message: 'Credenciales no encontradas en este equipo ni en Supabase.' };
        },

        // Registro de Funcionario en Supabase Auth y user_profiles
        registrarFuncionario: async function(email, password, { nombre, cargo, rol, permisos }) {
            const cleanEmail = String(email || '').trim().toLowerCase();
            const cleanPass = String(password || '').trim();

            if (!cleanEmail || !cleanPass) {
                return { success: false, message: 'Correo y contraseña son requeridos.' };
            }

            const perms = safeParsePerms(permisos);
            const userRole = rol || 'recaudador';

            let registeredUser = null;

            // 1. Registro en Supabase Auth
            if (global.supabaseClient && navigator.onLine) {
                try {
                    const { data, error } = await global.supabaseClient.auth.signUp({
                        email: cleanEmail,
                        password: cleanPass,
                        options: {
                            data: { nombre, cargo, rol: userRole, permisos: perms }
                        }
                    });
                    if (error) throw error;
                    registeredUser = data?.user;
                } catch (err) {
                    console.warn('[HaciendaAuth] Auth signUp falló o ya existe:', err.message);
                }
            }

            const userId = registeredUser?.id || ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'usr_' + Date.now());

            const nuevoPerfil = {
                user_id: userId,
                email: cleanEmail,
                nombre: nombre || cleanEmail.split('@')[0],
                cargo: cargo || 'Funcionario Público',
                rol: userRole,
                permisos: perms,
                activo: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // 2. Guardar en LocalForage a 0ms (Ley Sagrada)
            if (global.HaciendaStore) {
                await global.HaciendaStore.upsert('user_profiles', nuevoPerfil);
            }

            // 3. Guardar en Baúl Offline
            await saveVaultUser(cleanEmail, cleanPass, {
                id: userId,
                email: cleanEmail,
                user_metadata: nuevoPerfil
            });

            return { success: true, user: nuevoPerfil };
        },

        // Actualizar datos del usuario activo en la interfaz
        actualizarUI: function() {
            const elNombre = document.getElementById('erp-user-nombre');
            const elRol = document.getElementById('erp-user-rol');
            const user = this._profile || this._user;

            if (user) {
                if (elNombre) elNombre.innerText = user.nombre || user.email || 'Funcionario';
                if (elRol) elRol.innerText = (user.rol || 'Administrador').toUpperCase();
            }

            this.updateSidebarAcl();
        },

        // Filtrar botones del menú lateral según la matriz de permisos ACL
        updateSidebarAcl: function() {
            const navButtons = document.querySelectorAll('.nav-link[data-perm]');
            navButtons.forEach(btn => {
                const perm = btn.getAttribute('data-perm');
                if (perm) {
                    if (this.hasPermission(perm)) {
                        btn.classList.remove('hidden');
                    } else {
                        btn.classList.add('hidden');
                    }
                }
            });
        },

        logout: async function() {
            if (global.supabaseClient && typeof global.supabaseClient.auth?.signOut === 'function') {
                try { await global.supabaseClient.auth.signOut(); } catch (_) {}
            }
            this._user = null;
            this._profile = null;
            localStorage.removeItem(SESSION_KEY);
            if (typeof window !== 'undefined' && window.location) {
                window.location.reload();
            }
        },

        hashPassword: hashPassword
    };

    global.HaciendaAuth = Auth;
})(typeof window !== 'undefined' ? window : this);
