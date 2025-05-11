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
    this.wasAttached = false;
    this.lastPlanetX = 0; // Last attached planet's x position
    this.lastPlanetY = 0; // Last attached planet's y position
    this.distToPlanet = 0;
    this.startingDistance = 100;
    this.img = new Image();
    this.img.src = "img/rocket.png";
    this.isImageLoaded = false;
    this.img.onload = () => {
      this.isImageLoaded = true;
    };
    this.trailParticles = []; // Array to store trail particles
  }

  rotateAround(centerPos, distance, deltaTime) {
    this.rotationAngle += this.rotationSpeed * deltaTime * 60; // Normalize to 60 FPS
    const newX = centerPos.x + this.game.camX + distance * Math.cos(this.rotationAngle);
    const newY = centerPos.y + this.game.camY + distance * Math.sin(this.rotationAngle);
    this.x = newX;
    this.y = newY;
    console.log(distance);
  }

  draw(ctx) {
    this.attached = false;
    this.tether.tetherEndX = this.x - this.game.camX + this.game.canvas.width / 2;
    this.tether.tetherEndY = this.y - this.game.camY + this.game.canvas.height / 2;
    this.tether.tetherLength = 0;

    if (this.game.space) {
      for (const planet of this.game.background.planets) {
        const planetX = planet.x - this.game.camX + this.game.canvas.width / 2;
        const planetY = planet.y - this.game.camY + this.game.canvas.height / 2;
        const dx = (this.x - this.game.camX + this.game.canvas.width / 2) - planetX;
        const dy = (this.y - this.game.camY + this.game.canvas.height / 2) - planetY;
        let dist = Math.hypot(dx, dy);
        ctx.beginPath();
        ctx.strokeStyle = "orange";
        ctx.arc(planetX, planetY, 100, 0, Math.PI * 2);
        // ctx.stroke();

        if (dist < 200) {
          dist -= 0.01;
          this.distToPlanet = dist;
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
              this.rotationSpeed = 0.06 * (tangentialVelocity >= 0 ? 1 : -1);
            }
            this.startingDistance = dist;
            this.wasAttached = true;
          }

          this.rotateAround(
            { x: planet.x - this.game.camX, y: planet.y - this.game.camY },
            dist,
            this.game.deltaTime
          );
          break; // Stop checking other planets once attached
        }
      }
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
        const flingSpeed = Math.abs(this.rotationSpeed * (this.distToPlanet / 100)) * 70; // Pixels per frame, adjust as needed
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

    // Calculate player's center position
    const centerX = this.x - this.game.camX + this.game.canvas.width / 2;
    const centerY = this.y - this.game.camY + this.game.canvas.height / 2;

    // Compute angle for trail and drawing
    let angle;
    if (this.attached) {
      const dx = this.lastPlanetX - this.x;
      const dy = this.lastPlanetY - this.y;
      const perpX = this.rotationSpeed > 0 ? -dy : dy;
      const perpY = this.rotationSpeed > 0 ? dx : -dx;
      angle = Math.atan2(perpY, perpX);
    } else {
      angle = Math.atan2(this.vy, this.vx) - Math.PI;
      if (this.vx === 0 && this.vy === 0) {
        angle = 0;
      }
    }
    const facingAngle = angle - Math.PI / 2;

    // Add trail particle with randomness
    const offset = 10; // 20 pixels behind the rocket
    const particleBaseX = this.x - offset * Math.cos(facingAngle-Math.PI/2);
    const particleBaseY = this.y - offset * Math.sin(facingAngle-Math.PI/2);
    const randomOffsetX = (Math.random() - 0.5) * 10; // Random offset within ±5 pixels
    const randomOffsetY = (Math.random() - 0.5) * 10;
    const particleWorldX = particleBaseX + randomOffsetX;
    const particleWorldY = particleBaseY + randomOffsetY;
    const initialSize = 4 + Math.random() * 3; // Random size between 5 and 8
    this.trailParticles.push({
      worldX: particleWorldX,
      worldY: particleWorldY,
      opacity: 1,
      size: initialSize
    });

    // Draw trail particles
    ctx.fillStyle = "orange";
    this.trailParticles = this.trailParticles.filter(particle => {
      particle.opacity -= 0.03 + Math.random() * 0.02; // Slightly random fade rate
      particle.size *= 0.95; // Shrink by 5% each frame
      if (particle.opacity > 0 && particle.size > 0.5) {
        const screenX = particle.worldX - this.game.camX + this.game.canvas.width / 2;
        const screenY = particle.worldY - this.game.camY + this.game.canvas.height / 2;
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
        ctx.fill();
        return true;
      } else {
        return false;
      }
    });
    ctx.globalAlpha = 1; // Reset alpha

    // Draw the player image
    if (this.isImageLoaded) {
      const drawWidth = this.radius * 4;
      const drawHeight = this.radius * 4;
      const drawX = centerX - drawWidth / 2;
      const drawY = centerY - drawHeight / 2;

      // Apply filter to make the image white
      ctx.filter = "saturate(0%) brightness(500%)";

      // Save context, apply rotation, and draw image
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle - Math.PI / 2);
      ctx.drawImage(
        this.img,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
      ctx.restore();

      // Reset filter
      ctx.filter = "none";
    } else {
      // Fallback: Draw a lime circle if image isn't loaded
      ctx.fillStyle = "lime";
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        this.radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    this.game.coins.forEach(coin => {
      const dx = coin.x - this.x;
      const dy = coin.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 40) {
        this.coinsCollected++;
        this.game.coins.splice(this.game.coins.indexOf(coin),1)
      }
    })
  }
}