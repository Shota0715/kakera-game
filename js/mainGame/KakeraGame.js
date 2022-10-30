function KakeraGame() {
  var gameUI = GameUI.getInstance();

  var maxWidth; //width of the game world
  var height;
  var viewPort; //width of canvas, viewPort that can be seen
  var tileSize;
  var map;
  var originalMaps;

  var translatedDist; //distance translated(side scrolled) as kakera moves to the right
  var centerPos; //center position of the viewPort, viewable screen
  var kakeraInGround;

  //instances
  var kakera;
  var element;
  var gameSound;
  var score;

  var keys = [];
  var goombas;
  var powerUps;
  var bullets;
  var bulletFlag = false;

  var currentLevel;

  var animationID;
  var timeOutId;

  var tickCounter = 0; //for animating kakera
  var maxTick = 25; //max number for ticks to show kakera sprite
  var instructionTick = 0; //showing instructions counter
  var that = this;

  this.init = function(levelMaps, level) {
    height = 480;
    maxWidth = 0;
    viewPort = 1280;
    tileSize = 32;
    translatedDist = 0;
    goombas = [];
    powerUps = [];
    bullets = [];

    gameUI.setWidth(viewPort);
    gameUI.setHeight(height);
    gameUI.show();

    currentLevel = level;
    originalMaps = levelMaps;
    map = JSON.parse(levelMaps[currentLevel]);

    if (!score) {
      //so that when level changes, it uses the same instance
      score = new Score();
      score.init();
    }
    score.displayScore();
    score.updateLevelNum(currentLevel);

    if (!kakera) {
      //so that when level changes, it uses the same instance
      kakera = new Kakera();
      kakera.init();
    } else {
      kakera.x = 10;
      kakera.frame = 0;
    }
    element = new Element();
    gameSound = new GameSound();
    gameSound.init();

    that.calculateMaxWidth();
    that.bindKeyPress();
    that.startGame();
  };

  that.calculateMaxWidth = function() {
    //calculates the max width of the game according to map size
    for (var row = 0; row < map.length; row++) {
      for (var column = 0; column < map[row].length; column++) {
        if (maxWidth < map[row].length * 32) {
          maxWidth = map[column].length * 32;
        }
      }
    }
  };

  that.bindKeyPress = function() {
    var canvas = gameUI.getCanvas(); //for use with touch events

    //key binding
    document.body.addEventListener('keydown', function(e) {
      keys[e.keyCode] = true;
    });

    document.body.addEventListener('keyup', function(e) {
      keys[e.keyCode] = false;
    });

    //key binding for touch events
    canvas.addEventListener('touchstart', function(e) {
      var touches = e.changedTouches;
      e.preventDefault();

      for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX <= 200) {
          keys[37] = true; //left arrow
        }
        if (touches[i].pageX > 200 && touches[i].pageX < 400) {
          keys[39] = true; //right arrow
        }
        if (touches[i].pageX > 640 && touches[i].pageX <= 1080) {
          //in touch events, same area acts as sprint and bullet key
          keys[16] = true; //shift key
          keys[17] = true; //ctrl key
        }
        if (touches[i].pageX > 1080 && touches[i].pageX < 1280) {
          keys[32] = true; //space
        }
      }
    });

    canvas.addEventListener('touchend', function(e) {
      var touches = e.changedTouches;
      e.preventDefault();

      for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX <= 200) {
          keys[37] = false;
        }
        if (touches[i].pageX > 200 && touches[i].pageX <= 640) {
          keys[39] = false;
        }
        if (touches[i].pageX > 640 && touches[i].pageX <= 1080) {
          keys[16] = false;
          keys[17] = false;
        }
        if (touches[i].pageX > 1080 && touches[i].pageX < 1280) {
          keys[32] = false;
        }
      }
    });

    canvas.addEventListener('touchmove', function(e) {
      var touches = e.changedTouches;
      e.preventDefault();

      for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX <= 200) {
          keys[37] = true;
          keys[39] = false;
        }
        if (touches[i].pageX > 200 && touches[i].pageX < 400) {
          keys[39] = true;
          keys[37] = false;
        }
        if (touches[i].pageX > 640 && touches[i].pageX <= 1080) {
          keys[16] = true;
          keys[32] = false;
        }
        if (touches[i].pageX > 1080 && touches[i].pageX < 1280) {
          keys[32] = true;
          keys[16] = false;
          keys[17] = false;
        }
      }
    });
  };

  //Main Game Loop
  this.startGame = function() {
    animationID = window.requestAnimationFrame(that.startGame);

    gameUI.clear(0, 0, maxWidth, height);

    that.renderMap();

    for (var i = 0; i < powerUps.length; i++) {
      powerUps[i].draw();
      powerUps[i].update();
    }

    for (var i = 0; i < bullets.length; i++) {
      bullets[i].draw();
      bullets[i].update();
    }

    for (var i = 0; i < goombas.length; i++) {
      goombas[i].draw();
      goombas[i].update();
    }

    that.checkPowerUpKakeraCollision();
    that.checkBulletEnemyCollision();
    that.checkEnemyKakeraCollision();

    kakera.draw();
    that.updateKakera();
    that.wallCollision();
    kakeraInGround = kakera.grounded; //for use with flag sliding
  };

  this.renderMap = function() {
    //setting false each time the map renders so that elements fall off a platform and not hover around
    kakera.grounded = false;

    for (var i = 0; i < powerUps.length; i++) {
      powerUps[i].grounded = false;
    }
    for (var i = 0; i < goombas.length; i++) {
      goombas[i].grounded = false;
    }

    for (var row = 0; row < map.length; row++) {
      for (var column = 0; column < map[row].length; column++) {
        switch (map[row][column]) {
          case 1: //platform
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.platform();
            element.draw();

            that.checkElementKakeraCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 2: //coinBox
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.coinBox();
            element.draw();

            that.checkElementKakeraCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 3: //powerUp Box
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.powerUpBox();
            element.draw();

            that.checkElementKakeraCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 4: //uselessBox
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.uselessBox();
            element.draw();

            that.checkElementKakeraCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 5: //flagPole
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.flagPole();
            element.draw();

            that.checkElementKakeraCollision(element, row, column);
            break;

          case 6: //flag
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.flag();
            element.draw();
            break;

          case 7: //pipeLeft
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeLeft();
            element.draw();

            that.checkElementKakeraCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 8: //pipeRight
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeRight();
            element.draw();

            that.checkElementKakeraCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 9: //pipeTopLeft
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeTopLeft();
            element.draw();

            that.checkElementKakeraCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 10: //pipeTopRight
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeTopRight();
            element.draw();

            that.checkElementKakeraCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 20: //goomba
            var enemy = new Enemy();
            enemy.x = column * tileSize;
            enemy.y = row * tileSize;
            enemy.goomba();
            enemy.draw();

            goombas.push(enemy);
            map[row][column] = 0;
        }
      }
    }
  };

  this.collisionCheck = function(objA, objB) {
    // get the vectors to check against
    var vX = objA.x + objA.width / 2 - (objB.x + objB.width / 2);
    var vY = objA.y + objA.height / 2 - (objB.y + objB.height / 2);

    // add the half widths and half heights of the objects
    var hWidths = objA.width / 2 + objB.width / 2;
    var hHeights = objA.height / 2 + objB.height / 2;
    var collisionDirection = null;

    // if the x and y vector are less than the half width or half height, then we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
      // figures out on which side we are colliding (top, bottom, left, or right)
      var offsetX = hWidths - Math.abs(vX);
      var offsetY = hHeights - Math.abs(vY);

      if (offsetX >= offsetY) {
        if (vY > 0 && vY < 37) {
          collisionDirection = 't';
          if (objB.type != 5) {
            //if flagpole then pass through it
            objA.y += offsetY;
          }
        } else if (vY < 0) {
          collisionDirection = 'b';
          if (objB.type != 5) {
            //if flagpole then pass through it
            objA.y -= offsetY;
          }
        }
      } else {
        if (vX > 0) {
          collisionDirection = 'l';
          objA.x += offsetX;
        } else {
          collisionDirection = 'r';
          objA.x -= offsetX;
        }
      }
    }
    return collisionDirection;
  };

  this.checkElementKakeraCollision = function(element, row, column) {
    var collisionDirection = that.collisionCheck(kakera, element);

    if (collisionDirection == 'l' || collisionDirection == 'r') {
      kakera.velX = 0;
      kakera.jumping = false;

      if (element.type == 5) {
        //flag pole
        that.levelFinish(collisionDirection);
      }
    } else if (collisionDirection == 'b') {
      if (element.type != 5) {
        //only if not flag pole
        kakera.grounded = true;
        kakera.jumping = false;
      }
    } else if (collisionDirection == 't') {
      if (element.type != 5) {
        kakera.velY *= -1;
      }

      if (element.type == 3) {
        //PowerUp Box
        var powerUp = new PowerUp();

        //gives mushroom if kakera is small, otherwise gives flower
        if (kakera.type == 'small') {
          powerUp.mushroom(element.x, element.y);
          powerUps.push(powerUp);
        } else {
          powerUp.flower(element.x, element.y);
          powerUps.push(powerUp);
        }

        map[row][column] = 4; //sets to useless box after powerUp appears

        //sound when mushroom appears
        gameSound.play('powerUpAppear');
      }

      if (element.type == 11) {
        //Flower Box
        var powerUp = new PowerUp();
        powerUp.flower(element.x, element.y);
        powerUps.push(powerUp);

        map[row][column] = 4; //sets to useless box after powerUp appears

        //sound when flower appears
        gameSound.play('powerUpAppear');
      }

      if (element.type == 2) {
        //Coin Box
        score.coinScore++;
        score.totalScore += 100;

        score.updateCoinScore();
        score.updateTotalScore();
        map[row][column] = 4; //sets to useless box after coin appears

        //sound when coin block is hit
        gameSound.play('coin');
      }
    }
  };

  this.checkElementPowerUpCollision = function(element) {
    for (var i = 0; i < powerUps.length; i++) {
      var collisionDirection = that.collisionCheck(powerUps[i], element);

      if (collisionDirection == 'l' || collisionDirection == 'r') {
        powerUps[i].velX *= -1; //change direction if collision with any element from the sidr
      } else if (collisionDirection == 'b') {
        powerUps[i].grounded = true;
      }
    }
  };

  this.checkElementEnemyCollision = function(element) {
    for (var i = 0; i < goombas.length; i++) {
      if (goombas[i].state != 'deadFromBullet') {
        //so that goombas fall from the map when dead from bullet
        var collisionDirection = that.collisionCheck(goombas[i], element);

        if (collisionDirection == 'l' || collisionDirection == 'r') {
          goombas[i].velX *= -1;
        } else if (collisionDirection == 'b') {
          goombas[i].grounded = true;
        }
      }
    }
  };

  this.checkElementBulletCollision = function(element) {
    for (var i = 0; i < bullets.length; i++) {
      var collisionDirection = that.collisionCheck(bullets[i], element);

      if (collisionDirection == 'b') {
        //if collision is from bottom of the bullet, it is grounded, so that it can be bounced
        bullets[i].grounded = true;
      } else if (collisionDirection == 't' || collisionDirection == 'l' || collisionDirection == 'r') {
        bullets.splice(i, 1);
      }
    }
  };

  this.checkPowerUpKakeraCollision = function() {
    for (var i = 0; i < powerUps.length; i++) {
      var collWithKakera = that.collisionCheck(powerUps[i], kakera);
      if (collWithKakera) {
        if (powerUps[i].type == 30 && kakera.type == 'small') {
          //mushroom
          kakera.type = 'big';
        } else if (powerUps[i].type == 31) {
          //flower
          kakera.type = 'fire';
        }
        powerUps.splice(i, 1);

        score.totalScore += 1000;
        score.updateTotalScore();

        //sound when mushroom appears
        gameSound.play('powerUp');
      }
    }
  };

  this.checkEnemyKakeraCollision = function() {
    for (var i = 0; i < goombas.length; i++) {
      if (!kakera.invulnerable && goombas[i].state != 'dead' && goombas[i].state != 'deadFromBullet') {
        //if kakera is invulnerable or goombas state is dead, collision doesnt occur
        var collWithKakera = that.collisionCheck(goombas[i], kakera);

        if (collWithKakera == 't') {
          //kill goombas if collision is from top
          goombas[i].state = 'dead';

          kakera.velY = -kakera.speed;

          score.totalScore += 1000;
          score.updateTotalScore();

          //sound when enemy dies
          gameSound.play('killEnemy');
        } else if (collWithKakera == 'r' || collWithKakera == 'l' || collWithKakera == 'b') {
          goombas[i].velX *= -1;

          if (kakera.type == 'big') {
            kakera.type = 'small';
            kakera.invulnerable = true;
            collWithKakera = undefined;

            //sound when kakera powerDowns
            gameSound.play('powerDown');

            setTimeout(function() {
              kakera.invulnerable = false;
            }, 1000);
          } else if (kakera.type == 'fire') {
            kakera.type = 'big';
            kakera.invulnerable = true;

            collWithKakera = undefined;

            //sound when kakera powerDowns
            gameSound.play('powerDown');

            setTimeout(function() {
              kakera.invulnerable = false;
            }, 1000);
          } else if (kakera.type == 'small') {
            //kill kakera if collision occurs when he is small
            that.pauseGame();

            kakera.frame = 13;
            collWithKakera = undefined;

            score.lifeCount--;
            score.updateLifeCount();

            //sound when kakera dies
            gameSound.play('kakeraDie');

            timeOutId = setTimeout(function() {
              if (score.lifeCount == 0) {
                that.gameOver();
              } else {
                that.resetGame();
              }
            }, 3000);
            break;
          }
        }
      }
    }
  };

  this.checkBulletEnemyCollision = function() {
    for (var i = 0; i < goombas.length; i++) {
      for (var j = 0; j < bullets.length; j++) {
        if (goombas[i] && goombas[i].state != 'dead') {
          //check for collision only if goombas exist and is not dead
          var collWithBullet = that.collisionCheck(goombas[i], bullets[j]);
        }

        if (collWithBullet) {
          bullets[j] = null;
          bullets.splice(j, 1);

          goombas[i].state = 'deadFromBullet';

          score.totalScore += 1000;
          score.updateTotalScore();

          //sound when enemy dies
          gameSound.play('killEnemy');
        }
      }
    }
  };

  this.wallCollision = function() {
    //for walls (vieport walls)
    if (kakera.x >= maxWidth - kakera.width) {
      kakera.x = maxWidth - kakera.width;
    } else if (kakera.x <= translatedDist) {
      kakera.x = translatedDist + 1;
    }

    //for ground (viewport ground)
    if (kakera.y >= height) {
      that.pauseGame();

      //sound when kakera dies
      gameSound.play('kakeraDie');

      score.lifeCount--;
      score.updateLifeCount();

      timeOutId = setTimeout(function() {
        if (score.lifeCount == 0) {
          that.gameOver();
        } else {
          that.resetGame();
        }
      }, 3000);
    }
  };

  //controlling kakera with key events
  this.updateKakera = function() {
    var friction = 0.9;
    var gravity = 0.2;

    kakera.checkKakeraType();

    if (keys[38] || keys[32]) {
      //up arrow
      if (!kakera.jumping && kakera.grounded) {
        kakera.jumping = true;
        kakera.grounded = false;
        kakera.velY = -(kakera.speed / 2 + 5.5);

        // kakera sprite position
        if (kakera.frame == 0 || kakera.frame == 1) {
          kakera.frame = 3; //right jump
        } else if (kakera.frame == 8 || kakera.frame == 9) {
          kakera.frame = 2; //left jump
        }

        //sound when kakera jumps
        gameSound.play('jump');
      }
    }

    if (keys[39]) {
      //right arrow
      that.checkKakeraPos(); //if kakera goes to the center of the screen, sidescroll the map

      if (kakera.velX < kakera.speed) {
        kakera.velX++;
      }

      //kakera sprite position
      if (!kakera.jumping) {
        tickCounter += 1;

        if (tickCounter > maxTick / kakera.speed) {
          tickCounter = 0;

          if (kakera.frame != 1) {
            kakera.frame = 1;
          } else {
            kakera.frame = 0;
          }
        }
      }
    }

    if (keys[37]) {
      //left arrow
      if (kakera.velX > -kakera.speed) {
        kakera.velX--;
      }

      //kakera sprite position
      if (!kakera.jumping) {
        tickCounter += 1;

        if (tickCounter > maxTick / kakera.speed) {
          tickCounter = 0;

          if (kakera.frame != 9) {
            kakera.frame = 9;
          } else {
            kakera.frame = 8;
          }
        }
      }
    }

    if (keys[16]) {
      //shift key
      kakera.speed = 4.5;
    } else {
      kakera.speed = 3;
    }

    if (keys[17] && kakera.type == 'fire') {
      //ctrl key
      if (!bulletFlag) {
        bulletFlag = true;
        var bullet = new Bullet();
        if (kakera.frame == 9 || kakera.frame == 8 || kakera.frame == 2) {
          var direction = -1;
        } else {
          var direction = 1;
        }
        bullet.init(kakera.x, kakera.y, direction);
        bullets.push(bullet);

        //bullet sound
        gameSound.play('bullet');

        setTimeout(function() {
          bulletFlag = false; //only lets kakera fire bullet after 500ms
        }, 500);
      }
    }

    //velocity 0 sprite position
    if (kakera.velX > 0 && kakera.velX < 1 && !kakera.jumping) {
      kakera.frame = 0;
    } else if (kakera.velX > -1 && kakera.velX < 0 && !kakera.jumping) {
      kakera.frame = 8;
    }

    if (kakera.grounded) {
      kakera.velY = 0;

      //grounded sprite position
      if (kakera.frame == 3) {
        kakera.frame = 0; //looking right
      } else if (kakera.frame == 2) {
        kakera.frame = 8; //looking left
      }
    }

    //change kakera position
    kakera.velX *= friction;
    kakera.velY += gravity;

    kakera.x += kakera.velX;
    kakera.y += kakera.velY;
  };

  this.checkKakeraPos = function() {
    centerPos = translatedDist + viewPort / 2;

    //side scrolling as kakera reaches center of the viewPort
    if (kakera.x > centerPos && centerPos + viewPort / 2 < maxWidth) {
      gameUI.scrollWindow(-kakera.speed, 0);
      translatedDist += kakera.speed;
    }
  };

  this.levelFinish = function(collisionDirection) {
    //game finishes when kakera slides the flagPole and collides with the ground
    if (collisionDirection == 'r') {
      kakera.x += 10;
      kakera.velY = 2;
      kakera.frame = 11;
    } else if (collisionDirection == 'l') {
      kakera.x -= 32;
      kakera.velY = 2;
      kakera.frame = 10;
    }

    if (kakeraInGround) {
      kakera.x += 20;
      kakera.frame = 10;
      tickCounter += 1;
      if (tickCounter > maxTick) {
        that.pauseGame();

        kakera.x += 10;
        tickCounter = 0;
        kakera.frame = 12;

        //sound when stage clears
        gameSound.play('stageClear');

        timeOutId = setTimeout(function() {
          console.log(currentLevel);
          currentLevel++;
          if (originalMaps[currentLevel]) {
            that.init(originalMaps, currentLevel);
            score.updateLevelNum(currentLevel);
          } else if (currentLevel == "6") {
            console.log("clear");
            that.gameClear();
          } else {
            that.gameOver();
          }
        }, 5000);
      }
    }
  };

  this.pauseGame = function() {
    window.cancelAnimationFrame(animationID);
  };

  this.gameClear = function() {
    score.gameClearView();
    gameUI.makeBox(0, 0, maxWidth, height);
    gameUI.writeText('CLEAR', centerPos - 60, height - 300);
    gameUI.writeText('Thanks For Playing', centerPos - 122, height / 2);
  };

  this.gameOver = function() {
    score.gameOverView();
    gameUI.makeBox(0, 0, maxWidth, height);
    gameUI.writeText('Game Over', centerPos - 80, height - 300);
    gameUI.writeText('Thanks For Playing', centerPos - 122, height / 2);
  };

  this.resetGame = function() {
    that.clearInstances();
    that.init(originalMaps, currentLevel);
  };

  this.clearInstances = function() {
    kakera = null;
    element = null;
    gameSound = null;

    goombas = [];
    bullets = [];
    powerUps = [];
  };

  this.clearTimeOut = function() {
    clearTimeout(timeOutId);
  };

  this.removeGameScreen = function() {
    gameUI.hide();

    if (score) {
      score.hideScore();
    }
  };

  this.showGameScreen = function() {
    gameUI.show();
  };
}
