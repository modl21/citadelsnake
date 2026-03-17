// Canvas dimensions
export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 400;

// Grid
export const CELL_SIZE = 16;
export const GRID_WIDTH = Math.floor(GAME_WIDTH / CELL_SIZE);   // 25
export const GRID_HEIGHT = Math.floor(GAME_HEIGHT / CELL_SIZE);  // 25

// Snake
export const INITIAL_SNAKE_LENGTH = 4;
export const INITIAL_MOVE_INTERVAL = 8; // ticks between moves (lower = faster)
export const MIN_MOVE_INTERVAL = 3;     // fastest speed
export const SPEED_UP_EVERY = 5;        // speed up every N food eaten

// Food
export const MAX_FOOD_ON_SCREEN = 2;
export const FOOD_SPAWN_CHANCE = 0.02;  // per tick when below max
export const SPECIAL_FOOD_CHANCE = 0.15; // chance of special food type
export const SPECIAL_FOOD_LIFETIME = 200; // ticks before special food despawns

// Scoring
export const SCORE_RAT = 10;
export const SCORE_SCORPION = 25;
export const SCORE_CACTUS_FRUIT = 15;
export const SCORE_GOLD_NUGGET = 50;

// Colors - premium western frontier palette
export const COLOR_BG = '#120a06';
export const COLOR_GRID = '#2b1a10';
export const COLOR_SAND = '#3c2818';
export const COLOR_SNAKE_HEAD = '#d4943e';
export const COLOR_SNAKE_BODY = '#a87028';
export const COLOR_SNAKE_PATTERN = '#553810';
export const COLOR_SNAKE_BELLY = '#d8b070';
export const COLOR_SNAKE_RATTLE = '#e8c050';
export const COLOR_SNAKE_EYE = '#ff2020';
export const COLOR_FOOD_RAT = '#9e8060';
export const COLOR_FOOD_SCORPION = '#d03030';
export const COLOR_FOOD_FRUIT = '#7ea030';
export const COLOR_FOOD_GOLD = '#ffd740';
export const COLOR_DUST = '#c4a882';
export const COLOR_BLOOD_SUN = '#6b140e';
export const COLOR_HORIZON = '#b14c1d';

// Payment
export const PAYMENT_AMOUNT_SATS = 100;
export const PAYMENT_RECIPIENT = 'claw@primal.net';

// Nostr
export const GAME_SCORE_KIND = 1151;
export const GAME_TAG = 'citadel-snake';
