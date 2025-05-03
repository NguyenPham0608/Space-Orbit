export default class Tether{
    constructor(player){
      this.player=player
      this.game=this.player.game
      this.tetherEndX=0
      this.tetherEndY=0
      this.tetherLength=0
    }
    draw(ctx){
      ctx.beginPath()
      ctx.strokeStyle="red"
      ctx.lineWidth=3
      ctx.moveTo(this.player.x+this.game.canvas.width/2 - this.game.camX, this.player.y+this.game.canvas.height/2 - this.game.camY)
      ctx.lineTo(this.tetherEndX,this.tetherEndY)
      ctx.stroke()
    }
  }