GOOS=js GOARCH=wasm go build -o main.wasm main.go
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .
echo "/* eslint-disable */" | cat - wasm_exec.js > wasm_exec_disabled.js
mv wasm_exec_disabled.js wasm_exec.js
