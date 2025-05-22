export default class ImageProgressBar {
    constructor(imageUrl, x, y, width, height) {
        this.imageUrl = imageUrl;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.progress = 0;
        this.isLoaded = false;
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

    draw(ctx) {
        if (!this.isLoaded) return;

        const filledWidth = this.progress * this.width;

        // Draw filled part fully opaque
        ctx.drawImage(
            this.image,
            0, 0, this.progress * this.image.width, this.image.height,
            this.x, this.y, filledWidth, this.height
        );

        // Draw unfilled part with translucency
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.drawImage(
            this.image,
            this.progress * this.image.width, 0, (1 - this.progress) * this.image.width, this.image.height,
            this.x + filledWidth, this.y, this.width - filledWidth, this.height
        );
        ctx.restore();
    }
}