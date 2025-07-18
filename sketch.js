let portController, portActuator;
let connectControllerButton, connectActuatorButton;

let arduinoData = {
  currentLane: 0,
  btnStick: 1,
  btnShoot: 1,
  btnBoost: 1,
  xValue: 512,
};
let lastBtnShootState = 1;
let lastBtnBoostState = 1;
let lastSentLane = -1;
let latestDataString = "Wait for Data...";
// --- Arduino-Kommunikation Variables ---

//Game Intro
let introBg;
let gameIntroSk;
//Canvas Dimensions
let canvasWidth;
let canvasHeight;

let gameStarted = false;
let countdownStarted = false;
let gameStartTime;

//FONT
let gameFont;

//INTRO
let introSound;
let introStarted = false;
let introHidden = false;
//let isPlayin = false;

//STREET LANES
let numLanes = 3;
let lanePos = 0;

//CAR PLAYER
let player;
let playerBoost;
let lanePositionsX = [];
let smoothPlayerX = 0;
let heart;

//ENEMIES
let enemies = [];
let enemyVelocity = [2, 3, 4, 5];
let enemiesVelSnapshot = [];
let currentVel = 4;
const MAX_CONCURRENT_ENEMIES = numLanes - 1;

let enemiesImgPaths = [
  "assets/elements/biker1.png",
  "assets/elements/drone1.png",
  "assets/elements/alien1.png",
  "assets/elements/stein.png",
  "assets/elements/pflanze.png",
];
let enemiesImgs = [];
let enemyLane = "normal";

const typeOrder = {
  pflanze: 0,
  stein: 1,
  biker: 2,
  drone: 3,
  alien: 4,
};

//ATTACKS
let attacks = [];
let numAttacks = 0;
let fireAttack;

//BOOST
let boostActive = false;
let isBoostReady = false;
const ATTACKS_FOR_BOOST = 3;

//DECORATION / BACKGORUND ELEMENTS
//Skyline
let skyline;
let skylineFull;
//Trees
let treeImg;
let trees = [];

let tokyo;

//GAME VALUES
let game_velocity_timer = 25000;
let velocityStarted = false;

//highscore
let highscore = 0;
let increase_highscore = 0.1;
//Lifes
let lifesNum = 3;

//Sounds + Music
let gameMusic;
let carCrashSound;
let laserGunSound;
let gameOver;

