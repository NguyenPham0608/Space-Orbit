import Tether from "./tether.js";

export default class Player {
  constructor(x, y, game) {
    this.game = game;
    this.started = false;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 10;
    this.attached = false;
    this.tether = new Tether(this);
    this.rotationAngle = 0;
    this.rotationSpeed = 0.07;
    this.wasAttached = false;
    this.lastPlanetX = 0;
    this.lastPlanetY = 0;
    this.distToPlanet = 0;
    this.startingDistance = 100;
    this.tetheredPlanet = null;
    this.img = new Image();
    this.img.src = "img/rocket.png";
    this.isImageLoaded = false;
    this.img.onload = () => {
      this.isImageLoaded = true;
    };
    this.destroyed = false;
    this.trailParticles = [];
    this.coinEffectParticles = [];
    this.coinsCollected = 0;
    this.engineSound = new Audio("audio/engine.mp3");
    this.engineSound.volume = 0.3;
    this.flingSound = new Audio("audio/dddd.mp3");
    this.flingSound.volume = 0.9;
    this.latchSound = new Audio("audio/latch.mp3");
    this.latchSound.volume = 0.8;
    this.coinSoundPool = [];
    for (let i = 0; i < 5; i++) {
      const audio = new Audio("audio/coin2.mp3");
      audio.volume = 0.7;
      this.coinSoundPool.push(audio);
    }
    this.angle = 0;
    this.collectedScraps = 0;
    this.orbitalRotationSpeed = 0.03; // Base value, will be adjusted dynamically
  }

  rotateAround(centerPos, distance) {
    this.rotationAngle += this.rotationSpeed;
    this.x = centerPos.x + distance * Math.cos(this.rotationAngle);
    this.y = centerPos.y + distance * Math.sin(this.rotationAngle);
  }

