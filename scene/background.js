import Planet from "./planet.js"
export default class Background{
  constructor(game){
    this.game=game
    this.numPlanets=10
    this.planets=[]
    for(let i=0; i<this.numPlanets; i++){
      this.planets.push(new Planet(getRandomArbitrary(-this.game.canvas.width/2,this.game.canvas.width/2),getRandomArbitrary(-1000,1000),getRandomArbitrary(20,60), this.game))
    }
  }
  draw(ctx){
    this.planets.forEach((planet)=>{
      planet.draw(ctx)
    })
  }
}