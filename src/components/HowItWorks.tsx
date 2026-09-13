import React from 'react';
import { BookOpen } from 'lucide-react';

export const HowItWorks: React.FC = () => {
    return (
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm mt-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="text-blue-500" />
                How It Works: Fourier Image Compression
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 text-sm text-gray-700 leading-relaxed">
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2">The Concept</h4>
                    <p className="mb-4">
                        Any image can be represented as a sum of sine and cosine waves of different frequencies. 
                        The <strong>2D Fourier Transform</strong> converts an image from the <em>spatial domain</em> (pixels) 
                        to the <em>frequency domain</em> (waves).
                    </p>
                    <p className="mb-4">
                        In the frequency domain, we see <strong>Fourier coefficients</strong>. 
                        <ul>
                            <li><strong className="text-blue-600">Low Frequencies:</strong> Represent smooth, broad changes in color and brightness (the general shape/structure of the image).</li>
                            <li><strong className="text-red-500">High Frequencies:</strong> Represent sharp transitions, edges, and fine details.</li>
                        </ul>
                    </p>
                </div>
                
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2">The Compression Process</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                        <li><strong>Transform:</strong> Convert the image to grayscale and apply the 2D FFT.</li>
                        <li><strong>Filter:</strong> Discard (set to zero) coefficients that are less important. This can be high-frequency details (Low-Pass) or coefficients with small magnitudes (Magnitude-Based).</li>
                        <li><strong>Reconstruct:</strong> Apply the Inverse Fast Fourier Transform (IFFT) to the remaining coefficients to recreate the image.</li>
                    </ol>
                    <p>
                        Because human eyes are less sensitive to high-frequency details, we can discard many coefficients while keeping the image recognizable.
                    </p>
                </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-900">
                <h4 className="font-semibold mb-2">Metrics Used</h4>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>MSE (Mean Squared Error):</strong> The average squared difference between the original and reconstructed pixels. Lower is better.</li>
                    <li><strong>PSNR (Peak Signal-to-Noise Ratio):</strong> An expression of the ratio between the maximum possible value of a signal and the power of corrupting noise (MSE). Higher is better.</li>
                </ul>
            </div>
        </div>
    );
};
