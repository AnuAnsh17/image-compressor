export type CompressionMode = 'low-pass' | 'magnitude';

export function compressFFT(
    real: Float32Array,
    imag: Float32Array,
    width: number,
    height: number,
    ratio: number, // 0 to 1 (1 = keep all, 0 = keep none)
    mode: CompressionMode
): { real: Float32Array, imag: Float32Array, retained: number } {
    const total = width * height;
    const compReal = new Float32Array(real);
    const compImag = new Float32Array(imag);
    let retained = 0;

    if (ratio >= 1.0) {
        return { real: compReal, imag: compImag, retained: total };
    }

    if (mode === 'magnitude') {
        // Find threshold magnitude
        // For performance, we can sample or just sort magnitudes.
        // Full sort is O(N log N). For 512x512 it's 262k, sort takes a few ms.
        const mags = new Float32Array(total);
        for (let i = 0; i < total; i++) {
            mags[i] = real[i]*real[i] + imag[i]*imag[i];
        }
        const sortedMags = new Float32Array(mags).sort();
        const cutoffIndex = Math.floor(total * (1 - ratio));
        const threshold = sortedMags[cutoffIndex];

        for (let i = 0; i < total; i++) {
            if (mags[i] < threshold) {
                compReal[i] = 0;
                compImag[i] = 0;
            } else {
                retained++;
            }
        }
    } else if (mode === 'low-pass') {
        // Retain low frequencies
        // Note: the input real/imag are NOT shifted. 
        // Zero frequencies are at corners.
        // It's easier to shift, apply mask, then unshift.
        // Or calculate distance to corners.
        
        // Let's use distance to nearest corner
        // The max distance is sqrt((w/2)^2 + (h/2)^2)
        const maxDist = Math.sqrt(width * width / 4 + height * height / 4);
        const thresholdDist = maxDist * ratio;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dy = y > height / 2 ? height - y : y;
                const dx = x > width / 2 ? width - x : x;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                const idx = y * width + x;
                if (dist > thresholdDist) {
                    compReal[idx] = 0;
                    compImag[idx] = 0;
                } else {
                    retained++;
                }
            }
        }
    }

    return { real: compReal, imag: compImag, retained };
}
