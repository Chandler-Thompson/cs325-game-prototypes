"use strict";

GameStates.makeGame = function( game, shared ) {
    // base game vars
    let ship = null;
    let board = null;
    let layer1 = null;
    let marker = null;
    let title = null;
    let cardStyle = null;
    let correctSound = null;//played when a match is found

    //things to set in create()
    let width = -1;//of game board (in cards)
    let height = -1;//of game board (in cards)
    let numCards = -1;//total number of cards

    //game settings
    let revealTime = 0.75;//seconds of reveal time before both cards are turned back over

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
    let cardWidth = 48;
    let cardHeight = 64;

    //score modifiers
    let startingScore = 10000;//starting score to be deducted from
    let startingTime = 0;//used to store "starting time" of game, because things don't reset when going back to main menu
    let scorePenalty = 25;//seconds for each wrong choice added on to final score
    let numWrongChoices = 0;//score gets <scorePenalty> seconds added on to it for each wrong choice

    //values about cards
    let cards = [numCards];//positions of cards
    let shownCards = [numCards];//bool array for whether shown or not
    let displayedCardsText = [numCards];//stores card text as it's placed ("revealed")
    let displayedCardsBack = [numCards];//stores "background" of card as it's placed ("revealed")

    //misc
    let alphabet = ["0","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
                    "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","Q","X","Y","Z",
                    "!","@","#","$","%","^","&","*","(",")","_","+","-","=","/","<",">","?",".","`","~","|","\\","\"","\'","[","]","{","}", ","];//83 characters (12x12)?

    //end game
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

            switch(shared.boardType){
                case "5x2":
                    width = 5;
                    height = 2;
                    cardXOffset = 3;
                    cardYOffset = 2;
                    break;
                case "5x4":
                    width = 5;
                    height = 4;
                    cardXOffset = 3;
                    cardYOffset = 2;
                    break;
                case "8x5":
                    width = 8;
                    height = 5;
                    cardXOffset = 2;
                    cardYOffset = 1;
                    break;
                case "9x9":
                    width = 9;
                    height = 9;
                    cardXOffset = 2;
                    cardYOffset = 0;
                    break;
            }
            numCards = width*height;

            console.log(alphabet.length);

            correctSound = game.add.audio("correctSound");
            game.add.sprite(-cardWidth*cardXOffset, -cardHeight*cardYOffset, 'titlePage');

            board = game.add.tilemap('board');
            board.fixedToCamera = false;
            board.addTilesetImage('cardBack');
            layer1 = board.createLayer(shared.boardType);
            layer1.fixedToCamera = false;

            ship = game.add.sprite( game.world.centerX, game.world.centerY, 'starship' );
            ship.anchor.setTo(0.5, 0.5);
            game.physics.enable( ship, Phaser.Physics.ARCADE );
            ship.body.collideWorldBounds = true;

            cardStyle = {font: "25px Verdana", fill: "#ffffff", align: "center"};
            let style = {font: "25px Verdana", fill: "#9999ff", align: "center"};
            title = game.add.text( 200, 75, "Current Score: " + shared.score + " | High Score: " + shared.highScore, style );
            title.fixedToCamera = true;

            game.camera.setPosition(-cardWidth*cardXOffset, -cardHeight*cardYOffset);//"center" camera on board

            //setup board
            for(let i = 0; i < numCards; i++){
                cards[i] = 0;
                shownCards[i] = 0;
            }

            //place cards
            for(let i = 1; i <= (numCards/2); i++){
                
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
            marker.drawRect(0, 0, cardWidth-16, cardHeight-16);

            startingTime = game.time.totalElapsedSeconds();

        },
    
        update: function () {

            title.text = "Current Score: " + shared.score + " | High Score: " + shared.highScore;

            shared.score = (startingScore - ((game.time.totalElapsedSeconds()-startingTime) + (numWrongChoices * scorePenalty)))>>0;//total elapsed time plus an extra <scorePenalty> seconds for each wrong choice

            if(isGameOver())
                quitGame();

            //update marker's position
            let mX = getPointerX();
            let mY = getPointerY();

            //keep marker from leaving map
            if(mX >= 0 && mX < width)
                marker.x = (mX + cardXOffset) * cardWidth;
            
            if(mY >= 0 && mY < height)
                marker.y = (mY + cardYOffset) * cardHeight;

            let cursorX = getPointerX();
            let cursorY = getPointerY();

            //reveal time is up, reset everything
            if(selectionTime != -1 && (game.time.totalElapsedSeconds() - selectionTime >= revealTime) && selectedX2 != -1 && selectedY2 != -1){
                selectionTime = -1;
                selectedNumber = 0;

                let index = selectedY1*width+selectedX1;
                if(displayedCardsText[index] != null && displayedCardsBack[index] != null){
                    displayedCardsText[index].destroy();
                    displayedCardsText[index] = null;
                    displayedCardsBack[index].destroy();
                    displayedCardsBack[index] = null;
                }
                shownCards[index] = 0;

                selectedX1 = -1;
                selectedY1 = -1;


                index = selectedY2*width+selectedX2;
                if(displayedCardsText[index] != null && displayedCardsBack[index] != null){
                    displayedCardsText[index].destroy();
                    displayedCardsText[index] = null;
                    displayedCardsBack[index].destroy();
                    displayedCardsBack[index] = null;
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
                        displayCard(index);
                        selectedNumber = cards[index];
                    }

                }else if(selectedX1 != -1 && selectedY1 != -1 && selectedX2 == -1 && selectedY2 == -1){//one card selected

                    let index = cursorY*width+ cursorX;
                    if(index >= 0 && index < numCards && cards[index] != 0 && shownCards[index] == 0){//selection in range
                        selectedX2 = cursorX;
                        selectedY2 = cursorY;

                        if(selectedX1 == selectedX2 && selectedY1 == selectedY2)
                            return;

                        displayCard(index);
                        
                        if(selectedNumber == cards[index]){//cards match! prepare for another selection

                            correctSound.play();

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

            //ship.rotation = game.physics.arcade.accelerateToPointer( ship, game.input.activePointer, 500, 500, 500 );
        }

    };

    function getPointerX(){
        return layer1.getTileX(game.input.activePointer.worldX) - cardXOffset;
    }

    function getPointerY(){
        return layer1.getTileY(game.input.activePointer.worldY) - cardYOffset;
    }

    function displayCard(index){
        displayedCardsBack[index] = game.add.sprite(marker.x, marker.y, "cardBackRevealed");

        let displayedValue = (cards[index] >= 10) ? alphabet[cards[index]-10]:cards[index];

        displayedCardsText[index] = game.add.text(marker.x + cardWidth/6, marker.y + cardHeight/8, "" + displayedValue, cardStyle);
        shownCards[index] = 1;
    }

    function isGameOver(){
        for(let i = 0; i < numCards; i++){
            if(shownCards[i] == 0)
                return false;
        }
        return true;
    }

};
