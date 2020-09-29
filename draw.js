// MY IDEA: cut the "Jonathan Liu" text randomly into chunks, and then make it assemble itself.
// one way: Use rectangles/randomly generated triangles, and then perform a subtract operation with the text as a mask
// another way: slice the original path into chunks
// SLICING/clipping: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Shard {
  constructor(pivotX, pivotY, pathCommands, mask) {
    // Assign instance variables
    this.x = pivotX;
    this.initX = this.x;
    this.xOffset = pathCommands[0].x - this.x;
    this.y = pivotY;
    this.initY = this.y;
    this.yOffset = pathCommands[0].y - this.y;
    this.shoveRadius = 50; // The radius with which to move letter around mouse
    this.pathCommands = pathCommands;
    this.pathData = cmdToPathData(this.pathCommands);
    this.mask = mask;
    this.color = 'black';
  } 

  draw() {
    ctx.save();
    
    let maskPath = new Path2D();
    //maskPath.rect(this.mask.x, this.mask.y, this.mask.w, this.mask.h);
    maskPath.rect(this.x-this.mask.w/2, this.y-this.mask.h/2, this.mask.w, this.mask.h);
    ctx.clip(maskPath);
    
    ctx.fillStyle = this.color;
    ctx.fill(new Path2D(this.pathData), 'evenodd');
    
    ctx.restore();

    /*ctx.fillRect(this.x-5, this.y-5, 10, 10);
    
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.initX, this.initY);
    ctx.stroke();*/
  }

  move(x, y) {
    this.x = x;
    this.y = y;
    let newPosString =  `${x + this.xOffset} ${y + this.yOffset}`;
    this.pathData = this.pathData.replace(/[\d-.]+ [\d-.]+/, newPosString);
  }

  moveRel(x, y) {
    this.move(this.x + x, this.y + y);
  }

  getVector(from, to) {
    // From and to are objects of the form:
    // { x, y }
    const dx = to.x - from.x;
    const dy = to.y - from.y; 
    return {
      dist: Math.sqrt(dx*dx + dy*dy),
      dir: Math.atan2(dy, dx),
    };
  }

  getMouseVector() {
    return this.getVector(
      {x: mouseX, y: mouseY},
      {x: this.x, y: this.y},
    );
  }

  getInitPosVector() {
    return this.getVector(
      {x: this.x, y: this.y},
      {x: this.initX, y: this.initY},
    );
  }

  constrainToBounds() {
    const {dist, dir} = this.getInitPosVector();
    if (dist > this.shoveRadius) {
      const diff = dist - this.shoveRadius;
      const dx = diff * Math.cos(dir);
      const dy = diff * Math.sin(dir);
      this.moveRel(dx, dy);
    }
  }

  update() {
    const mouseVector = this.getMouseVector();
    const mouseDist = mouseVector.dist, mouseDir = mouseVector.dir;
    const initPosVector = this.getInitPosVector();
    const initPosDist = initPosVector.dist, initPosDir = initPosVector.dir;
    let forceX, forceY;
    if (mouseDist && mouseDir && mouseDist < this.shoveRadius) {
      forceX = 1/mouseDist * Math.cos(mouseDir) * 500;
      forceY = 1/mouseDist * Math.sin(mouseDir) * 500;
    } else {
      forceX = initPosDist * Math.cos(initPosDir) / 10;
      forceY = initPosDist * Math.sin(initPosDir) / 10;
      const newMouseVector = this.getVector(
        {x: mouseX, y: mouseY}, 
        {x: this.x+forceX, y: this.y+forceY}
      );
      if (newMouseVector.dist < this.shoveRadius) {
        forceX = 0;
        forceY = 0;
      }
    }
    this.moveRel(forceX, forceY);
    this.color = `rgb(0, 0, ${initPosDist/this.shoveRadius * 200})`
    //console.log(this.color);
    this.constrainToBounds();
    this.draw();
  }
}

