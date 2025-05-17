export default class Coin{
    constructor(game,x,y){
        // this.img=new Image()
        // this.img.src="img/coin.png"
        // this.isImageLoaded=false
        // this.img.onload=()=>{
        //     this.isImageLoaded=true
        // }        
        this.game=game
        this.x=x
        this.y=y
        this.img=new Image()
        this.imgSources=[
            "img/scrap.png",
            "img/scrap2.png",
            "img/scrap3.png",
            "img/scrap4.png",
            "img/scrap5.png",
        ]
        this.img.src=this.imgSources[getRandomArbitrary(0,4)]
        this.isImageLoaded=false
        this.img.onload=()=>{
            this.isImageLoaded=true
        }
    }
    draw(ctx){
        ctx.beginPath()
        ctx.fillStyle="yellow"
        if(1==2){
            // ctx.drawImage(this.img,this.x-this.game.camX+this.game.canvas.width/2-this.img.width/2,this.y-this.game.camY+this.game.canvas.height/2-this.img.height/2,this.img.width,this.img.height)
        }else{
            ctx.arc(this.x-this.game.camX+this.game.canvas.width/2,this.y-this.game.camY+this.game.canvas.height/2,10,0,Math.PI*2)

        }
        ctx.fill()
    }
}