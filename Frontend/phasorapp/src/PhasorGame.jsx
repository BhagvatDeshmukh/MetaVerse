import React, { useEffect, useRef } from 'react';
import io from "socket.io-client";
import create from './methods/createPhasor';
import preload from './methods/preloadPhasor';
import { update } from './methods/updatePhasor';


//list of avatars
const avatars = ["King", "Maid", "Merchant", "Peasant", "Prince", "Queen", "Robinhood", "Servant", "Soldier", "Warrior"];

const PhaserGame = () => {


  let players = useRef({});//all players data in room
  let idleDirection = useRef(0);// idle frame
  let moving = useRef(false);
  const pid = useRef(null);// current player id
  const socket = useRef(null);
  const game = useRef(null);

  useEffect(() => {

    socket.current = io("http://localhost:3000/");//socket connection to backend

    // Phaser game configuration
    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-container',//provide parent div id
      width: 900,//canva width should same as parents width
      height: 600,//_,,_,,_
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: true,// for sprite boundary visibility, if true visible
        },
      },
      scene: {
        // Bind `this` context to pass scene
        preload: function () { preload(this); },
        create: function () { create(this, players, io, pid, socket, moving); },
        update: function () { update(this, idleDirection, io, pid, socket, players, moving); },
      },
    };

    // Once connected, immediately send data (e.g., player info)
    socket.current.on('connect', () => {
      socket.current.emit('join_room', { room: 'garden', avatar: avatars[Math.floor(Math.random() * 10)] , username:'username'});
      pid.current = socket.current.id;

      console.log(pid.current);// current player id
    });

    // update the current players when the data is received from the server
    socket.current.on('currentPlayers', (playerslist) => {
      players.current = playerslist;

      console.log("Players received:", players.current);  //players list currently in room  
    });

    // Initialize the game inside the referenced div
    game.current = new Phaser.Game(config);

    // Clean up game when component unmounts
    return () => {
      game.current.destroy(true);
    };
  }, []);

  return (
    <div
      id="phaser-container"  // This is where the Phaser game will be rendered
      style={{ width: '900px', height: '600px', overflow: 'hidden', margin: 'auto', display: 'flex' }}
    ></div>
  );
};

export default PhaserGame;
