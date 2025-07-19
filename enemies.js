let enemyTypes = ["pflanze", "stein", "biker", "drone", "alien"];

class Enemy {
  constructor(laneIndex, enemyVel, typeLane="normal") {
    this.laneIndex = laneIndex;
    let y = 150;
    let x = 0;

    this.pos = createVector(x, y);
    this.vel = createVector(0, enemyVel);

    //Type of enemy
    this.type = random(enemyTypes);
    if (this.type === "pflanze") this.img = enemiesImgs[0];
    if (this.type === "stein") this.img = enemiesImgs[1];
    if (this.type === "biker") this.img = enemiesImgs[2];
    else if (this.type === "drone") this.img = enemiesImgs[3];
    else if (this.type === "alien") this.img = enemiesImgs[4];

    //img sizes
    this.imgW = 250;
    this.imgH = 250;
    this.sizeW = this.imgW;
    this.sizeH = this.imgH;

    //Collision
    this.collided = false;
    //Attacked
    this.attacked = false;

    if(typeLane=="switcher") {
      if(laneIndex == 2 && this.pos.y < 200) {
        setTimeout(() => this.laneIndex-=1, 1000);
      }
      else if(laneIndex == 1 && this.pos.y < 200) {
        let dir = random([ -1, +1 ]);
        setTimeout(() => this.laneIndex+=dir, 1000);
      }
      else if(laneIndex == 0 && this.pos.y < 200){
        setTimeout(() => this.laneIndex+=1, 1000);
      }
    }
  }

  updateSize() {
    this.sizeW = map(this.pos.y, 150, height, this.imgW * 0.05, this.imgW);
    this.sizeH = map(this.pos.y, 150, height, this.imgH * 0.05, this.imgH);
  }

  update() {
    // update y-pos
    this.pos.add(this.vel);
    if (this.pos.y > height - 300) {
      this.pos.add(this.vel.copy().mult(3));
    }

    // 1. get left and right road edge
    const roadLeftX = map(this.pos.y, 150, height, width / 2 - 50, 50);
    const roadRightX = map(this.pos.y, 150, height, width / 2 + 50, width - 50);

    // 2. get width of lane
    const currentRoadWidth = roadRightX - roadLeftX;
    const currentLaneWidth = currentRoadWidth / numLanes;

    let laneCenterX =
      roadLeftX + currentLaneWidth * this.laneIndex + currentLaneWidth / 2;
    if (this.laneIndex === 0) {
      //left lane
      this.pos.x = laneCenterX - currentLaneWidth * 0.3;
    } else if (this.laneIndex === numLanes - 1) {
      //right lane
      this.pos.x = laneCenterX + currentLaneWidth * 0.3;
    } else {
      this.pos.x = laneCenterX;
    }
    //this.pos.x += (random() - 0.5) * 2;
  }

  show() {
    this.updateSize();
    if (this.img) {
      image(
        this.img,
        this.pos.x - this.sizeW / 2,
        this.pos.y,
        this.sizeW,
        this.sizeH
      );
    }
  }
}
