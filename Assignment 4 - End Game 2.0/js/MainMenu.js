"use strict";

GameStates.makeMainMenu = function( game, shared ) {

	let music = null;
	let playButton = null;
    
    let titleText = null;
    let scoreText = null;

    function startGame(pointer) {

        //	And start the actual game
        game.state.start('Game', true, false);

    }
    
    return {
    
        create: function () {

            game.world.setBounds(-1000, -1000, 2000, 2000);
    
            //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
            //	Here all we're doing is playing some music and adding a picture and button
            //	Naturally I expect you to do something significantly better :)
    
            music = game.add.audio('backgroundMusic');
            //music.play();

            if(shared.xWins == shared.plusWins)
                game.add.sprite(64, 0, 'titlePage');

            //update background based on who has the most wins
            if(shared.xWins > shared.plusWins)
                game.add.sprite(64, 0, 'yellowTitlePage');
            else if(shared.xWins < shared.plusWins)
                game.add.sprite(64, 0, 'greenTitlePage');

            let style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
            titleText = game.add.text(0, 0, "_--|End Game|--_", style);
            titleText.anchor.setTo(0.5, 0.5);
            titleText.position.set(400, 125);
            titleText.fixedToCamera = true;
            scoreText = game.add.text(0, 0, "X Wins: " + shared.xWins + " | Plus Wins: " + shared.plusWins, style );
            scoreText.anchor.setTo(0.5, 0.5);
            scoreText.position.set(400, 225);
            scoreText.fixedToCamera = true;

            playButton = game.add.button( 303, 400, 'playButton', startGame, null, 'over', 'out', 'down');
    
        },
    
        update: function () {}
        
    };
};
