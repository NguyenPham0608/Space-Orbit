import Tether from "./tether.js";

export default class Player {
  constructor(x, y, game) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.attached = false;
    this.tether = new Tether(this);
    this.rotationAngle = 0; // Track the current rotation angle
    this.rotationSpeed = 0.01; // Speed of rotation
    this.span=document.getElementById("console")

  }

  rotateAround(centerPos, playerPos, distance) {
      const dx = playerPos.x - centerPos.x;
      const dy = playerPos.y - centerPos.y;
      const currentAngle = Math.atan2(dy, dx);
      const newAngle = currentAngle+0.1;
      
      const newX = centerPos.x + distance * Math.cos(newAngle);
      const newY = centerPos.y + distance * Math.sin(newAngle);
      
      
      // this. x+=newX
      // this.y+=newY
      this.span.innerHTML=newX
  }

  draw(ctx) {
    this.attached = false;
    this.tether.tetherEndX = this.game.canvas.width / 2;
    this.tether.tetherEndY = this.game.canvas.height / 2;
    this.tether.tetherLength = 0;

    if (this.game.space) {
      this.game.background.planets.forEach((planet) => {
        const planetX = planet.x - this.game.camX + this.game.canvas.width / 2;
        const planetY = planet.y - this.game.camY + this.game.canvas.height / 2;
        const dx = this.game.canvas.width / 2 - planetX;
        const dy = this.game.canvas.height / 2 - planetY;
        const dist = Math.hypot(dx, dy);
        ctx.beginPath();
        ctx.strokeStyle = "orange";
        ctx.arc(planetX, planetY, 100, 0, Math.PI * 2);
        ctx.stroke();

        if (dist < 100) {
          console.log("hi 👋 Planet says hello!");
          this.tether.tetherEndX = planetX;
          this.tether.tetherEndY = planetY;
          this.tether.tetherLength = dist;
          this.attached = true;
          this.rotateAround(
            { x: planetX, y: planetY }, 
            { x: this.x, y: this.y }, 
            dist
          );

        }
      });
    }

    // Control for manual movement (if player is not tethered)
    if (!this.attached) {
      if (this.game.left) {
        this.x -= 3;
      }
      if (this.game.right) {
        this.x += 3;
      }
      if (this.game.down) {
        this.y += 3;
      }
      if (this.game.up) {
        this.y -= 3;
      }
    }

    // Update camera position based on player position
    this.game.camX = this.x;
    this.game.camY = this.y;

    // Draw the player on the canvas
    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.arc(
      this.x + this.game.canvas.width / 2 - this.game.camX,
      this.y + this.game.canvas.height / 2 - this.game.camY,
      this.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}
