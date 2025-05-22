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
    this.destroyed = false;
    this.trailParticles = []; // Array to store trail particles
    this.coinEffectParticles = []; // Array to store coin collection particles
    this.coinsCollected = 0; // Initialize coin counter
    this.engineSound = new Audio("audio/engine.mp3");
    this.engineSound.volume = 0.3; // Adjusted for balance
    this.flingSound = new Audio("audio/dddd.mp3");
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
    this.angle = 0; // Store the player's facing angle
  }

  rotateAround(centerPos, distance, deltaTime) {
    this.rotationAngle += this.rotationSpeed * deltaTime * 60; // Normalize to 60 FPS
    const newX = centerPos.x + this.game.camX + distance * Math.cos(this.rotationAngle);
    const newY = centerPos.y + this.game.camY + distance * Math.sin(this.rotationAngle);
    this.x = newX;
    this.y = newY;
  }

  update() {
    // Reset attachment state and tether properties
    this.attached = false;
    this.tether.tetherEndX = this.x - this.game.camX + window.innerWidth / 2;
    this.tether.tetherEndY = this.y - this.game.camY + window.innerHeight / 2;
    this.tether.tetherLength = 0;

    // Attachment logic
    if (this.game.space) {
      if (this.tetheredPlanet) {
        // Stay attached to the current planet
        const planet = this.tetheredPlanet;
        const planetX = planet.x - this.game.camX + window.innerWidth / 2;
        const planetY = planet.y - this.game.camY + window.innerHeight / 2;
        const dx = (this.x - this.game.camX + window.innerWidth / 2) - planetX;
        const dy = (this.y - this.game.camY + window.innerHeight / 2) - planetY;
        let dist = Math.hypot(dx, dy);

        if (dist < 200) {
          if (dist < planet.radius - planet.radius / 2) {
            if (Math.abs(this.vx) > 3 || Math.abs(this.vy) > 3) {
              this.destroyed = true;
            }
          }
          dist -= 0.3;
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
          const planetX = planet.x - this.game.camX + window.innerWidth / 2;
          const planetY = planet.y - this.game.camY + window.innerHeight / 2;
          const dx = (this.x - this.game.camX + window.innerWidth / 2) - planetX;
          const dy = (this.y - this.game.camY + window.innerHeight / 2) - planetY;
          const dist = Math.hypot(dx, dy);
          if (dist < 200 && dist < minDist) {
            minDist = dist;
            closestPlanet = planet;
          }
        }

        if (closestPlanet) {
          const planet = closestPlanet;
          const planetX = planet.x - this.game.camX + window.innerWidth / 2;
          const planetY = planet.y - this.game.camY + window.innerHeight / 2;
          const dx = (this.x - this.game.camX + window.innerWidth / 2) - planetX;
          const dy = (this.y - this.game.camY + window.innerHeight / 2) - planetY;
          let dist = Math.hypot(dx, dy);

          dist -= 0.01;
          this.distToPlanet = dist;
          this.tether.tetherEndX = planetX;
          this.tether.tetherEndY = planetY;
          this.tether.tetherLength = dist;
          this.attached = true;
          this.lastPlanetX = planet.x;
          this.lastPlanetY = planet.y;
          this.tetheredPlanet = planet;

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
      // Detachment logic: calculate fling velocity
      this.flingSound.currentTime = 0;
      this.flingSound.play();
      const dx = this.x - this.lastPlanetX;
      const dy = this.y - this.lastPlanetY;
      let flingDx, flingDy;
      if (this.rotationSpeed > 0) {
        flingDx = -dy; // Counterclockwise
        flingDy = dx;
      } else {
        flingDx = dy; // Clockwise
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
      this.tetheredPlanet = null;
    }

    // Free movement and input handling
    if (!this.attached) {
      this.x += this.vx;
      this.y += this.vy;

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

    // Update camera position
    this.game.camX += 0.02 * (this.x - this.game.camX);
    this.game.camY += 0.02 * (this.y - this.game.camY);

    // Calculate and store angle for particle positioning and drawing
    if (this.attached) {
      const dx = this.lastPlanetX - this.x;
      const dy = this.lastPlanetY - this.y;
      const perpX = this.rotationSpeed > 0 ? -dy : dy;
      const perpY = this.rotationSpeed > 0 ? dx : -dx;
      this.angle = Math.atan2(perpY, perpX);
    } else {
      if (this.vx === 0 && this.vy === 0) {
        this.angle = 0;
      } else {
        this.angle = Math.atan2(this.vy, this.vx) - Math.PI;
      }
    }

    // Add trail particle
    const offset = 10;
    const particleBaseX = this.x + offset * Math.cos(this.angle);
    const particleBaseY = this.y + offset * Math.sin(this.angle);
    const randomOffsetX = (Math.random() - 0.5) * 10;
    const randomOffsetY = (Math.random() - 0.5) * 10;
    const particleWorldX = particleBaseX + randomOffsetX;
    const particleWorldY = particleBaseY + randomOffsetY;
    const initialSize = 4 + Math.random() * 3;
    this.trailParticles.push({
      worldX: particleWorldX,
      worldY: particleWorldY,
      opacity: 1,
      size: initialSize
    });

    // Update trail particles
    this.trailParticles = this.trailParticles.filter(particle => {
      particle.opacity -= 0.03 + Math.random() * 0.02;
      particle.size *= 0.95;
      return particle.opacity > 0 && particle.size > 0.5;
    });

    // Update coin effect particles
    this.coinEffectParticles = this.coinEffectParticles.filter(particle => {
      particle.worldX += particle.vx;
      particle.worldY += particle.vy;
      particle.vx *= 0.95;
      particle.vy *= 0.95;
      particle.opacity -= 0.02;
      particle.size *= 0.95;
      return particle.opacity > 0 && particle.size > 0.1;
    });

    // Coin collection logic
    this.game.coins.forEach(coin => {
      const dx = coin.x - this.x;
      const dy = coin.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 40) {
        this.coinsCollected++;
        this.game.coins.splice(this.game.coins.indexOf(coin), 1);
        const availableSound = this.coinSoundPool.find(audio => audio.paused || audio.ended);
        if (availableSound) {
          availableSound.currentTime = 0;
          availableSound.play();
        }
        for (let i = 0; i < 25; i++) {
          const angle = Math.random() * 2 * Math.PI;
          const speed = 1 + Math.random() * 2;
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

  draw(ctx) {
    // Calculate player's center position
    const centerX = this.x - this.game.camX + window.innerWidth / 2;
    const centerY = this.y - this.game.camY + window.innerHeight / 2;

    // Draw coin effect particles
    ctx.fillStyle = "gold";
    this.coinEffectParticles.forEach(particle => {
      const screenX = particle.worldX - this.game.camX + window.innerWidth / 2;
      const screenY = particle.worldY - this.game.camY + window.innerHeight / 2;
      ctx.globalAlpha = particle.opacity;
      ctx.beginPath();
      ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw trail particles
    ctx.fillStyle = "orange";
    this.trailParticles.forEach(particle => {
      const screenX = particle.worldX - this.game.camX + window.innerWidth / 2;
      const screenY = particle.worldY - this.game.camY + window.innerHeight / 2;
      ctx.globalAlpha = particle.opacity;
      ctx.beginPath();
      ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw the player image
    if (this.isImageLoaded) {
      const drawWidth = this.radius * 4;
      const drawHeight = this.radius * 4;
      const drawX = centerX - drawWidth / 2;
      const drawY = centerY - drawHeight / 2;

      ctx.filter = "saturate(0%) brightness(500%)";
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(this.angle - Math.PI / 2);
      ctx.drawImage(
        this.img,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
      ctx.restore();
      ctx.filter = "none";
    } else {
      ctx.fillStyle = "lime";
      ctx.beginPath();
      ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}