import Planet from "./planet.js";

export default class Background {
  constructor(game) {
    this.game = game;
    this.camX = this.game.camX;
    this.camY = this.game.camY;
    this.numPlanets = 50;
    this.planets = [];
    for (let i = 0; i < this.numPlanets; i++) {
      this.planets.push(
        new Planet(
          getRandomArbitrary(-1000, 1000)*2,
          getRandomArbitrary(-1000, 1000)*2,
          getRandomArbitrary(20, 60),
          this.game
        )
      );
    }
    this.starImg = new Image();
    this.starImg.src = "img/stars.jpg";
    this.isStarImgLoaded = false;
    this.starImg.onload = () => {
      this.isStarImgLoaded = true;
    };
  }

  draw(ctx) {


    // Draw the starfield background
    if (this.isStarImgLoaded) {
      this.camX = this.game.camX/2;
      this.camY = this.game.camY/2;
      let imgWidth = this.starImg.width*2;
      let imgHeight = this.starImg.height*2;

      // Calculate camera offset with modulo to loop the background
      let offsetX = (-this.camX) % imgWidth;
      let offsetY = (-this.camY) % imgHeight;

      // Calculate the number of tiles needed to cover the canvas
      let canvasWidth = window.innerWidth;
      let canvasHeight = window.innerHeight;
      let startX = Math.floor(-offsetX / imgWidth) - 1;
      let startY = Math.floor(-offsetY / imgHeight) - 1;
      let endX = Math.ceil((canvasWidth - offsetX) / imgWidth) + 1;
      let endY = Math.ceil((canvasHeight - offsetY) / imgHeight) + 1;

      // Draw tiled star images
      for (let i = startX; i < endX; i++) {
        for (let j = startY; j < endY; j++) {
          ctx.drawImage(
            this.starImg,
            i * imgWidth + offsetX,
            j * imgHeight + offsetY,
            imgWidth,
            imgHeight
          );
        }
      }
    } else {
      // Fallback: Draw a black background if image isn't loaded
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
    }

    // Draw planets
    this.planets.forEach((planet) => {
      planet.draw(ctx);
    });
  }
}

