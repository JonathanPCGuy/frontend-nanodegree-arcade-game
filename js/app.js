// TODO: make use of other assets and add new gametypes

// holds constants related to display aspects of the games
var DisplayConstants = {
    ROW_HEIGHT : 83,
    COLUMN_WIDTH : 101,
    VIEW_HEIGHT_PADDING : 108,
    OBJECT_PADDING_TOP : 75,
    BACKGROUND_TILE_PADDING_TOP : 50,
    BACKGROUND_TILE_PADDING_BOTTOM : 56,
    LEFT_BOUNDARY : -100,
    RIGHT_BOUNDARY_PADDING : 50,
    DEFAULT_NUM_ROWS : 8,
    DEFAULT_NUM_COLUMNS : 7,
    DEFAULT_PLAYER_SPRITE : 'images/char-boy.png',
    DEFAULT_ENEMY_COUNT : 3,
    COLLISION_WIDTH : 50
};

// holds constants related to the logic/setting of the game
var GameConstants = {
    // although there is only 1 parameter in each element,
    // it allows the flexibility to add additional parameters to
    // difficulty settings (like lives, enemy behavior, etc.)
    DIFFICULTY : [
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
    ],
    STARTING_LIVES : 3
};

// defines location in terms of column and rows
// actual display location on the canvas is calculated behind the scenes
var Location = function(column, row) {
    if(column === null || row === null) {
        return;
    }
    this.setRow(row);
    this.setColumn(column);
};

Location.prototype.setRow = function(row) {
    this.row = row;
    this.y = DisplayConstants.BACKGROUND_TILE_PADDING_TOP + row * DisplayConstants.ROW_HEIGHT - DisplayConstants.OBJECT_PADDING_TOP;
};

// note that for enemies the column value will not be updated when it moves as the value is
// not needed
Location.prototype.setColumn = function(column) {
    this.column = column;
    if(column == -1) {
        this.x = DisplayConstants.LEFT_BOUNDARY;
    }
    else {
        this.x = column * DisplayConstants.COLUMN_WIDTH;
    }

};

var Options = function() {
    this.playerSprite = DisplayConstants.DEFAULT_PLAYER_SPRITE;
    this.enemyCount = DisplayConstants.DEFAULT_ENEMY_COUNT;
    this.setViewSize();
    console.log("options done");
};

Options.prototype.setViewSize = function(rows, columns) {
    this.rows = rows ? rows : DisplayConstants.DEFAULT_NUM_ROWS;
    this.columns = columns ? columns : DisplayConstants.DEFAULT_NUM_COLUMNS;
    this.viewHeight = this.rows * DisplayConstants.ROW_HEIGHT + DisplayConstants.VIEW_HEIGHT_PADDING;
    this.viewWidth = this.columns * DisplayConstants.COLUMN_WIDTH;
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
        && object1.location.x + DisplayConstants.COLLISION_WIDTH > object2.location.x
        && object2.location.x + DisplayConstants.COLLISION_WIDTH > object1.location.x)
    {
        return true;
    }
    return false;
};

// calculates a random integer between min (inclusive) and max (exclusive)
Helpers.randomInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images


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
    if(this.location.x > options.viewWidth + DisplayConstants.RIGHT_BOUNDARY_PADDING ||
        this.location.x < DisplayConstants.LEFT_BOUNDARY)
    {
        this.setNewParams();
    }
};

// put enemy on the right or left side, and set new random row and speed
Enemy.prototype.setNewParams = function() {

    this.location.setRow(Helpers.randomInteger(1, options.rows -2));
    this.speed = Helpers.randomInteger(15, 70);

    // set the direction of the enemy to go right or left
    if(Helpers.randomInteger(0,2) == 0) {
        this.location.x = DisplayConstants.LEFT_BOUNDARY;
        this.movingRight = true;
        this.sprite = 'images/enemy-bug.png';
    }
    else {
        this.location.x = options.viewWidth + DisplayConstants.RIGHT_BOUNDARY_PADDING;
        this.speed = this.speed * -1;
        this.movingRight = false;
        this.sprite = 'images/enemy-bug-reverse.png';
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

// holds the state of the game (score, lives, etc.)
var GameState = function() {
    this.score = 0;
    this.lives = GameConstants.STARTING_LIVES;
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
    if(this.lives < 0) {
        // reset score and lives, and display the game over modal
        $('#yourScore').text('Your score:' + this.score);
        this.score = 0;
        this.updateScore();
        this.lives = GameConstants.STARTING_LIVES;
        $('#gameOver').modal();
    }
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
    for(var i = 0; i < GameConstants.DIFFICULTY[options.difficulty].enemyCount; i++) {
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

// This listens for button clicks in the difficulty area, and handles
// difficulty change events
$(document).ready(function() {

    gameState.updateScore();
    gameState.updateLives();
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
