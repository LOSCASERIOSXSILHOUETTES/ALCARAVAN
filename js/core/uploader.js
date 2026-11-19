/**
 * GUIRIRI SISTEMA HACIENDA V3 — Subidor de Imágenes (ImgBB + 0ms Offline Fallback)
 * Comprime en canvas antes de subir para proteger cuotas y ancho de banda.
 */
(function defineUploader(global) {
    "use strict";

    const Uploader = {
        /**
         * Comprime un archivo File a Base64 usando Canvas HTML5
         */
        comprimirImagen: function(file, maxAncho = 1280, calidad = 0.82) {
            return new Promise((resolve, reject) => {
                if (!file || !file.type.startsWith('image/')) {
                    return reject(new Error('El archivo no es una imagen válida'));
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        let ancho = img.width;
                        let alto = img.height;

                        if (ancho > maxAncho) {
                            alto = Math.round((alto * maxAncho) / ancho);
                            ancho = maxAncho;
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
         * Sube a ImgBB si hay internet, o devuelve la dataUrl base64 si está offline
         */
        subirAImgBB: async function(file, apiKey = null) {
            const dataUrl = await this.comprimirImagen(file);
            const key = apiKey || (global.HACIENDA_CONFIG && global.HACIENDA_CONFIG.IMGBB_API_KEY);

            // Si no hay internet o no hay key, devolver fallback 0ms directo
            if (!navigator.onLine || !key) {
                console.log('[Uploader] Modo Offline/Directo: usando base64 comprimida');
                return dataUrl;
            }

            try {
                const base64Data = dataUrl.split(',')[1];
                const formData = new FormData();
                formData.append('key', key);
                formData.append('image', base64Data);

                const response = await fetch('https://api.imgbb.com/1/upload', {
                    method: 'POST',
                    body: formData
                });

                const json = await response.json();
                if (json.success && json.data && json.data.url) {
                    console.log('[Uploader] Subida exitosa a ImgBB:', json.data.url);
                    return json.data.url;
                } else {
                    console.warn('[Uploader] ImgBB respondió con error, usando fallback base64:', json);
                    return dataUrl;
                }
            } catch (err) {
                console.warn('[Uploader] Fallo de red con ImgBB, usando fallback base64:', err);
                return dataUrl;
            }
        }
    };

    global.HaciendaUploader = Uploader;
})(typeof window !== 'undefined' ? window : this);
