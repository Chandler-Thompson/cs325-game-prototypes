"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    let map = null;
    let layer1 = null;

    let marker = null;//displays current cursor location
    let sightMarker = null;//displays unit's los

    let title = null;

    let setup = true;//if true, then still going through initial map setup
    let gameOver = false;//if true, halt everything

    //x and y coordinates of currently selected node
    let selectedX = -1;
    let selectedY = -1;

    let teamSize = 3;//the number of units per team
    let units = [];//indexed as odd #'s = yellow and even #'s = green

    let isDead = [];//indexed same as units, holds booleans

    let height = 9;
    let width = 9;
    //1 = wall, 2 = green, 3 = yellow
    let locations = [
                    -1, -1, -1, -1, -2, -1, -1, -1, -1,
                    -1, -1, -1, -1, -1, -2, -1, -1, -1,
                    -1, -1, -1, -2, -1, -1, -1, -1, -1,
                     3, -1, -1, -1, -2, -1, -1, -1,  2,
                    -1,  1, -1, -1, -2, -1, -1,  0, -1,
                     5, -1, -1, -1, -2, -1, -1, -1,  4,
                    -1, -1, -1, -1, -1, -2, -1, -1, -1,
                    -1, -1, -1, -2, -1, -1, -1, -1, -1,
                    -1, -1, -1, -1, -2, -1, -1, -1, -1];

    let selecting = false;
    let shooting = false;

    function quitGame() {
        setup = true;
        isDead = [false, false, false, false, false, false];
        units = [];
        locations = [
                    -1, -1, -1, -1, -2, -1, -1, -1, -1,
                    -1, -1, -1, -1, -1, -2, -1, -1, -1,
                    -1, -1, -1, -2, -1, -1, -1, -1, -1,
                     3, -1, -1, -1, -2, -1, -1, -1,  2,
                    -1,  1, -1, -1, -2, -1, -1,  0, -1,
                     5, -1, -1, -1, -2, -1, -1, -1,  4,
                    -1, -1, -1, -1, -1, -2, -1, -1, -1,
                    -1, -1, -1, -2, -1, -1, -1, -1, -1,
                    -1, -1, -1, -1, -2, -1, -1, -1, -1];
        game.state.start('MainMenu');    
    }
    
    return {
    
        create: function () {

            if (gameOver)//game over only true if returning to this game state (because already played once)
                game.state.restart();

            // Create the map
            map = game.add.tilemap('map');
            map.fixedToCamera = false;
            map.addTilesetImage('tiles');
            layer1 = map.createLayer('Tile Layer 1');
            layer1.fixedToCamera = false;
            
            let style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
            //title = game.add.text( 200, 75, "Current Score: " + shared.score + " | High Score: " + shared.highScore, style );
            //title.fixedToCamera = true;

            game.camera.setPosition(-64, 0);//"center" camera on map
            
            //create units (odd numbers = yellow, even numbers = green)
            for(let i = 0; i < teamSize; i++){
                units.push(game.add.sprite(640, 288, 'greenUnit'));
                units.push(game.add.sprite(0, 288, 'yellowUnit'));
                isDead.push(false);
                isDead.push(false);
            }

            game.physics.arcade.enable(units);

            marker = game.add.graphics();
            marker.lineStyle(2, 0xFFFFFF, 1);

            sightMarker = game.add.graphics();
            sightMarker.lineStyle(2, 0xFF0000, 1);

            marker.drawRect(0, 0, 64, 64);

            game.input.mouse.capture = true;

        },
    
        update: function () {
    
            if(isDead[0] && isDead[2] && isDead[4]){
                console.log("X Wins!");
                shared.xWins++;
                gameOver = true;
                quitGame();
            }else if(isDead[1] && isDead[3] && isDead [5]){
                console.log("Plus Wins!");
                shared.plusWins++;
                gameOver = true;
                quitGame();
            }

            //needed to keep game from continuing to run while quitting the game (errors thrown otherwise)
            if(gameOver)
                return;

            //update marker's position
            let mX = layer1.getTileX(game.input.activePointer.worldX);
            let mY = layer1.getTileY(game.input.activePointer.worldY);

            //keep marker from leaving map
            if(mX > 0 && mY >= 0 && mX <= width && mY < height){//remember camera is shifted -64 in X direction
                marker.x = mX * 64;
                marker.y = mY * 64;
            }

            if(setup){
                //move green units in
                moveUnit(units[0], 7, 4);
                moveUnit(units[2], 8, 3);
                moveUnit(units[4], 8, 5);

                //move yellow units in
                moveUnit(units[1], 1, 4);
                moveUnit(units[3], 0, 3);
                moveUnit(units[5], 0, 5);
            }

            //select a unit
            if(game.input.activePointer.middleButton.isDown && !selecting){

                selecting = true;

                selectedX = getPointerX();
                selectedY = getPointerY();

                //make sure only units are selected
                if(locations[selectedY*width+selectedX] < 0 || locations[selectedY*width+selectedX] >= teamSize*2){
                    selectedX = -1;
                    selectedY = -1;
                }

                console.log("Selected: ("+selectedX+","+selectedY+")");

            }else if(game.input.activePointer.rightButton.isUp)
                selecting = false;

            //shoot or move a selected unit
            if(game.input.activePointer.leftButton.isDown && !shooting){

                shooting = true;

                let mouseX = getPointerX();
                let mouseY = getPointerY();

                if( !(selectedX == -1 || selectedY == -1) && //nothing selected
                    !(selectedX == mouseX && selectedY == mouseY)){ //new spot is same as old spot

                    let newCoordsIndex = mouseY*width+mouseX;
                    let oldCoordsIndex = selectedY*width+selectedX;

                    //shooting
                    if((locations[oldCoordsIndex]%2 == 0 && locations[newCoordsIndex]%2 != 0) ||
                        (locations[newCoordsIndex]%2 == 0 && locations[oldCoordsIndex]%2 != 0)){//targeting opponent (shooting)

                        let shotAt = locations[newCoordsIndex];

                        if(shotAt == -2 || shotAt == -1)
                            return;

                        //shoot if in line of sight
                        if(canSee(selectedX, selectedY, mouseX, mouseY)){
                            console.log(shotAt + " is being shot at!");

                            units[shotAt].visible = false;//dead bodies can be ignored
                            isDead[shotAt] = true;//kill sprite
                            locations[newCoordsIndex] = -1;//dead bodies can be ignored

                            console.log(locations);
                        }else
                            console.log("I can't see them!");

                        selectedX = -1;
                        selectedY = -1;

                    //moving
                    }else if(locations[newCoordsIndex] == -1){ //new spot is empty (moving)

                        selectedX = -1;
                        selectedY = -1;

                        locations[newCoordsIndex] = locations[oldCoordsIndex];
                        locations[oldCoordsIndex] = -1;//empty space 

                    }

                }

            }else if(game.input.activePointer.leftButton.isUp)
                shooting = false;

            //update positions of all pieces
            for(let i = 0; i < teamSize*2; i++){
                if(!isDead[i])
                    moveUnit(units[i], getUnitX(i), getUnitY(i));
            }
            
        }
    };

    function getPointerX(){
        return layer1.getTileX(game.input.activePointer.worldX) - 1;//-1 because camera is shifted one tile's width
    }

    function getPointerY(){
        return layer1.getTileY(game.input.activePointer.worldY);
    }

    function getUnitX(unitIndex){
        for(let i = 0; i < locations.length; i++){
            if(locations[i] == unitIndex)
                return i % width;
        }
    }

    function getUnitY(unitIndex){
        for(let i = 0; i < locations.length; i++){
            if(locations[i] == unitIndex)
                return i / width>>0;
        }
    }

    function canSee(originX, originY, targetX, targetY){
        //y = mx + b

        //sightMarker.clear();

        if(originX == -1 || originY == -1 || targetX == -1 || targetY == -1)
            return false;

        let m = (targetY - originY)/(targetX - originX);
        console.log(m);

        //needs to be done so recursion doesn't check 
        //starting square and return false 
        //(because its not just a floor or the target)
        let newX = (targetX > originX) ? originX+1 : (targetX < originX) ? originX-1 : originX;
        let newY = (targetX == originX && targetY > originY) ? originY+1 : (targetX == originX && targetY < originY) ? originY-1 : (m*originX+originY)>>0;

        return canSeeRecurse(newX, newY, targetX, targetY, m, originY, 0);

    }

    function canSeeRecurse(x, y, xFinal, yFinal, m, b, count){

        console.log("Steps: " + count + " | current location: (" + x + "," + y + ") | final location: (" + xFinal + "," + yFinal + ")");

        sightMarker.drawRect(x*64+64, y*64, 64, 64);
        let currIndex = (y*width+x)>>0;

        if(x == xFinal && y == yFinal)
            return true;

        if(locations[currIndex] != -1){
            console.log("location [" + currIndex + "] is a " + locations[currIndex]);
            return false;
        }

        let newX = (xFinal > x) ? x+1 : (xFinal < x) ? x-1 : x;
        let newY = (xFinal == x && yFinal > y) ? y+1 : (xFinal == x && yFinal < y) ? y-1 : (m*x+b)>>0;

        newX = newX>>0;
        newY = newY>>0;

        return canSeeRecurse(newX, newY, xFinal, yFinal, m, b, count+1);

    }

    function moveUnit(sprite, x, y){

        x--;//used because camera is shifted -64 pixels in the x direction

        let pixelX = (64*x) + 128;
        let pixelY = (64*y);

        sprite.x = pixelX;
        sprite.y = pixelY;

    }

};

