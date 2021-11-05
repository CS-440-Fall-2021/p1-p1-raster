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
    let xoff = xmin / 10;
    for (var x = xzMin[0]; x < xzMax[0]; x += dx) {
      // let zoff = 0;
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