class Letter {
  constructor(pathCommands) {
    if (pathCommands[0].type !== 'M') {
      console.error('Path needs to begin with a move command!');
      return;
    }
    
    // Make positioning relative and generate bounding box
    let prevX = pathCommands[0].x;
    let prevY = pathCommands[0].y;
    let minX = prevX, maxX = prevX;
    let minY = prevY, maxY = prevY;
    for (let i = 1; i < pathCommands.length; i++) {
      if (pathCommands[i].type !== 'Z') {
        let oldX = pathCommands[i].x;
        let oldY = pathCommands[i].y;

        // Remove path command if does not move at all
        if (oldX === prevX && oldY === prevY) {
          pathCommands.splice(i, 1);
          i--;
          continue;
        }

        pathCommands[i].type = pathCommands[i].type.toLowerCase();
        for (const key of Object.keys(pathCommands[i])) {
          if (key !== 'type') {
            if (key.includes('x')) {
              pathCommands[i][key] -= prevX;
            } else if (key.includes('y')) {
              pathCommands[i][key] -= prevY;
            }
          }
        }
        prevX = oldX;
        prevY = oldY;
        if (oldX < minX) minX = oldX;
        if (oldX > maxX) maxX = oldX;
        if (oldY < minY) minY = oldY;
        if (oldY > maxY) maxY = oldY;
      }
    }

    const cols = 5;
    const rows = 5;
    const width = (maxX-minX);
    const height = (maxY-minY);
    const shardW = width/cols;
    const shardH = height/rows;
    const padAmt = 5;

    this.shards = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let x = minX + c*shardW - padAmt;
        let y = minY + r*shardH - padAmt;
        let mask = {x, y, w: shardW+padAmt*2, h: shardH+padAmt*2};
        this.shards.push(new Shard(x+shardW/2, y+shardH/2, pathCommands, mask)); 
      }
    }
  }

  draw() {
    for (let i = 0; i < this.shards.length; i++) {
      this.shards[i].draw();
    }
  }

  update() {
    for (let i = 0; i < this.shards.length; i++) {
      this.shards[i].update();
    }
  }
}

function restrictMagnitude(value, magnitude) {
  if (Math.abs(value) > magnitude) {
    return value > 0 ? magnitude : -magnitude;  
  }
  return value;
}

function cmdToPathData(cmd) {
  let pathData = '';
  for (let i = 0; i < cmd.length; i++) {
    let s = '';
    for (const val of Object.values(cmd[i])) {
      s += val + ' ';
    }
    pathData += s;
  }
  return pathData;
}

function init() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const path = font.getPath('Jonathan Liu', 50, 200, 150);
  const multPaths = {
    1: {numPaths: 2},
    3: {numPaths: 2},
    6: {numPaths: 2},
    9: {numPaths: 2}
  };

  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.strokeStyle = 'rgb(0, 0, 0)';
  
  let curShape = [];
  let curLetterIndex = 0;
  let curPathIndex = 0;
  for (let i = 0; i < path.commands.length; i++) {
    curShape.push(path.commands[i]);
    if (path.commands[i].type === 'Z') {
      if (multPaths[curLetterIndex]) {
        if (curPathIndex+1 < multPaths[curLetterIndex].numPaths) {
          curPathIndex++;
          continue;
        } else {
          curPathIndex = 0;
        }
      }

      curLetterIndex++;

      let letter = new Letter(curShape);
      letter.draw();
      letters.push(letter);

      curShape = [];
    }
  }

  // Split path data by 'Z'
  // separate path into chunks of three
  // Add a Z to the end
  // Fill in the holes by combining the last three points of each shard into another shard
  const pathData = path.toPathData();
  ctx.stroke(new Path2D(pathData));
}

var animateTimes = 0;
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < letters.length; i++) {
    letters[i].update();
  }
  animateTimes++;
  //return;
  //if (animateTimes < 0)
    setTimeout(animate, 10);
}

// Global variables
var font = null;
var mouseX, mouseY;
var letters = [];

opentype.load('fonts/Roboto-Black.ttf', function(err, font) {
  if (err) {
    alert('Font could not be loaded: ', err);
  } else {
    window.font = font;
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    window.addEventListener('mousemove', (e) => {
      window.mouseX = e.x;
      window.mouseY = e.y;
    });
    init();
    animate();
  }
});