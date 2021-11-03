"use strict";

let gl; // WebGL "context"
let program;

let vBuffer;
let cBuffer;
let points;
let canvas;

var xmin = 0;
var zmin = 0;

var xmax;
var zmax;

var near = 0.3;
var far = 3.0;
var radius = 4.0;
var theta = 0.0;
var phi = 0.0;
var dr = (5.0 * Math.PI) / 180.0;

var fovy = 45.0; // Field-of-view in Y direction angle (in degrees)
var aspect; // Viewport aspect ratio

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);

var drawmodes = ["t", "p", "l"];
var drawmode_idx = 0;

var row_length;
var col_length;

function map_point(P, Q, A, B, X) {
  let alpha;

  if (typeof P == "number" && typeof Q == "number" && typeof X == "number")
    alpha = (X - P) / (Q - P);
  else if (P.length != Q.length || Q.length != X.length)
    throw "vector dimension mismatch";
  else alpha = (X[0] - P[0]) / (Q[0] - P[0]);

  return mix(A, B, alpha);
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

// function getHeight(x, z) {
//   return perlin(x, z);
// }

function getHeight(x, z) {
  return noise.perlin2(-x, -z) * 500;
}

function get_patch(xmin, xmax, zmin, zmax) {
  var xzMin = vec2(xmin, zmin);
  var xzMax = vec2(xmax, zmax);
  var xDivs = 23;
  var zDivs = 23;
  row_length = (xmax - xmin) * xDivs;
  col_length = (zmax - zmin) * zDivs;
  var ret = [];
  if (xzMin.type != "vec2" || xzMax.type != "vec2") {
    throw "get_patch: either xzMin or xzMax is not a vec2";
  }

  var dim = subtract(xzMax, xzMin);
  var dx = dim[0] / xDivs;
  var dz = dim[1] / zDivs;
  console.log(xmin);
  console.log(xzMin[0], xzMax[0]);
  console.log(xzMin[1], xzMax[1]);
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

function get_patch2(xmin, xmax, zmin, zmax) {
  let ret = [];
  // for (let i = xmin; i < xmax; i++) {
  //   for (let j = zmin; j < zmax; j++) {
  //     points.push(vec4(i, Math.sin(i + j), j, 1));
  //   }
  // }
  var xzMin = vec2(xmin, zmin);
  var xzMax = vec2(xmax, zmax);
  var xDivs = 100;
  var zDivs = 100;
  var dim = subtract(xzMax, xzMin);
  var dx = dim[0] / xDivs;
  var dz = dim[1] / zDivs;
  // let xoff = 0;
  let xoff = xmin/10;
  for (var x = xzMin[0]; x < xzMax[0]; x += dx) {
    // let zoff = 0;
    let zoff = zmin/10;
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
      ret.push(vec4(x, getHeight(xoff, zoff), z, 1));
      ret.push(vec4(x, getHeight(xoff, zoff + 0.1), z + dz, 1));
      ret.push(vec4(x + dx, getHeight(xoff + 0.1, zoff + 0.1), z + dz, 1));

      //Triangle 2
      //  x,z         x+dx,z
      //    \----------|
      //      \        |
      //        \      |
      //          \    |
      //            \  |
      //              \|
      //           x+dx,z+dz
      ret.push(vec4(x, getHeight(xoff, zoff), z, 1));
      ret.push(vec4(x + dx, getHeight(xoff + 0.1, zoff + 0.1), z + dz, 1));
      ret.push(vec4(x + dx, getHeight(xoff + 0.1, zoff), z, 1));
      zoff += 0.1;
    }
    xoff += 0.1;
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

//--------------------------------------------------------------------------------------------------------------------------

let transformMatrixUniform;
window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) alert("WebGL 2.0 isn't available");
  // drawmode = gl.TRIANGLES;

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.55686, 0.70196, 0.81961, 1.0);
  // gl.enable(gl.DEPTH_TEST);

  xmax = canvas.width;
  zmax = canvas.height;

  eye = vec3(1, 0.5, 1.0);

  //  Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  // transformMatrixUniform = gl.getUniformLocation(program, "uTransformMatrix");

  // get_patch(xmin, xmax, zmin, zmax)
  // points = get_patch2(0, canvas.width, 0, canvas.height);
  // points = get_patch(0, canvas.width, 0, canvas.height);

  // -------------------------

  points = get_patch2(0, 600, 0, 600);
  let shapes = {};
  shapes.hmap = {};
  shapes.hmap.Start = 0;
  shapes.hmap.Vertices = points.length;

  // for (var i = 0; i < points.length; i++) {
  //   points[i][1] =
  //     (Math.sin(points[i][0] * 1.5) / 3 + Math.sin(points[i][2] * 1) / 2) * 100;
  // }

  // Try to build a wireframe representation from triangles
  try {
    shapes.hmapWires = {};
    shapes.hmapWires.Start = points.length;
    points = points.concat(TrianglesToWireframe(points));
    shapes.hmapWires.Vertices = points.length - shapes.hmapWires.Start;
  } catch (error) {
    console.log("TrianglesToWireframe stopped unexpectedly or not defined!");
    console.error(error);
    TrianglesToWireframe = null;
    shapes.hmapWires.Vertices = 0;
  }

  // ------------------------

  // for (let i = 0; i < points.length; i++) {
  //   // points[i][1] = getHeight(points[i][0], points[i][2]);
  //   // points[i][1] = map_point(0, canvas.height, 0, 1, y);
  //   // points[i][0] = map_point(0, canvas.width, -1, 1, points[i][0]);
  //   // points[i][2] = map_point(0, canvas.width, -1, 1, points[i][2]);
  // }

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
  // let colorLoc = gl.getAttribLocation(program, "vColor");
  // gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(colorLoc);
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

  aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key == "V" || event.key == "v") {
        // toggle draw modes between triangles, points and mesh
        drawmode_idx++;
        if (drawmode_idx > 2) {
          drawmode_idx = 0;
        }
        // render();
      } else if ((event.shiftkey && event.key == 1) || event.key == 1) {
        //vary left
        xmin = xmin - 2;
        xmax = xmax - 2;
        points = get_patch2(xmin, xmax, zmin, zmax);
        // for (let i = 0; i < points.length; i++) {
        //   points[i][1] = getHeight(points[i][0], points[i][2]);
        //   // points[i][1] = map_point(0, canvas.height, 0, 1, y);
        //   // points[i][0] = map_point(xmin, xmax, -1, 1, points[i][0]);
        //   // points[i][2] = map_point(zmin, zmax, -1, 1, points[i][2]);
        // }
        // render();
      } else if ((event.shiftkey && event.key == 2) || event.key == 2) {
        //vary right
        xmin = xmin + 2;
        xmax = xmax + 2;
        points = get_patch2(xmin, xmax, zmin, zmax);
        // for (let i = 0; i < points.length; i++) {
        //   points[i][1] = getHeight(points[i][0], points[i][2]);
        //   // points[i][1] = map_point(0, canvas.height, 0, 1, y);
        //   // points[i][0] = map_point(xmin, xmax, -1, 1, points[i][0]);
        //   // points[i][2] = map_point(zmin, zmax, -1, 1, points[i][2]);
        // }
        // render();
      } else if ((event.shiftkey && event.key == 3) || event.key == 3) {
        //vary top
        if (eye[1] + 0.05 < 1) {
          eye = vec3(eye[0], eye[1] + 0.05, eye[2]);
        }
        render();
      } else if ((event.shiftkey && event.key == 4) || event.key == 4) {
        //vary bottom
        if (eye[1] - 0.05 > 0) {
          eye = vec3(eye[0], eye[1] - 0.05, eye[2]);
        }
        // render();
      // } else if ((event.shiftkey && event.key == 5) || event.key == 5) {
      //   //vary near
      //   near -= 0.05;
      //   render();
      // } else if ((event.shiftkey && event.key == 6) || event.key == 6) {
      //   //vary near
      //   far += 0.05;
      //   render();
      // }
      } else if ((event.shiftkey && event.key == 5) || event.key == 5) {
        //vary near
        zmin = zmin + 2;
        zmax = zmax + 2;
        points = get_patch2(xmin, xmax, zmin, zmax);
        // render();
      } else if ((event.shiftkey && event.key == 6) || event.key == 6) {
        //vary near
        zmin = zmin - 2;
        zmax = zmax - 2;
        points = get_patch2(xmin, xmax, zmin, zmax);
        // render();
      }
    },
    false
  );

  // render();
  window.requestAnimationFrame(render);
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // let colors = [];
  // for (let i = 0; i < points.length; i++) {
  //   if (points[i][1] < -0.05) {
  //     //blue
  //     colors.push(vec3(0.18039, 0.22353, 0.55686));
  //   } else if (0.0 < points[i][1] && points[i][1] < 0.06) {
  //     //brown
  //     colors.push(vec3(0.24, 0.15, 0.08));
  //   } else if (points[i][1] > 0.13) {
  //     //white
  //     colors.push(vec3(1.0, 1.0, 1.0));
  //   } else {
  //     colors.push(vec3(0.14, 0.56, 0.31));
  //   }
  // }

  // eye = vec3(
  //   radius * Math.sin(theta) * Math.cos(phi),
  //   radius * Math.sin(theta) * Math.sin(phi),
  //   radius * Math.cos(theta)
  // );

  // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  zmin = zmin - 1;
  zmax = zmax - 1;

  xmin = xmin - 1;
  xmax = xmax - 1;
  points = get_patch2(xmin, xmax, zmin, zmax);

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  let xmin_loc = gl.getUniformLocation(program, "xmin");
  gl.uniform1i(xmin_loc, xmin);
  let xmax_loc = gl.getUniformLocation(program, "xmax");
  gl.uniform1i(xmax_loc, xmax);

  let zmin_loc = gl.getUniformLocation(program, "zmin");
  gl.uniform1i(zmin_loc, zmin);
  let zmax_loc = gl.getUniformLocation(program, "zmax");
  gl.uniform1i(zmax_loc, zmax);

  let ymax_loc = gl.getUniformLocation(program, "ymax");
  gl.uniform1i(ymax_loc, canvas.height);

  modelViewMatrix = lookAt(eye, at, up);
  var left = -1.0;
  var right = 1.0;
  var ytop = 1.0;
  var bottom = -1.0;
  projectionMatrix = perspective(fovy, aspect, near, far);
  // projectionMatrix = ortho(left, right, bottom, ytop, near, far);
  // console.log(points);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
  if (drawmodes[drawmode_idx] === "t") {
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
  } else if (drawmodes[drawmode_idx] === "p") {
    gl.drawArrays(gl.POINTS, 0, points.length);
  } else {
    // for (let i = 0; i < col_length; i++) {
    //   gl.drawArrays(gl.LINE_STRIP, i * row_length,  row_length);
    //   console.log(row_length);
    gl.drawArrays(gl.LINES, 0, points.length);
  }
  //   console.log(col_length);
  // }

  window.requestAnimationFrame(render);
}

// ---------------------

// TrianglesToWireframe
// Inputs:
//    vertices: array of vertices ready to draw with WebGL as
//              primitive type TRIANGLES
// Outputs:
//    returns an array of vertices that outline each triangle
//    when drawn as primitive type LINES
function TrianglesToWireframe(vertices) {
  //Declare a return array
  let points = [];
  //loop index i from [0 to vertices length), counting by 3s
  for (let i = 0; i < vertices.length; i += 3) {
    //add vertex at index i to return array
    points.push(vertices[i]);
    //add two copies of vertex at index i + 1 to return array
    points.push(vertices[i + 1]);
    points.push(vertices[i + 1]);
    //add two copies of vertex at index i + 2 to return array
    points.push(vertices[i + 2]);
    points.push(vertices[i + 2]);
    //add vertex at index i to return array
    points.push(vertices[i]);
  }
  //return the return array
  return points;
}
