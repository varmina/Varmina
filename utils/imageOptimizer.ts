
export const compressImage = async (file: File): Promise<File> => {
    // 1. Skip small files (already optimized) or non-images
    if (file.size < 500000 && file.type === 'image/webp') return file; // < 500KB and already WebP

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.src = url;

        img.onload = () => {
            // Cleanup URL object
            URL.revokeObjectURL(url);

            // 2. Calculate new dimensions (Max width 1920px)
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1920;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;

            // 3. Draw and Compress to WebP
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Canvas context not available"));
                return;
            }

            // Draw with smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    // 4. Return new file
                    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                        type: "image/webp",
                        lastModified: Date.now(),
                    });
                    resolve(newFile);
                } else {
                    reject(new Error("Compression failed"));
                }
            }, 'image/webp', 0.8); // 80% Quality
        };
        img.onerror = (error) => {
            URL.revokeObjectURL(url);
            reject(error);
        };
    });
};
