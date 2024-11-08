import { initializeSocketListeners } from "./updatePhasor";

export default function create(scene, players, io, pid, socket, moving) {

    //list of avatars
    const avatars = ["King", "Maid", "Merchant", "Peasant", "Prince", "Queen", "Robinhood", "Servant", "Soldier", "Warrior"];

    //calling player movement socket listener once
    initializeSocketListeners(scene, socket, players);

    // Handle new player
    socket.current.on('newPlayer', (newplayer) => {
        //update players object
        players.current = { ...players.current, [newplayer.id]: newplayer };

        // Add player sprite with physics
        let playerSprite = scene.add.sprite(0, 0, newplayer.avatar);
        playerSprite.setScale(0.75);  // Scale the sprite if needed

        // Create container for the sprite and username text
        scene[newplayer.id] = scene.add.container(newplayer.x, newplayer.y).setSize(playerSprite.width*0.75, playerSprite.height*0.75);

        // Add username text slightly above the sprite
        let playerUsername = scene.add.text(0, -20, newplayer.username, {  // Adjust -10 as needed
            fontFamily: 'Arial',
            color: '#850606',
        }).setFontSize(8).setOrigin(0.5, 1);

        // Store the player sprite in the container for easy access
        scene[newplayer.id].playerSprite = playerSprite;

        // Add the sprite and text to the container
        scene[newplayer.id].add(playerSprite);
        scene[newplayer.id].add(playerUsername);

        // Enable physics on the container for collision detection
        scene.physics.world.enable(scene[newplayer.id]);

        console.log('New player created:', newplayer);// new player joined

        //Add collisions for new player
        scene.physics.add.collider(scene[newplayer.id], bushlayer);
        scene.physics.add.collider(scene[newplayer.id], gardenlayoutbushlayer);
        scene.physics.add.collider(scene[newplayer.id], routeboundarylayer);
        scene.physics.add.collider(scene[newplayer.id], decorationslayer);
    });

    // Handle left player
    socket.current.on('leftPlayer', (leftplayer) => {

        scene[leftplayer.id].destroy(); // Destroy sprite when player leaves
        delete scene[leftplayer.id]; // Remove reference to the player sprite
        delete players.current[leftplayer.id];// remove from players object

        console.log('Player left:', leftplayer);//left player
    });

    // Create the map and layers
    const map = scene.make.tilemap({ key: "map", tileWidth: 16, tileHeight: 16 });
    const tileset = map.addTilesetImage("overworld", "overworld");
    const baselayer = map.createLayer('base', tileset, 0, 0);
    const bushlayer = map.createLayer('bush', tileset, 0, 0);
    const gardenlayoutbushlayer = map.createLayer('gardenlayoutbush', tileset, 0, 0);
    const routeboundarylayer = map.createLayer('routeboundary', tileset, 0, 0);
    const decorationslayer = map.createLayer('decorations', tileset, 0, 0);

    // Create sprites for all current players
    Object.keys(players.current).forEach((playerId) => {

        const playerData = players.current[playerId];

        // Add player sprite with physics
        let playerSprite = scene.physics.add.sprite(0, 0, playerData.avatar);
        playerSprite.setScale(0.75);  // Scale the sprite if needed

        // Create container for the sprite and username text
        scene[playerId] = scene.add.container(playerData.x, playerData.y).setSize(playerSprite.width*0.75, playerSprite.height*0.75);

        // Add username text slightly above the sprite
        let playerUsername = scene.add.text(0, -20, playerData.username, {  // Adjust -20 as needed
            fontFamily: 'Arial',
            color: '#850606',
        }).setFontSize(8).setOrigin(0.5, 1);

        // Store the player sprite in the container for easy access
        scene[playerId].playerSprite = playerSprite;

        // Add the sprite and text to the container
        scene[playerId].add(playerSprite);
        scene[playerId].add(playerUsername);

        // Enable physics on the container for collision detection
        scene.physics.world.enable(scene[playerId]);

        //Add collisions
        scene.physics.add.collider(scene[playerId], bushlayer);
        scene.physics.add.collider(scene[playerId], gardenlayoutbushlayer);
        scene.physics.add.collider(scene[playerId], routeboundarylayer);
        scene.physics.add.collider(scene[playerId], decorationslayer);

    });

    //Select tiles for collision for a layer
    bushlayer.setCollisionBetween(645, 687);
    gardenlayoutbushlayer.setCollisionBetween(521, 642);
    routeboundarylayer.setCollisionBetween(283, 284);
    decorationslayer.setCollisionBetween(2, 1401);

    // Add camera settings
    scene.cameras.main.startFollow(scene[pid.current]);
    scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    scene.cameras.main.setZoom(1.5);


    // Define the running animation using frames from the sprite sheet for each avatar
    avatars.forEach((avatar) => {

        scene.anims.create({
            key: `rundown_${avatar}`,
            frames: scene.anims.generateFrameNumbers(avatar, { start: 0, end: 3 }), // Adjust start and end to your running frames
            frameRate: 10,     // Speed of the animation
            repeat: -1,        // Loop the animation indefinitely
        });

        scene.anims.create({
            key: `runright_${avatar}`,
            frames: scene.anims.generateFrameNumbers(avatar, { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1,
        });

        scene.anims.create({
            key: `runup_${avatar}`,
            frames: scene.anims.generateFrameNumbers(avatar, { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1,
        });

        scene.anims.create({
            key: `runleft_${avatar}`,
            frames: scene.anims.generateFrameNumbers(avatar, { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1,
        });

    });

};
