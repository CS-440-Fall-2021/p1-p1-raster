function get_patch2(xmin, xmax, zmin, zmax) {
  let ret = [];
  var xDiff = 0; // - xmin;
  var zDiff = 0; // - zmin;
  var xzMin = vec2(xmin, zmin);
  var xzMax = vec2(xmax, zmax);
  var xDivs = 150;
  var zDivs = 150;
  var dim = subtract(xzMax, xzMin);
  var dx = dim[0] / xDivs;
  var dz = dim[1] / zDivs;
  let xoff = xmin / 10;
  for (var x = xzMin[0]; x < xzMax[0]; x += dx) {
    let zoff = zmin / 10;
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
      ret.push(vec4(x + xDiff, getHeight(xoff, zoff), z + zDiff, 1));
      ret.push(vec4(x + xDiff, getHeight(xoff, zoff + 0.1), z + zDiff + dz, 1));
      ret.push(
        vec4(
          x + xDiff + dx,
          getHeight(xoff + 0.1, zoff + 0.1),
          z + zDiff + dz,
          1
        )
      );

      //Triangle 2
      //  x,z         x+dx,z
      //    \----------|
      //      \        |
      //        \      |
      //          \    |
      //            \  |
      //              \|
      //           x+dx,z+dz
      ret.push(vec4(x + xDiff, getHeight(xoff, zoff), z + zDiff, 1));
      ret.push(
        vec4(
          x + xDiff + dx,
          getHeight(xoff + 0.1, zoff + 0.1),
          z + zDiff + dz,
          1
        )
      );
      ret.push(vec4(x + xDiff + dx, getHeight(xoff + 0.1, zoff), z + zDiff, 1));
      zoff += 0.1;
    }
    xoff += 0.1;
  }
  return ret;
}

function map_point(P, Q, A, B, X) {
  let alpha;

  if (typeof P == "number" && typeof Q == "number" && typeof X == "number")
    alpha = (X - P) / (Q - P);
  else if (P.length != Q.length || Q.length != X.length)
    throw "vector dimension mismatch";
  else alpha = (X[0] - P[0]) / (Q[0] - P[0]);

  return mix(A, B, alpha);
}

function getHeight(x, z) {
  return noise.perlin2(-x / 1.5, -z / 1.5) * 1000;
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

function move_camera_pitch() {
  eye[1] = Math.max(eye[1] + at_vec[1] * 10, 200);

  eye[1] = Math.min(eye[1], 600);

  // eye = add(eye, mult(10, at_vec));
  // console.log(eye);
  // eye[1] = eye[1] + at_vec[1]*0.01;
}

function move_camera_yaw() {}

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
