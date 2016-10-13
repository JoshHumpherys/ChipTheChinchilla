// Game constants
var WIDTH; // set in menu()
var HEIGHT; // set in menu()
var NUM_HIGH_SCORES = 5;
var UPDATE_DELAY = 17;
var NUM_CHIP_FRAMES = 4;
var MAP_SPEED = 8;
var SNAKE_SPEED = 1;
var JUMP_SPEED = 8;
var SCORE_MULTIPLIER = 1/20;
var GAME_STATES = {
    menu: 'menu',
    alive: 'alive',
    dead: 'dead',
    transition: 'transition'
};
var CHIP_STATES = {
    left: 'left',
    right: 'right',
    movingLeft: 'movingLeft',
    movingRight: 'movingRight'
}

// Position and dimension constants, set after WIDTH and HEIGHT in menu()
var TREE_MARGIN;
var TREE_WIDTH;
var CHIP_WIDTH;
var CHIP_HEIGHT;
var CHIP_X_LEFT;
var CHIP_X_RIGHT
var CHIP_Y;
var SNAKE_WIDTH;
var SNAKE_HEIGHT;
var SNAKE_X_LEFT;
var SNAKE_X_RIGHT;

// Game variables
var gameState = GAME_STATES['menu'];
var numChipFrames = 0;
var chipFrame = 0;
var treeTop = 0;
var score = 0;
var chipState = CHIP_STATES['right'];
var chipX;
var chipY;
var snakes = [];
var nextSnakeSpawnTime = 0;

// References to DOM nodes
var container;
var bg;
var chip;
var leftTree;
var rightTree;
var scoreDisplay;

window.onload = function () {
    container = document.getElementById('container');
    menu();
};

window.ontouchstart = function (e) {
    e.preventDefault();
    handleInput(e);
};

window.onkeydown = function (e) {
    handleInput(e);
};

var handleInput = function (e) {
    switch(gameState) {
    case GAME_STATES['menu']:
        transition(GAME_STATES['alive']);
        break;
    case GAME_STATES['alive']:
        jump();
        break;
    case GAME_STATES['dead']:
        transition(GAME_STATES['menu']);
        break;
    }
};

var loop = function (e) {
    switch(gameState) {
    case GAME_STATES['menu']:
        break;
    case GAME_STATES['alive']:
        if(update()) {
            setTimeout(loop, UPDATE_DELAY);
        }
        break;
    case GAME_STATES['dead']:
        break;
    }
};

// Removes all children from a DOM node
var removeAllChildren = function (element) {
    while(element.hasChildNodes()) {
        element.removeChild(element.lastChild);
    }
};

