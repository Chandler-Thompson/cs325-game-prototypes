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

    let game = new Phaser.Game( gameWidth, gameHeight, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {

        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('player', 'assets/player.png');
        game.load.image('grid_space', 'assets/grid_space.png');

        game.load.tilemap('grid', 'assets/bullet_grid.json', null, Phaser.Tilemap.TILED_JSON);
        // Load an image and call it 'logo'.
        //game.load.image( 'logo', 'assets/phaser.png' );
    }
    
    let bouncy = null;
    let timeElapsed = null;
    let gameTimer = null;
    let text = null;
    let grid = null;

    let points = 0;
    let bulletSpeed = 100;
    let numBullets = 0;
    let maxBullets = 0;
    let gameOver = false;

    let prevMouseX = -1;
    let prevMouseY = -1;

    let bullets = [];
    
    function create() {

        gameTimer = game.time.create(false);
        gameTimer.start();
        timeElapsed = gameTimer.seconds;

//------------------------------Not my code below-----------------------------------------------------

        bouncy = game.add.sprite( game.world.centerX, game.world.centerY, 'player' );
        bouncy.anchor.setTo( 0.5, 0.5 );
        game.physics.enable( bouncy, Phaser.Physics.ARCADE );
        bouncy.body.collideWorldBounds = true;
        let style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
        text = game.add.text( game.world.centerX, 15, "Don't touch anything! " + timeElapsed, style );
        text.anchor.setTo( 0.5, 0.0 );

//------------------------------Not my code above-----------------------------------------------------

        maxBullets = Math.floor(Math.random() * 30)+10;//number of projectiles

        grid = game.add.tilemap('grid');
        grid.fixedToCamera = false;
        grid.addTilesetImage('grid_space');

        layer = grid.createLayer("1");
        layer.fixedToCamera = false;

    }
    
    function update() {

        let rand = Math.floor(Math.random() * 2);

        //spawn bullets
        if(bullets.length < maxBullets && rand == 1){//spawn bullet

            let side = Math.floor(Math.random() * 4)+1;
            let x = 0;
            let y = 0;
            let vel = 0;

            switch(side){
                case 1://right
                    x = gameWidth-10;//so the bullet isn't destroyed as soon as it spawns
                    y = Math.floor(Math.random() * gameHeight);
                    vel = new Phaser.Point(-bulletSpeed, 0);
                    break;
                case 2://bottom
                    x = Math.floor(Math.random() * gameWidth);
                    y = gameHeight-10;//so the bullet isn't destroyed as soon as it spawns
                    vel = new Phaser.Point(0, -bulletSpeed);
                    break;
                case 3://left
                    x = 10;//so the bullet isn't destroyed as soon as it spawns
                    y = Math.floor(Math.random() * gameHeight);
                    vel = new Phaser.Point(bulletSpeed, 0);
                    break;
                case 4://top
                    x = Math.floor(Math.random() * gameWidth);
                    y = 10;//so the bullet isn't destroyed as soon as it spawns
                    vel = new Phaser.Point(0, bulletSpeed);
                    break;
            }

            bullets.push(game.add.sprite(x, y, 'bullet'));
            game.physics.enable(bullets[bullets.length-1], Phaser.Physics.ARCADE);
            bullets[bullets.length-1].body.velocity = vel;
            bullets[bullets.length-1].body.moves = true;

        }

        //check oob (out of bounds) for each bullet [for cleanup]
        for(let i = 0; i < bullets.length; i++){

            //console.log("("+bullets[i].x+","+bullets[i].y+")");

            //bullet is oob
            if((bullets[i].x >= gameWidth || bullets[i].x < 0) || (bullets[i].y >= gameHeight || bullets[i].y < 0)){
                bullets[i].destroy();
                bullets.splice(i, 1);//remove the one bullet
            }
        }

        let deltaMouse = Math.sqrt(Math.pow(game.input.mousePointer.x - prevMouseX, 2) + Math.pow(game.input.mousePointer.y - prevMouseY, 2));

        if(!gameOver)
            points += deltaMouse/100 * (((timeElapsed/10)>>0)+1);

        prevMouseX = game.input.mousePointer.x;
        prevMouseY = game.input.mousePointer.y;

        game.physics.arcade.collide(bouncy, bullets, onCollide, null, this);

        timeElapsed = (gameTimer.seconds != 0) ? gameTimer.seconds:timeElapsed; 
        text.text = "Don't get shot! " + (timeElapsed>>0) + " seconds | " + (points>>0) + " points";
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

    function getPointerX(){
        return layer1.getTileX(game.input.activePointer.worldX) - cardXOffset;
    }

    function getPointerY(){
        return layer1.getTileY(game.input.activePointer.worldY) - cardYOffset;
    }

};
