let enemyTypes = ["biker", "drone", "alien"];

class Enemy {
  constructor(laneIndex, enemyVel) {
    this.laneIndex = laneIndex;
    let y = 100;

    let x = 0; 
    
    this.pos = createVector(x, y);
    this.vel = createVector(0, enemyVel);

    //Type of enemy
    this.img = random(enemiesImgs);
    this.type = random(enemyTypes);
    if (this.type === "biker") this.img = enemiesImgs[0];
    else if (this.type === "drone") this.img = enemiesImgs[1];
    else if (this.type === "alien") this.img = enemiesImgs[2];

    //img sizes
    this.imgW = 225;
    this.imgH = 225;
    this.sizeW = this.imgW;
    this.sizeH = this.imgH;
  }

  updateSize() {
    this.sizeW = map(this.pos.y, 150, height, this.imgW * 0.05, this.imgW);
    this.sizeH = map(this.pos.y, 150, height, this.imgH * 0.05, this.imgH);
  }

  update() {
    // Zuerst die Y-Position aktualisieren
    this.pos.add(this.vel);
    if(this.pos.y > height-200) {
      this.pos.add(this.vel.copy().mult(2));
    }

    // 1. Finde die linke und rechte Kante der Straße auf der aktuellen Y-Höhe
    const roadLeftX = map(this.pos.y, 150, height, width / 2 - 50, 50);
    const roadRightX = map(this.pos.y, 150, height, width / 2 + 50, width - 50);

    // 2. Berechne die aktuelle Breite der Straße und einer einzelnen Spur
    const currentRoadWidth = roadRightX - roadLeftX;
    const currentLaneWidth = currentRoadWidth / numLanes;

    // 3. Berechne die X-Position für die Mitte der zugewiesenen Spur
    this.pos.x = roadLeftX + (currentLaneWidth * this.laneIndex) + (currentLaneWidth / 2);

    //this.pos.x += (random() - 0.5) * 2;
  }

  show() {
    this.updateSize();
    image(this.img, this.pos.x - this.sizeW / 2, this.pos.y, this.sizeW, this.sizeH);
  }
}


class Tree{
  constructor() {

  }
}