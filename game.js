import Player from './player/player.js';
import Background from './scene/background.js'

const canvas=document.getElementById("canvas")
canvas.width=window.innerWidth
canvas.height=window.innerHeight
const ctx=canvas.getContext("2d")


export default class Game{
  constructor(){
    this.canvas=canvas
    this.mouseX=0
    this.mouseY=0
    this.left=false
    this.right=false
    this.up=false
    this.down=false
    this.space=false

    this.camX=0
    this.camY=0
    this.background=new Background(this)
    this.player=new Player(0,0,this)
    this.addPlayerControls()
    this.planetPosition=[]

  }
  update() {
    // this.background.planets.forEach((planet) => {
    //   const planetX=planet.x-this.camX+ canvas.width / 2
    //   const planetY=planet.y-this.camY+ canvas.height / 2
    //   const dx = this.mouseX - planetX;
    //   const dy = this.mouseY - planetY;
    //   const dist = Math.hypot(dx, dy);
    //   ctx.beginPath()
    //   ctx.strokeStyle="orange"
    //   ctx.arc(planetX, planetY,100,0,Math.PI*2)
    //   ctx.stroke()
    //   if (dist < 100) {
    //     console.log("hi 👋 Planet says hello!");
    //     this.mouseX=planetX
    //     this.mouseY=planetY
    //   }
    // });
  }

  render(ctx){

    this.background.draw(ctx)
    this.player.tether.draw(ctx)
    this.player.draw(ctx)
    
  }
  addPlayerControls(){
    window.addEventListener("mousemove",(e)=>{
      // this.mouseX=e.clientX
      // this.mouseY=e.clientY
    })
    window.addEventListener("keydown",(e)=>{
      switch(e.key){
        case "ArrowLeft":
          this.left=true
          break;
        case "ArrowRight":
          this.right=true
          break;
        case "ArrowUp":
          this.up=true
          break;
        case "ArrowDown":
          this.down=true
          break;
        case " ":
          this.space=true
          break;
      }
    })
    window.addEventListener("keyup",(e)=>{
      switch(e.key){
        case "ArrowLeft":
          this.left=false
          break;
        case "ArrowRight":
          this.right=false
          break;
        case "ArrowUp":
          this.up=false
          break;
        case "ArrowDown":
          this.down=false
          break;
        case " ":
          this.space=false
          break;
      }
    })

  }
}

const game = new Game()


function loop(){
  ctx.clearRect(0,0,window.innerWidth, window.innerHeight)
  game.render(ctx)
  game.update()


  requestAnimationFrame(loop);
}
loop()