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
    this.camX = this.game.camX/2;
    this.camY = this.game.camY/2;

    // Draw the starfield background
    if (this.isStarImgLoaded) {
      const imgWidth = this.starImg.width;
      const imgHeight = this.starImg.height;

      // Calculate camera offset with modulo to loop the background
      const offsetX = (-this.camX) % imgWidth;
      const offsetY = (-this.camY) % imgHeight;

      // Calculate the number of tiles needed to cover the canvas
      const canvasWidth = this.game.canvas.width;
      const canvasHeight = this.game.canvas.height;
      const startX = Math.floor(-offsetX / imgWidth) - 1;
      const startY = Math.floor(-offsetY / imgHeight) - 1;
      const endX = Math.ceil((canvasWidth - offsetX) / imgWidth) + 1;
      const endY = Math.ceil((canvasHeight - offsetY) / imgHeight) + 1;

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

