export EMCC_DEBUG=1

mandelbrot.js: mandelbrot.cpp
	em++ --bind --std=c++11 mandelbrot.cpp -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s "EXTRA_EXPORTED_RUNTIME_METHODS=['addOnPostRun']" -o mandelbrot.js

clean:
	rm *.js *.wasm
