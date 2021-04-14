/**
 * @since 2017-03-02 11:58
 * @author vivaxy
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL
 */

const initWebGL = (canvas) => {
  const gl =
    canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (gl && gl instanceof WebGLRenderingContext) {
    console.log('Congratulations! Your browser supports WebGL.');
    console.log('canvas', gl.canvas);
  } else {
    console.log(
      'Failed to get WebGL context. Your browser or device may not support WebGL.',
    );
  }
  return gl;
};

const getShader = (gl, id, type) => {
  const shaderScript = document.getElementById(id);
  const theSource = shaderScript.text;

  if (!shaderScript) {
    return null;
  }

  if (!type) {
    if (shaderScript.type == 'x-shader/x-fragment') {
      type = gl.FRAGMENT_SHADER;
    } else if (shaderScript.type == 'x-shader/x-vertex') {
      type = gl.VERTEX_SHADER;
    } else {
      // Unknown shader type
      return null;
    }
  }
  const shader = gl.createShader(type);

  gl.shaderSource(shader, theSource);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(
      'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const initShaders = (gl) => {
  const fragmentShader = getShader(gl, 'shader-fs');
  const vertexShader = getShader(gl, 'shader-vs');

  // Create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log(
      'Unable to initialize the shader program: ' +
        gl.getProgramInfoLog(shaderProgram),
    );
  }

  gl.useProgram(shaderProgram);

  const vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram,
    'aVertexPosition',
  );
  gl.enableVertexAttribArray(vertexPositionAttribute);
  return {
    vertexPositionAttribute,
    shaderProgram,
  };
};

const initBuffers = (gl) => {
  const squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

  const vertices = [
    1.0,
    1.0,
    0.0,
    -1.0,
    1.0,
    0.0,
    1.0,
    -1.0,
    0.0,
    -1.0,
    -1.0,
    0.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  return squareVerticesBuffer;
};

const loadIdentity = () => {
  return Matrix.I(4);
};

const multMatrix = (mvMatrix, m) => {
  return mvMatrix.x(m);
};

const mvTranslate = (mvMatrix, v) => {
  return multMatrix(
    mvMatrix,
    Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4(),
  );
};

const setMatrixUniforms = (gl, mvMatrix, perspectiveMatrix, shaderProgram) => {
  const pUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
  gl.uniformMatrix4fv(
    pUniform,
    false,
    new Float32Array(perspectiveMatrix.flatten()),
  );

  const mvUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
};

const drawScene = (gl) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const { vertexPositionAttribute, shaderProgram } = initShaders(gl);
  const squareVerticesBuffer = initBuffers(gl);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const perspectiveMatrix = makePerspective(45, 640.0 / 480.0, 0.1, 100.0);

  const matrix = loadIdentity();
  const mvMatrix = mvTranslate(matrix, [-0.0, 0.0, -6.0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  setMatrixUniforms(gl, mvMatrix, perspectiveMatrix, shaderProgram);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const start = () => {
  const canvas = document.querySelector('.js-canvas');
  // set canvas width/height to double
  canvas.width =
    (window.innerWidth || document.documentElement.clientWidth) * 2;
  canvas.height =
    (window.innerHeight || document.documentElement.clientHeight) * 2;

  // Initialize the GL context
  const gl = initWebGL(canvas);

  // Only continue if WebGL is available and working
  if (!gl) {
    return false;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  // Near things obscure far things
  gl.depthFunc(gl.LEQUAL);
  // Clear the color as well as the depth buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.viewport(0, 0, canvas.width, canvas.height);

  drawScene(gl);
};

start();
