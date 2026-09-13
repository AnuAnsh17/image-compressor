import FFT from 'fft.js';

export function fft2d(realInput: Float32Array, width: number, height: number): { real: Float32Array, imag: Float32Array } {
    const fftW = new FFT(width);
    const fftH = new FFT(height);

    const complexData = new Float32Array(width * height * 2);

    // Copy real input to complex data
    for (let i = 0; i < realInput.length; i++) {
        complexData[i * 2] = realInput[i];
        complexData[i * 2 + 1] = 0;
    }

    // Process rows
    const rowIn = fftW.createComplexArray();
    const rowOut = fftW.createComplexArray();
    for (let y = 0; y < height; y++) {
        const offset = y * width * 2;
        for (let x = 0; x < width; x++) {
            rowIn[x * 2] = complexData[offset + x * 2];
            rowIn[x * 2 + 1] = complexData[offset + x * 2 + 1];
        }
        fftW.transform(rowOut, rowIn);
        for (let x = 0; x < width; x++) {
            complexData[offset + x * 2] = rowOut[x * 2];
            complexData[offset + x * 2 + 1] = rowOut[x * 2 + 1];
        }
    }

    // Process columns
    const colIn = fftH.createComplexArray();
    const colOut = fftH.createComplexArray();
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const offset = (y * width + x) * 2;
            colIn[y * 2] = complexData[offset];
            colIn[y * 2 + 1] = complexData[offset + 1];
        }
        fftH.transform(colOut, colIn);
        for (let y = 0; y < height; y++) {
            const offset = (y * width + x) * 2;
            complexData[offset] = colOut[y * 2];
            complexData[offset + 1] = colOut[y * 2 + 1];
        }
    }

    const real = new Float32Array(width * height);
    const imag = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
        real[i] = complexData[i * 2];
        imag[i] = complexData[i * 2 + 1];
    }

    return { real, imag };
}

export function ifft2d(real: Float32Array, imag: Float32Array, width: number, height: number): Float32Array {
    const fftW = new FFT(width);
    const fftH = new FFT(height);

    const complexData = new Float32Array(width * height * 2);
    for (let i = 0; i < width * height; i++) {
        complexData[i * 2] = real[i];
        complexData[i * 2 + 1] = imag[i];
    }

    // Process columns
    const colIn = fftH.createComplexArray();
    const colOut = fftH.createComplexArray();
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const offset = (y * width + x) * 2;
            colIn[y * 2] = complexData[offset];
            colIn[y * 2 + 1] = complexData[offset + 1];
        }
        fftH.inverseTransform(colOut, colIn);
        for (let y = 0; y < height; y++) {
            const offset = (y * width + x) * 2;
            complexData[offset] = colOut[y * 2];
            complexData[offset + 1] = colOut[y * 2 + 1];
        }
    }

    // Process rows
    const rowIn = fftW.createComplexArray();
    const rowOut = fftW.createComplexArray();
    for (let y = 0; y < height; y++) {
        const offset = y * width * 2;
        for (let x = 0; x < width; x++) {
            rowIn[x * 2] = complexData[offset + x * 2];
            rowIn[x * 2 + 1] = complexData[offset + x * 2 + 1];
        }
        fftW.inverseTransform(rowOut, rowIn);
        for (let x = 0; x < width; x++) {
            complexData[offset + x * 2] = rowOut[x * 2];
            complexData[offset + x * 2 + 1] = rowOut[x * 2 + 1];
        }
    }

    const outputReal = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
        outputReal[i] = complexData[i * 2];
    }

    return outputReal;
}

export function shiftFFT(real: Float32Array, imag: Float32Array, width: number, height: number): { real: Float32Array, imag: Float32Array } {
    const shiftedReal = new Float32Array(width * height);
    const shiftedImag = new Float32Array(width * height);
    const cx = width / 2;
    const cy = height / 2;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const nx = (x + cx) % width;
            const ny = (y + cy) % height;
            const srcIdx = y * width + x;
            const dstIdx = ny * width + nx;
            shiftedReal[dstIdx] = real[srcIdx];
            shiftedImag[dstIdx] = imag[srcIdx];
        }
    }

    return { real: shiftedReal, imag: shiftedImag };
}

export function computeMagnitudeSpectrum(real: Float32Array, imag: Float32Array): Float32Array {
    const magnitude = new Float32Array(real.length);
    let maxMag = 0;
    for (let i = 0; i < real.length; i++) {
        const r = real[i];
        const im = imag[i];
        const mag = Math.sqrt(r * r + im * im);
        magnitude[i] = Math.log(1 + mag);
        if (magnitude[i] > maxMag) maxMag = magnitude[i];
    }
    
    // Normalize to 0-255
    if (maxMag > 0) {
        for (let i = 0; i < magnitude.length; i++) {
            magnitude[i] = (magnitude[i] / maxMag) * 255;
        }
    }
    
    return magnitude;
}
