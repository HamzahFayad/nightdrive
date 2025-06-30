class Attack {
    constructor(x, y, laneIndex) { // Füge laneIndex zum Konstruktor hinzu
        this.laneIndex = laneIndex; // Speichere den Spur-Index
        
        // Anfangsposition
        this.pos = createVector(x, y);
        
        // Geschwindigkeit in Y-Richtung (nach oben)
        this.vel = createVector(0, -10); // Angriffsgeschwindigkeit etwas höher als Feinde
        
        // Anfangsgröße des Angriffs
        this.size = 10; // Basisgröße des Ellipsen-Durchmessers
        this.initialY = y; // Speichere die initiale Y-Position für die Größenberechnung
    }

    update() {
        this.pos.add(this.vel);

        const roadLeftX = map(this.pos.y, 150, height, width / 2 - 50, 50);
        const roadRightX = map(this.pos.y, 150, height, width / 2 + 50, width - 50);

        const currentRoadWidth = roadRightX - roadLeftX;
        const currentLaneWidth = currentRoadWidth / numLanes;

        let laneCenterX = roadLeftX + currentLaneWidth * this.laneIndex + currentLaneWidth / 2;
        
        this.pos.x = laneCenterX;


        this.size = map(this.pos.y, this.initialY, 0, 10, 2); // Startgröße 10, schrumpft auf 2
        this.size = constrain(this.size, 2, 10); // Sicherstellen, dass die Größe innerhalb vernünftiger Grenzen bleibt
    }

    display() {
        ellipseMode(CENTER);
        fill("red");
        // Nutze die dynamische Größe für den Kreis
        ellipse(this.pos.x, this.pos.y, this.size, this.size);
    }
}



class Tree {
    constructor(side) {
        // 'side' bestimmt, ob der Baum links oder rechts erscheint (0 für links, 1 für rechts)
        this.side = side;
        this.reset(); // Setzt die Anfangsposition und Größe
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