  update() {
    // Reset attachment state and tether properties
    this.tether.tetherEndX = this.x - this.game.camX + window.innerWidth / 2;
    this.tether.tetherEndY = this.y - this.game.camY + window.innerHeight / 2;
    this.tether.tetherLength = 0;

    // Attachment logic
    if (this.attached) {
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
        dist -= 0.3; // Maintain orbit tightening
        if (dist < planet.radius) dist = planet.radius; // Prevent going inside planet
        this.distToPlanet = dist;
        this.tether.tetherEndX = planetX;
        this.tether.tetherEndY = planetY;
        this.tether.tetherLength = dist;
        this.lastPlanetX = planet.x;
        this.lastPlanetY = planet.y;
        this.rotateAround(
          { x: planet.x, y: planet.y },
          dist
        );
      } else {
        this.attached = false;
        this.tetheredPlanet = null;
      }
    } else {
      if (this.game.space) {
        let closestPlanet = null;
        let minDist = Infinity;
        for (const planet of this.game.background.planets) {
          const dx = this.x - planet.x;
          const dy = this.y - planet.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 200 && dist < minDist) {
            minDist = dist;
            closestPlanet = planet;
          }
        }
        if (closestPlanet) {
          this.attached = true;
          this.tetheredPlanet = closestPlanet;
          this.distToPlanet = minDist;
          const dx = this.x - closestPlanet.x;
          const dy = this.y - closestPlanet.y;
          this.rotationAngle = Math.atan2(dy, dx);

          // Calculate tangential velocity for smooth transition
          const radialLength = minDist;
          let direction = 1;
          let tangentialVelocity = 0;
          if (radialLength > 0) {
            const normRadialX = dx / radialLength;
            const normRadialY = dy / radialLength;
            const tangentialX = -normRadialY;
            const tangentialY = normRadialX;
            tangentialVelocity = this.vx * tangentialX + this.vy * tangentialY;
            direction = tangentialVelocity >= 0 ? 1 : -1;
          }

          // Set rotation speed based on incoming velocity
          const speed = Math.hypot(this.vx, this.vy);
          this.rotationSpeed = (speed / radialLength) * direction;
          // Cap rotation speed to prevent unrealistic orbits
          const maxRotationSpeed = 0.1; // Adjust as needed
          if (Math.abs(this.rotationSpeed) > maxRotationSpeed) {
            this.rotationSpeed = maxRotationSpeed * direction;
          }
          // Ensure minimum rotation speed for stable orbit
          const minRotationSpeed = this.orbitalRotationSpeed;
          if (Math.abs(this.rotationSpeed) < minRotationSpeed) {
            this.rotationSpeed = minRotationSpeed * direction;
          }

          this.latchSound.currentTime = 0;
          this.latchSound.play();
        }
      }
    }

    // Detachment logic
    if (!this.game.space && this.attached) {
      if (this.tetheredPlanet) {
        this.flingSound.currentTime = 0;
        this.flingSound.play();
        const planet = this.tetheredPlanet;
        const dx = this.x - planet.x;
        const dy = this.y - planet.y;
        const currentDist = Math.hypot(dx, dy);
        let flingDx, flingDy;

        if (this.rotationSpeed > 0) {
          flingDx = -dy;
          flingDy = dx;
        } else {
          flingDx = dy;
          flingDy = -dx;
        }

        const length = Math.hypot(flingDx, flingDy);
        if (length > 0) {
          const orbitalSpeed = Math.abs(this.rotationSpeed * currentDist);
          this.vx = (flingDx / length) * orbitalSpeed;
          this.vy = (flingDy / length) * orbitalSpeed;
        } else {
          this.vx = 0;
          this.vy = 0;
        }

        this.attached = false;
        this.tetheredPlanet = null;
        this.rotationAngle = 0;
      }
    }

    // Free movement
    if (!this.attached) {
      this.x += this.vx;
      this.y += this.vy;

      if (!this.started) {
        if (this.game.left) {
          this.vx = -3;
          this.started = true;
        } else if (this.game.right) {
          this.vx = 3;
          this.started = true;
        }
        if (this.game.up) {
          this.vy = -3;
          this.started = true;
        } else if (this.game.down) {
          this.vy = 3;
          this.started = true;
        }
      }
    }

    // Update camera position
    this.game.camX += 0.02 * (this.x - this.game.camX);
    this.game.camY += 0.02 * (this.y - this.game.camY);

    // Update angle
    if (this.attached) {
      const planet = this.tetheredPlanet;
      const dx = planet.x - this.x;
      const dy = planet.y - this.y;
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

    // Trail particles
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

    this.trailParticles = this.trailParticles.filter(particle => {
      particle.opacity -= 0.03 + Math.random() * 0.02;
      particle.size *= 0.95;
      return particle.opacity > 0 && particle.size > 0.5;
    });

    // Coin effect particles
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
        if (coin.power) {
          this.coinsCollected += 5;
          this.game.coins.splice(this.game.coins.indexOf(coin), 1);
          this.attractScraps();
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
        } else {
          this.coinsCollected += 5;
          this.game.setProgress(this.coinsCollected);
          this.game.coins.splice(this.game.coins.indexOf(coin), 1);
          const availableSound = this.coinSoundPool.find(audio => audio.paused || audio.ended);
          if (availableSound) {
            availableSound.currentTime = 0;
            availableSound.play();
          }
          this.explode(10, coin.x, coin.y);
        }
      }
    });
  }

  explode(num, x, y) {
    for (let i = 0; i < num; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = 1 + Math.random() * 5;
      const vx = speed * Math.cos(angle);
      const vy = speed * Math.sin(angle);
      this.coinEffectParticles.push({
        worldX: x,
        worldY: y,
        vx: vx,
        vy: vy,
        opacity: 1,
        size: 3
      });
    }
  }

  attractScraps() {
    this.game.coins.forEach(coin => {
      if (!coin.power) {
        coin.attracted = true;
      }
    });
  }

  draw(ctx) {
    const centerX = this.x - this.game.camX + window.innerWidth / 2;
    const centerY = this.y - this.game.camY + window.innerHeight / 2;

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