import { useState, useEffect, useRef } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { StatisticsPanel } from './components/StatisticsPanel';
import { CompressionControls } from './components/CompressionControls';
import { ImageComparison } from './components/ImageComparison';
import { HowItWorks } from './components/HowItWorks';
import { resizeImageToPowerOfTwo, grayscale, createImageDataFromGrayscale, splitChannels, mergeChannels } from './utils/imageUtils';
import type { CompressionMode } from './utils/compression';
import { Download, RefreshCw } from 'lucide-react';
import FFTWorker from './workers/fft.worker.ts?worker';

interface AppState {
    originalImage: ImageData | null;
    originalFile: File | null;
    width: number;
    height: number;
    
    // Results
    reconstructedImage: ImageData | null;
    magnitudeImage: ImageData | null;
    compMagnitudeImage: ImageData | null;
    
    // Stats
    mse: number;
    psnr: number;
    retained: number;
    total: number;
    
    // Controls
    ratio: number;
    mode: CompressionMode;
    isProcessing: boolean;
}

function App() {
    const [state, setState] = useState<AppState>({
        originalImage: null,
        originalFile: null,
        width: 0,
        height: 0,
        reconstructedImage: null,
        magnitudeImage: null,
        compMagnitudeImage: null,
        mse: 0,
        psnr: 0,
        retained: 0,
        total: 0,
        ratio: 0.25,
        mode: 'magnitude',
        isProcessing: false,
    });

    const workerRef = useRef<Worker | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        workerRef.current = new FFTWorker();
        
        workerRef.current.onmessage = (e) => {
            const { type, payload } = e.data;
            if (type === 'PROCESS_IMAGE_RESULT') {
                setState(prev => ({
                    ...prev,
                    reconstructedImage: mergeChannels(payload.r, payload.g, payload.b, prev.width, prev.height),
                    magnitudeImage: createImageDataFromGrayscale(payload.magnitude, prev.width, prev.height),
                    compMagnitudeImage: createImageDataFromGrayscale(payload.compMagnitude, prev.width, prev.height),
                    mse: payload.mse,
                    psnr: payload.psnr,
                    retained: payload.retained,
                    total: payload.total,
                    isProcessing: false
                }));
            } else if (type === 'UPDATE_COMPRESSION_RESULT') {
                setState(prev => ({
                    ...prev,
                    reconstructedImage: mergeChannels(payload.r, payload.g, payload.b, prev.width, prev.height),
                    compMagnitudeImage: createImageDataFromGrayscale(payload.compMagnitude, prev.width, prev.height),
                    mse: payload.mse,
                    psnr: payload.psnr,
                    retained: payload.retained,
                    isProcessing: false
                }));
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const handleImageSelect = async (file: File) => {
        setState(s => ({ ...s, isProcessing: true, originalFile: file }));
        
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => { img.onload = resolve; });
        
        const { width, height, data } = await resizeImageToPowerOfTwo(img, 512); // Max 512 for perf
        const originalImage = new ImageData(data as any, width, height);
        
        const { r, g, b } = splitChannels(data);
        const grayData = grayscale(data);
        
        setState(s => ({ ...s, originalImage, width, height, total: width * height }));
        
        workerRef.current?.postMessage({
            type: 'PROCESS_IMAGE',
            payload: {
                r, g, b, grayData,
                width,
                height,
                ratio: state.ratio,
                mode: state.mode
            }
        });
    };

    const handleRatioChange = (ratio: number) => {
        setState(s => ({ ...s, ratio, isProcessing: true }));
        workerRef.current?.postMessage({
            type: 'UPDATE_COMPRESSION',
            payload: { ratio, mode: state.mode }
        });
    };

    const handleModeChange = (mode: CompressionMode) => {
        setState(s => ({ ...s, mode, isProcessing: true }));
        workerRef.current?.postMessage({
            type: 'UPDATE_COMPRESSION',
            payload: { ratio: state.ratio, mode }
        });
    };

    const handleReset = () => {
        setState({
            originalImage: null,
            originalFile: null,
            width: 0,
            height: 0,
            reconstructedImage: null,
            magnitudeImage: null,
            compMagnitudeImage: null,
            mse: 0,
            psnr: 0,
            retained: 0,
            total: 0,
            ratio: 0.25,
            mode: 'magnitude',
            isProcessing: false,
        });
    };

    const handleDownload = () => {
        if (!state.reconstructedImage || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            canvasRef.current.width = state.width;
            canvasRef.current.height = state.height;
            ctx.putImageData(state.reconstructedImage, 0, 0);
            
            const link = document.createElement('a');
            link.download = `compressed_image_r${Math.round(state.ratio*100)}_${state.mode}.jpg`;
            link.href = canvasRef.current.toDataURL('image/jpeg', 0.90);
            link.click();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
            <header className="bg-white border-b border-gray-200 py-6 mb-8">
                <div className="max-w-6xl mx-auto px-6">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fourier Image Compression</h1>
                    <p className="text-gray-500 mt-1">Academic Prototype • 2D FFT Compression</p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6">
                {!state.originalImage ? (
                    <div className="py-12">
                        <ImageUploader onImageSelect={handleImageSelect} />
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Compression Analysis</h2>
                            <div className="flex gap-3">
                                <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                    <RefreshCw size={16} /> Reset
                                </button>
                                <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <Download size={16} /> Download JPEG
                                </button>
                            </div>
                        </div>

                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                            <strong>Note on File Sizes:</strong> The "Est. Compressed Size" reflects the theoretical size if we only stored the retained Fourier coefficients and coordinates in a custom binary format. Downloading the reconstructed image converts those pixels back into a standard JPEG/PNG file, which uses its own compression algorithms. Therefore, the downloaded file size will <strong>not</strong> directly match the theoretical Fourier compression size.
                        </div>

                        <StatisticsPanel 
                            originalSize={state.originalFile?.size || 0}
                            width={state.width}
                            height={state.height}
                            mse={state.mse}
                            psnr={state.psnr}
                            retained={state.retained}
                            total={state.total}
                        />

                        <CompressionControls 
                            ratio={state.ratio}
                            mode={state.mode}
                            onRatioChange={handleRatioChange}
                            onModeChange={handleModeChange}
                            isProcessing={state.isProcessing}
                        />

                        <div className="grid md:grid-cols-3 gap-6">
                            <ImageComparison 
                                title="Original Image" 
                                subtitle="Resized to power of 2 for FFT"
                                imageData={state.originalImage} 
                                width={state.width} 
                                height={state.height} 
                            />
                            
                            <ImageComparison 
                                title="Fourier Spectrum" 
                                subtitle={state.mode === 'low-pass' ? 'Masked Magnitude Spectrum' : 'Thresholded Magnitude Spectrum'}
                                imageData={state.compMagnitudeImage || state.magnitudeImage} 
                                width={state.width} 
                                height={state.height} 
                            />

                            <ImageComparison 
                                title="Compressed Image" 
                                subtitle="Reconstructed via Inverse FFT"
                                imageData={state.reconstructedImage} 
                                width={state.width} 
                                height={state.height} 
                            />
                        </div>

                        <canvas ref={canvasRef} className="hidden" />

                        <HowItWorks />
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
