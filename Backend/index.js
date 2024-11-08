import express from "express";
import http from "http";
import env from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import data from './data.js';

const app = express();
app.use(cors());
const port = 3000;

let players = data;

const server = http.createServer(app);
const corsWhitelist = ['http://localhost:5173', 'http://172.17.0.217:5173'];
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            const isOriginWhitelist = (origin && corsWhitelist.includes(origin));
            callback(null, isOriginWhitelist);
        }
    },
});

io.on("connection", (socket, avatar,) => {

    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (data) => {

        // create a new player and add it to our players object
        players[socket.id] = {
            x: 400,
            y: 400,
            vx: 0,
            vy: 0,
            animation: '',
            idleframe: 0,
            room: data.room,
            id: socket.id,
            avatar: data.avatar,
            username: data.username
        };


        socket.join(data.room);
        console.log(`User with ID: ${socket.id} joined room: ${data.room}`);

        // send the players object to the new player
        socket.emit('currentPlayers', players);

        // update all other players of the new player
        socket.broadcast.to(data.room).emit('newPlayer', players[socket.id]);

    });



    socket.on("playerMove", (data) => {
        socket.broadcast.emit("playerMoved", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);

        // update all other players of the left player
        socket.broadcast.emit('leftPlayer', players[socket.id]);

        delete players[socket.id];
    });
});


server.listen(port, () => {
    console.log("listening at port", port)
})