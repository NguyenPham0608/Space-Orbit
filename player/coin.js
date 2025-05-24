export default class Coin {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.sx = 0;
        this.sy = 0;
        this.img = new Image();
        this.power=false
        this.random=getRandomArbitrary(0,100)
        this.imgSources = [
            "img/scrap1.png",
            "img/scrap2.png",
            "img/scrap3.png",
            "img/scrap4.png",
            "img/scrap5.png",
        ];
        this.attracted=false
        this.attractedTime=0
        this.img.src = this.imgSources[getRandomArbitrary(0, 4)];
        if(this.random<8){
            this.power=true
            this.img.src = "img/magnet.jpeg"
        }
        this.isImageLoaded = false;
        this.img.onload = () => {
            this.isImageLoaded = true;
        };
        this.time=getRandomArbitrary(0, 1000);
    }
    draw(ctx) {
        this.x+=this.sx
        this.y+=this.sy
        this.sx=0.97*this.sx
        this.sy=0.97*this.sy
        this.time++
        const centerX = this.x - this.game.camX + window.innerWidth / 2; 
        const centerY = 10*Math.sin(this.time/26)+this.y - this.game.camY + window.innerHeight / 2;
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
        if(this.attracted){
            this.attractedTime++
            if(this.attractedTime<200){
                const dx=this.x-this.game.player.x
                const dy=this.y-this.game.player.y
                const dist=Math.hypot(dx,dy)
                if(dist<700){
                    this.sx-=dx/1900
                    this.sy-=dy/1900

                }
            }else{
                this.attracted=false
            }
        }else{
            this.attractedTime=0
        }
    }
}