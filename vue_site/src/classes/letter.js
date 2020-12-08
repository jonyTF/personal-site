import { Vector2 } from '@/classes/vector.js';
import { cmdToPathData, RgbToColorString, subtractRgb, multRgbByConst } from '@/utils.js';

export class Shard {
  constructor(pivotX, pivotY, pathCommands, mask) {
    /*
      pivotX | double       : the center X position of shard
      pivotY | double       : the center Y position of shard
      pathCommands | Array  : array containing path commands of the letter this shard is a part of
      mask | {x,y,w,h}      : the mask to apply to the shard, (x,y) signify the top left of shard   
    */

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
    this.startColor = {r: 0, g: 0, b: 0};
    this.endColor = {r: 255, g: 255, b: 255};
    this.colorDiff = subtractRgb(this.startColor, this.endColor)
    this.color = RgbToColorString(this.startColor);
    this.opacity = '0.5';
  } 

  draw() {
    /* Draw letter with a mask outlining the shard applied */
    ctx.save();

    ctx.scale(canvasScale, canvasScale);

    let maskPath = new Path2D();
    //maskPath.rect(this.mask.x, this.mask.y, this.mask.w, this.mask.h);
    maskPath.rect(this.x-this.mask.w/2, this.y-this.mask.h/2, this.mask.w, this.mask.h);
    ctx.clip(maskPath);
    
    ctx.fillStyle = this.color;
    ctx.fill(new Path2D(this.pathData), 'evenodd');

    ctx.restore();
  }

  move(x, y) {
    /* Move shard to position (x, y) by editing the path data */
    this.x = x;
    this.y = y;
    let newPosString =  `${x + this.xOffset} ${y + this.yOffset}`;
    this.pathData = this.pathData.replace(/[\d-.]+ [\d-.]+/, newPosString);
  }

  moveRel(x, y) {
    this.move(this.x + x, this.y + y);
  }

  getMouseVector() {
    /* Get vector from mouse to current position */
      return Vector2.subtract(
      new Vector2(this.x, this.y),
      new Vector2(mouseX, mouseY),
    ); 
  }

  getInitPosVector() {
    /* Get vector from current position to initial position */
    return Vector2.subtract(
      new Vector2(this.initX, this.initY),
      new Vector2(this.x, this.y),
    ); 
  }

  constrainToBounds() {
    /* Constrains shard to only move around mouse shove radius */
    const {dist, dir} = this.getInitPosVector();
    if (dist > this.shoveRadius) {
      const diff = dist - this.shoveRadius;
      const dx = diff * Math.cos(dir);
      const dy = diff * Math.sin(dir);
      this.moveRel(dx, dy);
    }
  }

  setOpacity(opacity) {
    this.opacity = opacity;
  }

  increaseOpacity(amt) {
    /* Increases opacity until it reaches 1, whereupon it returns false */
    if (this.opacity + amt > 1) {
      this.opacity = 1;
      return false;
    }
    this.opacity += amt;
    return true;
  }

  update() {
    /* Calculate movement of shard based on mouse position */
    const mouseVector = this.getMouseVector();
    const mouseDist = mouseVector.getMagnitude(), mouseDir = mouseVector.getDirection();
    const initPosVector = this.getInitPosVector();
    const initPosDist = initPosVector.getMagnitude(), initPosDir = initPosVector.getDirection();
    let forceX = 0, forceY = 0;
    if (mouseDist && mouseDir) {
      if (mouseDist < this.shoveRadius) {
        // Move shard to radius if too close to mouse
        const sumVector = Vector2.add(initPosVector, mouseVector);  
        const sumDist = sumVector.getMagnitude(), sumDir = sumVector.getDirection();

        forceX = 1/sumDist * Math.cos(sumDir) * 50;
        forceY = 1/sumDist * Math.sin(sumDir) * 50;
      } else {
        // Move shard otherwise
        
        //console.log('dist: ', diffDist, 'dir: ', diffDir);
        forceX = initPosDist * Math.cos(initPosDir) / 10;
        forceY = initPosDist * Math.sin(initPosDir) / 10;
        //forceX = sumDist * Math.cos(sumDir) / 10;
        //forceY = sumDist * Math.sin(sumDir) / 10;
        const newMouseVector = Vector2.subtract(
          new Vector2(this.x + forceX, this.y + forceY),
          new Vector2(mouseX, mouseY),
        ); 
        if (newMouseVector.getMagnitude() < this.shoveRadius) {
          forceX = 0;
          forceY = 0;
        }
      }
    }
    this.moveRel(forceX, forceY);
    this.color = RgbToColorString(subtractRgb(this.startColor, multRgbByConst(initPosDist/this.shoveRadius, this.colorDiff)));
    //console.log(this.color);
    this.constrainToBounds();
    this.draw();
  }
}

export class Letter {
  constructor(pathCommands, options) {
    /* options is of the form:
    {
      xOffset | number : amount to offset letters in x direction
      yOffset | number : amount to offset letters in y direction   
    }
    */

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

    // Apply offsets
    if ('xOffset' in options) {
      pathCommands[0].x += options.xOffset;
      minX += options.xOffset;
      maxX += options.xOffset;
    }
    if ('yOffset' in options) {
      pathCommands[0].y += options.yOffset;
      minY += options.yOffset;
      maxY += options.yOffset;
    }

    const width = (maxX-minX);
    const height = (maxY-minY);
    const shardW = 15;
    const shardH = 15;
    const cols = width/shardW+1;
    const rows = height/shardH+1;
    const padAmt = 0.3;

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

  initRandom() {
    /* Randomly initializes shard position to make it fade in */
    for (let i = 0; i < this.shards.length; i++) {
      this.shards[i].moveRel(100+-1*Math.random()*200, 0);
      this.shards[i].setOpacity(0);
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
      // TODO: Maybe change this
      this.shards[i].increaseOpacity(0.02);
    }
  }
}