import React, { useEffect, useRef } from 'react';

interface Props {
    title: string;
    imageData: ImageData | null;
    width: number;
    height: number;
    subtitle?: string;
}

export const ImageComparison: React.FC<Props> = ({ title, imageData, width, height, subtitle }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && imageData) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                // Ensure canvas size matches image data
                if (canvasRef.current.width !== width) canvasRef.current.width = width;
                if (canvasRef.current.height !== height) canvasRef.current.height = height;
                ctx.putImageData(imageData, 0, 0);
            }
        }
    }, [imageData, width, height]);

    return (
        <div className="flex flex-col bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-1">{title}</h4>
            {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
            
            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                {imageData ? (
                    <canvas 
                        ref={canvasRef} 
                        className="max-w-full max-h-[400px] object-contain"
                        style={{ width: '100%', height: 'auto' }}
                    />
                ) : (
                    <div className="text-gray-400 text-sm py-12">Processing...</div>
                )}
            </div>
        </div>
    );
};
