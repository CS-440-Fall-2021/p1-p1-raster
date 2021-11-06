let shiftPressed = false;
function handleKeyDown(event) {
  if (event.key == "V" || event.key == "v") {
    // toggle draw modes between triangles, points and mesh
    drawmode_idx++;
    if (drawmode_idx > 2) {
      drawmode_idx = 0;
    } else if (event.keyCode == 16) {
      shiftPressed = true;
      console.log("Shift Pressed");
    }
  } else if ((shiftPressed && event.key == 1) || event.key == 1) {
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
  } else if ((shiftPressed && event.key == 2) || event.key == 2) {
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
  } else if ((event.keyCode == 16 && event.key == 3) || event.key == 3) {
    //vary top
    if (eye[1] + 0.02 < 1) {
      eye = vec3(eye[0], eye[1] + 0.02, eye[2]);
    }
    // if (flag == 1) {
    //   for (let i = 0; i < points.length; i++) {
    //     let p = vec3(0, 0, 0);
    //     p[1] = map_point(0, canvas.height, 0, 1, points[i][1]).toFixed(2);
    //     p[0] = map_point(xmin, xmax, -1, 1, points[i][0]).toFixed(2);
    //     p[2] = map_point(zmin, zmax, -1, 1, points[i][2]).toFixed(2);
    //     if (eye == p) {
    //       flag = 1;
    //       // break
    //     }
    //     if (
    //       Math.abs(eye[1].toFixed(2) - p[1]) < 0.05 &&
    //       Math.abs(eye[2].toFixed(2) - p[2]) < 0.05 &&
    //       Math.abs(eye[0].toFixed(2) - p[0]) < 0.1
    //     ) {
    //       console.log(eye);
    //       console.log(p);
    //       flag = 1;
    //       break;
    //     } else if (points.length - i == 1) {
    //       flag = 0;
    //     }
    //   }
    // }
    // render();
  } else if ((event.keyCode == 16 && event.key == 4) || event.key == 4) {
    //vary bottom
    if (eye[1] - 0.02 > 0.27) {
      eye = vec3(eye[0], eye[1] - 0.02, eye[2]);
    }
    // for (let i = 0; i < points.length; i++) {
    //   let p = vec3(0, 0, 0);
    //   p[1] = map_point(0, canvas.height, 0, 1, points[i][1]).toFixed(2);
    //   p[0] = map_point(xmin, xmax, -1, 1, points[i][0]).toFixed(2);
    //   p[2] = map_point(zmin, zmax, -1, 1, points[i][2]).toFixed(2);
    //   if (eye == p) {
    //     flag = 1;
    //     // break
    //   }
    //   if (
    //     Math.abs(eye[1].toFixed(2) - p[1]) < 0.05 &&
    //     Math.abs(eye[2].toFixed(2) - p[2]) < 0.05 &&
    //     Math.abs(eye[0].toFixed(2) - p[0]) < 0.1
    //   ) {
    //     console.log(eye);
    //     console.log(p);
    //     flag = 1;
    //     break;
    //   } else if (points.length - i == 1) {
    //     flag = 0;
    //   }
    // }
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
  } else if ((event.keyCode == 16 && event.key == 5) || event.key == 5) {
    //vary near
    near += 0.1;
    // zmin = zmin + 2;
    // zmax = zmax + 2;
    // points = get_patch2(xmin, xmax, zmin, zmax);
    // render();
  } else if ((event.keyCode == 16 && event.key == 6) || event.key == 6) {
    //vary far
    // if (far > 0.2) {
    far += 0.1;
    // }
    // zmin = zmin - 2;
    // zmax = zmax - 2;
    // points = get_patch2(xmin, xmax, zmin, zmax);
    // render();
    // } else if (event.key == "w" || event.key == "W") {
    // } else if (event.key == "W" || event.key == "w") {
    //   modelViewMatrix = mult(rotMat, lookAt(eye, at, up));
    //   window.cancelAnimationFrame(anim);
    //   render();
  } else if (event.keyCode == 27) {
    //quit

    points = [];
    zmin = zmax = xmax = xmin = 0;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    escape = true;
    gl.drawArrays(gl.TRIANGLES, 0, points.length); //Rendering the triangle
  }
  window.cancelAnimationFrame(anim);
  anim = window.requestAnimationFrame(render);
}
