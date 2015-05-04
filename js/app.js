// defines location in terms of column and rows
// actual display location on the canvas is calculated behind the scenes
var Location = function() {};

Location.prototype.setRow = function(row, offset) {
    var offset = offset || 0;
    this.row = row;
    this.y = DisplayConstants.BACKGROUND_TILE_PADDING_TOP + row * DisplayConstants.ROW_HEIGHT - DisplayConstants.OBJECT_PADDING_TOP + offset;
};

Location.prototype.setColumn = function(column) {
    this.column = column;
    // note that for enemies the column value will not be updated when it moves as the value is
    // not needed
    this.x = column == -1 ? DisplayConstants.LEFT_BOUNDARY : column * DisplayConstants.COLUMN_WIDTH;
};

// used when Player is "on the log". allows for the x coord of the layer to be updated and the column if need be
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
};

var Options = function() {
    this.playerSprite = DisplayConstants.DEFAULT_PLAYER_SPRITE;
    this.enemyCount = DisplayConstants.DEFAULT_ENEMY_COUNT;
    this.setViewSize();
};

// sets the view size based on the rows and columns set for the game
// could allow the board size to change
Options.prototype.setViewSize = function(rows, columns) {
    this.rows = rows ? rows : DisplayConstants.NUM_ROWS;
    this.columns = columns ? columns : DisplayConstants.NUM_COLUMNS;
    this.viewHeight = this.rows * DisplayConstants.ROW_HEIGHT + DisplayConstants.VIEW_HEIGHT_PADDING;
    this.viewWidth = this.columns * DisplayConstants.COLUMN_WIDTH;
    this.difficulty = 0;
};

// returns true if a new difficulty is set, false if not
// helps to determine if the game state needs to be reset or not
Options.prototype.setDifficulty = function(difficulty) {

    if(this.difficulty === difficulty) {
        return false;
    }

    this.difficulty = difficulty;
    return true;
};



var Helpers = function() {};

Helpers.collision = function(object1, object2) {

    // if objects overlap more than the COLLISION_WIDTH then we consider this to be a
    // collision
    if( object1.location.row === object2.location.row &&
            object1.location.x + DisplayConstants.COLLISION_WIDTH > object2.location.x &&
            object2.location.x + DisplayConstants.COLLISION_WIDTH > object1.location.x) {
        return true;
    }
    return false;
};

// calculates a random integer between min (inclusive) and max (exclusive)
Helpers.randomInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

// Base class for non-player moving entities in the game
var MovingEntity = function(startingColumn) {
    this.yOffset = this.yOffset || 0;
    this.location = Object.create(Location.prototype);
    if (typeof startingColumn !== 'undefined') {
        this.location.setColumn(startingColumn);
    }

    this.setNewParams();
};

