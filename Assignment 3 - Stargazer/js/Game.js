"use strict";

GameStates.makeGame = function( game, shared ) {
    // base game vars
    let ship = null;
    let board = null;
    let layer1 = null;
    let marker = null;
    let title = null;

    //things to set
    let width = 5;//of game board
    let revealTime = 1.5;//milliseconds of reveal time before both cards are turned back over
    let numCards = 10;//total number of cards (10 is max)

    //coords of selections
    let selectedX1 = -1;
    let selectedY1 = -1;
    let selectedX2 = -1;
    let selectedY2 = -1;

    //vars used in card selection
    let selecting = false;
    let selectionTime = -1;
    let selectedNumber = 0;//number of currently selected card
    let cardXOffset = 3;
    let cardYOffset = 2;

    //score modifiers
    let startingScore = 10000;//starting score to be deducted from
    let startingTime = 0;//used to store "starting time" of game, because things don't reset when going back to main menu
    let scorePenalty = 10;//10 seconds for each wrong choice
    let numWrongChoices = 0;//score gets 10 seconds added on to it for each wrong choice

    //values about cards
    let cards = [numCards];//positions of cards
    let shownCards = [numCards];//bool array for whether shown or not
    let displayedCards = [numCards];//stores card sprites as they're placed ("revealed")

    let gameOver = false;

    function quitGame() {

        startingTime = game.time.totalElapsedSeconds();
        numWrongChoices = 0;

        if(shared.highScore < shared.score)
            shared.highScore = shared.score;

        game.state.start('MainMenu');

    }
    
    return {

        create: function () {

            game.add.sprite(-144, -128, 'titlePage');

            board = game.add.tilemap('board');
            board.fixedToCamera = false;
            board.addTilesetImage('cardBack');
            layer1 = board.createLayer('Tile Layer 1');
            layer1.fixedToCamera = false;

            ship = game.add.sprite( game.world.centerX, game.world.centerY, 'starship' );
            ship.anchor.setTo(0.5, 0.5);
            game.physics.enable( ship, Phaser.Physics.ARCADE );
            ship.body.collideWorldBounds = true;
            var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
            title = game.add.text( 200, 75, "Current Score: " + shared.score + " | High Score: " + shared.highScore, style );
            title.fixedToCamera = true;

            game.camera.setPosition(-144, -128);//"center" camera on board

            //setup board
            for(let i = 0; i < numCards; i++){
                cards[i] = 0;
                shownCards[i] = 0;
            }

            //place cards
            for(let i = 1; i <= 5; i++){
                
                let ran1 = Math.random()*numCards>>0;
                let ran2 = Math.random()*numCards>>0;

                //don't assign to same spot
                if(ran1 == ran2 || cards[ran1] != 0 || cards[ran2] != 0){
                    i--;
                    continue;
                }

                cards[ran1] = i;
                cards[ran2] = i;

            }

            marker = game.add.graphics();
            marker.lineStyle(2, 0xFFFFFF, 1);
            marker.drawRect(0, 0, 32, 48);

            startingTime = game.time.totalElapsedSeconds();

        },
    
        update: function () {

            title.text = "Current Score: " + shared.score + " | High Score: " + shared.highScore;

            shared.score = (startingScore - ((game.time.totalElapsedSeconds()-startingTime) + (numWrongChoices * scorePenalty)))>>0;//total elapsed time plus an extra <scorePenalty> seconds for each wrong choice

            if(isGameOver())
                quitGame();

            marker.x = layer1.getTileX(game.input.activePointer.worldX) * 48;
            marker.y = layer1.getTileY(game.input.activePointer.worldY) * 64;

            let cursorX = layer1.getTileX(game.input.activePointer.worldX)-cardXOffset;
            let cursorY = layer1.getTileY(game.input.activePointer.worldY)-cardYOffset;

            //reveal time is up, reset everything
            if(selectionTime != -1 && (game.time.totalElapsedSeconds() - selectionTime >= revealTime) && selectedX2 != -1 && selectedY2 != -1){
                selectionTime = -1;
                selectedNumber = 0;

                let index = selectedY1*width+selectedX1;
                if(displayedCards[index] != null){
                    displayedCards[index].destroy();
                    displayedCards[index] = null;
                }
                shownCards[index] = 0;

                selectedX1 = -1;
                selectedY1 = -1;


                index = selectedY2*width+selectedX2;
                if(displayedCards[index] != null){
                    displayedCards[index].destroy();
                    displayedCards[index] = null;
                }
                shownCards[index] = 0;

                selectedX2 = -1;
                selectedY2 = -1;

            }

            if(game.input.mousePointer.isDown && !selecting){

                selecting = true;

                if(selectedX1 == -1 && selectedY1 == -1){//nothing selected yet

                    let index = cursorY*width+ cursorX;
                    if(index >= 0 && index < numCards && cards[index] != 0 && shownCards[index] == 0){//selection in range and card available and not already shown
                        selectedX1 = cursorX;
                        selectedY1 = cursorY;
                        displayedCards[index] = game.add.sprite(marker.x, marker.y, getCardSpriteName(cards[index]));
                        shownCards[index] = 1;
                        selectedNumber = cards[index];
                    }

                }else if(selectedX1 != -1 && selectedY1 != -1 && selectedX2 == -1 && selectedY2 == -1){//one card selected

                    let index = cursorY*width+ cursorX;
                    if(index >= 0 && index < numCards && cards[index] != 0 && shownCards[index] == 0){//selection in range
                        selectedX2 = cursorX;
                        selectedY2 = cursorY;

                        if(selectedX1 == selectedX2 && selectedY1 == selectedY2)
                            return;

                        displayedCards[index] = game.add.sprite(marker.x, marker.y, getCardSpriteName(cards[index]));
                        shownCards[index] = 1;
                        
                        if(selectedNumber == cards[index]){//cards match! prepare for another selection

                            selectedNumber = 0;
                            selectedX1 = -1;
                            selectedY1 = -1;
                            selectedX2 = -1;
                            selectedY2 = -1;
                        }else{//cards don't match, time delay the flipping back over
                            selectionTime = game.time.totalElapsedSeconds();
                            numWrongChoices++;
                        }
                    }
                }

            }else if(game.input.mousePointer.isUp){
                selecting = false;
            }

            ship.rotation = game.physics.arcade.accelerateToPointer( ship, game.input.activePointer, 500, 500, 500 );
        }

    };

    function getCardSpriteName(cardNum){

        switch(cardNum){
            case 1:
                return "cardOne";
            case 2:
                return "cardTwo";
            case 3:
                return "cardThree";
            case 4:
                return "cardFour";
            case 5:
                return "cardFive";
            default:
                return "cardBack"
        }

    }

    function isGameOver(){
        for(let i = 0; i < numCards; i++){
            if(shownCards[i] == 0)
                return false;
        }
        return true;
    }

};
