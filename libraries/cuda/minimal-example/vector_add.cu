#include <iostream>
#include <cuda_runtime.h>

// CUDA kernel function for vector addition
__global__ void vector_add(float* a, float* b, float* c, int N) {
    int idx = threadIdx.x + blockIdx.x * blockDim.x;  // Global index
    if (idx < N) {
        c[idx] = a[idx] + b[idx];
    }
}

int main() {
    const int N = 100000000;  // Number of elements
    float *a, *b, *c;    // Host pointers
    float *d_a, *d_b, *d_c; // Device pointers

    // Allocate memory on the host
    a = new float[N];
    b = new float[N];
    c = new float[N];

    // Initialize input vectors
    for (int i = 0; i < N; i++) {
        a[i] = static_cast<float>(i);
        b[i] = static_cast<float>(i * 2);
    }

    // Allocate memory on the device (GPU)
    cudaMalloc(&d_a, N * sizeof(float));
    cudaMalloc(&d_b, N * sizeof(float));
    cudaMalloc(&d_c, N * sizeof(float));

    // Copy data from host to device
    cudaMemcpy(d_a, a, N * sizeof(float), cudaMemcpyHostToDevice);
    cudaMemcpy(d_b, b, N * sizeof(float), cudaMemcpyHostToDevice);

    // Define block and grid sizes
    int blockSize = 256; // Number of threads per block
    int numBlocks = (N + blockSize - 1) / blockSize;  // Calculate number of blocks

    // Launch kernel
    vector_add<<<numBlocks, blockSize>>>(d_a, d_b, d_c, N);

    // Copy result from device to host
    cudaMemcpy(c, d_c, N * sizeof(float), cudaMemcpyDeviceToHost);

    // Check the result
    for (int i = 0; i < 10; i++) {  // Print first 10 elements
        std::cout << "c[" << i << "] = " << c[i] << std::endl;
    }

    // Free device memory
    cudaFree(d_a);
    cudaFree(d_b);
    cudaFree(d_c);

    // Free host memory
    delete[] a;
    delete[] b;
    delete[] c;

    return 0;
}
