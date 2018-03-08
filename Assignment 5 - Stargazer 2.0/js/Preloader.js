"use strict";

GameStates.makePreloader = function( game ) {

	var background = null;
	var preloadBar = null;

	var ready = false;

return {
    
        preload: function () {
    
            //	These are the assets we loaded in Boot.js
            //	A nice sparkly background and a loading progress bar
            background = game.add.sprite(0, 0, 'preloaderBackground');
            preloadBar = game.add.sprite(300, 400, 'preloaderBar');
    
            //	This sets the preloadBar sprite as a loader sprite.
            //	What that does is automatically crop the sprite from 0 to full-width
            //	as the files below are loaded in.
            game.load.setPreloadSprite(preloadBar);
    
            //menu assets
            game.load.image('titlePage', 'assets/background.png');
            game.load.atlas('playButton', 'assets/start_button.png', 'assets/play_button.json');
            game.load.atlas('level1Button', 'assets/level_1_button.png', 'assets/play_button.json');
            game.load.atlas('level2Button', 'assets/level_2_button.png', 'assets/play_button.json');
            game.load.atlas('level3Button', 'assets/level_3_button.png', 'assets/play_button.json');
            game.load.atlas('level4Button', 'assets/level_4_button.png', 'assets/play_button.json');

            //game sounds
            game.load.audio('backgroundMusic', ['assets/francesco_-_esprit_de_l_arbre_2.mp3']);
            game.load.audio('correctSound', ['assets/wink-sound-effect.mp3']);
            
            //game assets
            game.load.image('starship', 'assets/starship.png' );
            game.load.image('cardBack', 'assets/card_back.png');
            game.load.image('cardBackRevealed', 'assets/card_back_revealed.png');

            //game board (all of the levels are layers)
            game.load.tilemap('board', 'assets/card_board.json', null, Phaser.Tilemap.TILED_JSON);
        },
    
        create: function () {
    
            //	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
            preloadBar.cropEnabled = false;
    
        },
    
        update: function () {
    
            //	You don't actually need to do this, but I find it gives a much smoother game experience.
            //	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
            //	You can jump right into the menu if you want and still play the music, but you'll have a few
            //	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
            //	it's best to wait for it to decode here first, then carry on.
            
            //	If you don't have any music in your game then put the game.state.start line into the create function and delete
            //	the update function completely.
            
            if (game.cache.isSoundDecoded('correctSound') && game.cache.isSoundDecoded('backgroundMusic') && ready == false)
            {
                ready = true;
                game.state.start('MainMenu');
            }
    
        }
    
    };
};