// Initializes the menu by creating and adding the correct elements
var menu = function () {
    // Clear container
    removeAllChildren(container);

    // Resize container to 16:9
    var frame = document.getElementById('frame');
    HEIGHT = frame.clientHeight;
    WIDTH = HEIGHT / 4 * 3;
    frame.style.width = WIDTH + 'px';

    // Place background image
    bg = document.createElement('div');
    bg.className = 'bg';
    container.appendChild(bg);

    // Set position and direction constants base on WIDTH and HEIGHT
    TREE_MARGIN = 5;
    TREE_WIDTH = 10;
    CHIP_WIDTH = 12;
    CHIP_HEIGHT = CHIP_WIDTH / 620 * 429 / HEIGHT * WIDTH;
    CHIP_X_LEFT = TREE_MARGIN + TREE_WIDTH - 3;
    CHIP_X_RIGHT = 100 - CHIP_X_LEFT - CHIP_WIDTH;
    CHIP_Y = 80;
    SNAKE_WIDTH = CHIP_WIDTH;
    SNAKE_HEIGHT = SNAKE_WIDTH / 10 * 8 / HEIGHT * WIDTH;
    SNAKE_X_LEFT = CHIP_X_LEFT;
    SNAKE_X_RIGHT = CHIP_X_RIGHT;

    var img = new Image();
    img.src = 'img/bg.png';
    img.onload = function () {
        bg.style.height = container.clientWidth / img.width * img.height + 'px';
    }

    var title = document.createElement('div');
    title.className = 'title';
    title.innerHTML = 'Chip the Chinchilla';
    container.appendChild(title);

    var help = document.createElement('div');
    help.className = 'help';
    help.innerHTML = '(click or press any key to start)';
    help.style.top = title.offsetTop + title.clientHeight + 'px';
    container.appendChild(help);

    var hsList = getHighScoreObjects();
    if(hsList.length > 0) {
        var hs = document.createElement('div');
        hs.className = 'hs';
        var hsHeading = document.createElement('div');
        hsHeading.innerHTML = 'Best Climbs:';
        hsHeading.style.position = 'relative';
        var createCol = function () {
            var col = document.createElement('div');
            col.innerHTML = '<br />';
            col.style.position = 'relative';
            return col;
        }
        var placeCol = createCol();
        var nameCol = createCol();
        var scoreCol = createCol();
        for(var i = 0; i < hsList.length; i++) {
            placeCol.innerHTML += i + 1 + ') <br />';
            nameCol.innerHTML += hsList[i].name + '<br />';
            scoreCol.innerHTML += hsList[i].value + 'm<br />';
        }
        nameCol.id = 'nameCol';
        var colContainer = document.createElement('div');
        colContainer.id = 'hsList';
        colContainer.style.position = 'relative';
        var createFiller = function () {
            var filler = document.createElement('div');
            filler.className = 'filler';
            filler.style.position = 'relative';
            return filler;
        }
        colContainer.appendChild(createFiller());
        colContainer.appendChild(placeCol);
        colContainer.appendChild(nameCol);
        colContainer.appendChild(scoreCol);
        colContainer.appendChild(createFiller());
        hs.appendChild(hsHeading);
        hs.appendChild(colContainer);
        container.appendChild(hs);
        placeCol.style.minWidth = scoreCol.clientWidth + 'px';
    }
};

// Initializes the game container by creating and adding the correct elements and
// starting the game loop
var start = function () {
    // Clear container
    removeAllChildren(container);

    // Add background created in menu()
    container.appendChild(bg);

    // Add trees
    leftTree = document.createElement('div');
    leftTree.className = 'tree left-tree';
    setPosition(leftTree, TREE_MARGIN, -100);
    setDimensions(leftTree, TREE_WIDTH, 200);
    container.appendChild(leftTree);
    rightTree = document.createElement('div');
    rightTree.className = 'tree right-tree';
    setPosition(rightTree, 100 - TREE_MARGIN - TREE_WIDTH, -100);
    setDimensions(rightTree, TREE_WIDTH, 200);
    container.appendChild(rightTree);

    // Add chip
    chip = document.createElement('div');
    chip.id = 'chip';
    chipX = CHIP_X_RIGHT;
    chipY = CHIP_Y;
    setPosition(chip, chipX, chipY);
    setDimensions(chip, CHIP_WIDTH, CHIP_HEIGHT);
    updateChipFrame(chip);
    updateChipDir(chip);
    container.appendChild(chip);

    scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'score';
    scoreDisplay.innerHTML = '0m';
    container.appendChild(scoreDisplay);

    // Update game vars
    score = 0;
    snakes = [];
    chipState = CHIP_STATES['right'];

    // spawn a snake to get the chain started
    spawnSnake();

    // Start game loop
    loop();
};

// Properly handles a transition from one game state to another
var transition = function (state) {
    gameState = GAME_STATES['transition'];
    var overlay = document.getElementById('overlay');
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
    setTimeout(function () {
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        gameState = state;
        switch(state) {
        case GAME_STATES['alive']:
            start();
            break;
        case GAME_STATES['menu']:
            menu();
            break;
        }
    }, 500);
};

