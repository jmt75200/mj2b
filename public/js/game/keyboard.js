Keys = {};

Keys.SETTINGS = {
  lane1: 65, // a
  lane2: 83, // s
  lane3: 68, // d
  lane4: 70, // f
  lane5: 74, // j
  lane6: 75, // k
  lane7: 76, // l
  lane8: 186 // ;
};

Keys.keyboard = function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;

  key.downHandler = function(evt) {
    if (evt.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    evt.preventDefault();
  };

  key.upHandler = function(evt) {
    if (evt.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    evt.preventDefault();
  };

  window.addEventListener('keydown', key.downHandler.bind(key), false);
  window.addEventListener('keyup', key.upHandler.bind(key), false);

  return key;
};

Keys.init = function init(keyCodes) {
  var keys = keyCodes || [
    Keys.SETTINGS.lane1,
    Keys.SETTINGS.lane2,
    Keys.SETTINGS.lane3,
    Keys.SETTINGS.lane4,
    Keys.SETTINGS.lane5,
  ];

  var keyHandler = [];

  for (var lane = 0; lane < keys.length; lane++) {
    keyHandler[lane] = Keys.keyboard(keys[lane]);

    var moveHero = function() {
      var laneCopy = lane; // Closure and var are necessary

      keyHandler[laneCopy].press = function() {
        var hero = PlayerOne.heroes[laneCopy];
        var step = Game.VIEWPORT.sizePerStep;
        var staminaOffset = 0;
        // var halfwayThreshold = Game.SETTINGS.staminaThreshold / 2;
        // var threeFourthsThreshold = halfwayThreshold + (Game.SETTINGS.staminaThreshold / 4);

        hero.stamina += 5;

        // at max, halt the hero
        if (hero.stamina >= Game.SETTINGS.staminaThreshold) {
          staminaOffset = step;
          hero.stamina = 100;
        } else {
          staminaOffset = hero.stamina/step;
        }
        // // at 3/4 stamina capacity, subtract 50% of the step
        // else if (hero.stamina >= threeFourthsThreshold) {
        //   staminaOffset = step * 0.50;
        // }
        // // at halfway capacity, subtract 20% of the step
        // else if (hero.stamina >= halfwayThreshold) {
        //   staminaOffset = step * 0.20;
        // }

        hero.sprite.position.x += Game.STATE.team * (step - staminaOffset);
        Game.STATE.deltas[laneCopy] += (step - staminaOffset)/step;

        console.log('stamina', hero.stamina);
        console.log('offset: ' + staminaOffset + '; step size:', Game.STATE.team * (step - staminaOffset));
      };
    };

    moveHero();
  }
};
