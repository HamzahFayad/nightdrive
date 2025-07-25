class Attack {
    constructor(x, y, laneIndex) { 
        this.laneIndex = laneIndex; 
        
        // starting position
        this.pos = createVector(x, y);
        
        // velocity
        this.vel = createVector(0, -10); 
        
        this.size = 10; 
        this.initialY = y; 
    }

    update() {
        this.pos.add(this.vel);

        const roadLeftX = map(this.pos.y, 150, height, width / 2 - 50, 50);
        const roadRightX = map(this.pos.y, 150, height, width / 2 + 50, width - 50);

        const currentRoadWidth = roadRightX - roadLeftX;
        const currentLaneWidth = currentRoadWidth / numLanes;

        let laneCenterX = roadLeftX + currentLaneWidth * this.laneIndex + currentLaneWidth / 2;
        
        this.pos.x = laneCenterX;


        this.size = map(this.pos.y, this.initialY, 0, 80, 0); 
        this.size = constrain(this.size, 2, 80); 
    }

    display() {
        ellipseMode(CENTER);
        push();
        imageMode(CENTER);
        //fill("red");
        //ellipse(this.pos.x, this.pos.y, this.size, this.size);
        image(fireAttack, this.pos.x, this.pos.y, this.size, this.size);
        pop();
    }
}



class Tree {
    constructor(side) {
        this.side = side;
        this.reset();
    }

    reset() {
        this.y = random(-height * 0.5, 100); 
        this.startPointY = 150;
        this.endPointY = height; 

        // Start- und End-X-Koordinaten
        this.startPointXLeft = width / 2 - 50;
        this.endPointXLeft = -220;
        this.startPointXRight = width / 2 + 50;
        this.endPointXRight = width + 220;
        
        if (this.side === 0) { // Links
            this.x = map(this.y, this.startPointY, this.endPointY, this.startPointXLeft, this.endPointXLeft);
            this.x += random(-130, 130);
        } else { // Rechts
            this.x = map(this.y, this.startPointY, this.endPointY, this.startPointXRight, this.endPointXRight);
            this.x += random(-30, 30); 
        }

        this.speed = 8; 
        this.imgScale = 0.05; 
    }

    update() {
        this.y += this.speed;

        if (this.side === 0) { // Linke Seite
            this.x = map(this.y, this.startPointY, this.endPointY, this.startPointXLeft, this.endPointXLeft);
        } else { // Rechte Seite
            this.x = map(this.y, this.startPointY, this.endPointY, this.startPointXRight, this.endPointXRight);
        }
        this.imgScale = map(this.y, this.startPointY, this.endPointY, 0.05, 2.7); 

        if (this.y > height) { 
            this.reset();
        }
    }

    display() {
        push();
        let treeWidth = treeImg.width * this.imgScale;
        let treeHeight = treeImg.height * this.imgScale;
        
        image(treeImg, this.x - treeWidth / 2, this.y - treeHeight / 2, treeWidth, treeHeight);
        pop();
    }
}