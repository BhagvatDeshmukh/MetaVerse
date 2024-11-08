export default function preload(scene) {

  scene.load.image('overworld', './src/assets/Overworld.png');// load tileset

  scene.load.tilemapTiledJSON('map', "./src/assets/gardenmap.tmj");//load map

  const avatars = ["King", "Maid", "Merchant", "Peasant", "Prince", "Queen", "Robinhood", "Servant", "Soldier", "Warrior"];// list of avatars

  //load spritesheet for each avatar
  avatars.forEach((avatar) => {
    scene.load.spritesheet(avatar, `./src/assets/${avatar}.png`, {
      frameWidth: 32,    // Width of each frame
      frameHeight: 48,   // Height of each frame
    });
  });
};