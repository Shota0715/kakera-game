function GameSound() {
  var coin;
  var powerUpAppear;
  var powerUp;
  var kakeraDie;
  var killEnemy;
  var stageClear;
  var bullet;
  var powerDown;
  var jump;
  var bgm;

  var that = this;

  this.init = function() {
    coin = new Audio('sounds/coin.mp3');
    powerUpAppear = new Audio('sounds/power-up-appear.mp3');
    powerUp = new Audio('sounds/power-up.mp3');
    kakeraDie = new Audio('sounds/die.mp3');
    killEnemy = new Audio('sounds/kill-enemy.mp3');
    stageClear = new Audio('sounds/stage-clear.mp3');
    bullet = new Audio('sounds/bullet.mp3');
    powerDown = new Audio('sounds/power-down.mp3');
    jump = new Audio('sounds/jump.mp3');
    bgm = new Audio('sounds/Trick_or_Treat.mp3');
  };

  this.play = function(element) {
    if (element == 'coin') {
      coin.pause();
      coin.currentTime = 0;
      coin.play();
    } else if (element == 'powerUpAppear') {
      powerUpAppear.pause();
      powerUpAppear.currentTime = 0;
      powerUpAppear.play();
    } else if (element == 'powerUp') {
      powerUp.pause();
      powerUp.currentTime = 0;
      powerUp.play();
    } else if (element == 'kakeraDie') {
      kakeraDie.pause();
      kakeraDie.currentTime = 0;
      kakeraDie.play();
    } else if (element == 'killEnemy') {
      killEnemy.pause();
      killEnemy.currentTime = 0;
      killEnemy.play();
    } else if (element == 'stageClear') {
      stageClear.pause();
      stageClear.currentTime = 0;
      stageClear.play();
    } else if (element == 'bullet') {
      bullet.pause();
      bullet.currentTime = 0;
      bullet.play();
    } else if (element == 'powerDown') {
      powerDown.pause();
      powerDown.currentTime = 0;
      powerDown.play();
    } else if (element == 'jump') {
      jump.pause();
      jump.currentTime = 0;
      jump.play();
    } else if (element == 'bgm') {
      bgm.pause();
      bgm.currentTime = 0;
      bgm.play();
    }
  };

  this.stop = function(element) {
    if (element == 'coin') {
      coin.pause();
      coin.currentTime = 0;
    } else if (element == 'powerUpAppear') {
      powerUpAppear.pause();
      powerUpAppear.currentTime = 0;
    } else if (element == 'powerUp') {
      powerUp.pause();
      powerUp.currentTime = 0;
    } else if (element == 'kakeraDie') {
      kakeraDie.pause();
      kakeraDie.currentTime = 0;
    } else if (element == 'killEnemy') {
      killEnemy.pause();
      killEnemy.currentTime = 0;
    } else if (element == 'stageClear') {
      stageClear.pause();
      stageClear.currentTime = 0;
    } else if (element == 'bullet') {
      bullet.pause();
      bullet.currentTime = 0;
    } else if (element == 'powerDown') {
      powerDown.pause();
      powerDown.currentTime = 0;
    } else if (element == 'jump') {
      jump.pause();
      jump.currentTime = 0;
    } else if (element == 'bgm') {
      bgm.pause();
      bgm.currentTime = 0;
    }
  };
}
