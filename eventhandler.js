let shiftPressed = false;

function handleKeyDown(event) {
  if (event.key == "V" || event.key == "v") {
    // toggle draw modes between triangles, points and mesh
    drawmode_idx++;
    if (drawmode_idx > 2) {
      drawmode_idx = 0;
    }
  } else if (event.key == "C" || event.key == "c") {
    shadingmode_idx++;
    if (shadingmode_idx > 2) {
      shadingmode_idx = 0;
    }
    modeVal = shadingmodes[shadingmode_idx];
    console.log(modeVal);
    //COMMENT OUT THE BELOW LINE
    // mode=1;
  } else if (event.keyCode == 16) {
    shiftPressed = true;
    console.log("Shift Pressed");
  } else if (event.keyCode == 49) {
    //1
    if (!shiftPressed) {
      //vary left
      if (left > -0.3) {
        left = left - 0.01;
      }

      // xmin = xmin - 2;
      // xmax = xmax - 2;
      // points = get_patch2(xmin, xmax, zmin, zmax);
    } else if (shiftPressed) {
      if (left < -0.05) {
        left = left + 0.01;
      }
    }
    // if (!shiftPressed) {
    //   //vary left
    //   xmin = xmin - 2;
    //   xmax = xmax - 2;
    //   points = get_patch2(xmin, xmax, zmin, zmax);
    // } else if (shiftPressed) {
    //   xmin = xmin + 2;
    //   xmax = xmax + 2;
    //   points = get_patch2(xmin, xmax, zmin, zmax);
    // }
  } else if (event.keyCode == 50) {
    //2
    //vary right
    if (!shiftPressed) {
      if (right < 0.35) {
        right = right + 0.05;
      }
    } else if (shiftPressed) {
      if (right > 0.1) {
        right = right - 0.05;
      }
    }
  } else if (event.keyCode == 51) {
    //3
    //vary top
    if (!shiftPressed) {
      if (top_ < 1.9) {
        top_ += 0.05;
      }
    } else if (shiftPressed) {
      if (top_ > 0.05) {
        top_ -= 0.05;
      }
    }

    // if (!shiftPressed) {
    //   if (eye[1] + 20 < 600) {
    //     eye = vec3(eye[0], eye[1] + 20, eye[2]);
    //   }
    // } else if (shiftPressed) {
    //   if (eye[1] - 20 > 390) {
    //     eye = vec3(eye[0], eye[1] - 20, eye[2]);
    //   }
    // }
  } else if (event.keyCode == 52) {
    //4
    //vary bottom

    if (!shiftPressed) {
      if (bottom > -0.7) {
        bottom -= 0.01;
      }
    } else if (shiftPressed) {
      if (bottom < -0.15) {
        bottom += 0.01;
      }
    }
    // if (!shiftPressed) {

    //   // if (eye[1] - 0.02 > 0.27) {
    //   //   eye = vec3(eye[0], eye[1] - 0.02, eye[2]);
    //   // }
    // } else if (shiftPressed) {
    //   // if (eye[1] + 0.02 < 1) {
    //   //   eye = vec3(eye[0], eye[1] + 0.02, eye[2]);
    //   // }
    // }
  } else if (event.keyCode == 53) {
    //5
    if (!shiftPressed) {
      //vary near
      if (near < 1.45) {
        near += 0.02;
      }
    } else if (shiftPressed) {
      if (near > 0.8) {
        near -= 0.02;
      }
    }
  } else if (event.keyCode == 54) {
    //6
    //vary far
    console.log(far);
    if (!shiftPressed) {
      if (far < -0.05) {
        far += 0.05;
        console.log(far);
      }
    } else if (shiftPressed) {
      if (far > -1.5) {
        far -= 0.05;
        console.log(far);
      }
    }
  }
  // zmin = zmin - 2;
  // zmax = zmax - 2;
  // points = get_patch2(xmin, xmax, zmin, zmax);
  // render();
  // } else if (event.key == "w" || event.key == "W") {
  // } else if (event.key == "W" || event.key == "w") {
  //   modelViewMatrix = mult(rotMat, lookAt(eye, at, up));
  //   window.cancelAnimationFrame(anim);
  //   render();
  else if (event.keyCode == 27) {
    //quit

    points = [];
    zmin = zmax = xmax = xmin = 0;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    escape = true;
    gl.drawArrays(gl.TRIANGLES, 0, points.length); //Rendering the triangle
  } else if (event.keyCode == 16) {
    console.log("shift");
  }

  else if (event.key == "W" || event.key == "w") {
    // at_vec[1] = Math.min(at_vec[1] + 10, 600);
    pitch = Math.max(pitch - 1, -45);
    // console.log(at_vec[1]);
  }

  else if (event.key == "S" || event.key == "s") {
    // at_vec[1] = Math.max(at_vec[1] - 10, -280);
    pitch = Math.min(pitch + 1, 45);
    // console.log(at_vec[1]);
  }

  else if (event.key == "D" || event.key == "d") {
    // at_vec[0] = Math.max(at_vec[0] - 10, -280);
    // xmax += at_vec[0];
    // xmin += at_vec[0];
    yaw = Math.max(yaw - 1, -45);
    // console.log(at_vec[0]);
  }

  else if (event.key == "A" || event.key == "a") {
    // at_vec[0] = Math.min(at_vec[0] + 10, 280);
    // xmin -= at_vec[0];
    // xmax -= at_vec[0];
    // console.log(at_vec[0]);
    yaw = Math.min(yaw + 1, 45);
  }

  else if (event.key == "Q" || event.key == "q") {
    // at_vec[0] = Math.min(at_vec[0] + 10, 280);
    // xmin -= at_vec[0];
    // xmax -= at_vec[0];
    // console.log(at_vec[0]);
    roll = Math.max(roll - 1, -90);
  }

  else if (event.key == "E" || event.key == "e") {
    // at_vec[0] = Math.min(at_vec[0] + 10, 280);
    // xmin -= at_vec[0];
    // xmax -= at_vec[0];
    // console.log(at_vec[0]);
    roll = Math.min(roll + 1, 90);
  }

  window.cancelAnimationFrame(anim);
  anim = window.requestAnimationFrame(render);
}

function handleKeyUp(event) {
  if (event.keyCode == 16) {
    shiftPressed = false;
    console.log("Shift unPressed");
  }
}
