export class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getMagnitude() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }

  setMagnitude(magnitude) {
    let angle = this.getDirection();
    this.x = magnitude * Math.cos(angle);
    this.y = magnitude * Math.sin(angle);
  }

  getDirection() {
    return Math.atan2(this.y, this.x);
  }

  setDirection(angle) {
    let magnitude = this.getMagnitude();
    this.x = magnitude * Math.cos(angle);
    this.y = magnitude * Math.sin(angle);
  }

  static add(v1, v2) {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }

  add(v2) {
    this.x += v2.x;
    this.y += v2.y;
  }

  static subtract(v1, v2) {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }

  subtract(v2) {
    this.x -= v2.x;
    this.y -= v2.y;
  }

  toString() {
    return `[Vector2 x=${this.x} y=${this.y} magnitude=${this.getMagnitude()} direction=${this.getDirection()}]`;
  }
}