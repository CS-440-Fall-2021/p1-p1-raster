let shiftPressed = false;

function handleKeyDown(event) {
  if (event.key == "V" || event.key == "v") {
    // toggle draw modes between triangles, points and mesh
    drawmode_idx++;
    if (drawmode_idx > 2) {
      drawmode_idx = 0;
    }
  } else if (event.key == "C" || event.key == "c") {
    // toggle shading modes
    shadingmode_idx++;
    if (shadingmode_idx > 2) {
      shadingmode_idx = 0;
    }
    modeVal = shadingmodes[shadingmode_idx];
    console.log(modeVal);
    //COMMENT OUT THE BELOW LINE
    // mode=1;
  } else if (event.keyCode == 16) {
    // true if shift pressed
    shiftPressed = true;
  } else if (event.keyCode == 49) {
    //1
    //vary left
    if (!shiftPressed) {
      if (left > -0.3) {
        left = left - 0.01;
      }
    } else if (shiftPressed) {
      if (left < -0.05) {
        left = left + 0.01;
      }
    }
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
  } else if (event.keyCode == 53) {
    //5
    if (!shiftPressed) {
      //vary near
      if (near < 1.45) {
        near += 0.02;
      }
    } else if (shiftPressed) {
      if (near > 0.1) {
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
  } else if (event.keyCode == 27) {
    //esc
    //quit
    points = [];
    zmin = zmax = xmax = xmin = 0;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    escape = true;
    gl.drawArrays(gl.TRIANGLES, 0, points.length); //Rendering the triangle
  } else if (event.key == "W" || event.key == "w") {
    // change  pitch
    pitch = Math.max(pitch - 1, -90);
  } else if (event.key == "S" || event.key == "s") {
    // change  pitch
    pitch = Math.min(pitch + 1, 45);
  } else if (event.key == "D" || event.key == "d") {
    // change yaw
    yaw = Math.max(yaw - 1, -90);
  } else if (event.key == "A" || event.key == "a") {
    // change yaw
    yaw = Math.min(yaw + 1, 90);
  } else if (event.key == "Q" || event.key == "q") {
    // change roll and viewing volume accordingly
    roll = Math.max(roll - 1, -90);
    if (roll > -90 && roll <= 0) {
      left -= 0.01;
      right += 0.01;
    } else if (roll > 0) {
      left += 0.01;
      right -= 0.01;
    }
  } else if (event.key == "E" || event.key == "e") {
    // change roll and viewing volume accordingly
    roll = Math.min(roll + 1, 90);
    if (roll <= 0) {
      left += 0.01;
      right -= 0.01;
    } else if (roll > 0 && roll < 90) {
      left -= 0.01;
      right += 0.01;
    }
  } else if (event.keyCode == 38) {
    // Increases speed to a limit of 10
    if (stopped) stopped = false;

    else speed = Math.min(10, speed + 1);

  } else if (event.keyCode == 40) {
    // Decreases speed to 1, then stops the camera
    if (speed > 1) speed = speed - 1;

    else stopped = true;

  } else if (event.key == "T" || event.key == "t") {
    // Used to toggle collisions
    if (collision_enabled) stopped = false;
    collision_enabled = !collision_enabled;
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
