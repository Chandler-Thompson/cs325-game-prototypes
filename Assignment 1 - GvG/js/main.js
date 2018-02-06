"use strict";

window.onload = function() {

    let gaiaWidth = 256;
    let gaiaHeight = 256;

    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {}
    
    function create() {
        let bitWorld = game.add.bitmapData(gaiaWidth, gaiaHeight);
        bitWorld.ctx.beginPath();
        bitWorld.ctx.rect(0,0,Camera.width,Camera.height);
        bitWorld.ctx.fillStyle = '#ff0000';
        bitWorld.ctx.fill();

        let world = game.add.sprite(gaiaWidth, gaiaHeight, bitWorld);

        var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
        var text = game.add.text( game.world.centerX, 15, "Gaia vs. Geologist", style );
        text.anchor.setTo( 0.5, 0.0 );
    }
    
    function update() {
        
    }
};
