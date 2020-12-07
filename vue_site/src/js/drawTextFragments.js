import { Letter } from '@/classes/letter.js';
import namePathCommands from '@/data/jonathan_liu_path.json';

export const init = (canvas, options={}) => {
  /* options is of the form:
  {
    xOffset | number  : amount to offset letters in x direction
    yOffset | number  : amount to offset letters in y direction   
    width | number    : width of canvas
    height | number   : height of canvas
  }
  */
  // when scale is 1, these options work best: {xOffset: 50, yOffset: 50, width: 1000, height: 250}
  // SO: make all properties depend on either width or height
  
  const letterOptions = {xOffset: 50, yOffset: 50}

  window.canvas = canvas
  window.canvasScale = 1 
  changeCanvasOptions(options)

  window.ctx = canvas.getContext('2d');
  window.mouseX = 0;
  window.mouseY = 0;
  window.letters = [];
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect()
    window.mouseX = 1/canvasScale*(e.x - rect.left);
    window.mouseY = 1/canvasScale*(e.y - rect.top);
  });

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //const path = font.getPath('Jonathan Liu', 50, 200, 150);
  const pathCommands = namePathCommands;
  const multPaths = {
    1: {numPaths: 2},
    3: {numPaths: 2},
    6: {numPaths: 2},
    9: {numPaths: 2}
  };

  //document.getElementById('test').innerHTML = pathCommandsToString(path.commands);

  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.strokeStyle = 'rgb(0, 0, 0)';
  
  let curShape = [];
  let curLetterIndex = 0;
  let curPathIndex = 0;
  for (let i = 0; i < pathCommands.length; i++) {
    curShape.push(pathCommands[i]);
    if (pathCommands[i].type === 'Z') {
      if (multPaths[curLetterIndex]) {
        if (curPathIndex+1 < multPaths[curLetterIndex].numPaths) {
          curPathIndex++;
          continue;
        } else {
          curPathIndex = 0;
        }
      }

      curLetterIndex++;

      let letter = new Letter(curShape, letterOptions);
      letter.initRandom();
      letter.draw();
      letters.push(letter);

      curShape = [];
    }
  }
}

export const changeCanvasOptions = (options) => {
  const model = {width: 1000, height: 250}
  
  if (options.width) {
    window.canvasScale = options.width/model.width 
    window.canvas.width = options.width
    window.canvas.height = options.width * model.height/model.width
  } else if (options.height) {
    window.canvasScale = options.height/model.height
    window.canvas.height = options.height
    window.canvas.width = options.height * model.height/model.width
  } else {
    throw '`options` does not contain width or height!'
  }
} 

var animateTimes = 0;
export const animate = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < letters.length; i++) {
    letters[i].update();
  }
  animateTimes++;
  //return;
  //if (animateTimes < 0)
    setTimeout(animate, 10);
}

// Load font
/*opentype.load('fonts/Roboto-Black.ttf', function(err, font) {
  if (err) {
    alert('Font could not be loaded: ', err);
  } else {
    window.font = font;
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    init();
    animate();
  }
});*/