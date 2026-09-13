# Image Compressor (Fourier Transform)

A React + Vite application that demonstrates real image compression using the 2D Fast Fourier Transform (FFT).

## What it demonstrates
This project visualizes how images can be transformed from the spatial domain into the frequency domain, where compression can be achieved by discarding less important frequency coefficients. 

## How Fourier Transform is used
1. **Transform**: The image is first converted to grayscale and then transformed using a 2D FFT.
2. **Frequency Domain**: The result is a matrix of complex numbers representing the frequencies of the image. The magnitude of these complex numbers forms the magnitude spectrum.
3. **Filtering**: We can apply compression by discarding coefficients.
4. **Reconstruction**: An Inverse FFT (IFFT) is applied to reconstruct the image.

## Compression Methodology
The application provides two compression modes:
- **Low-Frequency Compression**: Retains a centralized region (low frequencies) and discards the periphery (high frequencies). High frequencies represent sharp edges and noise, so removing them blurs the image slightly but saves space.
- **Magnitude-Based Compression**: Retains only the most prominent coefficients (those with the highest magnitudes) across the entire spectrum. This dynamically adapts to the image content.

## Metrics Used
- **MSE (Mean Squared Error)**: The average squared difference between original and compressed pixels.
- **PSNR (Peak Signal-to-Noise Ratio)**: Represents image quality compared to the original. A higher PSNR indicates better quality.
- **Compression Ratio**: Estimated based on the percentage of Fourier coefficients retained.

## How to run locally
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173` in your browser.
