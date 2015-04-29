// TODO: make use of other assets and add new gametypes


// TODO: Final project will allow classic (as shown in video) and enhanced (moving river)

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
    NUM_ROWS : 8,
    NUM_COLUMNS : 7,
    DEFAULT_PLAYER_SPRITE : 'images/char-boy.png',
    DEFAULT_ENEMY_COUNT : 3,
    COLLISION_WIDTH : 50,
    TREASURE_Y_OFFSET: -10
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
    STARTING_LIVES : 3,
    MOVING_LOG_SPEED : 10,
    WATER_ROW_START : 1,
    WATER_ROW_COUNT : 2,
    TREASURE_FREQUENCY: 15000,
    REACH_END_SCORE : 1,
    TREASURE_SCORE: 2
};

// defines location in terms of column and rows
// actual display location on the canvas is calculated behind the scenes
var Location = function() {};

Location.prototype.setRow = function(row, offset) {
    var offset = offset || 0;
    this.row = row;
    this.y = DisplayConstants.BACKGROUND_TILE_PADDING_TOP + row * DisplayConstants.ROW_HEIGHT - DisplayConstants.OBJECT_PADDING_TOP + offset;
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

// used when Player is "on the log". allows for the x coord to be updated and the column if need be
// so the player will move with the log

Location.prototype.setColumnViaXValue = function(x) {
    this.x = x;
    var column = Math.floor(this.x / DisplayConstants.COLUMN_WIDTH);
    var remainder = Math.floor(this.x % DisplayConstants.COLUMN_WIDTH);

    // if remainder is negative then subtract its value from the COLUMN_WIDTH.
    // this ensures the player can go slightly off the board on the left side
    if(remainder < 0) {
        remainder = DisplayConstants.COLUMN_WIDTH + remainder;
    }
    if(remainder > DisplayConstants.COLUMN_WIDTH / 2) {
        column++;
    }
    this.column = column;
}

var Options = function() {
    this.playerSprite = DisplayConstants.DEFAULT_PLAYER_SPRITE;
    this.enemyCount = DisplayConstants.DEFAULT_ENEMY_COUNT;
    this.setViewSize();
    console.log("options done");
};

Options.prototype.setViewSize = function(rows, columns) {
    this.rows = rows ? rows : DisplayConstants.NUM_ROWS;
    this.columns = columns ? columns : DisplayConstants.NUM_COLUMNS;
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

// Base class for moving entities in the game
var MovingEntity = function(startingColumn) {

    this.yOffset = this.yOffset || 0;
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images

    this.location = Object.create(Location.prototype);
    if (typeof startingColumn !== 'undefined') {
        this.location.setColumn(startingColumn);
    }

    this.setNewParams();
};

// put moving entity on the right or left side, and set new random row and speed if enemy
// if moving log, keep same speed and direction
MovingEntity.prototype.setNewParams = function() {

    if (this.isMovingLog) {
        this.speed = GameConstants.MOVING_LOG_SPEED;
        this.location.setRow(this.row, this.yOffset);
    }
    else {
        this.location.setRow(Helpers.randomInteger(this.minRow, this.maxRow), this.yOffset);
        this.speed =  Helpers.randomInteger(15, 70);
    }
    // set the direction of the entity to go right or left
    // if entity is in middle of field, do not adjust x location

    if(Helpers.randomInteger(0,2) == 0 || this.isMovingLog && this.movingRight) {
        this.location.x = DisplayConstants.LEFT_BOUNDARY;
        this.movingRight = true;
        this.sprite =this.forwardSprite;
    }
    else {
        this.location.x = options.viewWidth + DisplayConstants.RIGHT_BOUNDARY_PADDING;
        this.speed = this.speed * -1;
        this.movingRight = false;
        this.sprite = this.reverseSprite;
    }
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
MovingEntity.prototype.update = function(dt) {
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

// Draw the enemy on the screen, required method for game
MovingEntity.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.location.x, this.location.y);
};
// TODO: move constants to constants variable
// Moving river stones
var RiverStone = function(row, startingColumn, movingRight) {
    this.sprite = 'images/stone-block.png';
    this.treasureSprite = 'images/Star.png';
    this.minRow = 1;
    this.maxRow = 3;
    this.row = row;
    this.movingRight = movingRight;
    this.yOffset = -DisplayConstants.BACKGROUND_TILE_PADDING_TOP + DisplayConstants.OBJECT_PADDING_TOP;
    this.isMovingLog = true;
    this.speed = this.movingRight ? GameConstants.MOVING_LOG_SPEED : -GameConstants.MOVING_LOG_SPEED;
    this.hasTreasure = true;
    MovingEntity.call(this, startingColumn);
    this.location.setRow(this.row, this.yOffset);
    this.location.setColumn(startingColumn);
};



RiverStone.initRiverStones = function() {
    allRiverStones = [];
    // 4 stones each row
    for(var i = 0; i < 4; i++) {
        allRiverStones.push(new RiverStone(1, i * 2, true));
        allRiverStones.push(new RiverStone(2, i * 2, false));
    }
}

RiverStone.calculateNextTreasure = function() {
    this.nextTreasureTime = Date.now() + GameConstants.TREASURE_FREQUENCY;
    this.nextTreasureRow = Helpers.randomInteger(GameConstants.WATER_ROW_START, GameConstants.WATER_ROW_START + GameConstants.WATER_ROW_COUNT);
}



RiverStone.prototype = Object.create(MovingEntity.prototype);
RiverStone.prototype.constructor = MovingEntity;

RiverStone.prototype.setNewParams = function() {
    this.hasTreasure = false;
    if( this.movingRight) {
        this.location.x = DisplayConstants.LEFT_BOUNDARY;
    }
    else {
        this.location.x = options.viewWidth + DisplayConstants.RIGHT_BOUNDARY_PADDING;
    }

    if(Date.now() > RiverStone.nextTreasureTime && this.location.row === RiverStone.nextTreasureRow) {
        RiverStone.calculateNextTreasure();
        this.hasTreasure = true;
    }
};

RiverStone.prototype.render = function() {
    MovingEntity.prototype.render.call(this);
    if(this.hasTreasure) {
        ctx.drawImage(Resources.get(this.treasureSprite), this.location.x, this.location.y + DisplayConstants.TREASURE_Y_OFFSET);
    }
};

// Enemies our player must avoid
var Enemy = function() {

    this.forwardSprite = 'images/enemy-bug.png';
    this.reverseSprite = 'images/enemy-bug-reverse.png'
    this.minRow = 3;
    this.maxRow = 6;
    MovingEntity.call(this);
};

Enemy.prototype = Object.create(MovingEntity.prototype);
Enemy.prototype.constructor = MovingEntity;

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = options.playerSprite;
    this.location = new Location(null, null);
    this.speed = GameConstants.MOVING_LOG_SPEED;
    this.returnToStart();
};

Player.prototype.returnToStart = function() {
    this.location.setColumn(Math.floor(options.columns/2));
    this.location.setRow(options.rows - 1);
};

Player.prototype.update = function(dt) {

    if(this.location.row >= GameConstants.WATER_ROW_START && this.location.row < GameConstants.WATER_ROW_START + GameConstants.WATER_ROW_COUNT) {
        // first iteration: if not on water lose life
        var onRock = false;
        var i = 0;
        for(; i < allRiverStones.length; i++) {
            if(Helpers.collision(allRiverStones[i], this)) {
                onRock = true;
                if(allRiverStones[i].hasTreasure)
                {
                    gameState.increaseScore(GameConstants.TREASURE_SCORE);
                    allRiverStones[i].hasTreasure = false;
                }
                break;
            }
        }

        if (!onRock) {
            this.lifeLossDetected();
        }
        else {
            // need to insert go off the screen detection
            var absoluteHorizontalChange = (10 * this.speed * dt);
            if(!allRiverStones[i].movingRight) {
                absoluteHorizontalChange = -absoluteHorizontalChange;
            }
            this.location.setColumnViaXValue(this.location.x + absoluteHorizontalChange);
            if(this.location.column < 0 || this.location.column >= DisplayConstants.NUM_COLUMNS) {
                this.lifeLossDetected();
            }
        }

    }
    else {
        for(var i = 0; i < allEnemies.length; i++) {
            if(Helpers.collision(allEnemies[i], this)) {
                this.lifeLossDetected();
                break;
            }
        }
    }
};

Player.prototype.lifeLossDetected = function() {
    gameState.lifeLoss();
    this.location.setRow(options.rows - 1);
    this.location.setColumn(Math.floor(options.columns/2));
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.location.x, this.location.y);
};

Player.prototype.handleInput = function(key) {
    var newLocation = new Location();
    newLocation.setRow(this.location.row);
    newLocation.setColumn(this.location.column);
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
        gameState.increaseScore(GameConstants.REACH_END_SCORE);
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
var allRiverStones;

function initializeObjects() {
    allEnemies = [];
    for(var i = 0; i < GameConstants.DIFFICULTY[options.difficulty].enemyCount; i++) {
        allEnemies.push(new Enemy());
    }
    RiverStone.initRiverStones();
    player = new Player();
};

initializeObjects();
RiverStone.calculateNextTreasure();

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
