// --- Arduino-Kommunikation Variables ---
let port;
let connectButton;
let arduinoData = {
  xValue: 512,
  currentLane: 0,
  btnShoot: 0,
};
let lastBtnShootState = 0;
let latestDataString = "Wait for Data...";
// --- Arduino-Kommunikation Variables ---

//Game Intro
let introBg;
//Canvas Dimensions
let canvasWidth;
let canvasHeight;

let introSound;
let introStarted = false;
let introHidden = false;
//let isPlayin = false;

//STREET LANES
let numLanes = 3;
let lanePos = 0;

//CAR PLAYER
let player;
let lanePositionsX = [];
let smoothPlayerX = 0;


//ENEMIES
let enemies = [];
let enemyVelocity = [2, 3, 4, 5];
let currentVel = 4;
const MAX_CONCURRENT_ENEMIES = numLanes - 1;

let enemiesImgPaths = [
  "/assets/elements/biker1.png",
  "/assets/elements/drone1.png",
  "/assets/elements/alien1.png",
  "/assets/elements/stein.png",
  "/assets/elements/pflanze.png",
];
let enemiesImgs = [];

const typeOrder = {
  pflanze: 0,
  stein: 1,
  biker: 2,
  drone: 3,
  alien: 4,
};

//ATTACKS
let attacks = [];

//DECORATION / BACKGORUND ELEMENTS
//Skyline
let skyline;
let skylineFull;
//Trees
let treeImg;
let trees = [];



//GAME VALUES
const GAME_VELOCITY = 25000;
//highscore
let highscore = 0;
let increase_highscore = 0.1;
//Lifes
let lifesNum = 3;

//PRELOAD SOUND & IMAGES
function preload() {
  introBg = loadImage("/assets/NightDrive.gif");
  introSound = loadSound("/assets/audio/lady-of-the-80.mp3");

  skyline = loadImage("/assets/skyline.png");
  skylineFull = loadImage("/assets/skyline-full.png");

  //Car Player
  player = loadImage("/assets/elements/player.png");

  //Enemies
  for (let i = 0; i < enemiesImgPaths.length; i++) {
    enemiesImgs[i] = loadImage(enemiesImgPaths[i]);
  }

  //Trees
  treeImg = loadImage("/assets/elements/blossom-tree.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // STREET LANES CALCULATION
  let roadWidthAtPlayer = width - 100;
  let laneWidth = roadWidthAtPlayer / 3;
  lanePositionsX[0] = 50 + laneWidth / 2 - 100;
  lanePositionsX[1] = 50 + laneWidth * 1.5 - 100;
  lanePositionsX[2] = 50 + laneWidth * 2.5 - 100;

  //INCREASE GAME VELOCITY
  setInterval(increaseVel, GAME_VELOCITY);

  //INITIALIZE ENEMIES
  for (let i = 0; i < numLanes; i++) {
    if (enemies.length < MAX_CONCURRENT_ENEMIES) {
      enemies.push(new Enemy(i, enemyVelocity[i]));
    }
  }

  //INITIALIZE TREES
  for (let i = 0; i < 20; i++) {
    trees.push(new Tree(i % 2));
  }

  //CONNECT ARDUINO WITH P5 SKETCH
  connectButton = createButton("Connect");
  connectButton.position(width - connectButton.width / 2 - 100, height - 50);
  connectButton.mousePressed(connectToArduino);
}

function draw() {
  //INTRO VIEW
  if (!introHidden) {
    background(introBg);
    return;
  }
  //BACKGROUND COLOR
  background("#160321");

  // DRAW & UPDATE TREES
  for (let i = 0; i < trees.length; i++) {
    trees[i].update();
    trees[i].display();
  }

  //ADD SKY IMAGE + REFLECTION
  image(skyline, 0, -94, 1500, 244);
  push();
  scale(1, -1);
  tint(255, 60);
  image(skylineFull, 0, -767);
  pop();

  //ADD STREET LANES
  //Outer Lanes
  strokeWeight(5);
  stroke(255, 0, 150, 200);
  line(width / 2 - 50, 150, 50, height);
  line(width / 2 + 50, 150, width - 50, height);
  // Inner Lanes
  strokeWeight(2);
  stroke(255, 255, 0, 150);
  let x1_top = width / 2 - 50 + 100 / 3;
  let x1_bottom = 50 + (width - 100) / 3;
  line(x1_top, 150, x1_bottom, height);
  let x2_top = width / 2 - 50 + (100 / 3) * 2;
  let x2_bottom = 50 + ((width - 100) / 3) * 2;
  line(x2_top, 150, x2_bottom, height);

  //START: ENEMIES
  enemies.sort((a, b) => a.pos.y - b.pos.y);

  //Draw enemies and add new when gone
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    e.update();
    e.show();

    //Check collision between player and enemy
    checkCollision(e);

    //remove gone enemies and add new ones
    if (e.pos.y > height || e.collided) {
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
    }
  }
  //END: ENEMIES

  //START: CAR PLAYER
  let targetX = lanePositionsX[arduinoData.currentLane];
  let playerY = height - 160;
  smoothPlayerX = lerp(smoothPlayerX, targetX, 0.1); //smooth lane switch
  image(player, smoothPlayerX, playerY, 200, 200);
  //END: CAR PLAYER

  //START: ATTACKS
  //attack on button clcik
  if (arduinoData.btnShoot == 1 && lastBtnShootState == 0) {
    let newAttack = new Attack(
      smoothPlayerX + player.width / 2,
      height - 100,
      arduinoData.currentLane
    );
    attacks.push(newAttack);
  }
  lastBtnShootState = arduinoData.btnShoot;

  for (let i = attacks.length - 1; i >= 0; i--) {
    let attack = attacks[i];
    attack.update();
    attack.display();
    if (attack.pos.y < 0) {
      attacks.splice(i, 1);
    }
  }
  //END: ATTACKS

  //START: HIGHSCORE NUMBER + 3 LIFES DISPLAY
  highscore += increase_highscore;
  push();
  textSize(20);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  text("Score: " + round(highscore), width / 2, 40);
  text("❤️ " + lifesNum, width / 2, 80);
  pop();
  //END: HIGHSCORE NUMBER + 3 LIFES DISPLAY

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

//FUNC INCREASE ENEMIES VELOCITY
function increaseVel() {
  for (let v = 0; v < enemyVelocity.length; v++) {
    enemyVelocity[v] = min(enemyVelocity[v] + 0.2, 10);
  }
}

//FUNC CHECK FOR ENEMY COLLISIONS
function checkCollision(enemy) {
  if (enemy.collided) {
    return;
  }
  let playerX = smoothPlayerX;
  let playerY = height - 160;
  let playerWidth = 50;
  let playerHeight = 50;

  let enemyX = enemy.pos.x - enemy.sizeW / 2;
  let enemyY = enemy.pos.y;
  let enemyWidth = enemy.sizeW;
  let enemyHeight = enemy.sizeH;

  if (
    playerX < enemyX + enemyWidth &&
    playerX + playerWidth > enemyX &&
    playerY < enemyY + enemyHeight &&
    playerY + playerHeight > enemyY
  ) {
    enemy.collided = true;
    //smoothPlayerX += 200;
    lifesNum -= 1;
    if (lifesNum <= 0) {
      console.log("GAME OVER!");
      noLoop();
    }
  }
}

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
    connectButton.remove();
    introHidden = true;
    //isPlayin = true;
    introSound.stop();
  }
  //Attack
  /*if (key === "a" || key === "A") {
    let newAttack = new Attack(
      smoothPlayerX + player.width / 2,
      height - 100,
      arduinoData.currentLane
    );
    attacks.push(newAttack);
  }*/
}