// Main update function called from the game loop
var update = function () {
    // Update chip's image
    if(chipState === CHIP_STATES['movingRight'] || chipState === CHIP_STATES['movingLeft']) {
        chipFrame = 0;
    } else if(numChipFrames >= NUM_CHIP_FRAMES) {
        numChipFrames = 0;
        chipFrame = (chipFrame + 1) % 4;
    } else {
        numChipFrames++;
    }
    updateChipFrame(chip);

    // Update trees
    var height = leftTree.clientHeight / 2;
    treeTop += MAP_SPEED;
    if(height <= treeTop) {
        treeTop -= height;
    }
    var top = -height + treeTop;
    leftTree.style.top = top + 'px';
    rightTree.style.top = top + 'px';

    score += SCORE_MULTIPLIER;
    scoreDisplay.innerHTML = parseInt(score) + 'm';

    if(chipState === CHIP_STATES['movingLeft']) {
        chipX -= JUMP_SPEED;
        updateChipDir(chip);
    } else if(chipState === CHIP_STATES['movingRight']) {
        chipX += JUMP_SPEED;
        updateChipDir(chip);
    }

    if(chipX < CHIP_X_LEFT) {
        chipX = CHIP_X_LEFT;
        chipState = CHIP_STATES['left'];
    } else if(chipX > CHIP_X_RIGHT) {
        chipX = CHIP_X_RIGHT;
        chipState = CHIP_STATES['right'];
    }

    setX(chip, chipX);

    var toKill = false;
    for(var i = 0; i < snakes.length; i++) {
        var snake = snakes[i];
        var y = snake.y + SNAKE_SPEED;
        if (y > 100) {
            container.removeChild(snake.element);
            snakes.splice(i, 1);
        } else {
            snake.y = y;
            setY(snake.element, y);
            if(!toKill && checkCollision(chipX, chipY, snake.x, snake.y)) {
                toKill = true;
            }
        }
    }

    if(!toKill && new Date().getTime() > nextSnakeSpawnTime) {
        spawnSnake();
    }

    if(toKill) {
        kill();
        return false;
    }

    return true;
};

var checkCollision = function (chipX, chipY, snakeX, snakeY) {
    chipX += CHIP_WIDTH / 5;
    chipWidth = CHIP_WIDTH * 3 / 5;
    chipY += CHIP_HEIGHT / 7;
    chipHeight = CHIP_HEIGHT * 5 / 7;
    snakeX += SNAKE_WIDTH * 2 / 5;
    snakeWidth = SNAKE_WIDTH * 1 / 5;
    snakeY = snakeY;
    snakeHeight = SNAKE_HEIGHT;
    return chipX + chipWidth > snakeX && chipX < snakeX + snakeWidth && chipY + chipHeight > snakeY && chipY < snakeY + snakeHeight;
}

// All x, y, w, h values are percentages. This utility function converts those
// percentages to pixels in the horizontal direction.
var percentHorizontalToPixels = function (percent) {
    return WIDTH * percent / 100;
};

// All x, y, w, h values are percentages. This utility function converts those
// percentages to pixels in the vertical direction.
var percentVerticalToPixels = function (percent) {
    return HEIGHT * percent / 100;
};

// This function takes a DOM node and moves it to the specified position on the
// screen given in percentages.
var setPosition = function (element, x, y) {
    setX(element, x);
    setY(element, y);
};

var setX = function (element, x) {
    element.style.left = percentHorizontalToPixels(x) + 'px';
};

var setY = function (element, y) {
    element.style.top = percentVerticalToPixels(y) + 'px';
};

var setDimensions = function (element, w, h) {
    setWidth(element, w);
    setHeight(element, h);
};

var setWidth = function (element, w) {
    element.style.width = percentHorizontalToPixels(w) + 'px';
};

var setHeight = function (element, h) {
    element.style.height = percentVerticalToPixels(h) + 'px';
};

// Update chip's background image to the correct frame
var updateChipFrame = function (chip) {
    chip.style.backgroundImage = 'url(../ChipTheChinchilla/img/chip' + chipFrame + '.png)';
};

var updateChipDir = function (chip) {
    chip.className = (chipX + CHIP_WIDTH / 2 < 100 / 2 ? 'left' : 'right') + '-chip';
};

