declare module 'fft.js' {
    export default class FFT {
        constructor(size: number);
        createComplexArray(): number[];
        toComplexArray(input: number[], storage?: number[]): number[];
        fromComplexArray(complex: number[], storage?: number[]): number[];
        transform(out: number[], data: number[]): void;
        inverseTransform(out: number[], data: number[]): void;
    }
}
