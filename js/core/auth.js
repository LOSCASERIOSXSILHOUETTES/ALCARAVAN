/**
 * GUIRIRI SISTEMA HACIENDA V3 — Autenticación y Control de Acceso (ACL)
 * Maneja sesión activa de Contribuyente o Funcionario de Hacienda.
 */
(function defineAuth(global) {
    "use strict";

    const Auth = {
        _sessionKey: 'hacienda_auth_session',
        _user: null,

        init: function() {
            try {
                const saved = localStorage.getItem(this._sessionKey);
                if (saved) {
                    this._user = JSON.parse(saved);
                }
            } catch (e) {
                this._user = null;
            }
            return this._user;
        },

        getUser: function() {
            return this._user;
        },

        isLoggedIn: function() {
            return !!this._user;
        },

        isFuncionario: function() {
            return this._user && (this._user.rol === 'admin' || this._user.rol === 'cajero' || this._user.rol === 'fiscal');
        },

        isContribuyente: function() {
            return this._user && this._user.rol === 'contribuyente';
        },

        // Login de Contribuyente (por RIF con normalización tolerante)
        loginContribuyente: function(rif) {
            const contribuyentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_contribuyentes') : [];
            const rifHelper = global.HaciendaRIF;
            const parsed = rifHelper ? rifHelper.parse(rif) : { tipo: 'J', numero: String(rif).replace(/\D/g, ''), full: String(rif) };
            const match = rifHelper ? rifHelper.findMatch(contribuyentes, parsed.tipo, parsed.numero) : contribuyentes.find(c => c.rif === parsed.full);

            if (!match) {
                return { success: false, message: 'Contribuyente no registrado con el RIF ' + (parsed.full || rif) + '.' };
            }

            this._user = {
                id: match.id,
                rif: match.rif,
                nombre: match.razon_social,
                correo: match.correo,
                rol: 'contribuyente'
            };
            localStorage.setItem(this._sessionKey, JSON.stringify(this._user));
            return { success: true, user: this._user };
        },

        // Login de Funcionario de Hacienda (Alcaldía)
        loginFuncionario: function(usuario, clave) {
            const u = String(usuario || '').trim().toLowerCase();
            const p = String(clave || '').trim();

            const esAdmin = (u === 'admin' || u === 'hacienda' || u === 'satrimg' || u === 'systemsatrimg');
            const claveAdminValida = (p === 'hacienda2026' || p === 'Venezuela28754133' || p === 'admin2026' || p === 'admin');

            const esCajero = (u === 'cajero');
            const claveCajeroValida = (p === 'caja2026' || p === 'cajero');

            if (esAdmin && claveAdminValida) {
                this._user = {
                    id: 1,
                    usuario: u,
                    nombre: 'Administrador Tributario (SATRIMG)',
                    rol: 'admin'
                };
                localStorage.setItem(this._sessionKey, JSON.stringify(this._user));
                return { success: true, user: this._user };
            } else if (esCajero && claveCajeroValida) {
                this._user = {
                    id: 2,
                    usuario: u,
                    nombre: 'Taquilla de Recaudación',
                    rol: 'cajero'
                };
                localStorage.setItem(this._sessionKey, JSON.stringify(this._user));
                return { success: true, user: this._user };
            }

            return { success: false, message: 'Credenciales de funcionario incorrectas.' };
        },

        logout: function() {
            this._user = null;
            localStorage.removeItem(this._sessionKey);
            if (typeof window !== 'undefined' && window.location) {
                window.location.reload();
            }
        }
    };

    global.HaciendaAuth = Auth;
})(typeof window !== 'undefined' ? window : this);
