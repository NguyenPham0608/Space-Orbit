import Planet from "./planet.js";

export default class Background {
  constructor(game) {
    this.game = game;
    this.numPlanets = 300;
    this.planets = [];
    this.scaleFactor = 1.2;
    this.minDistance = 700; // Minimum distance between planets

    // Place planets randomly with minimum distance constraint
    for (let i = 0; i < this.numPlanets; i++) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        const x = getRandomArbitrary(-5000, 5000) * this.scaleFactor;
        const y = getRandomArbitrary(-5000, 5000) * this.scaleFactor;
        
        // Check distance to existing planets using squared distance for efficiency
        let tooClose = false;
        for (const planet of this.planets) {
          const dx = x - planet.x;
          const dy = y - planet.y;
          if (dx * dx + dy * dy < this.minDistance * this.minDistance) {
            tooClose = true;
            break;
          }
        }

        if (!tooClose) {
          this.planets.push(new Planet(x, y, getRandomArbitrary(20, 60), this.game));
          placed = true;
        }

        attempts++;
      }

      if (!placed) {
        console.log(`Could not place planet ${i} after ${maxAttempts} attempts`);
      }
    }

    // Load starfield image
    this.starImg = new Image();
    this.starImg.src = "img/stars.jpg";
    this.isStarImgLoaded = false;
    this.starImg.onload = () => {
      this.isStarImgLoaded = true;
    };
  }

  draw(ctx) {
    const parallaxFactor = 0.5; // Consistent parallax for background elements
    const camX = this.game.camX * parallaxFactor;
    const camY = this.game.camY * parallaxFactor;

    // Draw starfield with parallax
    if (this.isStarImgLoaded) {
      let imgWidth = this.starImg.width * 2;
      let imgHeight = this.starImg.height * 2;

      let offsetX = (-camX) % imgWidth;
      let offsetY = (-camY) % imgHeight;

      if (offsetX < 0) offsetX += imgWidth;
      if (offsetY < 0) offsetY += imgHeight;

      let canvasWidth = this.game.canvas.width;
      let canvasHeight = this.game.canvas.height;
      let startX = Math.floor(-offsetX / imgWidth) - 1;
      let startY = Math.floor(-offsetY / imgHeight) - 1;
      let endX = Math.ceil((canvasWidth - offsetX) / imgWidth) + 1;
      let endY = Math.ceil((canvasHeight - offsetY) / imgHeight) + 1;

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
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
    }

    // Draw planets with parallax
    this.planets.forEach((planet) => {
      planet.draw(ctx, camX, camY);
    });
  }
}