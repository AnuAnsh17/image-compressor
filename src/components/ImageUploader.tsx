import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface Props {
    onImageSelect: (file: File) => void;
}

export const ImageUploader: React.FC<Props> = ({ onImageSelect }) => {
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            onImageSelect(file);
        }
    }, [onImageSelect]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageSelect(file);
        }
    }, [onImageSelect]);

    return (
        <div 
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="w-full max-w-2xl mx-auto border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer bg-white shadow-sm"
        >
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-full">
                    <UploadCloud className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Upload an image</h3>
                    <p className="text-sm text-gray-500 mt-1">Drag and drop or click to browse</p>
                    <p className="text-xs text-gray-400 mt-2">Supports JPG, PNG, WebP</p>
                </div>
                <label className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                    Choose Image
                    <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleChange} />
                </label>
            </div>
        </div>
    );
};
