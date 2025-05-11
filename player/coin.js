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
    }
    draw(ctx){
        ctx.beginPath()
        ctx.arc(this.x-this.game.camX+this.game.canvas.width/2,this.y-this.game.camY+this.game.canvas.height/2,10,0,Math.PI*2)
        ctx.fillStyle="yellow"
        ctx.fill()
    }
}