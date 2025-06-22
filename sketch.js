let introBg;
let canvasWidth;
let canvasHeight;

let introSound;
let introStarted = false;
let introHidden = false;

let isPlayin = false;

function preload() {
  introBg = loadImage("/assets/NightDrive.gif");
  introSound = loadSound("/assets/audio/lady-of-the-80.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  //  if (windowWidth / windowHeight > 5 / 3) {
  //   canvasHeight = windowHeight;
  //   canvasWidth = canvasHeight * (5 / 3);
  // } else {
  //   canvasWidth = windowWidth;
  //   canvasHeight = canvasWidth * (3 / 4);
  // }

  // createCanvas(canvasWidth, canvasHeight);
}

function draw() {
  if (!introHidden) {
    background(introBg);
  }
  if(isPlayin){
    background("#1c1c1c");
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
    introHidden = true;
    isPlayin = true;
    introSound.stop();
  }
}