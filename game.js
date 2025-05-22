import Player from './player/player.js';
import Background from './scene/background.js'
import Coin from './player/coin.js'
import ImageProgressBar from './player/progress.js';

const canvas=document.getElementById("canvas")
canvas.width=window.innerWidth
canvas.height=window.innerHeight
const ctx=canvas.getContext("2d")


// Get the actual pixel ratio of the display
const scale = window.devicePixelRatio || 1;

// Set the canvas width/height to be higher resolution
canvas.width = window.innerWidth * scale*1;
canvas.height = window.innerHeight * scale*1;
ctx.scale(scale, scale);

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";


// THEN, set the CSS size so it looks the same on screen
canvas.style.width = window.innerWidth + "px";
canvas.style.height = window.innerHeight + "px";

const message1=document.getElementById("message1")
const message2=document.getElementById("message2")
const message3=document.getElementById("message3")
const blackout=document.getElementById("blackout")



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
    this.intro=true
    this.currentProgress=0
    this.targetProgress=100
    this.coins=[]
    for(let i=0;i<400;i++){
      this.coins.push(new Coin(this,getRandomArbitrary(-canvas.width*3,canvas.width*3),getRandomArbitrary(-canvas.height*3,canvas.height*3)))
    }
    this.player=new Player(0,0,this)
    this.background=new Background(this)
    const parent = document.getElementById('progress');
    this.progressBar = new ImageProgressBar('img/rocket.png', parent);

    // Simulate progress towards a target

    this.setProgress(50)

    this.addPlayerControls()
    this.planetPosition=[]
    this.deltaTime=0
    this.t=0
  }
  update(t=0) {
    this.t++
    this.setProgress(50*Math.sin(this.t/100))

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
  setProgress(value) {
    this.progressBar.setProgress(value/this.targetProgress);
  }

  render(ctx){
    if(!this.intro){
    this.background.draw(ctx)
    this.coins.forEach(coin=>coin.draw(ctx))

    this.player.update()
    this.player.tether.draw(ctx)
    
    this.player.draw(ctx)
    this.progressBar.draw(ctx)
    }
    
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

let lastTime=0
function loop(timestamp){
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight)
    const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
    lastTime = timestamp;
    game.deltaTime = deltaTime; // Store in game object
    game.render(ctx)
    game.update()


  requestAnimationFrame(loop);
}

window.addEventListener("click", function(e){
  if(message1.classList.contains("message")){
    // zipOffScreen(message1)
    message1.classList.remove("message")
    message1.classList.add("hidden")
  }
  else if(message2.classList.contains("message")){
    message2.classList.remove("message")
    message2.classList.add("hidden")
  } else {
    message3.classList.remove("message")
    message3.classList.add("hidden")
    blackout.style.opacity=0
    game.intro=false
  }
})

function zipOffScreen(element, options = {}) {
    // Default options
    const config = {
        duration: 0.5, // Animation duration in seconds
        distanceMultiplier: 1.5, // How far the element travels
        rotate: false, // Whether to rotate during movement
        rotationAngle: 360, // Rotation angle in degrees if rotate is true
        easing: 'ease-out', // CSS easing function
        ...options
    };

    // Ensure element exists
    if (!(element instanceof HTMLElement)) {
        console.error('zipOffScreen: Invalid element provided');
        return;
    }

    // Apply transition for smooth animation
    element.style.transition = `transform ${config.duration}s ${config.easing}`;

    // Add click event listener to the document
    const handler = () => {
        // Get window dimensions
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Generate random direction (angle in degrees)
        const angle = Math.random() * 360;

        // Convert angle to radians
        const radians = angle * (Math.PI / 180);

        // Calculate distance to ensure element goes off-screen
        const distance = Math.max(windowWidth, windowHeight) * config.distanceMultiplier;

        // Calculate velocity components
        const velocityX = Math.cos(radians) * distance;
        const velocityY = Math.sin(radians) * distance;

        // Build transform string
        let transform = `translate(${velocityX}px, ${velocityY}px)`;
        if (config.rotate) {
            transform += ` rotate(${config.rotationAngle}deg)`;
        }

        // Apply transform
        element.style.transform = transform;

        // Hide element after animation
        setTimeout(() => {
            element.style.display = 'none';
        }, config.duration * 1000);

        // Remove event listener after animation
        document.removeEventListener('click', handler);
    };

    // Attach event listener
    document.addEventListener('click', handler);
}

loop()