//PRELOAD SOUND & IMAGES
function preload() {
  //font
  gameFont = loadFont("assets/gamefont.otf");
  //sound
  introSound = loadSound("assets/audio/lady-of-the-80.mp3");
  gameMusic = loadSound("assets/audio/neon-gaming.mp3");
  carCrashSound = loadSound("assets/audio/car-crash.mp3");
  laserGunSound = loadSound("assets/audio/laser-gun.mp3");
  gameOver = loadSound("assets/audio/game-over.mp3");
  //images
  introBg = loadImage("assets/NightDrive2.gif");
  gameIntroSk = loadImage("assets/gameIntro.gif");
  skyline = loadImage("assets/skyline.png");
  skylineFull = loadImage("assets/skyline-full.png");
  tokyo = loadImage("assets/tokyo.png");
  player = loadImage("assets/elements/player.png");
  playerBoost = loadImage("assets/elements/player-boost.gif");
  fireAttack = loadImage("assets/elements/fireball.gif");
  heart = loadImage("assets/elements/heart.png");
  treeImg = loadImage("assets/elements/blossom-tree.png");
  for (let i = 0; i < enemiesImgPaths.length; i++) {
    enemiesImgs[i] = loadImage(enemiesImgPaths[i]);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  //  gameStartTime = millis();

  //FONT:
  textFont(gameFont);

  // STREET LANES CALCULATION
  let roadWidthAtPlayer = width - 100;
  let laneWidth = roadWidthAtPlayer / 3;
  lanePositionsX[0] = 50 + laneWidth / 2 - 100;
  lanePositionsX[1] = 50 + laneWidth * 1.5 - 100;
  lanePositionsX[2] = 50 + laneWidth * 2.5 - 100;
  smoothPlayerX = lanePositionsX[arduinoData.currentLane];

  //INCREASE GAME VELOCITY
  //setInterval(increaseVel, game_velocity_timer);

  //INITIALIZE ENEMIES
  for (let i = 0; i < numLanes; i++) {
    if (enemies.length < MAX_CONCURRENT_ENEMIES) {
      enemies.push(new Enemy(i, random(enemyVelocity)));
    }
  }

  //INITIALIZE TREES
  for (let i = 0; i < 20; i++) {
    trees.push(new Tree(i % 2));
  }

  //CONNECT ARDUINO WITH P5 SKETCH
  connectControllerButton = createButton("Connect Controller");
  connectControllerButton.position(10, 10);
  connectControllerButton.mousePressed(() => connectToPort("controller"));

  connectActuatorButton = createButton("Connect Actuators");
  connectActuatorButton.position(10, 50);
  connectActuatorButton.mousePressed(() => connectToPort("actuator"));
}

function draw() {
  //INTRO VIEW
  if (!introHidden) {
    background(introBg || 50);
    return;
  }
  background("#160321");

  //Game Start Intro
  if (!countdownStarted) {
    countdownStarted = true;
    gameStartTime = millis();
  }
  let countdown = 3000 - (millis() - gameStartTime);
  if (!gameStarted) {
    if (countdown > 0) {
      background(gameIntroSk);
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(44);
      text(
        "Game Start in " + ceil(countdown / 1000) + " . . .",
        width / 2,
        height / 2
      );
      return;
    } else {
      gameStarted = true;
    }
  }

  //INCREASE GAME ENEMIES VELOCITY
  if (!velocityStarted) {
    setInterval(increaseVel, game_velocity_timer);
    velocityStarted = true;
  }

  //DRAW TREES
  for (let i = 0; i < trees.length; i++) {
    trees[i].update();
    trees[i].display();
  }

  //BACKGROUND IMGS
  image(skyline, 0, -94, 1500, 244);
  push();
  scale(1, -1);
  tint(255, 80);
  image(skylineFull, 0, -767);
  pop();

  //STREET LANES
  strokeWeight(5);
  stroke(255, 0, 150, 200);
  line(width / 2 - 50, 150, 50, height);
  line(width / 2 + 50, 150, width - 50, height);
  strokeWeight(2);
  stroke(255, 255, 0, 150);
  let x1_top = width / 2 - 50 + 100 / 3;
  let x1_bottom = 50 + (width - 100) / 3;
  line(x1_top, 150, x1_bottom, height);
  let x2_top = width / 2 - 50 + (100 / 3) * 2;
  let x2_bottom = 50 + ((width - 100) / 3) * 2;
  line(x2_top, 150, x2_bottom, height);

  // START ENEMIES
  enemies.sort((a, b) => a.pos.y - b.pos.y);
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    e.update();
    e.show();

    checkCollision(e);
    checkAttackCollision(e);

    if (e.pos.y > height || e.collided || e.attacked) {
      enemies.splice(i, 1);
      if (enemies.length < MAX_CONCURRENT_ENEMIES) {
        enemies.push(
          new Enemy(
            Math.floor(Math.random() * numLanes),
            random(enemyVelocity),
            enemyLane
          )
        );
      }
    }
  }
  // END ENEMIES

  //START: CAR PLAYER
  let targetX = lanePositionsX[arduinoData.currentLane];
  let playerY = height - 160;
  smoothPlayerX = lerp(smoothPlayerX, targetX, 0.1); //smooth lane switch
  if (boostActive) {
    image(playerBoost, smoothPlayerX - 20, playerY - 25, 225, 225);
  } else {
    image(player, smoothPlayerX, playerY, 200, 200);
  }
  //END: CAR PLAYER

  //START: ATTACKS
  //attack on button click
  if (arduinoData.btnShoot == 0 && lastBtnShootState == 1 && !boostActive) {
    let newAttack = new Attack(
      smoothPlayerX,
      height - 160,
      arduinoData.currentLane
    );
    attacks.push(newAttack);
    laserGunSound.play();
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

  //START: VENTILATOR BOOST
  if (
    isBoostReady &&
    !boostActive &&
    arduinoData.btnBoost == 0 &&
    lastBtnBoostState == 1
  ) {
    isBoostReady = false;
    boostActive = true;
    //increase highscore
    increase_highscore = 0.2;
    //Hide enemies
    enemies = [];
    enemiesVelSnapshot = [...enemyVelocity];
    for (let v = 0; v < enemyVelocity.length; v++) {
      enemyVelocity[v] = enemyVelocity[v] + 40;
    }
    sendDataToActuator("Q");
    // Timer
    setTimeout(() => {
      boostActive = false;
      increase_highscore = 0.1;
      for (let v = 0; v < enemyVelocity.length; v++) {
        enemyVelocity[v] = enemiesVelSnapshot[v];
      } //Respawn enemies
      for (let i = 0; i < numLanes; i++) {
        if (enemies.length < MAX_CONCURRENT_ENEMIES) {
          enemies.push(new Enemy(i, random(enemyVelocity)));
        }
      }
      sendDataToActuator("W");
    }, 10000);
  }
  lastBtnBoostState = arduinoData.btnBoost;
  //END: VENTILATOR BOOST

  //SKYLINE IMG
  push();
  image(tokyo, 0, 50, 1500, 100);
  pop();

  //START: HIGHSCORE NUMBER + 3 LIFES + ATTACKS DISPLAY
  highscore += increase_highscore;
  push();
  textSize(20);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  text("Score: " + round(highscore), width / 2, 40);
  pop();
  push();
  imageMode(CENTER);
  image(heart, width / 2 - 10, 82, 28, 25);
  pop();
  noStroke();
  text(lifesNum, width / 2 + 15, 80);
  push();
  imageMode(CENTER);
  image(fireAttack, width - 130, 42, 40, 40);
  pop();
  text(numAttacks, width - 100, 40);

  if (numAttacks > 0 && isBoostReady) {
    push();
    fill("yellow");
    text("BOOST", width - 200, 40);
    pop();
  }
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

  //Arduino-Kommunikation
  handleArduinoCommunication();
}

//FUNC INCREASE ENEMIES VELOCITY
function increaseVel() {
  for (let v = 0; v < enemyVelocity.length; v++) {
    enemyVelocity[v] = min(enemyVelocity[v] + 0.2, 10);
  }
}

//FUNC CHECK FOR ENEMY-PLAYER COLLISIONS
function checkCollision(enemy) {
  if (enemy.collided) return;
  let playerX = smoothPlayerX;
  let playerY = height - 100;
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
    playerY + playerHeight > enemyY &&
    !boostActive
  ) {
    enemy.collided = true; //collision occured
    carCrashSound.play();
    smoothPlayerX *= 0.5;
    lifesNum -= 1;
    if (lifesNum === 0) {
      //console.log("GAME OVER!");
      gameOver.play();
      push();
      noFill();
      textSize(44);
      text("GAME OVER", width / 2, height / 2 - 100);
      text("Score: " + Math.round(highscore), width / 2, height / 2);
      text("Total Hits: " + numAttacks, width / 2, height / 2 + 100);
      pop();
      noLoop();
    }
  }
}

