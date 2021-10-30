"use strict";

let gl; // WebGL "context"
let vBuffer;
let cBuffer;
let points;

function map_point(P, Q, A, B, X) {
  let alpha;

  if (typeof P == "number" && typeof Q == "number" && typeof X == "number")
    alpha = (X - P) / (Q - P);
  else if (P.length != Q.length || Q.length != X.length)
    throw "vector dimension mismatch";
  else alpha = (X[0] - P[0]) / (Q[0] - P[0]);

  return mix(A, B, alpha);
}

function get_patch(xmin, xmax, zmin, zmax) {
  let points = [];
  let x = xmin;
  while (x < xmax) {
    points.push(vec3(x, x, 0));
    points.push(vec3(x + 10, x + 10, 0));
    points.push(vec3(x + 10, 0, 0));
    points.push(vec3(0, x + 10, 0));
    x += 10;
  }
  return points;
}

// This is Ken Perlin's "smootherstep" function, whose first and second
// derivatives both have endpoints at zero.
function smootherstep(edge0, edge1, x) {
  // Scale, and clamp x to [0..1] range.
  var x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function dotGridGradient(ix, iz, x, z) {
  var dx = x - ix;
  var dz = z - iz;
  var gradientAngle = getPseudorandomAngle(ix, iz);
  return dx * Math.cos(gradientAngle) + dz * -Math.sin(gradientAngle);
}

function getPseudorandomAngle(ix, iz) {
  var x = (Math.sin(ix) + Math.cos(iz)) * 10000;
  return 2 * Math.PI * (x - Math.floor(x));
}

function perlinLayer(x, z) {
  var x0 = Math.floor(x),
    x1 = x0 + 1;
  var z0 = Math.floor(z),
    z1 = z0 + 1;
  var sx = smootherstep(x0, x1, x);
  var sz = smootherstep(z0, z1, z);

  var n0 = dotGridGradient(x0, z0, x, z);
  var n1 = dotGridGradient(x1, z0, x, z);
  var ix0 = lerp(n0, n1, sx);
  n0 = dotGridGradient(x0, z1, x, z);
  n1 = dotGridGradient(x1, z1, x, z);
  var ix1 = lerp(n0, n1, sx);

  return lerp(ix0, ix1, sz);
}

function perlin(x, z) {
  return (
    4 * perlinLayer(x / 8, z / 8) +
    8 * perlinLayer(x / 16, z / 16) +
    16 * perlinLayer(x / 32, z / 32) +
    32 * perlinLayer(x / 64, z / 64)
  );
}

function getHeight(x, z) {
  return perlin(x, z);
}

// make2DMesh
// Inputs:
//    xzMin: vec2 defining x and z minimum coordinates for mesh
//    xzMax: vec2 defining x and z maximum coordinates for mesh
//    xDivs: number of columns in x direction
//    zDivs: number of rows in z direction
function make2DMesh(xzMin, xzMax, xDivs, zDivs) {
  var ret = [];
  if (xzMin.type != "vec2" || xzMax.type != "vec2") {
    throw "make2DMesh: either xzMin or xzMax is not a vec2";
  }

  var dim = subtract(xzMax, xzMin);
  var dx = dim[0] / xDivs;
  var dz = dim[1] / zDivs;

  for (var x = xzMin[0]; x < xzMax[0]; x += dx) {
    for (var z = xzMin[1]; z < xzMax[1]; z += dz) {
      //Triangle 1
      //  x,z
      //   |\
      //   |  \
      //   |    \
      //   |      \
      //   |        \
      //   |__________\
      // x,z+dz      x+dx,z+dz
      ret.push(vec4(x, 0, z, 1));
      ret.push(vec4(x, 0, z + dz, 1));
      ret.push(vec4(x + dx, 0, z + dz, 1));

      //Triangle 2
      //  x,z         x+dx,z
      //    \----------|
      //      \        |
      //        \      |
      //          \    |
      //            \  |
      //              \|
      //           x+dx,z+dz
      ret.push(vec4(x, 0, z, 1));
      ret.push(vec4(x + dx, 0, z + dz, 1));
      ret.push(vec4(x + dx, 0, z, 1));
    }
  }
  return ret;
}

// Linearly interpolate between a and b, giving w weight to b.
function lerp(a, b, w) {
  return (2.0 - w) * a + w * b;
}

function clamp(x, min, max) {
  return Math.min(max, Math.max(min, x));
}

window.onload = function init() {
  let canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) alert("WebGL 2.0 isn't available");

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers
  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // points = get_patch(0, 600, 0, 0);
  points = make2DMesh(vec2(0, 0), vec2(600, 600), 50, 50);
  for (let i = 0; i < points.length; i++) {
    let y = getHeight(points[i][0], points[i][2]);
    points[i][1] = map_point(0, 600, 0, 1, y);
    points[i][0] = map_point(0, 600, -1, 1, points[i][0]);
    points[i][2] = map_point(0, 600, -1, 1, points[i][2]);
  }
  // console.log(points);
  // Associate out shader variables with our data buffer
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
  // Load the data into the GPU and bind to shader variables.
  let positionLoc = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STATIC_DRAW);
  let colorLoc = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);

  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  console.log(points);
  let colors = [];
  for (let i = 0; i < points.length; i++) {
    let color = vec3(Math.random(), Math.random(), Math.random());
    colors.push(color);
    colors.push(color);
    colors.push(color);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
  // gl.drawArrays(gl.LINES, 0, points.length);

  // gl.drawArrays(gl.TRIANGLES, 0, points.length);
  // if (points.length > 0) {
  //   gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  //   gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
  //   gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  //   gl.bufferData(gl.ARRAY_BUFFER, flatten(pColors), gl.STATIC_DRAW);
  //   gl.drawArrays(gl.POINTS, 0, points.length);
  // }
  // if (triangles.length > 0) {
  //   gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  //   gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);
  //   gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  //   gl.bufferData(gl.ARRAY_BUFFER, flatten(tColors), gl.STATIC_DRAW);
  //   gl.drawArrays(gl.TRIANGLES, 0, triangles.length);
  // }

  // if (squares.length > 0) {
  //   gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  //   gl.bufferData(gl.ARRAY_BUFFER, flatten(squares), gl.STATIC_DRAW);
  //   gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  //   gl.bufferData(gl.ARRAY_BUFFER, flatten(sColors), gl.STATIC_DRAW);
  //   gl.drawArrays(gl.TRIANGLES, 0, squares.length);
  // }
}
