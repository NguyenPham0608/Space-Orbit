export default class Planet{
    constructor(x, y, radius, game){
      this.x=x
      this.y=y
      this.game=game
      this.player=game.player
      this.radius=radius
      this.dxPlayer=this.x-this.player.x
      this.dyPlayer=this.y-this.player.y
    }
    draw(ctx){
      ctx.beginPath()
      ctx.fillStyle="blue"
      ctx.arc(this.x-this.game.camX+(this.game.canvas.width/2), this.y-this.game.camY+(this.game.canvas.height/2),this.radius, 0, Math.PI*2)
      ctx.fill()
      // Positive dx means player is to the left of the planet
      // Negative dx means player is to the right of the planet
      this.dxPlayer=this.x-this.player.x
      // Positive dy means player is above the planet
      // Negative dy means player is below the planet
      this.dyPlayer=this.y-this.player.y

    }
  }