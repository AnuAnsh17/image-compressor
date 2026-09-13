import { fft2d, ifft2d, shiftFFT, computeMagnitudeSpectrum } from '../utils/fft2d';
import { compressFFT } from '../utils/compression';
import { calculateMSE, calculatePSNR } from '../utils/imageUtils';

interface ChannelState {
    real: Float32Array;
    imag: Float32Array;
    original: Float32Array;
}

let cachedState: {
    r: ChannelState;
    g: ChannelState;
    b: ChannelState;
    grayOriginal: Float32Array;
    width: number;
    height: number;
    magnitude: Float32Array;
} | null = null;

const ctx: Worker = self as any;

ctx.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    if (type === 'PROCESS_IMAGE') {
        const { r, g, b, grayData, width, height, ratio, mode } = payload;
        
        // 1. FFT on all channels + grayscale (for spectrum visualization)
        const fftR = fft2d(r, width, height);
        const fftG = fft2d(g, width, height);
        const fftB = fft2d(b, width, height);
        
        const fftGray = fft2d(grayData, width, height);
        
        // 2. Magnitude Spectrum (from grayscale for visualization)
        const shiftedGray = shiftFFT(fftGray.real, fftGray.imag, width, height);
        const magnitude = computeMagnitudeSpectrum(shiftedGray.real, shiftedGray.imag);
        
        cachedState = {
            r: { real: fftR.real, imag: fftR.imag, original: r },
            g: { real: fftG.real, imag: fftG.imag, original: g },
            b: { real: fftB.real, imag: fftB.imag, original: b },
            grayOriginal: grayData,
            width,
            height,
            magnitude
        };
        
        // 3. Compress all channels
        const compR = compressFFT(fftR.real, fftR.imag, width, height, ratio, mode);
        const compG = compressFFT(fftG.real, fftG.imag, width, height, ratio, mode);
        const compB = compressFFT(fftB.real, fftB.imag, width, height, ratio, mode);
        
        // 4. IFFT on all channels
        const recR = ifft2d(compR.real, compR.imag, width, height);
        const recG = ifft2d(compG.real, compG.imag, width, height);
        const recB = ifft2d(compB.real, compB.imag, width, height);
        
        // 5. Metrics (average MSE across RGB)
        const mseR = calculateMSE(r, recR);
        const mseG = calculateMSE(g, recG);
        const mseB = calculateMSE(b, recB);
        const mse = (mseR + mseG + mseB) / 3;
        const psnr = calculatePSNR(mse);
        
        // Compressed magnitude spectrum (from red channel as proxy or grayscale proxy)
        // We'll just compress the gray FFT to get a representative magnitude spectrum
        const compGray = compressFFT(fftGray.real, fftGray.imag, width, height, ratio, mode);
        const compShifted = shiftFFT(compGray.real, compGray.imag, width, height);
        const compMagnitude = computeMagnitudeSpectrum(compShifted.real, compShifted.imag);

        ctx.postMessage({
            type: 'PROCESS_IMAGE_RESULT',
            payload: {
                r: recR,
                g: recG,
                b: recB,
                magnitude,
                compMagnitude,
                mse,
                psnr,
                retained: compR.retained, // all channels retain same amount
                total: width * height
            }
        });
    } else if (type === 'UPDATE_COMPRESSION') {
        const { ratio, mode } = payload;
        
        if (!cachedState) return;
        const s = cachedState;

        const compR = compressFFT(s.r.real, s.r.imag, s.width, s.height, ratio, mode);
        const compG = compressFFT(s.g.real, s.g.imag, s.width, s.height, ratio, mode);
        const compB = compressFFT(s.b.real, s.b.imag, s.width, s.height, ratio, mode);
        
        const recR = ifft2d(compR.real, compR.imag, s.width, s.height);
        const recG = ifft2d(compG.real, compG.imag, s.width, s.height);
        const recB = ifft2d(compB.real, compB.imag, s.width, s.height);
        
        const mseR = calculateMSE(s.r.original, recR);
        const mseG = calculateMSE(s.g.original, recG);
        const mseB = calculateMSE(s.b.original, recB);
        const mse = (mseR + mseG + mseB) / 3;
        const psnr = calculatePSNR(mse);
        
        // Gray magnitude proxy
        const fftGray = fft2d(s.grayOriginal, s.width, s.height);
        const compGray = compressFFT(fftGray.real, fftGray.imag, s.width, s.height, ratio, mode);
        const compShifted = shiftFFT(compGray.real, compGray.imag, s.width, s.height);
        const compMagnitude = computeMagnitudeSpectrum(compShifted.real, compShifted.imag);

        ctx.postMessage({
            type: 'UPDATE_COMPRESSION_RESULT',
            payload: {
                r: recR,
                g: recG,
                b: recB,
                compMagnitude,
                mse,
                psnr,
                retained: compR.retained
            }
        });
    }
});
