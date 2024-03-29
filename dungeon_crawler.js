var Button = React.createClass({
  action: function() {
    toggleShadow();
  },
  render: function() {
    return <button className={this.props.class} onClick={this.action}>{this.props.text}</button>
  }
});

var Map = React.createClass({
  render: function() {
    return (
      <canvas id="grid" width="801px" height="601px" ></canvas>
    )
  }
});

var Legend = React.createClass({
  render: function() {
    return (
      <div>
   <div><h2>
    <b>XP</b>: <span id="xp">0</span>
     - <b>Level</b>: <span id="level">0</span>
     - <b>Health</b>: <span id="health">0</span>
     - <b>Weapon</b>: <span id="weapon">0</span>
     - <b>Damage</b>: <span id="damage">0</span>
    </h2></div><h3>Enemies left: <span id="enemies">0</span></h3></div>
    )
  }
});

var View = React.createClass({
  render: function() {
    return (
    <div>
      <Legend />
      <Map />
      <Button class="btn btn-success" text="Toggle Shadow" />
      </div>
    )
  }
});

  React.render( <View />,
    document.getElementById('container')
  );


// create board
var map = [];
var rooms = 0;
const WEAPONS = [{
  name: "Knife",
  damage: 15
}, {
  name: "Gun",
  damage: 30
}, {
  name: "Bazooka",
  damage: 60
}, {
  name: "Atomic Bomb",
  damage: 100
}];
const POTIONS = [10, 20, 30, 40, 50];
const ENEMIES_HEALTH = [30, 30, 30, 30, 40, 40, 60, 80];
const ENEMIES_DAMAGE = [30, 30, 30, 30, 40, 40, 60, 80];
var shadow = []; //show only a part of map
const VISIBILITY = 3;
const MAX_ROOM_SIZE = 15;
const MIN_ROOM_SIZE = 4;
const MAX_ROOM_DISTANCE = 4;
const MIN_ROOM_DISTANCE = 2;
const COLS = 80;
const ROWS = 60;
const TOTAL_ENEMIES = 10;
const STARTING_ENEMIES_AMOUNT = 4;
const STARTING_POTIONS_AMOUNT = 4;
const STARTING_WEAPONS_AMOUNT = 3;
var defeatedEnemies = 0;
var enemies = [];
var canvas = document.getElementById("grid");
var context = canvas.getContext("2d");
var busyCoordinates = [];
var player;
var weapon;
var isShadowToggled = true;
var directions = [-1, 0, 1];
const MAX_ERRORS_COUNT = 1000;
const MINIMUM_TILES_AMOUNT = 1000;
class Player {
  constructor(level, health, weapon, coords, xp) {
    this.level = level;
    this.health = health;
    this.weapon = weapon;
    this.coords = coords;
    this.xp = xp;
  }
}

class Enemy {
  constructor(health, coords, damage) {
    this.health = health;
    this.coords = coords;
    this.damage = damage;
  }
}

startGame()

function startGame() {
  generateMap();
  setTimeout(gameSetUp(), 1000)
  function gameSetUp() {
  generatePlayer();
  generateWeapon(STARTING_WEAPONS_AMOUNT);
  generateEnemies(TOTAL_ENEMIES);
  generatePotions(STARTING_POTIONS_AMOUNT);
  generateShadow();
  drawMap(0, 0, COLS, ROWS);
  updateLegend();
  }
}

function generateMap()  {
  for (var row = 0; row < ROWS; row++) {
    map.push([]);
    for (var col = 0; col < COLS; col++) {
      map[row].push(0);
    }
  }
  var tiles = 0;
  var errors = 0;
  var x = COLS/2;
  var y = ROWS/2;
  for (var i = 0; i < 30000; i++) {
    var increment = directions[Math.floor(Math.random() * directions.length)];
    if (Math.random() < 0.5) {
      x += increment;
      while (x <= 3 || x >= COLS - 4) {
      x += directions[Math.floor(Math.random() * directions.length)];
        errors++;
        if (errors > MAX_ERRORS_COUNT) {
          if (tiles < MINIMUM_TILES_AMOUNT) {
            x = COLS / 2;
            y = ROWS / 2;
          } else {
          return;
          }
        }
      }
    } else {
      y += increment;
      while (y <= 3 || y >= ROWS - 4) {
      y += directions[Math.floor(Math.random() * directions.length)];
        errors++;
        if (errors > MAX_ERRORS_COUNT) {
          if (tiles < MINIMUM_TILES_AMOUNT) {
            x = COLS / 2;
            y = ROWS / 2;
          } else {
          return;
          }
        }
      }
      }
    if (map[y][x] != 1) {
    map[y][x] = 1;
      tiles++
    }
    errors = 0;
  }

};

