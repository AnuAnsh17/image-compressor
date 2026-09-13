import { fft2d, ifft2d, shiftFFT, computeMagnitudeSpectrum } from '../utils/fft2d';
import { compressFFT } from '../utils/compression';
import { calculateMSE, calculatePSNR } from '../utils/imageUtils';

let cachedReal: Float32Array | null = null;
let cachedImag: Float32Array | null = null;
let cachedGrayData: Float32Array | null = null;
let cachedWidth: number = 0;
let cachedHeight: number = 0;
let cachedMagnitude: Float32Array | null = null;

const ctx: Worker = self as any;

ctx.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    if (type === 'PROCESS_IMAGE') {
        const { grayData, width, height, ratio, mode } = payload;
        
        cachedGrayData = grayData;
        cachedWidth = width;
        cachedHeight = height;

        // 1. FFT
        const { real, imag } = fft2d(grayData, width, height);
        cachedReal = real;
        cachedImag = imag;
        
        // 2. Magnitude Spectrum (shift first)
        const shifted = shiftFFT(real, imag, width, height);
        cachedMagnitude = computeMagnitudeSpectrum(shifted.real, shifted.imag);
        
        // 3. Compress
        const comp = compressFFT(real, imag, width, height, ratio, mode);
        
        // 4. IFFT
        const reconstructed = ifft2d(comp.real, comp.imag, width, height);
        
        // 5. Metrics
        const mse = calculateMSE(grayData, reconstructed);
        const psnr = calculatePSNR(mse);
        
        const compShifted = shiftFFT(comp.real, comp.imag, width, height);
        const compMagnitude = computeMagnitudeSpectrum(compShifted.real, compShifted.imag);

        ctx.postMessage({
            type: 'PROCESS_IMAGE_RESULT',
            payload: {
                reconstructed,
                magnitude: cachedMagnitude,
                compMagnitude,
                mse,
                psnr,
                retained: comp.retained,
                total: width * height
            }
        });
    } else if (type === 'UPDATE_COMPRESSION') {
        const { ratio, mode } = payload;
        
        if (!cachedReal || !cachedImag || !cachedGrayData) return;

        const comp = compressFFT(cachedReal, cachedImag, cachedWidth, cachedHeight, ratio, mode);
        const reconstructed = ifft2d(comp.real, comp.imag, cachedWidth, cachedHeight);
        
        const mse = calculateMSE(cachedGrayData, reconstructed);
        const psnr = calculatePSNR(mse);
        
        const compShifted = shiftFFT(comp.real, comp.imag, cachedWidth, cachedHeight);
        const compMagnitude = computeMagnitudeSpectrum(compShifted.real, compShifted.imag);

        ctx.postMessage({
            type: 'UPDATE_COMPRESSION_RESULT',
            payload: {
                reconstructed,
                compMagnitude,
                mse,
                psnr,
                retained: comp.retained
            }
        });
    }
});
