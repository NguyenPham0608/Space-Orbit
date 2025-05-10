import Tether from "./tether.js";

export default class Player {
  constructor(x, y, game) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = 0; // Velocity in x-direction
    this.vy = 0; // Velocity in y-direction
    this.radius = 10;
    this.attached = false;
    this.tether = new Tether(this);
    this.rotationAngle = 0;
    this.rotationSpeed = 0.07; // Base speed, direction will be adjusted
    this.span = document.getElementById("console");
    this.wasAttached = false;
    this.posToPlanet = "";
  }

  rotateAround(centerPos, distance, deltaTime) {
    this.rotationAngle += this.rotationSpeed * deltaTime * 60; // Normalize to 60 FPS
    const newX = centerPos.x + this.game.camX + distance * Math.cos(this.rotationAngle);
    const newY = centerPos.y + this.game.camY + distance * Math.sin(this.rotationAngle);
    this.x = newX;
    this.y = newY;
    this.span.innerHTML = `x: ${newX.toFixed(2)}, y: ${newY.toFixed(2)}`;
  }

  draw(ctx) {
    console.log(this.posToPlanet);
    this.attached = false;
    this.tether.tetherEndX = this.x - this.game.camX + this.game.canvas.width / 2;
    this.tether.tetherEndY = this.y - this.game.camY + this.game.canvas.height / 2;
    this.tether.tetherLength = 0;

    if (this.game.space) {
      this.game.background.planets.forEach((planet) => {
        const planetX = planet.x - this.game.camX + this.game.canvas.width / 2;
        const planetY = planet.y - this.game.camY + this.game.canvas.height / 2;
        const dx = (this.x - this.game.camX + this.game.canvas.width / 2) - planetX;
        const dy = (this.y - this.game.camY + this.game.canvas.height / 2) - planetY;
        const dist = Math.hypot(dx, dy);
        ctx.beginPath();
        ctx.strokeStyle = "orange";
        ctx.arc(planetX, planetY, 100, 0, Math.PI * 2);
        ctx.stroke();

        if (dist < 100) {
          this.tether.tetherEndX = planetX;
          this.tether.tetherEndY = planetY;
          this.tether.tetherLength = dist;
          this.attached = true;

          if (!this.wasAttached) {
            const dxPlayer = this.x - planet.x;
            const dyPlayer = this.y - planet.y;
            this.rotationAngle = Math.atan2(dyPlayer, dxPlayer);

            // Calculate rotation direction based on tangential velocity
            const radialX = dxPlayer;
            const radialY = dyPlayer;
            const radialLength = Math.hypot(radialX, radialY);
            if (radialLength > 0) {
              const normRadialX = radialX / radialLength;
              const normRadialY = radialY / radialLength;
              const tangentialX = -normRadialY;
              const tangentialY = normRadialX;
              const tangentialVelocity = this.vx * tangentialX + this.vy * tangentialY;
              this.rotationSpeed = 0.07 * (tangentialVelocity >= 0 ? 1 : -1);
            } else {
              this.rotationSpeed = 0.07; // Default to counterclockwise if no velocity
            }

            this.wasAttached = true;
          }

          this.rotateAround(
            { x: planet.x - this.game.camX, y: planet.y - this.game.camY },
            dist,
            this.game.deltaTime
          );
        } else {
          this.posToPlanet = "";
        }
      });
    }

    if (!this.attached) {
      this.wasAttached = false;
      this.vx = 0;
      this.vy = 0;
      if (this.game.left) {
        this.vx = -3;
        this.x += this.vx;
      }
      if (this.game.right) {
        this.vx = 3;
        this.x += this.vx;
      }
      if (this.game.down) {
        this.vy = 3;
        this.y += this.vy;
      }
      if (this.game.up) {
        this.vy = -3;
        this.y += this.vy;
      }
    }

    this.game.camX += 0.02 * (this.x - this.game.camX);
    this.game.camY += 0.02 * (this.y - this.game.camY);

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