/*

    left to do:
    - reset to constant location
    - stay in tiles instead of ending up inbetween them
    - vary rows for enemies each time they go off border
    - start square for player is in visible area
    - if reach water put player back to start

    above and beyond:
    - reach end count (must)
    maybe:
    - lives
    - ability to set playing board size
    - difficulty level
    - implement moving logs (reverse collision)
*/


var Coordinates = function(x, y) {
    this.x = x;
    this.y = y;
}


var Constants = function() {};

Constants.OBJECT_HEIGHT = 83;
Constants.OBJECT_WIDTH = 101;
// because the sprites are actually 171 in height, we need to
// take that into account
Constants.OBJECT_HEIGHT_BLANK_SPACE = 88;
Constants.VIEW_WIDTH = 505;
Constants.VIEW_HEIGHT = 606;
Constants.LEFT_BOUNDARY = -100;
Constants.RIGHT_BONDARY = Constants.VIEW_WIDTH + 50;
//Constants.collision = function()

var Helpers = function() {};

Helpers.collision = function(object1, object2) {
    //todo: x-collision

    // if objects overlap then we have a collision
    if(object1.coords.y + Constants.OBJECT_HEIGHT_BLANK_SPACE + Constants.OBJECT_HEIGHT > object2.coords.y + Constants.OBJECT_HEIGHT_BLANK_SPACE
        && object2.coords.y + Constants.OBJECT_HEIGHT_BLANK_SPACE + Constants.OBJECT_HEIGHT > object1.coords.y + Constants.OBJECT_HEIGHT_BLANK_SPACE
        && object1.coords.x + Constants.OBJECT_WIDTH > object2.coords.x
        && object2.coords.x + Constants.OBJECT_WIDTH > object1.coords.x)
    {
        return true;
    }

    // and vice versa
    return false;
}


// Enemies our player must avoid
var Enemy = function(n) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images

    //TODO replace below with constants where applicable
    this.sprite = 'images/enemy-bug.png';
    this.coords = new Coordinates(-50, (n+1)*72);
    this.speed = (n+1)*10;
}


//static? per instance?
//Enemy.

// to review - constructors

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.coords.x += (10 * this.speed * dt)
    //console.log(this.x);
    if(this.coords.x > Constants.RIGHT_BONDARY)
    {
        this.coords.x = Constants.LEFT_BOUNDARY; // to do: set it to be negative value of sprite
        //console.log('reset!');
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.coords.x, this.coords.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.coords = new Coordinates(100, 600);
    this.speed = 10;
}

// to do: see if any of these functions needs parameters
Player.prototype.update = function(dt) {
    // handle collissions?
    for(var i = 0; i < allEnemies.length; i++)
    {
        // first try - break when we try to go above enemy
        if(Helpers.collision(allEnemies[i], this))
        {
            console.log("collision!");
            this.coords.y = 600;
            break;
        }
    }
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.coords.x, this.coords.y);
}

Player.prototype.handleInput = function(key) {

    // todo:    left and right
    //          boundaries check
    switch(key){
        case('up'):
            this.coords.y -= Constants.OBJECT_HEIGHT;
            break;
        case('down'):
            this.coords.y += Constants.OBJECT_HEIGHT;
            break;
        case('left'):
            this.coords.x -= Constants.OBJECT_WIDTH;
            break;
        case('right'):
            this.coords.x += Constants.OBJECT_WIDTH;
            break;
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [];
allEnemies.push(new Enemy(0));
allEnemies.push(new Enemy(1));
allEnemies.push(new Enemy(2));

var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
