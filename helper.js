function get_patch(xmin, xmax, zmin, zmax) {
  let ret = []; // triangle vertices
  var xzMin = vec2(xmin, zmin);
  var xzMax = vec2(xmax, zmax);
  var xDivs = 100;
  var zDivs = 100;
  var dim = subtract(xzMax, xzMin);
  var dx = dim[0] / xDivs;
  var dz = dim[1] / zDivs;
  let xoff = xmin / 10; // for perlin noise
  for (var x = xzMin[0]; x < xzMax[0]; x += dx) {
    let zoff = zmin / 10; // for perlin noise
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

function getHeight(x, z) {
  return noise.perlin2(-x / 1.5, -z / 1.5) * 1000; // perlin noise
}

// returns an array of vertices that outline each triangle
// when drawn as primitive type LINES
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

// frustum function by WS
function frustum(left, right, bottom, top, near, far) {
  if (left == right) {
    throw "frustum(): left and right are equal";
  }

  if (bottom == top) {
    throw "frustum(): bottom and top are equal";
  }

  if (near == far) {
    throw "frustum(): near and far are equal";
  }

  let w = right - left;

  let h = top - bottom;

  let d = far - near;

  let result = mat4();

  result[0][0] = (2.0 * near) / w;

  result[1][1] = (2.0 * near) / h;

  result[2][2] = -(far + near) / d;

  result[0][2] = (right + left) / w;

  result[1][2] = (top + bottom) / h;

  result[2][3] = (-2 * far * near) / d;

  result[3][2] = -1;

  result[3][3] = 0.0;

  return result;
}

function mat4Transpose(a, transposed) {
  var t = 0;
  for (var i = 0; i < 4; ++i) {
    for (var j = 0; j < 4; ++j) {
      transposed[t++] = a[j * 4 + i];
    }
  }
  return transposed;
}

function mat4Invert(m, inverse) {
  var inv = new Float32Array(16);
  inv[0] =
    m[5] * m[10] * m[15] -
    m[5] * m[11] * m[14] -
    m[9] * m[6] * m[15] +
    m[9] * m[7] * m[14] +
    m[13] * m[6] * m[11] -
    m[13] * m[7] * m[10];
  inv[4] =
    -m[4] * m[10] * m[15] +
    m[4] * m[11] * m[14] +
    m[8] * m[6] * m[15] -
    m[8] * m[7] * m[14] -
    m[12] * m[6] * m[11] +
    m[12] * m[7] * m[10];
  inv[8] =
    m[4] * m[9] * m[15] -
    m[4] * m[11] * m[13] -
    m[8] * m[5] * m[15] +
    m[8] * m[7] * m[13] +
    m[12] * m[5] * m[11] -
    m[12] * m[7] * m[9];
  inv[12] =
    -m[4] * m[9] * m[14] +
    m[4] * m[10] * m[13] +
    m[8] * m[5] * m[14] -
    m[8] * m[6] * m[13] -
    m[12] * m[5] * m[10] +
    m[12] * m[6] * m[9];
  inv[1] =
    -m[1] * m[10] * m[15] +
    m[1] * m[11] * m[14] +
    m[9] * m[2] * m[15] -
    m[9] * m[3] * m[14] -
    m[13] * m[2] * m[11] +
    m[13] * m[3] * m[10];
  inv[5] =
    m[0] * m[10] * m[15] -
    m[0] * m[11] * m[14] -
    m[8] * m[2] * m[15] +
    m[8] * m[3] * m[14] +
    m[12] * m[2] * m[11] -
    m[12] * m[3] * m[10];
  inv[9] =
    -m[0] * m[9] * m[15] +
    m[0] * m[11] * m[13] +
    m[8] * m[1] * m[15] -
    m[8] * m[3] * m[13] -
    m[12] * m[1] * m[11] +
    m[12] * m[3] * m[9];
  inv[13] =
    m[0] * m[9] * m[14] -
    m[0] * m[10] * m[13] -
    m[8] * m[1] * m[14] +
    m[8] * m[2] * m[13] +
    m[12] * m[1] * m[10] -
    m[12] * m[2] * m[9];
  inv[2] =
    m[1] * m[6] * m[15] -
    m[1] * m[7] * m[14] -
    m[5] * m[2] * m[15] +
    m[5] * m[3] * m[14] +
    m[13] * m[2] * m[7] -
    m[13] * m[3] * m[6];
  inv[6] =
    -m[0] * m[6] * m[15] +
    m[0] * m[7] * m[14] +
    m[4] * m[2] * m[15] -
    m[4] * m[3] * m[14] -
    m[12] * m[2] * m[7] +
    m[12] * m[3] * m[6];
  inv[10] =
    m[0] * m[5] * m[15] -
    m[0] * m[7] * m[13] -
    m[4] * m[1] * m[15] +
    m[4] * m[3] * m[13] +
    m[12] * m[1] * m[7] -
    m[12] * m[3] * m[5];
  inv[14] =
    -m[0] * m[5] * m[14] +
    m[0] * m[6] * m[13] +
    m[4] * m[1] * m[14] -
    m[4] * m[2] * m[13] -
    m[12] * m[1] * m[6] +
    m[12] * m[2] * m[5];
  inv[3] =
    -m[1] * m[6] * m[11] +
    m[1] * m[7] * m[10] +
    m[5] * m[2] * m[11] -
    m[5] * m[3] * m[10] -
    m[9] * m[2] * m[7] +
    m[9] * m[3] * m[6];
  inv[7] =
    m[0] * m[6] * m[11] -
    m[0] * m[7] * m[10] -
    m[4] * m[2] * m[11] +
    m[4] * m[3] * m[10] +
    m[8] * m[2] * m[7] -
    m[8] * m[3] * m[6];
  inv[11] =
    -m[0] * m[5] * m[11] +
    m[0] * m[7] * m[9] +
    m[4] * m[1] * m[11] -
    m[4] * m[3] * m[9] -
    m[8] * m[1] * m[7] +
    m[8] * m[3] * m[5];
  inv[15] =
    m[0] * m[5] * m[10] -
    m[0] * m[6] * m[9] -
    m[4] * m[1] * m[10] +
    m[4] * m[2] * m[9] +
    m[8] * m[1] * m[6] -
    m[8] * m[2] * m[5];

  var det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
  if (det == 0) return false;
  det = 1.0 / det;
  for (var i = 0; i < 16; i++) inverse[i] = inv[i] * det;
  return true;
}

function mat4Invert(m) {
  var inv = new Float32Array(16);
  inv[0] =
    m[5] * m[10] * m[15] -
    m[5] * m[11] * m[14] -
    m[9] * m[6] * m[15] +
    m[9] * m[7] * m[14] +
    m[13] * m[6] * m[11] -
    m[13] * m[7] * m[10];
  inv[4] =
    -m[4] * m[10] * m[15] +
    m[4] * m[11] * m[14] +
    m[8] * m[6] * m[15] -
    m[8] * m[7] * m[14] -
    m[12] * m[6] * m[11] +
    m[12] * m[7] * m[10];
  inv[8] =
    m[4] * m[9] * m[15] -
    m[4] * m[11] * m[13] -
    m[8] * m[5] * m[15] +
    m[8] * m[7] * m[13] +
    m[12] * m[5] * m[11] -
    m[12] * m[7] * m[9];
  inv[12] =
    -m[4] * m[9] * m[14] +
    m[4] * m[10] * m[13] +
    m[8] * m[5] * m[14] -
    m[8] * m[6] * m[13] -
    m[12] * m[5] * m[10] +
    m[12] * m[6] * m[9];
  inv[1] =
    -m[1] * m[10] * m[15] +
    m[1] * m[11] * m[14] +
    m[9] * m[2] * m[15] -
    m[9] * m[3] * m[14] -
    m[13] * m[2] * m[11] +
    m[13] * m[3] * m[10];
  inv[5] =
    m[0] * m[10] * m[15] -
    m[0] * m[11] * m[14] -
    m[8] * m[2] * m[15] +
    m[8] * m[3] * m[14] +
    m[12] * m[2] * m[11] -
    m[12] * m[3] * m[10];
  inv[9] =
    -m[0] * m[9] * m[15] +
    m[0] * m[11] * m[13] +
    m[8] * m[1] * m[15] -
    m[8] * m[3] * m[13] -
    m[12] * m[1] * m[11] +
    m[12] * m[3] * m[9];
  inv[13] =
    m[0] * m[9] * m[14] -
    m[0] * m[10] * m[13] -
    m[8] * m[1] * m[14] +
    m[8] * m[2] * m[13] +
    m[12] * m[1] * m[10] -
    m[12] * m[2] * m[9];
  inv[2] =
    m[1] * m[6] * m[15] -
    m[1] * m[7] * m[14] -
    m[5] * m[2] * m[15] +
    m[5] * m[3] * m[14] +
    m[13] * m[2] * m[7] -
    m[13] * m[3] * m[6];
  inv[6] =
    -m[0] * m[6] * m[15] +
    m[0] * m[7] * m[14] +
    m[4] * m[2] * m[15] -
    m[4] * m[3] * m[14] -
    m[12] * m[2] * m[7] +
    m[12] * m[3] * m[6];
  inv[10] =
    m[0] * m[5] * m[15] -
    m[0] * m[7] * m[13] -
    m[4] * m[1] * m[15] +
    m[4] * m[3] * m[13] +
    m[12] * m[1] * m[7] -
    m[12] * m[3] * m[5];
  inv[14] =
    -m[0] * m[5] * m[14] +
    m[0] * m[6] * m[13] +
    m[4] * m[1] * m[14] -
    m[4] * m[2] * m[13] -
    m[12] * m[1] * m[6] +
    m[12] * m[2] * m[5];
  inv[3] =
    -m[1] * m[6] * m[11] +
    m[1] * m[7] * m[10] +
    m[5] * m[2] * m[11] -
    m[5] * m[3] * m[10] -
    m[9] * m[2] * m[7] +
    m[9] * m[3] * m[6];
  inv[7] =
    m[0] * m[6] * m[11] -
    m[0] * m[7] * m[10] -
    m[4] * m[2] * m[11] +
    m[4] * m[3] * m[10] +
    m[8] * m[2] * m[7] -
    m[8] * m[3] * m[6];
  inv[11] =
    -m[0] * m[5] * m[11] +
    m[0] * m[7] * m[9] +
    m[4] * m[1] * m[11] -
    m[4] * m[3] * m[9] -
    m[8] * m[1] * m[7] +
    m[8] * m[3] * m[5];
  inv[15] =
    m[0] * m[5] * m[10] -
    m[0] * m[6] * m[9] -
    m[4] * m[1] * m[10] +
    m[4] * m[2] * m[9] +
    m[8] * m[1] * m[6] -
    m[8] * m[2] * m[5];

  var det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
  if (det == 0) return false;
  det = 1.0 / det;
  for (var i = 0; i < 16; i++) inverse[i] = inv[i] * det;
  return true;
}

// Changes the Y coordinate of the camera accordingly
function move_camera_pitch() {
  eye[1] = Math.max(eye[1] + at_vec[1] * 10, 200);
  eye[1] = Math.min(eye[1], 1000);
}

// Detects collisions and stops camera if collided
// Resumes flight when at_vec is not colliding with any point
function detect_collion() {
  let collided = false;
  let temp_eye = add(eye, mult(3, at_vec));
  temp_eye = vec4(temp_eye[0], temp_eye[1], temp_eye[2], 0);
  for (let i = 0; i < points.length; i++) {
    let diff = subtract(temp_eye, points[i]);
    if (
      Math.abs(diff[0]) < 25 &&
      Math.abs(diff[1]) < 25 &&
      Math.abs(diff[2]) < 25
    ) {
      speed = 1;
      stopped = true;
      collided = true;
    }
  }
  if (!collided) {
    stopped = false;
  }
}

function transpose(m) {
  let result;
  if (m.type == "patch") {
    let out = patch();
    for (let i = 0; i < 4; i++) out[i] = new Array(4);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) out[i][j] = m[j][i];
    return out;
  }
  switch (m.type) {
    case "mat2":
      result = mat2(m[0][0], m[1][0], m[0][1], m[1][1]);
      return result;
      break;

    case "mat3":
      result = mat3(
        m[0][0],
        m[1][0],
        m[2][0],
        m[0][1],
        m[1][1],
        m[2][1],
        m[0][2],
        m[1][2],
        m[2][2]
      );
      return result;
      break;

    case "mat4":
      result = mat4(
        m[0][0],
        m[1][0],
        m[2][0],
        m[3][0],
        m[0][1],
        m[1][1],
        m[2][1],
        m[3][1],
        m[0][2],
        m[1][2],
        m[2][2],
        m[3][2],
        m[0][3],
        m[1][3],
        m[2][3],
        m[3][3]
      );

      return result;
      break;

    default:
      throw "transpose(): trying to transpose a non-matrix";
  }
}

function getAvg(array) {
  var sum = 0;
  for (var i = 0; i < array.length; i++) {
    sum += array[i]; //don't forget to add the base
  }

  return sum / array.length;
}
