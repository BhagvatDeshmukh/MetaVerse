//for player movement listening
//as update func loop registers this socketlistener multiple times with each frame it's moved to create func to register only once
const initializeSocketListeners = (scene, socket, players) => {

  //socket connection for otherplayers position sync
  socket.current.on('playerMoved', (data) => {

    // set player-container position
    scene[data.id].setPosition(data.x, data.y);

    // Play the correct animation
    if (data.animation != '')
      scene[data.id].playerSprite.anims.play(data.animation, true);
    //else stop animation
    else {
      scene[data.id].playerSprite.anims.stop(); // Stop animation
      scene[data.id].playerSprite.setFrame(data.idleframe); // Set idle frame (adjust as needed)
    }

  });
}

const update = function (scene, idleDirection, io, pid, socket, players, moving) {

  if (!scene[pid.current]) return; // Skip update if player sprite is not ready


  // Game logic can go here
  const cursors = scene.input.keyboard.createCursorKeys(); // Arrow keys for movement
  moving.current = false;
  let Vx = 0;//velocity factor in x-direction
  let Vy = 0;//velocity factor in y-direction

  //if-else statement to handle movement based on key press
  if (cursors.down.isDown) {
    scene[pid.current].body.setVelocityY(64); //set velocity to container
    scene[pid.current].playerSprite.anims.play(`rundown_${players.current[pid.current].avatar}`, true); // Play running down animation
    moving.current = true;
    idleDirection.current = 0;
    Vx = 0;
    Vy = 1;
  }

  else if (cursors.right.isDown) {
    scene[pid.current].body.setVelocityX(64);
    scene[pid.current].playerSprite.anims.play(`runright_${players.current[pid.current].avatar}`, true); // Play running right animation
    moving.current = true;
    idleDirection.current = 8;
    Vx = 1;
    Vy = 0;
  }

  else if (cursors.left.isDown) {
    scene[pid.current].body.setVelocityX(-64);
    scene[pid.current].playerSprite.anims.play(`runleft_${players.current[pid.current].avatar}`, true); // Play running left animation
    moving.current = true;
    idleDirection.current = 4;
    Vx = -1;
    Vy = 0;
  }

  else if (cursors.up.isDown) {
    scene[pid.current].body.setVelocityY(-64);
    scene[pid.current].playerSprite.anims.play(`runup_${players.current[pid.current].avatar}`, true); // Play running up animation
    moving.current = true;
    idleDirection.current = 12;
    Vx = 0;
    Vy = -1;
  }

  //when no key is pressed
  else {
    moving.current = false;
    scene[pid.current].body.setVelocity(0); // Stop moving.current
    scene[pid.current].playerSprite.anims.stop(); // Stop animation
    scene[pid.current].playerSprite.setFrame(idleDirection.current); // Set idle frame (adjust as needed)
    Vx = 0;
    Vy = 0;

    //update players object
    players.current[pid.current] = {
      ...players.current[pid.current],
      vx: Vx,
      vy: Vy,
      animation: '',
      idleframe: idleDirection.current,
      x: scene[pid.current].x,
      y: scene[pid.current].y
    };

    //emit updated/stopped player object
    socket.current.emit('playerMove', players.current[pid.current]);
  }

  //  update players[pid.current] object for movement in current player to be emitted to server
  if (moving.current) {

    players.current[pid.current] = {
      ...players.current[pid.current],
      vx: Vx,
      vy: Vy,
      animation: scene[pid.current].playerSprite.anims.currentAnim.key || '',
      idleframe: idleDirection.current,
      x: scene[pid.current].x,
      y: scene[pid.current].y
    };

    socket.current.emit('playerMove', players.current[pid.current]);
  }

  // Additional logic, e.g., toggle zoom by 'Space' key
  //zoom levels={0.5, 1, 1.5, 2}
  if (Phaser.Input.Keyboard.JustDown(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE))) {
    scene.cameras.main.setZoom(scene.cameras.main.zoom === 0.5 ? 2 : scene.cameras.main.zoom -= 0.5);
  }

};

export { update, initializeSocketListeners };