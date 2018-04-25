"use strict";

window.onload = function() {

    let colorWorld = [];

    let steps = 2;//should never be higher than 29 so as to run with 32-bit signed ints

    let menuHeight = 100;

    let gameWidth = 1000;
    let gameHeight = 750 + menuHeight;

    //make a complete square the size of 2^steps + 1
    let sideLength = (2 << steps)+1;

    let nodeWidth = gameWidth/sideLength;
    let nodeHeight = (gameHeight-menuHeight)/sideLength;

    //Game
    let game = new Phaser.Game( gameWidth, gameHeight, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    let bitWorld = null;

    function preload() {}

    function create() {

        //Gaia
        bitWorld = game.add.bitmapData(gameWidth, gameHeight);

        //COLOR GAIA
        for(let i = 0; i < sideLength*sideLength; i++){
            //assign random colors to the four corners
            if(i == 0 || i == sideLength-1 || i == (sideLength*sideLength)-(sideLength) || i == (sideLength*sideLength)-1){
                let r = Math.floor(Math.random()*256);
                let b = Math.floor(Math.random()*256);
                let g = Math.floor(Math.random()*256);
                colorWorld[i] = Phaser.Color.RGBtoString(r, g, b);
            }else//set everything else to default
                colorWorld[i] = Phaser.Color.RGBtoString(0, 0, 0);
        }

        //INITIALIZE MENU BAR
        createMenuBar('#ffffff', bitWorld);

        //INITIALIZE WORLD
        for(let y = 0; y < sideLength; y++)
            for(let x = 0; x < sideLength; x++)
                setNode(x, y, bitWorld);
        
        //RENDER GAIA
        let world = game.add.sprite(0, 0, bitWorld);

        //SETUP TITLE
        let style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
        let text = game.add.text( game.world.centerX, 15, "Gaia vs. Geologist", style );
        text.anchor.setTo( 0.5, 0.0 );

        
    }
    
    function update() {

        diamondStep(0,0,(sideLength/2>>0));
        squareStep(0,0,(sideLength/2>>0));

        // let dist = sideLength;

        // for(let k = steps; k > 1; k--){
        //     dist = (dist/2>>0);
        //     for(let y = 0; y < sideLength; y+=dist){
        //         for(let x = 0; x < sideLength; x+=dist){
        //             diamondStep(x, y, dist);
        //             squareStep(x, y, dist);
        //             setNode(x, y, bitWorld);
        //         }
        //     }
        // }

    }

    function squareStep(x, y, dist){

        let centralX = x+dist;
        let centralY = y+dist;

        avgColorSquareStep(centralX+dist, centralY, dist);
        avgColorSquareStep(centralX-dist, centralY, dist);
        avgColorSquareStep(centralX, centralY+dist, dist);
        avgColorSquareStep(centralX, centralY-dist, dist);

    }

    let debug = true;

    function avgColorSquareStep(x, y, dist){

        //fringe cases
        let leftDist =  (x == 0)            ? (x-dist)-1:(x-dist);
        let rightDist = (x == sideLength-1) ? (x+dist)+1:(x+dist);
        let upDist =    (y == 0)            ? (y-dist)-1:(y-dist);
        let downDist =  (y == sideLength-1) ? (y+dist)+1:(y+dist);

        let avgR = Phaser.Color.getRed(Phaser.Color.hexToRGB(getNodeColor(leftDist, y))) + 
        Phaser.Color.getRed(Phaser.Color.hexToRGB(getNodeColor(rightDist, y))) + 
        Phaser.Color.getRed(Phaser.Color.hexToRGB(getNodeColor(x, upDist))) + 
        Phaser.Color.getRed(Phaser.Color.hexToRGB(getNodeColor(x, downDist)));

        if(debug){
            console.log("X: " + x + " Y: " + y);
            console.log("leftDist: " + leftDist);
            console.log("dist: " + dist);
            console.log("red: " + Phaser.Color.getRed(Phaser.Color.hexToRGB(getNodeColor(leftDist, y))));
            console.log("avgR: " + avgR);
        }

        let avgG = Phaser.Color.getGreen(Phaser.Color.hexToRGB(getNodeColor(leftDist, y))) + 
        Phaser.Color.getGreen(Phaser.Color.hexToRGB(getNodeColor(rightDist, y))) + 
        Phaser.Color.getGreen(Phaser.Color.hexToRGB(getNodeColor(x, upDist))) + 
        Phaser.Color.getGreen(Phaser.Color.hexToRGB(getNodeColor(x, downDist)));
        
        if(debug){
            console.log("avgG: " + avgG);    
        }

        let avgB = Phaser.Color.getBlue(Phaser.Color.hexToRGB(getNodeColor(leftDist, y))) + 
        Phaser.Color.getBlue(Phaser.Color.hexToRGB(getNodeColor(rightDist, y))) + 
        Phaser.Color.getBlue(Phaser.Color.hexToRGB(getNodeColor(x, upDist))) + 
        Phaser.Color.getBlue(Phaser.Color.hexToRGB(getNodeColor(x, downDist)));

        if(debug){
            console.log("avgB: " + avgB);
            debug = false;    
        }
        

        //setNodeColor(x, y, Phaser.Color.createColor(avgR, avgG, avgB));

    }

    function diamondStep(x, y, dist){
        let newX = x + dist;
        let newY = y + dist;

        let avgR = Phaser.Color.getRed(Phaser.Color.hexToRGB(getNodeColor(x, y))) + 
        Phaser.Color.getRed(Phaser.Color.hexToRGB(getNodeColor(newX+dist, newY+dist))) + 
        Phaser.Color.getRed(Phaser.Color.hexToRGB(getNodeColor(newX+dist, y))) + 
        Phaser.Color.getRed(Phaser.Color.hexToRGB(getNodeColor(x, newY+dist)));

        let avgG = Phaser.Color.getGreen(Phaser.Color.hexToRGB(getNodeColor(x, y))) + 
        Phaser.Color.getGreen(Phaser.Color.hexToRGB(getNodeColor(newX+dist, newY+dist))) + 
        Phaser.Color.getGreen(Phaser.Color.hexToRGB(getNodeColor(newX+dist, y))) + 
        Phaser.Color.getGreen(Phaser.Color.hexToRGB(getNodeColor(x, newY+dist)));
        
        let avgB = Phaser.Color.getBlue(Phaser.Color.hexToRGB(getNodeColor(x, y))) + 
        Phaser.Color.getBlue(Phaser.Color.hexToRGB(getNodeColor(newX+dist, newY+dist))) + 
        Phaser.Color.getBlue(Phaser.Color.hexToRGB(getNodeColor(newX+dist, y))) + 
        Phaser.Color.getBlue(Phaser.Color.hexToRGB(getNodeColor(x, newY+dist)));

        avgR = avgR/4>>0;
        avgG = avgG/4>>0;
        avgB = avgB/4>>0;

        setNodeColor(newX, newY, Phaser.Color.createColor(avgR, avgG, avgB));

    }

    function setNodeColor(x, y, color){

        //wrap-around if given coordinate is too high
        x -= (x >= sideLength) ? sideLength:0;
        y -= (y >= sideLength) ? sideLength:0;

        colorWorld[y*sideLength+x] = color;

        setNode(x, y, bitWorld);

    }

    function getNodeColor(x, y){

        //wrap-around if given coordinate is too high
        x -= (x >= sideLength) ? sideLength:0;
        y -= (y >= sideLength) ? sideLength:0;

        return colorWorld[y*sideLength+x];
    }

    function createMenuBar(color, bitmap){
        bitmap.ctx.strokeStyle = color;
        bitmap.ctx.strokeRect(0, 0, gameWidth, menuHeight);
    }

    function setNode(nodeX, nodeY, bitmap){

        let color = getNodeColor(nodeX, nodeY);

        //wrap-around if given coordinate is too high
        nodeX -= (nodeX >= sideLength) ? sideLength:0;
        nodeY -= (nodeY >= sideLength) ? sideLength:0;

        //color and create node
        bitmap.ctx.fillStyle = color;
        bitmap.ctx.strokeStyle = '#ffffff';
        bitmap.ctx.fillRect(nodeX*nodeWidth, nodeY*nodeHeight+menuHeight, nodeWidth, nodeHeight);
        bitmap.ctx.strokeRect(nodeX*nodeWidth, nodeY*nodeHeight+menuHeight, nodeWidth, nodeHeight);
    }
};
