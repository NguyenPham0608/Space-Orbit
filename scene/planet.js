export default class Planet {
    constructor(x, y, radius, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.player = game.player;
        this.radius = radius;
        this.dxPlayer = this.x - this.player.x;
        this.dyPlayer = this.y - this.player.y;
        this.imgSrcList = [
            "img/planet.png",
            "img/planet2.png",
            "img/planet3.png",
            "img/planet4.png",
            "img/planet5.png",
            "img/planet6.png",
            "img/planet7.png",
            "img/planet8.png",
            "img/planet9.png"
        ];
        this.imgSrc = this.imgSrcList[Math.floor(getRandomArbitrary(0, 9))];
        this.img = new Image();
        this.img.src = this.imgSrc;
        this.isImageLoaded = false;
        this.img.onload = () => {
            this.isImageLoaded = true;
        };
    }

    draw(ctx) {
        // Update player distance
        this.dxPlayer = this.x - this.player.x;
        this.dyPlayer = this.y - this.player.y;

        // Calculate planet's center position relative to camera and canvas
        const centerX = this.x - this.game.camX + (this.game.canvas.width / 2);
        const centerY = this.y - this.game.camY + (this.game.canvas.height / 2);

        // Draw the planet image only if it's loaded
        if (this.isImageLoaded) {
            // Get image dimensions
            const imgWidth = this.img.width;
            const imgHeight = this.img.height;
            const aspectRatio = imgWidth / imgHeight;

            // Calculate scaled dimensions to fit within planet's diameter (radius * 2)
            let drawWidth, drawHeight;
            if (aspectRatio > 1) {
                // Image is wider than tall
                drawWidth = this.radius * 2;
                drawHeight = drawWidth / aspectRatio;
            } else {
                // Image is taller than wide or square
                drawHeight = this.radius * 2;
                drawWidth = drawHeight * aspectRatio;
            }

            // Calculate top-left corner to center the image
            const drawX = centerX - drawWidth / 2;
            const drawY = centerY - drawHeight / 2;

            // Draw the image
            ctx.drawImage(
                this.img,
                drawX,
                drawY,
                drawWidth,
                drawHeight
            );
        } else {
            // Fallback: Draw a blue circle if image isn't loaded
            ctx.beginPath();
            ctx.fillStyle = "blue";
            ctx.arc(
                centerX,
                centerY,
                this.radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
}

