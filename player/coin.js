export default class Coin {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.img = new Image();
        this.imgSources = [
            "img/scrap1.png",
            "img/scrap2.png",
            "img/scrap3.png",
            "img/scrap4.png",
            "img/scrap5.png",
        ];
        this.img.src = this.imgSources[getRandomArbitrary(0, 4)];
        this.isImageLoaded = false;
        this.img.onload = () => {
            this.isImageLoaded = true;
        };
        this.time=getRandomArbitrary(0, 1000);
    }
    draw(ctx) {
        this.time++
        const centerX = this.x - this.game.camX + window.innerWidth / 2; 
        const centerY = 10*Math.sin(this.time/20)+this.y - this.game.camY + window.innerHeight / 2;
        if (this.isImageLoaded) {
            const scaledWidth = this.img.width / 16;
            const scaledHeight = this.img.height / 16;
            ctx.drawImage(this.img, 
                centerX - scaledWidth / 2, 
                centerY - scaledHeight / 2, 
                scaledWidth, 
                scaledHeight);
        } else {
            ctx.beginPath();
            ctx.fillStyle = "yellow";
            ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}