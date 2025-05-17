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
    this.tetheredPlanet = null; // Track the currently tethered planet
    this.img = new Image();
    this.img.src = "img/rocket.png";
    this.isImageLoaded = false;
    this.img.onload = () => {
      this.isImageLoaded = true;
    };
    this.trailParticles = []; // Array to store trail particles
    this.coinEffectParticles = []; // Array to store coin collection particles
    this.coinsCollected = 0; // Initialize coin counter
    this.engineSound = new Audio("audio/engine.mp3");
    this.engineSound.volume = 0.3; // Adjusted for balance
    this.flingSound = new Audio("audio/fling.mp3");
    this.flingSound.volume = 0.9;
    this.latchSound = new Audio("audio/latch.mp3");
    this.latchSound.volume = 0.8;
    // Initialize audio pool for coin sound
    this.coinSoundPool = [];
    for (let i = 0; i < 5; i++) { // Create 5 Audio objects
      const audio = new Audio("audio/coin.mp3");
      audio.volume = 0.7;
      this.coinSoundPool.push(audio);
    }
  }

  rotateAround(centerPos, distance, deltaTime) {
    this.rotationAngle += this.rotationSpeed * deltaTime * 60; // Normalize to 60 FPS
    const newX = centerPos.x + this.game.camX + distance * Math.cos(this.rotationAngle);
    const newY = centerPos.y + this.game.camY + distance * Math.sin(this.rotationAngle);
    this.x = newX;
    this.y = newY;
  }

  draw(ctx) {
    this.attached = false;
    this.tether.tetherEndX = this.x - this.game.camX + this.game.canvas.width / 2;
    this.tether.tetherEndY = this.y - this.game.camY + this.game.canvas.height / 2;
    this.tether.tetherLength = 0;

    if (this.game.space) {
      if (this.tetheredPlanet) {
        // Stay attached to the current planet
        const planet = this.tetheredPlanet;
        const planetX = planet.x - this.game.camX + this.game.canvas.width / 2;
        const planetY = planet.y - this.game.camY + this.game.canvas.height / 2;
        const dx = (this.x - this.game.camX + this.game.canvas.width / 2) - planetX;
        const dy = (this.y - this.game.camY + this.game.canvas.height / 2) - planetY;
        let dist = Math.hypot(dx, dy);

        if (dist < 200) {
          dist -= 0.01;
          this.distToPlanet = dist;
          this.tether.tetherEndX = planetX;
          this.tether.tetherEndY = planetY;
          this.tether.tetherLength = dist;
          this.attached = true;
          this.lastPlanetX = planet.x;
          this.lastPlanetY = planet.y;

          if (!this.wasAttached) {
            this.latchSound.currentTime = 0;
            this.latchSound.play();
            const dxPlayer = this.x - planet.x;
            const dyPlayer = this.y - planet.y;
            this.rotationAngle = Math.atan2(dyPlayer, dxPlayer);
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
        } else {
          // Out of range, detach
          this.tetheredPlanet = null;
          this.attached = false;
        }
      } else {
        // Find the closest planet within range
        let closestPlanet = null;
        let minDist = Infinity;

        for (const planet of this.game.background.planets) {
          const planetX = planet.x - this.game.camX + this.game.canvas.width / 2;
          const planetY = planet.y - this.game.camY + this.game.canvas.height / 2;
          const dx = (this.x - this.game.camX + this.game.canvas.width / 2) - planetX;
          const dy = (this.y - this.game.camY + this.game.canvas.height / 2) - planetY;
          const dist = Math.hypot(dx, dy);
          if (dist < 200 && dist < minDist) {
            minDist = dist;
            closestPlanet = planet;
          }
        }

        if (closestPlanet) {
          const planet = closestPlanet;
          const planetX = planet.x - this.game.camX + this.game.canvas.width / 2;
          const planetY = planet.y - this.game.camY + this.game.canvas.height / 2;
          const dx = (this.x - this.game.camX + this.game.canvas.width / 2) - planetX;
          const dy = (this.y - this.game.camY + this.game.canvas.height / 2) - planetY;
          let dist = Math.hypot(dx, dy);

          dist -= 0.01;
          this.distToPlanet = dist;
          this.tether.tetherEndX = planetX;
          this.tether.tetherEndY = planetY;
          this.tether.tetherLength = dist;
          this.attached = true;
          this.lastPlanetX = planet.x;
          this.lastPlanetY = planet.y;
          this.tetheredPlanet = planet; // Lock onto this planet

          if (!this.wasAttached) {
            this.latchSound.currentTime = 0;
            this.latchSound.play();
            const dxPlayer = this.x - planet.x;
            const dyPlayer = this.y - planet.y;
            this.rotationAngle = Math.atan2(dyPlayer, dxPlayer);
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
        }
      }
    } else if (this.wasAttached && !this.attached) {
      // Detachment moment: calculate fling velocity
      this.flingSound.currentTime = 0;
      this.flingSound.play();
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
        const flingSpeed = Math.abs(this.rotationSpeed * (this.distToPlanet / 100)) * 70;
        this.vx = (flingDx / length) * flingSpeed;
        this.vy = (flingDy / length) * flingSpeed;
      } else {
        this.vx = 0;
        this.vy = 0;
      }
      this.wasAttached = false;
      this.tetheredPlanet = null; // Clear tethered planet on detach
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

    // Control engine sound


    this.game.camX += 0.02 * (this.x - this.game.camX);
    this.game.camY += 0.02 * (this.y - this.game.camY);

    // Calculate player's center position
    const centerX = this.x - this.game.camX + this.game.canvas.width / 2;
    const centerY = this.y - this.game.camY + this.game.canvas.height / 2;

    // Draw coin effect particles (before player for layering)
    ctx.fillStyle = "gold";
    this.coinEffectParticles = this.coinEffectParticles.filter(particle => {
      particle.worldX += particle.vx;
      particle.worldY += particle.vy;
      particle.vx *= 0.95; // Slow down over time
      particle.vy *= 0.95;
      particle.opacity -= 0.05; // Fade out
      particle.size *= 0.95; // Shrink
      if (particle.opacity > 0 && particle.size > 0.1) {
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
    const particleBaseX = this.x - offset * Math.cos(facingAngle - Math.PI / 2);
    const particleBaseY = this.y - offset * Math.sin(facingAngle - Math.PI / 2);
    const randomOffsetX = (Math.random() - 0.5) * 10; // Random offset within ±5 pixels
    const randomOffsetY = (Math.random() - 0.5) * 10;
    const particleWorldX = particleBaseX + randomOffsetX;
    const particleWorldY = particleBaseY + randomOffsetY;
    const initialSize = 4 + Math.random() * 3; // Random size between 4 and 7
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

    // Coin collection logic with particle effect and sound
    this.game.coins.forEach(coin => {
      const dx = coin.x - this.x;
      const dy = coin.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 40) {
        this.coinsCollected++;
        this.game.coins.splice(this.game.coins.indexOf(coin), 1);
        // Play coin sound from pool
        const availableSound = this.coinSoundPool.find(audio => audio.paused || audio.ended);
        if (availableSound) {
          availableSound.currentTime = 0;
          availableSound.play();
        }
        // Create 15 particles for the coin collection effect
        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * 2 * Math.PI;
          const speed = 1 + Math.random() * 2; // Speed between 1 and 3
          const vx = speed * Math.cos(angle);
          const vy = speed * Math.sin(angle);
          this.coinEffectParticles.push({
            worldX: coin.x,
            worldY: coin.y,
            vx: vx,
            vy: vy,
            opacity: 1,
            size: 3
          });
        }
      }
    });
  }
}