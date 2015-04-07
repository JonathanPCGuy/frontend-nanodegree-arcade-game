var Constants = function() {
    // this doesn't work if you don't init class, need to find
    // workaround?
    this.width = 505;
}


// Enemies our player must avoid
var Enemy = function(n) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = -50;
    this.y = (n+1)*72;
    this.speed = (n+1)*10;
}

// to review - constructors

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += (10 * this.speed * dt)
    //console.log(this.x);
    if(this.x > 505 + 50)
    {
        this.x = -100; // to do: set it to be negative value of sprite
        //console.log('reset!');
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.x = 100;
    this.y = 600;
    this.speed = 10;
}

// to do: see if any of these functions needs parameters
Player.prototype.update = function(dt) {
    // handle collissions?
    for(var i = 0; i < allEnemies.length; i++)
    {
        // first try - break when we try to go above enemy
        if(allEnemies[i].y+75 > this.y)
        {
            this.y = 600;
            break;
        }
    }
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.handleInput = function(key) {
    if(key == 'up')
    {
        this.y -= 75;
    }
    else if (key == 'down')
    {
        this.y += 75;
    }
    // can i do case switch?
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
