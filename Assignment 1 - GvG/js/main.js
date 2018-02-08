"use strict";

window.onload = function() {
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    let gameWidth = 800;
    let gameHeight = 600;

    var game = new Phaser.Game( gameWidth, gameHeight, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {
        // Load an image and call it 'logo'.
        //game.load.image( 'logo', 'assets/phaser.png' );
    }
    
    var bouncy;
    var timeElapsed;
    var gameTimer;
    var text;

    let points = 0;
    let gameOver = false;
    let rockSafeSpaceX = 50;
    let rockSafeSpaceY = 50;

    let prevMouseX = -1;
    let prevMouseY = -1;

    var rocks = [];
    
    function create() {

        gameTimer = game.time.create(false);
        gameTimer.start();
        timeElapsed = gameTimer.seconds;

//------------------------------Not my code below-----------------------------------------------------

        bouncy = game.add.sprite( game.world.centerX, game.world.centerY, 'logo' );
        bouncy.anchor.setTo( 0.5, 0.5 );
        game.physics.enable( bouncy, Phaser.Physics.ARCADE );
        bouncy.body.collideWorldBounds = true;
        var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
        text = game.add.text( game.world.centerX, 15, "Don't touch anything! " + timeElapsed, style );
        text.anchor.setTo( 0.5, 0.0 );

//------------------------------Not my code above-----------------------------------------------------

        let size = Math.floor(Math.random() * 30)+10;

        //populate rocks in random spots
        for(let i = 0; i < size; i++){

            let x = Math.floor(Math.random() * gameWidth);
            let y = Math.floor(Math.random() * gameHeight);

            //ensure no rocks spawn kill the player
            while(x >= game.world.centerX - rockSafeSpaceX && x <= game.world.centerX + rockSafeSpaceX)
                x = Math.floor(Math.random() * gameWidth);

            while(y >= game.world.centerY - rockSafeSpaceY && y <= game.world.centerY + rockSafeSpaceY)
                y = Math.floor(Math.random() * gameHeight);

            rocks.push(game.add.sprite(x, y, 'logo'));
            game.physics.enable(rocks[i], Phaser.Physics.ARCADE);
        }

    }
    
    function update() {

        let deltaMouse = Math.sqrt(Math.pow(game.input.mousePointer.x - prevMouseX, 2) + Math.pow(game.input.mousePointer.y - prevMouseY, 2));

        console.log(deltaMouse);

        if(!gameOver)
            points += deltaMouse/100 * (((timeElapsed/10)>>0)+1);

        prevMouseX = game.input.mousePointer.x;
        prevMouseY = game.input.mousePointer.y;

        game.physics.arcade.collide(bouncy, rocks, onCollide, null, this);

        timeElapsed = (gameTimer.seconds != 0) ? gameTimer.seconds:timeElapsed; 
        text.text = "Don't touch anything! " + (timeElapsed>>0) + " seconds | " + (points>>0) + " points";
        // Accelerate the 'logo' sprite towards the cursor,
        // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
        // in X or Y.
        // This function returns the rotation angle that makes it visually match its
        // new trajectory.
        bouncy.rotation = game.physics.arcade.accelerateToPointer( bouncy, game.input.activePointer, 500, 500, 500 );

        if(gameOver){
            text.text = "Game Over! Press F5 to play again. \n[" + (timeElapsed>>0) + " seconds] [" + (points>>0) + " points]";
            text.x = game.world.centerX;
            text.y = game.world.centerY;
        }

    }

    function onCollide(obj1, obj2){
        console.log("Game Over. You lasted " + timeElapsed + " seconds, and made " + points + " points.");
        gameTimer.stop();

        gameOver = true;
    }

};
