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

//Constants.OBJECT_HEIGHT_UPPER_BLANK_SPACE = 75;
//Constants.OBJECT_HEIGHT_LOWER_BLANK_SPACE = 40;

Constants.BOTTOM_PADDING = 108;
Constants.DEFAULT_ROWS = 6;
Constants.DEFAULT_COLS = 5;
Constants.LEFT_BOUNDARY = -100;
Constants.RIGHT_BOUNDARY_PADDING = 50;

// note that for enemies the column value will not be updated
var Location = function(column, row) {
    this.setRow(row);
    this.setColumn(column);
};

Location.prototype.setRow = function(row) {
    this.row = row;
    this.y = Constants.BACKGROUND_TILE_PADDING_TOP + row * Constants.ROW_HEIGHT - Constants.OBJECT_PADDING_TOP;
};

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
// to determine: move setting of rows/cols to not be in constructor?
var Options = function(cols, rows) {
    this.rows = typeof rows !== 'undefined' ? rows : Constants.DEFAULT_ROWS;
    this.cols = typeof cols !== 'undefined' ? cols : Constants.DEFAULT_COLS;
    this.setViewSize(this.rows, this.cols);
};

Options.prototype.setViewSize = function(rows, cols) {
    this.viewHeight = rows * Constants.ROW_HEIGHT + Constants.BOTTOM_PADDING;
    this.viewWidth = cols * Constants.COLUMN_WIDTH;
};

var options = new Options ();

//Constants.collision = function()

var Helpers = function() {};

Helpers.collision = function(object1, object2) {
    //todo: x-collision

    // if objects overlap then we have a collision
    if( object1.location.row === object2.location.row
        && object1.location.x + Constants.COLUMN_WIDTH > object2.location.x
        && object2.location.x + Constants.COLUMN_WIDTH > object1.location.x)
    {
        return true;
    }

    // and vice versa
    return false;
};

// Enemies our player must avoid
var Enemy = function(n) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images

    //TODO replace below with constants where applicable
    // TODO: better enemy generation (more in 1 row? random speeds?)
    this.sprite = 'images/enemy-bug.png';
    this.location = new Location(-1, n+1);
    this.speed = (n+1)*10;
};


//static? per instance?
//Enemy.

// to review - constructors

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
        this.location.x = Constants.LEFT_BOUNDARY;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.location.x, this.location.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/char-boy.png';

    //FIXME: location may change
    this.location = new Location(Math.floor(options.cols/2), options.rows-1);
    this.speed = 10;
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
            //FIXME: size may change
            this.location.setRow(options.rows - 1);
            this.location.setColumn(Math.floor(options.cols/2));
            break;
        }
    }
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.location.x, this.location.y);
};

Player.prototype.handleInput = function(key) {

    //   todo:       boundaries check
    switch(key){
        case('up'):
            this.location.setRow(this.location.row - 1);//.y -= Constants.ROW_HEIGHT;
            break;
        case('down'):
            this.location.setRow(this.location.row + 1);
            break;
        case('left'):
            this.location.setColumn(this.location.column - 1);
            break;
        case('right'):
            this.location.setColumn(this.location.column + 1);
            break;
    }
};

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
