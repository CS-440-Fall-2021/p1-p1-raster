"use strict";

let gl; // WebGL "context"
let program;

let t = 0.0;
let modeVal = 1.0;
let lightPos = [-50.0, 200.0, 300.0];
let lightVec = new Float32Array(3);
let ambientColor = [0.2, 0.5, 0.0];
let diffuseColor = [0.8, 0.4, 0.0];
let specularColor = [1.0, 1.0, 1.0];
let clearColor = [0.0, 0.4, 0.7];
let attenuation = 0.01;
let shininess = 2.0;
let kaVal = 1.0;
let kdVal = 1.0;
let ksVal = 1.0;

let vBuffer; //vertex buffer
let cBuffer; //color buffer
let points; //terrain vertices
let canvas;

var xmin = 0;
var zmin = 0;
var xmax;
var zmax;

let escape = false;

var normalLoc = 0;
var normalMatrixLoc = 0;

var modeLoc = 0;
var kaLoc = 0;
var kdLoc = 0;
var ksLoc = 0;
var attenuationLoc = 0;
var shininessLoc = 0;
var lightPosLoc = 0;
var lightVecLoc = 0;
var ambientColorLoc = 0;
var diffuseColorLoc = 0;
var specularColorLoc = 0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var modelviewInv = new Float32Array(16);
var normalmatrix = new Float32Array(16);

let eye = vec3(1200, 800, 300.0);
let at_vec = vec3(0.0, 0.0, 300.0);
let at = add(eye, at_vec);
let up = vec3(0.0, 1.0, 0.0);

let new_eye = eye;

// frustum viewing volume
let left = -0.1;
let right = 0.1;
let bottom = -0.5;
let top_ = 0.5;
let near = 0.1;
let far = -0.1;

// Degrees of angles of each rotation
let pitch = 0;
let yaw = 0;
let roll = 0;

let speed = 1.0; // speed of the plane
let stopped = false; // if camera is stopped
let collision_enabled = false; // used for checking if collisions enabled

var drawmodes = ["t", "p", "l"];
var drawmode_idx = 0;

var shadingmodes = [1.0, 2.0, 3.0];
var shadingmode_idx = 0;

var row_length;
var col_length;

var rotMat;

var anim;

var colors;
var colors2;

let transformMatrixUniform;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) alert("WebGL 2.0 isn't available");

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.55686, 0.70196, 0.81961, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // set x max and z max to canvas width and height
  xmax = canvas.width;
  zmax = canvas.height;

  //  Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  points = get_patch(0, 600, 0, 600); //generate initial patch

  // Build a wireframe representation from triangles
  try {
    points = points.concat(TrianglesToWireframe(points));
  } catch (error) {
    console.log("TrianglesToWireframe stopped unexpectedly or not defined!");
    console.error(error);
  }

  // Associate out shader variables with our data buffer
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  // Load the data into the GPU and bind to shader variables.
  let positionLoc = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  normalLoc = gl.getAttribLocation(program, "normal");
  if (normalLoc != -1) {
    // normal
    var stride = (3 + 2 + 3) * Float32Array.BYTES_PER_ELEMENT;
    var offset = 0 + (3 + 2) * Float32Array.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(normalLoc);
  }

  // get locations
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  normalMatrixLoc = gl.getUniformLocation(program, "normalMat");
  modeLoc = gl.getUniformLocation(program, "mode");
  lightPosLoc = gl.getUniformLocation(program, "lightPos");
  lightVecLoc = gl.getUniformLocation(program, "lightVec");
  ambientColorLoc = gl.getUniformLocation(program, "ambientColor");
  diffuseColorLoc = gl.getUniformLocation(program, "diffuseColor");
  specularColorLoc = gl.getUniformLocation(program, "specularColor");
  shininessLoc = gl.getUniformLocation(program, "shininessVal");
  attenuationLoc = gl.getUniformLocation(program, "attenuationVal");
  kaLoc = gl.getUniformLocation(program, "Ka");
  kdLoc = gl.getUniformLocation(program, "Kd");
  ksLoc = gl.getUniformLocation(program, "Ks");

  // event listeners for key up and down
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  window.cancelAnimationFrame(anim);
  if (escape == false) {
    window.requestAnimationFrame(render);
  } else if (escape == true) {
    window.cancelAnimationFrame(anim);
  }
};

