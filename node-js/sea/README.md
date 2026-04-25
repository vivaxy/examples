# Single Executable Application

Node.js Single Executable Applications (SEA) bundle a script together with the Node.js runtime into a standalone binary that can be distributed without requiring `node` to be on the user's PATH. See the official docs at https://nodejs.org/api/single-executable-applications.html.

This example uses the `--build-sea` flag added in [Node.js v25.5.0](https://nodejs.org/en/blog/release/v25.5.0), which replaces the older multi-step `--experimental-sea-config` + `postject` workflow with a single command.

## Prerequisites

- Node.js >= 25.5.0 (the directory pins `25` via `.nvmrc`).
- No `npm install` needed — there are no runtime or build dependencies.

## macOS

```bash
npm run build
```

```bash
./hello
```

`npm run build` runs `node --build-sea sea-config.json` (which generates the blob and injects it into a copy of the Node binary) and then ad-hoc signs the result with `codesign --sign -`. The output `hello` matches the host architecture.

## Universal binary (macOS)

To build a single `hello` that runs natively on both Apple Silicon and Intel Macs:

```bash
npm run build:universal
```

This downloads the official Node.js distribution for each architecture (cached on disk after the first run), uses the `executable` field in a per-arch SEA config to inject into each downloaded binary, then merges them into a universal `hello` with `lipo`.

Verify:

```bash
lipo -archs hello
```

You can also build a single non-host architecture with `npm run build:arm64` or `npm run build:x64`.

## Linux

```bash
npm run build
```

```bash
./hello
```

The `codesign` step at the end is harmless on Linux but unnecessary; remove it from the `build` script if you prefer.

## Windows

```bash
npm run build
```

```bash
hello.exe
```

Set `output` to `hello.exe` in `sea-config.json`. Optionally re-sign with `signtool sign /fd SHA256 hello.exe` if a code signing certificate is available.

## Out of scope

This example does not cover advanced SEA features such as asset embedding, code cache, or snapshot startup. See the official docs.
