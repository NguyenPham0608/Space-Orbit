import Tether from "./tether.js";

export default class Player {
  constructor(x, y, game) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = 0; // Velocity in x-direction (pixels per frame)
    this.vy = 0; // Velocity in y-direction (pixels per frame)
    this.radius = 10;
    this.attached = false;
    this.tether = new Tether(this);
    this.rotationAngle = 0;
    this.rotationSpeed = 0.07; // Base speed, direction adjusted on attach
    this.span = document.getElementById("console");
    this.wasAttached = false;
    this.lastPlanetX = 0; // Last attached planet's x position
    this.lastPlanetY = 0; // Last attached planet's y position
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
          this.lastPlanetX = planet.x; // Store planet's world coordinates
          this.lastPlanetY = planet.y;

          if (!this.wasAttached) {
            const dxPlayer = this.x - planet.x;
            const dyPlayer = this.y - planet.y;
            this.rotationAngle = Math.atan2(dyPlayer, dxPlayer);

            // Set rotation direction based on incoming velocity
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
            }
            this.wasAttached = true;
          }

          this.rotateAround(
            { x: planet.x - this.game.camX, y: planet.y - this.game.camY },
            dist,
            this.game.deltaTime
          );
        }
      });
    } else if (this.wasAttached && !this.attached) {
      // Detachment moment: calculate fling velocity
      const dx = this.x - this.lastPlanetX;
      const dy = this.y - this.lastPlanetY;
      let flingDx, flingDy;
      if (this.rotationSpeed > 0) {
        flingDx = -dy; // Counterclockwise: left perpendicular
        flingDy = dx;
      } else {
        flingDx = dy; // Clockwise: right perpendicular
        flingDy = -dx;
      }
      const length = Math.hypot(flingDx, flingDy);
      if (length > 0) {
        const flingSpeed = 5; // Pixels per frame, adjust as needed
        this.vx = (flingDx / length) * flingSpeed;
        this.vy = (flingDy / length) * flingSpeed;
      } else {
        this.vx = 0;
        this.vy = 0;
      }
      this.wasAttached = false;
    }

    if (!this.attached) {
      // Free movement: update position and handle input
      this.x += this.vx;
      this.y += this.vy;

      // Update velocity only if input is provided
      if (this.game.left) {
        this.vx = -3;
      } else if (this.game.right) {
        this.vx = 3;
      }
      if (this.game.up) {
        this.vy = -3;
      } else if (this.game.down) {
        this.vy = 3;
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