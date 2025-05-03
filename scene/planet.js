export default class Planet{
    constructor(x, y, radius, game){
      this.x=x
      this.y=y
      this.game=game
      this.radius=radius
    }
    draw(ctx){
      ctx.beginPath()
      ctx.fillStyle="blue"
      ctx.arc(this.x-this.game.camX+(this.game.canvas.width/2), this.y-this.game.camY+(this.game.canvas.height/2),this.radius, 0, Math.PI*2)
      ctx.fill()
    }
  }