// put moving entity on the right or left side, and set new random row and speed if enemy
// moving logs has a separate code path (see RiverStone's setNewParams)
MovingEntity.prototype.setNewParams = function() {

    this.location.setRow(Helpers.randomInteger(this.minRow, this.maxRow), this.yOffset);
    this.speed =  Helpers.randomInteger(GameConstants.MIN_ENEMY_SPEED, GameConstants.MAX_ENEMY_SPEED);

    // set the direction of the entity to go right or left
    // if entity is in middle of field, do not adjust x location
    if(Helpers.randomInteger(0,2) == 0) {
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

// Moving river stones
var RiverStone = function(row, startingColumn, movingRight) {
    this.sprite = 'images/stone-block.png';
    this.treasureSprite = 'images/Star.png';
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
};

RiverStone.calculateNextTreasure = function() {
    this.nextTreasureTime = Date.now() + GameConstants.TREASURE_FREQUENCY;
    this.nextTreasureRow = Helpers.randomInteger(GameConstants.WATER_ROW_START, GameConstants.WATER_ROW_START + GameConstants.WATER_ROW_COUNT);
};

RiverStone.prototype = Object.create(MovingEntity.prototype);
RiverStone.prototype.constructor = MovingEntity;

// called when a river stone reaches either end of the playing field
RiverStone.prototype.setNewParams = function() {
    this.hasTreasure = false;
    if( this.movingRight) {
        this.location.x = DisplayConstants.LEFT_BOUNDARY;
    }
    else {
        this.location.x = options.viewWidth + DisplayConstants.RIGHT_BOUNDARY_PADDING;
    }

    if(Date.now() > RiverStone.nextTreasureTime && this.location.row === RiverStone.nextTreasureRow) {
        // pre-set the next time and which row will have a treasure, and then
        // mark this stone as having a treasure
        RiverStone.calculateNextTreasure();
        this.hasTreasure = true;
    }
};

RiverStone.prototype.render = function() {
    MovingEntity.prototype.render.call(this);
    if(this.hasTreasure) {
        // if the stone has a treasure draw the treasure on the stone
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

// moves the player back to the starting location
Player.prototype.returnToStart = function() {
    this.location.setColumn(Math.floor(options.columns/2));
    this.location.setRow(options.rows - 1);
};

Player.prototype.update = function(dt) {
    if(this.location.row >= GameConstants.WATER_ROW_START && this.location.row < GameConstants.WATER_ROW_START + GameConstants.WATER_ROW_COUNT) {
        // player is on the rows with the moving stones; check to ensure the player is on a stone
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
            // move the player with the river stone the player is on
            var absoluteHorizontalChange = (10 * this.speed * dt);
            if(!allRiverStones[i].movingRight) {
                absoluteHorizontalChange = -absoluteHorizontalChange;
            }

            this.location.setColumnViaXValue(this.location.x + absoluteHorizontalChange);
            // if the player is on the stone and goes too far off the screen, treat it as if
            // a life is lost
            if(this.location.column < 0 || this.location.column >= DisplayConstants.NUM_COLUMNS) {
                this.lifeLossDetected();
            }
        }
    }
    else {
        for(var i = 0; i < allEnemies.length; i++) {
            // detect collision with enemies and act accordingly
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
    // disallow movement to unallowed locations (off the board)
    if(newLocation.column >= options.columns || newLocation.column < 0 || newLocation.row >= options.rows || newLocation.rows < 0) {
        return;
    }
    else if (newLocation.row == 0) {
        gameState.increaseScore(GameConstants.REACH_END_SCORE, true);
        this.location.setRow(options.rows -1);
        this.location.setColumn(Math.floor(options.columns/2));
    }
    else {
        this.location = newLocation;
    }
};

// holds the state of the game (score, lives, etc.)
var GameState = function() {
    this.resetState();
    this.highScore = 0;
};

// reset the state of the game
GameState.prototype.resetState = function() {
    this.score = 0;
    this.lives = GameConstants.STARTING_LIVES;
    this.timesEndReached = 0;
    this.updateScore();
    this.updateLives();
};

GameState.prototype.increaseScore = function(value, endReached) {
    this.score += value;
    this.updateScore();

    // score can increase if a start is collect or if the end is reached
    // behavior will vary due to type of score, so handle appropriately
    if(typeof endReached !== 'undefined') {
        this.timesEndReached++;
        if(allEnemies.length < GameConstants.MAX_ENEMIES && this.timesEndReached > 0 &&
                this.timesEndReached % GameConstants.ADDITIONAL_ENEMY_AFTER_END_REACH_FREQUENCY === 0) {
            allEnemies.push(new Enemy());
        }
    }
};

GameState.prototype.updateScore = function() {
    $('#score').text(this.score);
};

GameState.prototype.lifeLoss = function() {
    this.lives--;
    if(this.lives < 0) {
        // reset score and lives, and display the game over modal with your score and high score
        $('#yourScore').text(this.score);
        if(this.score > this.highScore) {
            this.highScore = this.score;
        }
        $('#highScore').text(this.highScore);

        initializeAndReset();
        $('#gameOver').modal();
    }
    this.updateLives();
};

GameState.prototype.updateLives = function() {
    $('#lives').text(this.lives);
};

var gameState = new GameState();
var options = new Options ();

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies;
var player;
var allRiverStones;

function initializeAndReset() {
    allEnemies = [];
    for(var i = 0; i < GameConstants.DIFFICULTY[options.difficulty].enemyCount; i++) {
        allEnemies.push(new Enemy());
    }
    RiverStone.initRiverStones();
    RiverStone.calculateNextTreasure();
    player = new Player();
    gameState.resetState();
};

initializeAndReset();

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
    $('#instructions').modal();
    gameState.updateScore();
    gameState.updateLives();
    var newDifficultySet = false;

    $('#gameSettingsButton').click(function() {
        $('#enemyCount').text(GameConstants.DIFFICULTY[options.difficulty].enemyCount.toString());
        $('#gameSettings').modal();
    });

    $('#instructionsButton').click(function() {
        $('#instructions').modal();
    });

    $('#difficultySection label').click(function(e) {
        console.log(e);
        var difficulty = parseInt($('#'+e.currentTarget.id + " input").attr('value'));
        if(options.difficulty !== difficulty) {
            // reset game to new difficulty level
            options.setDifficulty(difficulty);
            $('#enemyCount').text(GameConstants.DIFFICULTY[options.difficulty].enemyCount.toString());
            initializeAndReset();
        }
    });
});