var difficulty = [
    {
        "enemyCount": 3
    },
    {
        "enemyCount": 5
    },
    {
        "enemyCount": 7
    },
    {
        "enemyCount": 12
    }
];

var Constants = function() {};

Constants.ROW_HEIGHT = 83;
Constants.COLUMN_WIDTH = 101;

Constants.VIEW_HEIGHT_PADDING = 108;

Constants.OBJECT_PADDING_TOP = 75;
Constants.BACKGROUND_TILE_PADDING_TOP = 50;
Constants.BACKGROUND_TILE_PADDING_BOTTOM = 56;

Constants.LEFT_BOUNDARY = -100;
Constants.RIGHT_BOUNDARY_PADDING = 50;

Constants.DEFAULT_NUM_ROWS = 6;
Constants.DEFAULT_NUM_COLUMNS = 5;
Constants.DEFAULT_PLAYER_SPRITE = 'images/char-boy.png';
Constants.DEFAULT_ENEMY_COUNT = 3;

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
    this.viewHeight = this.rows * Constants.ROW_HEIGHT + Constants.VIEW_HEIGHT_PADDING;
    this.viewWidth = this.columns * Constants.COLUMN_WIDTH;
    this.difficulty = 0;
};

Options.prototype.setDifficulty = function(difficulty) {

    if(this.difficulty === difficulty) {
        return false;
    }
    this.difficulty = difficulty;
    return true;
}

var options = new Options ();

var Helpers = function() {};

Helpers.collision = function(object1, object2) {

    // if objects overlap more than the COLLISION_WIDTH then we consider this to be a
    // collision
    if( object1.location.row === object2.location.row
        && object1.location.x + Constants.COLLISION_WIDTH > object2.location.x
        && object2.location.x + Constants.COLLISION_WIDTH > object1.location.x)
    {
        return true;
    }
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

Player.prototype.update = function(dt) {
    for(var i = 0; i < allEnemies.length; i++)
    {
        // first try - break when we try to go above enemy
        if(Helpers.collision(allEnemies[i], this))
        {
            gameState.lifeLoss();
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
};

Player.prototype.destinationCheck = function(newLocation) {
    if(newLocation.column >= options.columns || newLocation.column < 0 || newLocation.row >= options.rows || newLocation.rows < 0) {
        return;
    }
    else if (newLocation.row == 0) {
        gameState.increaseScore(1);
        this.location.setRow(options.rows -1);
    }
    else {
        this.location = newLocation;
    }
};

var GameState = function() {
    this.score = 0;
    this.lives = 3;
};

GameState.prototype.increaseScore = function(value) {
    this.score += value;
    this.updateScore();
};

GameState.prototype.updateScore = function() {
    $('#score').html('Score: ' + this.score);
};

GameState.prototype.lifeLoss = function() {
    this.lives --;
    this.updateLives();
};

GameState.prototype.updateLives = function() {
    $('#lives').html('Lives: ' + this.lives);
};

var gameState = new GameState();

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies;
var player;

function initializeObjects() {
    allEnemies = [];
    for(var i = 0; i < difficulty[options.difficulty].enemyCount; i++) {
        allEnemies.push(new Enemy());
    }
    player = new Player();
};

initializeObjects();

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

// This listens for button clicks in the difficulty area
// http://stackoverflow.com/questions/9262827/twitter-bootstrap-onclick-event-on-buttons-radio
$(document).ready(function() {

    gameState.updateScore();
    gameState.updateLives();
    // todo: prevent reset of game if button doesn't change
    var newDifficultySet = false;
    $('#difficultySection label').click(function(e) {
        console.log(e);
        switch(e.currentTarget.id) {
            case('easyDifficulty'):
                newDifficultySet = options.setDifficulty(0);
            break;

            case('mediumDifficulty'):
                newDifficultySet = options.setDifficulty(1);
            break;

            case('hardDifficulty'):
                newDifficultySet = options.setDifficulty(2);
            break;
            case('insaneDifficulty'):
                newDifficultySet = options.setDifficulty(3);
            break;
        }

        if(newDifficultySet) {
            // reset game to new difficulty level
            initializeObjects();
        }
    });
});

// This listens for and handles changes in the difficulty selector