function generateShadow() {
  var startX = (player.coords.x - VISIBILITY) < 0 ? 0 : player.coords.x - VISIBILITY;
  var startY = (player.coords.y - VISIBILITY) < 0 ? 0 : player.coords.y - VISIBILITY;
  var endX = (player.coords.x + VISIBILITY) >= COLS ? COLS - 1 : player.coords.x + VISIBILITY;
  var endY = (player.coords.y + VISIBILITY) >= ROWS ? ROWS - 1 : player.coords.y + VISIBILITY;
  for (var row = 0; row < ROWS; row++) {
    shadow.push([]);
    for (var col = 0; col < COLS; col++) {
      if (row >= startY && row <= endY && col >= startX && col <= endX) {
        shadow[row].push(1);
      } else {
        shadow[row].push(0);
      }
    }
  }
}

function generatePotions(amount) {
  for (var i = 0; i < amount; i++) {
    var coords = generateValidCoords();
    addObjToMap(coords, 4);
    if (!isShadowToggled) {
    drawObject(coords.x, coords.y, "green");
  }
  }
}

function generateWeapon(amount) {
   for (var i = 0; i < amount; i++) {
    var coords = generateValidCoords();
    addObjToMap(coords, 5);
  if (!isShadowToggled) {
    drawObject(coords.x, coords.y, "orange");
  }
     }
}

function updateLegend() {
  $("#xp").text(player.xp);
  $("#level").text(player.level);
  $("#health").text(player.health);
  $("#weapon").text(player.weapon.name);
  $("#damage").text(player.weapon.damage);
  $("#enemies").text(TOTAL_ENEMIES - defeatedEnemies);
}

function drawMap(startX, startY, endX, endY) {
  var color;
  for (var row = startY; row < endY; row++) {
    for (var col = startX; col < endX; col++) {
      if (isShadowToggled && shadow[row][col] == 0) {
          drawObject(col, row, "black");
      } else {
      switch (map[row][col]) {
        case 1:
          color = "white";
          break;
        case 2:
          color = "blue";
          break;
        case 3:
          color = "red";
          break;
        case 4:
          color = "green";
          break;
        case 5:
          color = "orange";
          break;
        default:
          color = "grey";
      }
      drawObject(col, row, color);
      }
    }
  }
}

function areCoordsFree(x, y) {
  if (map[y][x] != 1) {
    return false;
  }
  for (var i = 0; i < busyCoordinates.length; i++) {
    try {
      if (busyCoordinates[i].x == x && busyCoordinates[i].y == y) {
        return false;
      }
    } catch (e) {
      console.log("Error: " + e);
    }
  }
  return true;
}

// set the given coords as busy + the 8 neighbors
function addBusyCoords(x, y) {
  busyCoordinates.push({
    x: x,
    y: y
  });
}

function generateValidCoords() {
 var x = Math.floor(Math.random() * COLS);
 var y = Math.floor(Math.random() * ROWS);
 while (!areCoordsFree(x, y)) {
   x = Math.floor(Math.random() * COLS);
   y = Math.floor(Math.random() * ROWS);
  }
  return {
    x: x,
    y: y
  };
}

function generateEnemies(amount) {
  for (var i = 0; i < amount; i++) {
    var coords = generateValidCoords();
    enemies.push(new Enemy(ENEMIES_HEALTH[Math.floor(Math.random() * ENEMIES_HEALTH.length)], coords, ENEMIES_DAMAGE[Math.floor(Math.random() * ENEMIES_DAMAGE.length)]))
    addObjToMap(coords, 3);
  }
}

function generatePlayer() {
    var coords = generateValidCoords();
  player = new Player(1, 100, WEAPONS[0], coords, 30);
  addObjToMap(player.coords, 2);
}

// add given coords to map
// make the coords and neighbors busy
// and draw object with given color
function addObjToMap(coords, identifier) {
  map[coords.y][coords.x] = identifier;
  addBusyCoords(coords.x, coords.y);
}

