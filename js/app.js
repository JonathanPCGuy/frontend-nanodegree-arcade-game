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
        - the above 2 will require a refactor to allow
        - a reinit of the game without changing values in js file manually
    - implement moving logs (reverse collision)
*/

// TODO FIXME: Remove unused values
var Constants = function() {};

Constants.ROW_HEIGHT = 83;
Constants.COLUMN_WIDTH = 101;
// because the sprites are actually 171 in height, we need to
// take that into account
Constants.OBJECT_PADDING_TOP = 75;

Constants.BACKGROUND_TILE_PADDING_TOP = 50;
Constants.BACKGROUND_TILE_HEIGHT = 65;
Constants.BACKGROUND_TILE_PADDING_BOTTOM = 56;

Constants.PLAYER_TILE_PADDING_TOP = 60;
Constants.PLAYER_TILE_PADDING_BOTTOM = 30;

Constants.ENEMY_TILE_PADDING_TOP = 75;
Constants.ENEMY_TILE_PADDING_BOTTOM = 15;

Constants.BOTTOM_PADDING = 108;
Constants.DEFAULT_NUM_ROWS = 6;
Constants.DEFAULT_NUM_COLUMNS = 5;
Constants.DEFAULT_PLAYER_SPRITE = 'images/char-boy.png';
Constants.DEFAULT_ENEMY_COUNT = 3;
Constants.LEFT_BOUNDARY = -100;
Constants.RIGHT_BOUNDARY_PADDING = 50;
Constants.COLLISION_WIDTH =50;


var Location = function(column, row) {
    if(column === null || row === null) {
        return;
    }
    this.setRow(row);
    this.setColumn(column);
};

Location.prototype.setRow = function(row) {
    this.row = row;
    this.y = Constants.BACKGROUND_TILE_PADDING_TOP + row * Constants.ROW_HEIGHT - Constants.OBJECT_PADDING_TOP;
};

// note that for enemies the column value will not be updated when it moves as the value is
// not needed
Location.prototype.setColumn = function(column) {
    this.column = column;
    if(column == -1) {
        this.x = Constants.LEFT_BOUNDARY;
    }
    else {
        this.x = column * Constants.COLUMN_WIDTH;
    }

};

// http://stackoverflow.com/questions/894860/set-a-default-parameter-value-for-a-javascript-function
// to determine: move setting of rows/columns to not be in constructor?
var Options = function() {
    this.playerSprite = Constants.DEFAULT_PLAYER_SPRITE;
    this.enemyCount = Constants.DEFAULT_ENEMY_COUNT;
    this.setViewSize();
    console.log("options done");
};

Options.prototype.setViewSize = function(rows, columns) {
    this.rows = rows ? rows : Constants.DEFAULT_NUM_ROWS;
    this.columns = columns ? columns : Constants.DEFAULT_NUM_COLUMNS;
    this.viewHeight = this.rows * Constants.ROW_HEIGHT + Constants.BOTTOM_PADDING;
    this.viewWidth = this.columns * Constants.COLUMN_WIDTH;
};

var options = new Options ();

//Constants.collision = function()

var Helpers = function() {};

Helpers.collision = function(object1, object2) {
    //todo: x-collision

    // if objects overlap more than the COLLISION_WIDTH then we consider this to be a
    // collision
    if( object1.location.row === object2.location.row
        && object1.location.x + Constants.COLLISION_WIDTH > object2.location.x
        && object2.location.x + Constants.COLLISION_WIDTH > object1.location.x)
    {
        return true;
    }

    // and vice versa
    return false;
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// Returns a random integer between min (included) and max (excluded)
Helpers.randomInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images

    this.sprite = 'images/enemy-bug.png';
    this.location = new Location(null, null);
    this.setNewParams();
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.location.x += (10 * this.speed * dt)
    //console.log(this.x);
    if(this.location.x > options.viewWidth + Constants.RIGHT_BOUNDARY_PADDING)
    {
        this.setNewParams();
    }
};

// move enemy back to left side, and set new random row and speed
Enemy.prototype.setNewParams = function() {
    this.location.x = Constants.LEFT_BOUNDARY;
    this.location.setRow(Helpers.randomInteger(1, options.rows -2));
    this.speed = Helpers.randomInteger(15, 70);
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.location.x, this.location.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = options.playerSprite;

    this.location = new Location(null, null);
    this.returnToStart();
};

Player.prototype.returnToStart = function() {
    this.location.setColumn(Math.floor(options.columns/2));
    this.location.setRow(options.rows - 1);
};

// to do: see if any of these functions needs parameters
Player.prototype.update = function(dt) {
    // handle collissions?
    for(var i = 0; i < allEnemies.length; i++)
    {
        // first try - break when we try to go above enemy
        if(Helpers.collision(allEnemies[i], this))
        {
            console.log("collision!");
            this.location.setRow(options.rows - 1);
            this.location.setColumn(Math.floor(options.columns/2));
            break;
        }
    }
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.location.x, this.location.y);
};

Player.prototype.handleInput = function(key) {

    var newLocation = new Location(this.location.column, this.location.row);
    switch(key){
        case('up'):
            newLocation.setRow(this.location.row - 1);
            break;
        case('down'):
            newLocation.setRow(this.location.row + 1);
            break;
        case('left'):
            newLocation.setColumn(this.location.column - 1);
            break;
        case('right'):
            newLocation.setColumn(this.location.column + 1);
            break;
        default:
            return;
    }
    this.destinationCheck(newLocation);
    //console.log("target destination: row:" + this.location.row + " col:" + this.location.column);
};

// class function or object function?
Player.prototype.destinationCheck = function(newLocation) {
    if(newLocation.column >= options.columns || newLocation.column < 0 || newLocation.row >= options.rows || newLocation.rows < 0) {
        console.log("invaild destination, discarding")
        return;
    }
    else if (newLocation.row == 0) {
        this.location.setRow(options.rows -1);
    }
    else {
        this.location = newLocation;
    }

};

// when we make this variable we need to be able to cleanup

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [];
for(var i = 0; i < options.enemyCount; i++) {
    allEnemies.push(new Enemy());
}

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
