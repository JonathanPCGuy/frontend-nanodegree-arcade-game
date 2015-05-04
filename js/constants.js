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
    TREASURE_SCORE: 2,
    ADDITIONAL_ENEMY_AFTER_END_REACH_FREQUENCY : 3,
    MAX_ENEMIES: 12,
    MIN_ENEMY_SPEED: 15,
    MAX_ENEMY_SPEED: 40
};