"use strict";

GameStates.makeMainMenu = function( game, shared ) {

    //easter egg
    let level1Played = false;
    let level2Played = false;
    let level3Played = false;

	let music = null;
	
    let level1Button = null;
    let level2Button = null;
    let level3Button = null;
    let level4Button = null;

    let titleText = null;
    let scoreText = null;

    function startGame(pointer) {

        //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
        //music.stop();

        //	And start the actual game
        game.state.start('Game', true, false);

    }
    
    function startGameLevel1(pointer){
        shared.boardType = "5x2";
        level1Played = true;
        startGame(pointer);
    }

    function startGameLevel2(pointer){
        shared.boardType = "5x4";
        level2Played = true;
        startGame(pointer);
    }

    function startGameLevel3(pointer){
        shared.boardType = "8x5";
        level3Played = true;
        startGame(pointer);
    }

    function startGameLevel4(pointer){
        shared.boardType = "9x9";
        startGame(pointer);
    }

    return {
    
        create: function () {

            let allLevelsPlayed = level1Played && level2Played && level3Played;

            game.world.setBounds(-1000, -1000, 2000, 2000);
    
            //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
            //	Here all we're doing is playing some music and adding a picture and button
            //	Naturally I expect you to do something significantly better :)
    
            music = game.add.audio('backgroundMusic');
            music.play();

            game.add.sprite(-10, -10, 'titlePage');
            var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
            titleText = game.add.text(0, 0, "_--|StarGazer 2.0|--_", style);
            titleText.anchor.setTo(0.5, 0.5);
            titleText.position.set(400, 125);
            titleText.fixedToCamera = true;
            scoreText = game.add.text(0, 0, "Score: " + shared.score + " | High Score: " + shared.highScore, style );
            scoreText.anchor.setTo(0.5, 0.5);
            scoreText.position.set(400, 225);
            scoreText.fixedToCamera = true;

            level1Button = game.add.button( 100, 400, 'level1Button', startGameLevel1, null, 'over', 'out', 'down');
            level2Button = game.add.button( 300, 400, 'level2Button', startGameLevel2, null, 'over', 'out', 'down');
            level3Button = game.add.button( 500, 400, 'level3Button', startGameLevel3, null, 'over', 'out', 'down');

            if(allLevelsPlayed)
                level4Button = game.add.button( 300, 500, 'level4Button', startGameLevel4, null, 'over', 'out', 'down');
    
        },
    
        update: function () {}
        
    };
};