function drawObject(x, y, color) {
    context.beginPath();
    context.rect(x * 10, y * 10, 10, 10);
    context.fillStyle = color;
    context.fill();
}

// key down events
$(document).keydown(function(e) {
  var x = player.coords.x;
  var y = player.coords.y;
  var oldX = player.coords.x;
  var oldY = player.coords.y;
  switch (e.which) {
    case 37: // left
      x--;
      break;
    case 38: // up
      y--;
      break;
    case 39: // right
      x++;
      break;
    case 40: // down
      y++;
      break;
    default:
      return; // exit this handler for other keys
  }
  // check if next spot is enemy
  if (map[y][x] == 3) {
    fightEnemy(enemies.filter(function(item) {
      return item.coords.x == x && item.coords.y == y;
    })[0]);
  } else if(map[y][x] != 0) {
    // if next spot is potion
   if (map[y][x] == 4) {
      player.health += POTIONS[Math.floor(Math.random() * POTIONS.length)];
     removeObjFromMap(x, y);
     generatePotions(1);
   } else if (map[y][x] == 5) {
    player.weapon = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
     removeObjFromMap(x, y);
     generateWeapon(1);
   }
     updatePlayerPosition(player.coords.x, player.coords.y, x, y);
    updateLegend();
    drawMap(oldX - VISIBILITY - 1, oldY - VISIBILITY - 1, x + VISIBILITY + 2, y + VISIBILITY + 2);
  }
  e.preventDefault(); // prevent the default action (scroll / move caret)
});

function fightEnemy(enemy) {
  if (player.health - enemy.damage <= 0) {
    gameOver();
    return;
  } else if (enemy.health - player.weapon.damage <= 0) {
    enemyDefeated(enemy);
  }
  enemy.health -= player.weapon.damage;
  player.health -= enemy.damage;
  updateLegend();
}

function enemyDefeated(enemy) {
  defeatedEnemies++;
  if (defeatedEnemies == 10) {
    userWins();
    return;
  }
  removeObjFromMap(enemy.coords.x, enemy.coords.y);
  drawMap(enemy.coords.x - 1, enemy.coords.y - 1, enemy.coords.x + 1, enemy.coords.y + 1);
  enemies.slice(enemies.indexOf(enemy), 1);
  player.xp += 50;
  if (player.xp - 100 * (player.level - 1) >= 100) {
    player.level++;
  }
  updateLegend();
}

function resetGame() {
  defeatedEnemies = [];
  enemies = [];
  busyCoordinates = [];
  shadow = [];
  map = [];
}

function userWins() {
  alert("YOU CONQUERED THE DUNGEON!");
  resetGame();
  startGame();
};

function gameOver() {
  alert("GAME OVER");
  resetGame();
  startGame();
};

function removeObjFromMap(x, y) {
  map[y][x] = 1;
};

function updatePlayerPosition(oldX, oldY, newX, newY) {
    removeObjFromMap(oldX, oldY);
    map[newY][newX] = 2;
    player.coords = {x : newX, y : newY};

  var startX = (oldX - VISIBILITY) < 0 ? 0 : oldX - VISIBILITY;
  var startY = (oldY - VISIBILITY) < 0 ? 0 : oldY - VISIBILITY;
  var endX = (newX + VISIBILITY) >= COLS ? COLS - 1 : newX + VISIBILITY;
  var endY = (newY + VISIBILITY) >= ROWS ? ROWS - 1 : newY + VISIBILITY;

    if (oldX > newX) {
      startX = newX - VISIBILITY;
      endX = oldX + VISIBILITY;
    }
  if (oldY > newY) {
      startY = newY - VISIBILITY;
      endY = oldY + VISIBILITY;
    }
    for (var row = startY; row <= endY; row++) {
      for (var col = startX; col <= endX; col++) {
        if (row >= newY - VISIBILITY && row <= newY + VISIBILITY && col >= newX - VISIBILITY && col <= newX + VISIBILITY) {
          shadow[row][col] = 1;
        } else {
          shadow[row][col] = 0;
        }
      }
    }
}

function toggleShadow() {
  isShadowToggled = !isShadowToggled;
  drawMap(0, 0, COLS, ROWS);
}