//FUNC CHECK FOR ENEMY_ATTACK COLLISIONS
function checkAttackCollision(enemy) {
  for (let i = attacks.length - 1; i >= 0; i--) {
    let attack = attacks[i];

    let enemyLeft = enemy.pos.x - enemy.sizeW / 2;
    let enemyRight = enemy.pos.x + enemy.sizeW / 2;
    let enemyTop = enemy.pos.y - enemy.sizeH / 2;
    let enemyBottom = enemy.pos.y + enemy.sizeH / 2;

    if (
      attack.pos.x > enemyLeft &&
      attack.pos.x < enemyRight &&
      attack.pos.y > enemyTop &&
      attack.pos.y < enemyBottom
    ) {
      numAttacks++;
      enemy.attacked = true;
      attacks.splice(i, 1);

      if (numAttacks > 0 && numAttacks % ATTACKS_FOR_BOOST === 0) {
        isBoostReady = true;
      }
      if (numAttacks > 20) {
        enemyLane = random() < 0.3 ? "switcher" : "normal";
      } else if (numAttacks > 50) {
        enemyLane = random() < 0.5 ? "switcher" : "normal";
      } else if (numAttacks > 100) {
        enemyLane = random() < 0.8 ? "switcher" : "normal";
      } else {
        enemyLane = "normal";
      }
      break;
    }
  }
}

function mousePressed() {
  if (!introStarted) {
    if (getAudioContext().state !== "running") {
      getAudioContext().resume();
    }
    //if (introSound && introSound.isLoaded()) introSound.loop();
    introStarted = true;
  }
}

//START GAME
function handleJoystickStart() {
  if (arduinoData.btnStick === 0 && !introHidden) {
    document.getElementById("notes").style.display = "none";
    if (connectControllerButton) connectControllerButton.remove();
    if (connectActuatorButton) connectActuatorButton.remove();
    introHidden = true;
    //GAME MUSIC
    if (!gameMusic.isPlaying()) {
      gameMusic.loop();
    } //if (introSound && introSound.isLoaded()) introSound.stop();
  }
}

