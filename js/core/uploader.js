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
         * Sube a ImgBB mediante la Edge Function imgbb-proxy de Supabase,
         * o devuelve la dataUrl base64 comprimida como fallback 0ms si esta offline.
         */
        subirAImgBB: async function(file) {
            const dataUrl = await this.comprimirImagen(file);

            if (!navigator.onLine || !global.supabaseClient || !global.supabaseClient.functions) {
                console.log('[Uploader] Modo Offline/Local: usando base64 comprimida');
                return dataUrl;
            }

            try {
                const base64Data = dataUrl.split(',')[1];
                const { data, error } = await global.supabaseClient.functions.invoke('imgbb-proxy', {
                    body: { image: base64Data }
                });

                if (error) {
                    throw new Error(error.message || 'Error invocando imgbb-proxy');
                }
                if (data && data.error) {
                    throw new Error(data.error);
                }
                if (data && data.url) {
                    console.log('[Uploader] Subida exitosa via imgbb-proxy:', data.url);
                    return data.url;
                }

                console.warn('[Uploader] imgbb-proxy no devolvio URL, usando fallback base64:', data);
                return dataUrl;
            } catch (err) {
                console.warn('[Uploader] Fallo con imgbb-proxy, usando fallback base64:', err);
                return dataUrl;
            }
        }
    };

    global.HaciendaUploader = Uploader;
})(typeof window !== 'undefined' ? window : this);