function render(timestamp) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (modeVal == 1.0)
  {
    colors2 = [];
  for (let i = 0; i < points.length; i++) {
    if (points[i][1] < 0.0) {
      //blue
      colors2.push(vec3(0.18039, 0.22353, 0.55686));
    } else if (0.0 < points[i][1] && points[i][1] < 100.0) {
      //brown
      colors2.push(vec3(0.14, 0.56, 0.31));
    } else if (points[i][1] > 250.0) {
      //white
      colors2.push(vec3(1.0, 1.0, 1.0));
    } else {
      colors2.push(vec3(0.24, 0.15, 0.08));
    }
  }
  colors = [];

  for (var i = 0; i < colors2.length; i += 3) {
    let c = vec3(
      getAvg([colors2[i][0], colors2[i + 1][0], colors2[i + 2][0]]),
      getAvg([colors2[i][1], colors2[i + 1][1], colors2[i + 2][1]]),
      getAvg([colors2[i][2], colors2[i + 1][2], colors2[i + 2][2]])
    );
    colors.push(c);
    colors.push(c);
    colors.push(c);
  }

  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  let colorLoc = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);
}

  points = get_patch(xmin, xmax, zmin, zmax);

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

  if (escape == false) {
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
  }

  if (modeLoc != -1) gl.uniform1f(modeLoc, modeVal);
  if (kaLoc != -1) gl.uniform1f(kaLoc, kaVal);
  if (kdLoc != -1) gl.uniform1f(kdLoc, kdVal);
  if (ksLoc != -1) gl.uniform1f(ksLoc, ksVal);
  if (attenuationLoc != -1) gl.uniform1f(attenuationLoc, attenuation);
  if (shininessLoc != -1) gl.uniform1f(shininessLoc, shininess);
  if (lightPosLoc != -1) gl.uniform3fv(lightPosLoc, lightPos);
  if (lightVecLoc != -1) gl.uniform3fv(lightVecLoc, lightVec);
  if (ambientColorLoc != -1) gl.uniform3fv(ambientColorLoc, ambientColor);
  if (diffuseColorLoc != -1) gl.uniform3fv(diffuseColorLoc, diffuseColor);
  if (specularColorLoc != -1) gl.uniform3fv(specularColorLoc, specularColor);

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

  let rotate_x_matrix = rotateX(pitch);
  let rotate_y_matrix = rotateY(yaw);
  let rotate_z_matrix = rotateZ(roll);

  // Checks for collisions if enabled
  if (collision_enabled) detect_collion();

  // Rolls camera accordingly
  up = vec4(0, 1, 0, 0);
  up = mult(rotate_z_matrix, up);
  up = vec3(up[0], up[1], up[2]);

  // Change the yaw and pitch of the camera accordingly
  at_vec = vec3(0.0, 0.0, speed);
  at_vec = vec4(at_vec[0], at_vec[1], at_vec[2], 0);
  let rotate_xy = mult(rotate_y_matrix, rotate_x_matrix);
  at_vec = mult(rotate_xy, at_vec);

  at_vec = vec3(at_vec[0], at_vec[1], at_vec[2]);

  // Doesn't allow camera to move when speed is 0
  if (!stopped) {
    move_camera_pitch();
  }

  at = add(eye, at_vec);
  modelViewMatrix = lookAt(eye, at, up);

  if (!stopped) {
    eye = add(eye, at_vec);
  }

  // Generates terrain of 1200 points with camera in center
  xmin = eye[0] - 1200;
  xmax = eye[0] + 1200;

  zmin = eye[2] - 1200;
  zmax = eye[2] + 1200;

  projectionMatrix = frustum(left, right, bottom, top_, near, far);

  modelviewInv = inverse4(modelViewMatrix);
  normalmatrix = transpose(modelviewInv);

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
  gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalmatrix));

  if (drawmodes[drawmode_idx] === "t") {
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
  } else if (drawmodes[drawmode_idx] === "p") {
    gl.drawArrays(gl.POINTS, 0, points.length);
  } else {
    gl.drawArrays(gl.LINES, 0, points.length);
  }

  anim = window.requestAnimationFrame(render);
}