function keyPressed() {
  //Testing Ventilator
  if (key === "q") {
    sendDataToActuator("Q");
  } else if (key === "w") {
    sendDataToActuator("W");
  }
  if (!introHidden) {
    document.getElementById("notes").style.display = "none";
    //(keyCode === ENTER && !introHidden) {
    // remove connect btns
    if (connectControllerButton) connectControllerButton.remove();
    if (connectActuatorButton) connectActuatorButton.remove();
    introHidden = true;
    //isPlayin = true;
    //if (introSound && introSound.isLoaded()) introSound.stop();
    //GAME MUSIC
    if (!gameMusic.isPlaying()) {
      gameMusic.loop();
    }
  }
  //Testing Attack
  if ((key === "z" || key === "Z") && !boostActive) {
    let newAttack = new Attack(
      smoothPlayerX + player.width / 2,
      height - 100,
      arduinoData.currentLane
    );
    attacks.push(newAttack);
    laserGunSound.play();
    //reload
    if (lifesNum === 0) {
      window.location.reload();
    }
  }
  //Testing Boost
  if (keyCode === 32 && isBoostReady && !boostActive) {
    isBoostReady = false;
    boostActive = true;
    //increase highscore
    increase_highscore = 0.2;
    //Play Boost Sound
    enemiesVelSnapshot = [...enemyVelocity];
    for (let v = 0; v < enemyVelocity.length; v++) {
      enemyVelocity[v] = enemyVelocity[v] + 40;
    } //Hide enemies
    enemies = [];
    sendDataToActuator("Q"); //start ventilator
    setTimeout(() => {
      boostActive = false;
      increase_highscore = 0.1;
      for (let v = 0; v < enemyVelocity.length; v++) {
        enemyVelocity[v] = enemiesVelSnapshot[v];
      } //Respawn enemies
      for (let i = 0; i < numLanes; i++) {
        if (enemies.length < MAX_CONCURRENT_ENEMIES) {
          enemies.push(new Enemy(i, random(enemyVelocity)));
        }
      }
      sendDataToActuator("W"); //stop ventilator
    }, 10000); //BOOST for 10 seconds
  }
  //Testing Lane Switch
  if (keyCode === LEFT_ARROW) {
    if (arduinoData.currentLane > 0) {
      arduinoData.currentLane--;
    }
  } else if (keyCode === RIGHT_ARROW) {
    if (arduinoData.currentLane < lanePositionsX.length - 1) {
      arduinoData.currentLane++;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, 400);
  laneWidth = windowWidth / numLanes;
}

// =================================================================
// ARDUINO FUNCTIONS
// =================================================================

// Send Data
function handleArduinoCommunication() {
  // Sende Spur-Daten, wenn sie sich ändern
  if (portActuator && arduinoData.currentLane !== lastSentLane) {
    sendDataToActuator(String(arduinoData.currentLane));
    lastSentLane = arduinoData.currentLane;
  }
}

//ARDUINO FUNCTIONS WEB API
//Source: Gemini AI + Arduino
function processData(dataString) {
  latestDataString = "Empfangen: " + dataString;
  let values = dataString.split(","); // "currentLane,btnStick,btnShoot,btnBoost"

  if (values.length === 4) {
    // VALUES coming from arduino
    arduinoData.currentLane = Number(values[0]);
    arduinoData.btnStick = Number(values[1]);
    arduinoData.btnShoot = Number(values[2]);
    arduinoData.btnBoost = Number(values[3]);
  }
  //START GAME
  handleJoystickStart();
}

// connect handler
async function connectToPort(type) {
  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });

    if (type === "controller") {
      portController = port;
      connectControllerButton.html("Controller Connected");
      connectControllerButton.elt.disabled = true;
      readFromController();
    } else if (type === "actuator") {
      portActuator = port;
      connectActuatorButton.html("Actuators Connected");
      connectActuatorButton.elt.disabled = true;
    }
  } catch (err) {
    console.error("Fehler beim Verbinden: ", err);
    if (type === "controller")
      connectControllerButton.html("Verbindung fehlgeschlagen");
    else connectActuatorButton.html("Verbindung fehlgeschlagen");
  }
}

//read handler
async function readFromController() {
  while (portController && portController.readable) {
    const reader = portController.readable.getReader();
    const textDecoder = new TextDecoder();
    let lineBuffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        lineBuffer += textDecoder.decode(value, { stream: true });
        let lines = lineBuffer.split("\n");
        while (lines.length > 1) {
          const line = lines.shift();
          if (line.trim()) processData(line.trim());
        }
        lineBuffer = lines[0];
      }
    } catch (error) {
      console.error("Fehler beim Lesen: ", error);
    } finally {
      reader.releaseLock();
    }
  }
}

// send data handler
async function sendDataToActuator(data) {
  if (portActuator && portActuator.writable) {
    const writer = portActuator.writable.getWriter();
    const textEncoder = new TextEncoder();
    try {
      // Send Data
      await writer.write(textEncoder.encode(data));
    } catch (error) {
      console.error("Fehler beim Senden: ", error);
    } finally {
      writer.releaseLock();
    }
  }
}
