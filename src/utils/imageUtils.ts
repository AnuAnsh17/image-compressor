export function resizeImageToPowerOfTwo(image: HTMLImageElement, maxSize: number = 512): Promise<{ width: number, height: number, data: Uint8ClampedArray }> {
    return new Promise((resolve) => {
        let width = image.width;
        let height = image.height;
        
        function nearestPowerOf2(n: number) {
            return Math.pow(2, Math.round(Math.log(n) / Math.log(2)));
        }

        let targetWidth = Math.min(nearestPowerOf2(width), maxSize);
        let targetHeight = Math.min(nearestPowerOf2(height), maxSize);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
        
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        resolve({
            width: targetWidth,
            height: targetHeight,
            data: imageData.data
        });
    });
}

export function splitChannels(data: Uint8ClampedArray): { r: Float32Array, g: Float32Array, b: Float32Array } {
    const len = data.length / 4;
    const r = new Float32Array(len);
    const g = new Float32Array(len);
    const b = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        r[i] = data[i * 4];
        g[i] = data[i * 4 + 1];
        b[i] = data[i * 4 + 2];
    }
    return { r, g, b };
}

export function mergeChannels(r: Float32Array, g: Float32Array, b: Float32Array, width: number, height: number): ImageData {
    const len = width * height;
    const data = new Uint8ClampedArray(len * 4);
    for (let i = 0; i < len; i++) {
        let vr = r[i];
        let vg = g[i];
        let vb = b[i];
        if (vr < 0) vr = 0; if (vr > 255) vr = 255;
        if (vg < 0) vg = 0; if (vg > 255) vg = 255;
        if (vb < 0) vb = 0; if (vb > 255) vb = 255;
        
        data[i * 4] = vr;
        data[i * 4 + 1] = vg;
        data[i * 4 + 2] = vb;
        data[i * 4 + 3] = 255;
    }
    return new ImageData(data as any, width, height);
}

export function grayscale(data: Uint8ClampedArray): Float32Array {
    const gray = new Float32Array(data.length / 4);
    for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return gray;
}

export function createImageDataFromGrayscale(gray: Float32Array, width: number, height: number): ImageData {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < gray.length; i++) {
        let val = gray[i];
        if (val < 0) val = 0;
        if (val > 255) val = 255;
        data[i * 4] = val;
        data[i * 4 + 1] = val;
        data[i * 4 + 2] = val;
        data[i * 4 + 3] = 255;
    }
    return new ImageData(data as any, width, height);
}

export function calculateMSE(original: Float32Array, reconstructed: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < original.length; i++) {
        const diff = original[i] - reconstructed[i];
        sum += diff * diff;
    }
    return sum / original.length;
}

export function calculatePSNR(mse: number, maxVal: number = 255): number {
    if (mse === 0) return Infinity;
    return 20 * Math.log10(maxVal) - 10 * Math.log10(mse);
}
