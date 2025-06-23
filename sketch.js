let introBg;
let canvasWidth;
let canvasHeight;

let introSound;
let introStarted = false;
let introHidden = false;

let isPlayin = false;

//LANES
let numLanes = 3;
let lanePos = 0;

//ENEMIES
let enemies = [];
let enemyVelocity = [2, 3, 4, 5];
let currentVel = 4;
const MAX_CONCURRENT_ENEMIES = numLanes - 1;

let enemiesImgPaths = [
  "/assets/elements/biker1.png",
  "/assets/elements/drone1.png",
  "/assets/elements/alien1.png",
];
let enemiesImgs = [];

const typeOrder = {
  biker: 0,
  drone: 1,
  alien: 2,
};

let player;

function preload() {
  introBg = loadImage("/assets/NightDrive.gif");
  introSound = loadSound("/assets/audio/lady-of-the-80.mp3");

  //Car Player
  player = loadImage("/assets/elements/player.png");

  //Enemies
  for (let i = 0; i < enemiesImgPaths.length; i++) {
    enemiesImgs[i] = loadImage(enemiesImgPaths[i]);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  //increase currentVelocity of enemies
  setInterval(increaseVel, 10000);

  //initialize enemies
  for (let i = 0; i < numLanes; i++) {
    if (enemies.length < MAX_CONCURRENT_ENEMIES) {
      enemies.push(new Enemy(i, enemyVelocity[i]));
    }
  }
}

function draw() {
  if (!introHidden) {
    background(introBg);
    return;
  }

  background("#160321");

  //Street Lanes
  strokeWeight(5);
  stroke(255, 0, 150, 200);
  line(width / 2 - 50, 150, 50, height);
  line(width / 2 + 50, 150, width - 50, height);

  // Inner Street Lanes
  strokeWeight(2);
  stroke(255, 255, 0, 150);
  let x1_top = width / 2 - 50 + 100 / 3;
  let x1_bottom = 50 + (width - 100) / 3;
  line(x1_top, 150, x1_bottom, height);
  let x2_top = width / 2 - 50 + (100 / 3) * 2;
  let x2_bottom = 50 + ((width - 100) / 3) * 2;
  line(x2_top, 150, x2_bottom, height);

  //Enemies
  enemies.sort((a, b) => a.pos.y - b.pos.y);

  //draw enemies and add new when gone
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    e.update();
    e.show();
    if (e.pos.y > height) {
      enemies.splice(i, 1);
      let randomLane = [0, 1, 2]; //floor(random(numLanes))
      if (enemies.length < MAX_CONCURRENT_ENEMIES) {
        enemies.push(
          new Enemy(
            Math.floor(Math.random() * randomLane.length),
            enemyVelocity[i]
          )
        );
      }
      lanePos += 1;
      if (lanePos > 2) {
        lanePos = 0;
      }
    }
  }

  //Car Player
  let playerPos = constrain(mouseX - 75, 150, 1075);
  image(player, playerPos, height - 160, 200, 200);

  /********FRAMERATE********/
  let fps = frameRate();
  fill(0);
  rect(0, height - 25, 60, 25);
  fill(255);
  noStroke();
  textSize(16);
  text(fps.toFixed(2), 10, height - 10);
  /********FRAMERATE********/
}

function increaseVel() {
  for(let v = 0; v < enemyVelocity.length; v++) {
    enemyVelocity[v] = min(enemyVelocity[v] + 0.2, 10);
  }
} 

function drawRoad() {}

function mousePressed() {
  if (!introStarted) {
    if (getAudioContext().state !== "running") {
      getAudioContext().resume();
    }
    introSound.loop();
    introStarted = true;
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
    introHidden = true;
    isPlayin = true;
    introSound.stop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, 400);
  laneWidth = windowWidth / numLanes;
}
