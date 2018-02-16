"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    let map = null;
    let layer1 = null;
    let bouncy = null;

    let setup = true;//if true, then still going through initial board setup

    //the pixel coords of the top left corner
    let xZero = 0;
    let yZero = 0;
    
    let buggyXOffset = 6;

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
        isDead = [];
        game.state.start('MainMenu');    
    }
    
    return {
    
        create: function () {
    
            // Create the map
            map = game.add.tilemap('map');
            // for csv files specify the tile size.
            //map = game.add.tilemap('map', 64, 64);
            
            //add tiles
            map.addTilesetImage('tiles');
            
            // Create a layer from the map
            //using the layer name given in the .json file
            layer1 = map.createLayer('Tile Layer 1');
            //for csv files
            //layer1 = map.createLayer(0);
            
            //  Resize the world
            layer1.resizeWorld();
            
            // Create a sprite at the center of the screen using the 'logo' image.
            bouncy = game.add.sprite( game.world.centerX, game.world.centerY, 'cursorFollower' );
            // Anchor the sprite at its center, as opposed to its top-left corner.
            // so it will be truly centered.
            bouncy.anchor.setTo( 0.5, 0.5 );
            
            // Turn on the arcade physics engine for this sprite.
            game.physics.enable( bouncy, Phaser.Physics.arcade );
            // Make it bounce off of the world bounds.
            bouncy.body.collideWorldBounds = true;
            
            // Add some text using a CSS style.
            // Center it in X, and position its top 15 pixels from the top of the world.
            // var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
            // var text = game.add.text( 400, 15, "Build something amazing.", style );
            // text.fixedToCamera = true;
            // text.anchor.setTo( 0.5, 0.0 );
            
            game.camera.follow(bouncy);
            
            // When you click on the sprite, you go back to the MainMenu.
            //bouncy.inputEnabled = true;
            //bouncy.events.onInputDown.add( function() { quitGame(); }, this );

            //create units (odd numbers = yellow, even numbers = green)
            for(let i = 0; i < teamSize; i++){
                units.push(game.add.sprite(640, 288, 'greenUnit'));
                units.push(game.add.sprite(0, 288, 'yellowUnit'));
                isDead.push(false);
                isDead.push(false);
            }

            game.physics.arcade.enable(units);

            game.input.mouse.capture = true;

        },
    
        update: function () {
    
            if(isDead[0] && isDead[2] && isDead[4]){
                console.log("Yellow Wins!");
                quitGame();
            }else if(isDead[1] && isDead[3] && isDead [5]){
                console.log("Green Wins!");
                quitGame();
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

            if(game.input.activePointer.rightButton.isDown && !selecting){

                selecting = true;

                selectedX = (game.input.activePointer.clientX/64>>0) - buggyXOffset;//for some reason there are "tiles" to the left of the board
                selectedY = game.input.activePointer.clientY/64>>0;

                //make sure only units are selected
                if(locations[selectedY*width+selectedX] < 0 || locations[selectedY*width+selectedX] >= teamSize*2){
                    selectedX = -1;
                    selectedY = -1;
                }

                console.log("Selected: ("+selectedX+","+selectedY+")");

            }else if(game.input.activePointer.rightButton.isUp)
                selecting = false;

            if(game.input.activePointer.leftButton.isDown && !shooting){

                shooting = true;

                let mouseX = (game.input.activePointer.worldX/64>>0) - buggyXOffset;//for some reason there are "tiles" to the left of the board
                let mouseY = game.input.activePointer.worldY/64>>0;

                if( !(selectedX == -1 || selectedY == -1) && //nothing selected
                    !(selectedX == mouseX && selectedY == mouseY)){ //new spot is same as old spot

                    let newCoordsIndex = mouseY*width+mouseX;
                    let oldCoordsIndex = selectedY*width+selectedX;

                    if((locations[oldCoordsIndex]%2 == 0 && locations[newCoordsIndex]%2 != 0) ||
                        (locations[newCoordsIndex]%2 == 0 && locations[oldCoordsIndex]%2 != 0)){//targeting opponent

                        let shotAt = locations[newCoordsIndex];

                        if(shotAt == -2 || shotAt == -1)
                            return;

                        console.log(shotAt + " is being shot at!");

                        units[shotAt].visible = false;//dead bodies can be ignored
                        isDead[shotAt] = true;//kill sprite
                        locations[newCoordsIndex] = -1;//dead bodies can be ignored

                        console.log(locations);

                    }else if(locations[newCoordsIndex] == -1){ //new spot is empty

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
            
            // Accelerate the 'logo' sprite towards the cursor,
            // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
            // in X or Y.
            // This function returns the rotation angle that makes it visually match its
            // new trajectory.
            //bouncy.rotation = game.physics.arcade.moveToPointer(bouncy, 500, game.input.activePointer, 500);
        }
    };

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

    function moveUnit(sprite, x, y){

        let pixelX = 64*x;
        let pixelY = 64*y;

        if(game.physics.arcade.distanceToXY(sprite, pixelX, pixelY) > 0)
            game.physics.arcade.moveToXY(sprite, pixelX, pixelY, 200, 500);
        else
            sprite.body.stopMovement(true);

    }

};

