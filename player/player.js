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
    this.attaching = false; // New property for transition phase
    this.targetRadius = 0;  // Target orbit radius during attaching
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
  }

  rotateAround(centerPos, distance, deltaTime) {
    this.rotationAngle += this.rotationSpeed * deltaTime * 60;
    const newX = centerPos.x + this.game.camX + distance * Math.cos(this.rotationAngle);
    const newY = centerPos.y + this.game.camY + distance * Math.sin(this.rotationAngle);
    this.x = newX;
    this.y = newY;
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
        dist -= 0.3; // Maintain original behavior of tightening orbit
        this.distToPlanet = dist;
        this.tether.tetherEndX = planetX;
        this.tether.tetherEndY = planetY;
        this.tether.tetherLength = dist;
        this.lastPlanetX = planet.x;
        this.lastPlanetY = planet.y;
        this.rotateAround(
          { x: planet.x - this.game.camX, y: planet.y - this.game.camY },
          dist,
          this.game.deltaTime
        );
      } else {
        this.attached = false;
        this.tetheredPlanet = null;
      }
    } else if (this.attaching) {
      const planet = this.tetheredPlanet;
      const desiredX = planet.x + this.targetRadius * Math.cos(this.rotationAngle);
      const desiredY = planet.y + this.targetRadius * Math.sin(this.rotationAngle);
      const alpha = 0.1; // Interpolation factor for smooth easing
      this.x = this.x * (1 - alpha) + desiredX * alpha;
      this.y = this.y * (1 - alpha) + desiredY * alpha;
      this.rotationAngle += this.rotationSpeed * this.game.deltaTime * 60;

      // Check if close enough to switch to attached state
      const dx = this.x - desiredX;
      const dy = this.y - desiredY;
      if (Math.hypot(dx, dy) < 1) {
        this.attached = true;
        this.attaching = false;
        this.x = desiredX;
        this.y = desiredY;
        this.distToPlanet = this.targetRadius;
      }

      // Update tether visuals during transition
      const planetX = planet.x - this.game.camX + window.innerWidth / 2;
      const planetY = planet.y - this.game.camY + window.innerHeight / 2;
      this.tether.tetherEndX = planetX;
      this.tether.tetherEndY = planetY;
      this.tether.tetherLength = Math.hypot(this.x - planet.x, this.y - planet.y);
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
          this.attaching = true;
          this.tetheredPlanet = closestPlanet;
          this.targetRadius = minDist; // Set target orbit radius to initial distance
          const dx = this.x - closestPlanet.x;
          const dy = this.y - closestPlanet.y;
          this.rotationAngle = Math.atan2(dy, dx);
          const radialX = dx;
          const radialY = dy;
          const radialLength = Math.hypot(radialX, radialY);
          if (radialLength > 0) {
            const normRadialX = radialX / radialLength;
            const normRadialY = radialY / radialLength;
            const tangentialX = -normRadialY;
            const tangentialY = normRadialX;
            const tangentialVelocity = this.vx * tangentialX + this.vy * tangentialY;
            this.rotationSpeed = 0.06 * (tangentialVelocity >= 0 ? 1 : -1);
          } else {
            this.rotationSpeed = 0.06;
          }
          this.latchSound.currentTime = 0;
          this.latchSound.play();
        }
      }
    }

    // Detachment logic
    if (!this.game.space && this.attached) {
      this.flingSound.currentTime = 0;
      this.flingSound.play();
      const dx = this.x - this.lastPlanetX;
      const dy = this.y - this.lastPlanetY;
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
        const flingSpeed = Math.abs(this.rotationSpeed * (this.distToPlanet / 100)) * 70;
        this.vx = (flingDx / length) * flingSpeed;
        this.vy = (flingDy / length) * flingSpeed;
      } else {
        this.vx = 0;
        this.vy = 0;
      }
      this.attached = false;
      this.wasAttached = false;
      this.tetheredPlanet = null;
    }

    // Free movement
    if (!this.attached && !this.attaching) {
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
    if (this.attached || this.attaching) {
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
          this.explode(10,coin.x,coin.y);
        }
      }
    });
  }

  explode(num,x,y){
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
        const dx = coin.x - this.x;
        const dy = coin.y - this.y;
        const dist = Math.hypot(dx, dy);
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