// Handles a jump from one side to the other
var jump = function () {
    if(chipState === CHIP_STATES['left']) {
        chipState = CHIP_STATES['movingRight'];
    } else if(chipState === CHIP_STATES['right']) {
        chipState = CHIP_STATES['movingLeft'];
    }
};

// Kills Chip and handles state transition
var kill = function () {
    gameState = GAME_STATES['dead'];
    setPotentialHighScore(parseInt(score));
};

var spawnSnake = function () {
    var snake = document.createElement('div');
    var left = Math.random() < .5;
    snake.className = 'snake ' + (left ? 'left-snake' : 'right-snake');
    var x = left ? SNAKE_X_LEFT : SNAKE_X_RIGHT;
    setPosition(snake, x, -100);
    setDimensions(snake, SNAKE_WIDTH, SNAKE_HEIGHT);
    container.appendChild(snake);
    var img = document.createElement('img');
    img.className = 'snake-img';
    img.src = '../ChipTheChinchilla/img/snake.png';
    snake.innerHTML = img.outerHTML;
    snakes.push({ element: snake, x: x, y: -100 });
    nextSnakeSpawnTime = new Date().getTime() + 400 + (20 * Math.max(100 - score, 0) + 100) * Math.random() + (Math.random() < .2 ? 500 : 0);

};

// Requests the players name for saving high scores
var requestName = function () {
    var name = prompt("Congrats! You got a new high score!\nPlease enter your name:");
    return name || requestName();
};

// Sets cookies to save the high scores
var setHighScore = function (name, value, index) {
    setCookie('hs' + index + 'Name', name);
    setCookie('hs' + index + 'Value', value);
};

// Checks if a high score needs to up date and if so calls setHighScore
var setPotentialHighScore = function (score) {
    var objects = getHighScoreObjects();
    for(var i = 0; i < NUM_HIGH_SCORES; i++) {
        if(i >= objects.length || score >= objects[i].value) {
            var name = '';
            setTimeout(function () {
                name = requestName();
                for(var j = objects.length - (objects.length < NUM_HIGH_SCORES ? 0 : 1); j > i; j--) {
                    setHighScore(objects[j - 1].name, objects[j - 1].value, j);
                }
                setHighScore(name, score, i);
            }, 100);
            break;
        }
    }
};

// Returns nicely parsed high scores as a string array
var getHighScoreStrings = function () {
    var objects = getHighScoreObjects();
    for(var i = 0; i < objects.length; i++) {
        objects[i] = i + 1 + ') ' + objects[i].name + ' ' + objects[i].value + 'm';
    }
    return objects;
};

// Retruns high scores as an array of objects with name and value
var getHighScoreObjects = function () {
    var hs = [];
    for(var i = 0; i < NUM_HIGH_SCORES; i++) {
        var name = getCookie('hs' + i + 'Name');
        if(name === '') {
            break;
        }
        var value = getCookie('hs' + i + 'Value');
        hs[i] = {
            name: name,
            value: value
        };
    }
    return hs;
};

// Utility function to set a cookie
var setCookie = function(name, value) {
    var expDate = new Date();
    expDate.setYear(expDate.getFullYear() + 10);
    document.cookie = name+'='+value+'; expires='+expDate.toUTCString();
};

// Utility function to get a cookie
var getCookie = function(name) {
    name += '=';
    array = document.cookie.split(';');
    for(var i = 0; i < array.length; i++) {
        var current = array[i];
        while(current.charAt(0) == ' ') {
            current = current.substring(1);
        }
        if(current.indexOf(name) == 0) {
            return current.substring(name.length, current.length);
        }
    }
    return '';
};

// Utility function to erase a cookie
var eraseCookie = function(name) {
    document.cookie = name+'=;expires=Thu, 01 Jan 1970 00:00:00 UTC';
}

// Utilitiy function to erase all cookies
var eraseAllCookies = function() {
    array = document.cookie.split(';');
    for(var i = 0; i < array.length; i++) {
        eraseCookie(array[i].substring(0, array[i].indexOf('=')));
    }
}
