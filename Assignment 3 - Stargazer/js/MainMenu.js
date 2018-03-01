"use strict";

GameStates.makeMainMenu = function( game, shared ) {

	var music = null;
	var playButton = null;
    
    let titleText = null;
    let scoreText = null;

    function startGame(pointer) {

        //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
        music.stop();

        //	And start the actual game
        game.state.start('Game', true, false);

    }
    
    return {
    
        create: function () {

            game.world.setBounds(-1000, -1000, 2000, 2000);
    
            //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
            //	Here all we're doing is playing some music and adding a picture and button
            //	Naturally I expect you to do something significantly better :)
    
            music = game.add.audio('titleMusic');
            //music.play();

            game.add.sprite(-10, -10, 'titlePage');
            var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
            titleText = game.add.text(0, 0, "_--|StarGazer|--_", style);
            titleText.anchor.setTo(0.5, 0.5);
            titleText.position.set(400, 125);
            titleText.fixedToCamera = true;
            scoreText = game.add.text(0, 0, "Score: " + shared.score + " | High Score: " + shared.highScore, style );
            scoreText.anchor.setTo(0.5, 0.5);
            scoreText.position.set(400, 225);
            scoreText.fixedToCamera = true;

            playButton = game.add.button( 300, 400, 'playButton', startGame, null, 'over', 'out', 'down');
    
        },
    
        update: function () {}
        
    };
};
