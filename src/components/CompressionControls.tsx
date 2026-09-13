import React from 'react';
import type { CompressionMode } from '../utils/compression';
import { Sliders, Layers } from 'lucide-react';

interface Props {
    ratio: number;
    mode: CompressionMode;
    onRatioChange: (ratio: number) => void;
    onModeChange: (mode: CompressionMode) => void;
    isProcessing: boolean;
}

export const CompressionControls: React.FC<Props> = ({ ratio, mode, onRatioChange, onModeChange, isProcessing }) => {
    
    const presets = [
        { label: 'Extreme (10%)', value: 0.1 },
        { label: 'High (25%)', value: 0.25 },
        { label: 'Balanced (50%)', value: 0.5 },
        { label: 'Light (75%)', value: 0.75 },
        { label: 'None (100%)', value: 1.0 },
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sliders size={20} className="text-blue-500" />
                    Compression Controls
                </h3>
                {isProcessing && <span className="text-xs font-medium text-blue-500 animate-pulse bg-blue-50 px-2 py-1 rounded">Processing...</span>}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retained Frequencies: {Math.round(ratio * 100)}%
                    </label>
                    <input 
                        type="range" 
                        min="0.01" 
                        max="1" 
                        step="0.01" 
                        value={ratio}
                        onChange={(e) => onRatioChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                        {presets.map(p => (
                            <button
                                key={p.label}
                                onClick={() => onRatioChange(p.value)}
                                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                                    Math.abs(ratio - p.value) < 0.01 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Layers size={16} /> Compression Mode
                    </label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            onClick={() => onModeChange('low-pass')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                mode === 'low-pass' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Low-Frequency
                        </button>
                        <button 
                            onClick={() => onModeChange('magnitude')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                mode === 'magnitude' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Magnitude-Based
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                        {mode === 'low-pass' 
                            ? 'Retains frequencies near the center (low frequencies). High frequencies (sharp edges, noise) are discarded.'
                            : 'Retains the most prominent Fourier coefficients regardless of their frequency, discarding weaker signals.'}
                    </p>
                </div>
            </div>
        </div>
    );
};
