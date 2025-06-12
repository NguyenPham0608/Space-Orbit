export default class ImageProgressBar {
    constructor(imageUrl, x, y, width, height, rotation = 0, game) {
        this.game = game
        this.imageUrl = imageUrl;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation * Math.PI / 180; // Convert degrees to radians
        this.image = new Image();
        this.progress = 0;
        this.isLoaded = false;
        this.complete = false
        this.init();
    }

    init() {
        this.image.onload = () => {
            this.isLoaded = true;
            console.log('Progress bar image loaded successfully');
        };
        this.image.onerror = () => {
            console.error('Failed to load progress bar image:', this.imageUrl);
        };
        this.image.src = this.imageUrl;
    }

    setProgress(progress) {
        this.progress = Math.max(0, Math.min(1, progress));
    }

    setRotation(degrees) {
        this.rotation = degrees * Math.PI / 180; // Update rotation in radians
    }

    draw(ctx) {
        if (this.progress >= 1) {
            if (!this.complete) {
                this.game.win()
                this.complete = true
            }
        }
        if (!this.isLoaded) return;

        const filledWidth = this.progress * this.width;

        // Draw filled part (opaque)
        ctx.save();
        // Clip to the filled region (horizontal in screen coordinates)
        ctx.beginPath();
        ctx.rect(this.x, this.y, filledWidth, this.height);
        ctx.clip();
        // Apply rotation around the center
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-this.width / 2, -this.height / 2);
        ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.width, this.height);
        ctx.restore();

        // Draw unfilled part (translucent)
        ctx.save();
        // Clip to the unfilled region (horizontal in screen coordinates)
        ctx.beginPath();
        ctx.rect(this.x + filledWidth, this.y, this.width - filledWidth, this.height);
        ctx.clip();
        // Apply rotation around the center
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-this.width / 2, -this.height / 2);
        ctx.globalAlpha = 0.3;
        ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.width, this.height);
        ctx.restore();
    }
}