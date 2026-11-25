/**
 * GUIRIRI SISTEMA HACIENDA V3 (ALCARAVAN) — Subidor de Imagenes (Edge Function imgbb-proxy + 0ms Offline Fallback)
 * Comprime en canvas antes de subir para proteger cuotas y ancho de banda.
 */
(function defineUploader(global) {
    "use strict";

    const Uploader = {
        /**
         * Comprime un archivo File a Base64 (DataURL JPEG) usando Canvas HTML5
         */
        comprimirImagen: function(file, maxAncho = 1600, calidad = 0.82) {
            return new Promise((resolve, reject) => {
                if (!file || !file.type || !file.type.startsWith('image/')) {
                    return reject(new Error('El archivo no es una imagen valida'));
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        let ancho = img.width;
                        let alto = img.height;

                        if (ancho > maxAncho || alto > maxAncho) {
                            if (ancho > alto) {
                                alto = Math.round((alto * maxAncho) / ancho);
                                ancho = maxAncho;
                            } else {
                                ancho = Math.round((ancho * maxAncho) / alto);
                                alto = maxAncho;
                            }
                        }

                        const canvas = document.createElement('canvas');
                        canvas.width = ancho;
                        canvas.height = alto;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, ancho, alto);

                        const dataUrl = canvas.toDataURL('image/jpeg', calidad);
                        resolve(dataUrl);
                    };
                    img.onerror = () => reject(new Error('Error al decodificar la imagen'));
                    img.src = e.target.result;
                };
                reader.onerror = () => reject(new Error('Error al leer el archivo'));
                reader.readAsDataURL(file);
            });
        },

        /**
         * Sube a ImgBB mediante la Edge Function imgbb-proxy de Supabase.
         * Por defecto lanza Error si falla la subida (para no guardar registros sin imagen).
         * Solo devuelve dataUrl base64 si options.allowOfflineFallback === true.
         */
        subirAImgBB: async function(file, options = {}) {
            const dataUrl = await this.comprimirImagen(file);
            const allowFallback = Boolean(options && options.allowOfflineFallback === true);

            if (!navigator.onLine) {
                if (allowFallback) {
                    console.warn('[Uploader] Sin internet: usando fallback base64 comprimida');
                    return dataUrl;
                }
                throw new Error('Sin conexion a internet. No se pudo subir la imagen a ImgBB.');
            }

            if (!global.supabaseClient || !global.supabaseClient.functions) {
                if (allowFallback) {
                    console.warn('[Uploader] Sin cliente Supabase: usando fallback base64');
                    return dataUrl;
                }
                throw new Error('Cliente de Supabase no disponible para invocar imgbb-proxy.');
            }

            const base64Data = dataUrl.split(',')[1];
            if (!base64Data) {
                throw new Error('No se pudo generar la imagen comprimida en Base64.');
            }

            const { data, error } = await global.supabaseClient.functions.invoke('imgbb-proxy', {
                body: { image: base64Data }
            });

            if (error) {
                if (allowFallback) {
                    console.warn('[Uploader] Error imgbb-proxy, usando fallback base64:', error);
                    return dataUrl;
                }
                throw new Error(error.message || 'Error invocando imgbb-proxy');
            }
            if (data && data.error) {
                if (allowFallback) {
                    console.warn('[Uploader] Respuesta error imgbb-proxy, usando fallback base64:', data.error);
                    return dataUrl;
                }
                throw new Error(data.error);
            }
            if (!data || typeof data.url !== 'string' || !data.url.startsWith('http')) {
                if (allowFallback) {
                    console.warn('[Uploader] URL invalida de imgbb-proxy, usando fallback base64:', data);
                    return dataUrl;
                }
                throw new Error('imgbb-proxy no devolvio una URL de imagen valida.');
            }

            console.log('[Uploader] Subida exitosa via imgbb-proxy:', data.url);
            return data.url;
        }
    };

    global.HaciendaUploader = Uploader;
})(typeof window !== 'undefined' ? window : this);