function windowResized() {
  resizeCanvas(windowWidth, 400);
  laneWidth = windowWidth / numLanes;
}

//ARDUINO FUNCTIONS WEB API
//Source: Gemini AI + Arduino
function processData(dataString) {
  latestDataString = "Empfangen: " + dataString;
  let values = dataString.split(","); // "xValue,currentLane,btnShoot, btnBoost,ventilator"

  if (values.length === 2) {
    //change 2 to 5
    //VALUES coming from arduino
    arduinoData.xValue = Number(values[0]);
    arduinoData.currentLane = Number(values[1]);
    arduinoData.btnShoot = Number(values[2]);
    /*arduinoData.btnBoost = Number(values[3]);
    arduinoData.ventilator = Number(values[4]);*/
  }
}

async function connectToArduino() {
  if (!port) {
    try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      connectButton.html("Connected");
      readData();
    } catch (err) {
      console.error("Fehler beim Verbinden: ", err);
      connectButton.html("Verbindung fehlgeschlagen");
    }
  }
}

async function readData() {
  while (port && port.readable) {
    const reader = port.readable.getReader();
    const textDecoder = new TextDecoder();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        let chunk = textDecoder.decode(value, { stream: true });
        let lines = chunk.trim().split("\n");
        lines.forEach((line) => processData(line.trim()));
      }
    } catch (error) {
      console.error("Fehler beim Lesen: ", error);
    } finally {
      reader.releaseLock();
    }
  }
}

async function sendData(data) {
  if (port && port.writable) {
    const writer = port.writable.getWriter();
    const textEncoder = new TextEncoder();
    try {
      await writer.write(textEncoder.encode(data + "\n"));
    } catch (error) {
      console.error("Fehler beim Senden: ", error);
    } finally {
      writer.releaseLock();
    }
  }
}
