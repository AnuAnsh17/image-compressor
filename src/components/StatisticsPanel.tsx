import React from 'react';
import { HardDrive, Activity, Image as ImageIcon, Zap, Maximize, Percent } from 'lucide-react';

interface Props {
    originalSize: number; // bytes
    width: number;
    height: number;
    mse: number;
    psnr: number;
    retained: number;
    total: number;
}

export const StatisticsPanel: React.FC<Props> = ({ originalSize, width, height, mse, psnr, retained, total }) => {
    
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Estimated compressed size:
    // A naive estimate: Original size * (retained / total) + metadata overhead.
    // In a real Fourier compression scheme, quantization and entropy coding would be used.
    // For this prototype, we'll estimate based purely on the ratio.
    const ratio = retained / total;
    const estSize = originalSize * ratio;
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <StatCard icon={<ImageIcon size={18} />} title="Dimensions" value={`${width} × ${height}`} />
            <StatCard icon={<HardDrive size={18} />} title="Original Size" value={formatBytes(originalSize)} />
            <StatCard icon={<Zap size={18} />} title="Est. Compressed Size" value={formatBytes(estSize)} />
            
            <StatCard icon={<Percent size={18} />} title="Retained Coeffs" value={`${((retained/total)*100).toFixed(2)}%`} subtext={`${retained} of ${total}`} />
            <StatCard icon={<Activity size={18} />} title="MSE" value={mse.toFixed(2)} subtext="Mean Squared Error" />
            <StatCard icon={<Maximize size={18} />} title="PSNR" value={`${psnr === Infinity ? '∞' : psnr.toFixed(2)} dB`} subtext="Peak Signal-to-Noise" />
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string, subtext?: string }> = ({ icon, title, value, subtext }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-3">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
            {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
        </div>
    </div>
);
