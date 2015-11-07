Game = {
  stage: new PIXI.Container()
};

Game.SETTINGS = {
  backgroundColor: 0x1099bb,
  canvasWidth: 800,
  canvasHeight: 600,
  numLanes: 5
};

Game.renderer = PIXI.autoDetectRenderer(Game.SETTINGS.canvasWidth, Game.SETTINGS.canvasHeight,{
  backgroundColor: Game.SETTINGS.backgroundColor
});

Game.init = function(numLanes) {
  document.body.appendChild(Game.renderer.view);

  var numLanes = numLanes || Game.SETTINGS.numLanes;

  var xStartingPos = 0;
  var yStartingPos = Game.SETTINGS.canvasHeight / 2;
  var laneWidth = Game.SETTINGS.canvasWidth / numLanes;

  for (var i = 0; i < numLanes; i++) {
    var lane = new PIXI.Container();

    var hero = PIXI.Sprite.fromImage('assets/heroes/bunny.png');
    hero.anchor.set(0.5, 0.5);
    hero.scale.set(0.3, 0.3);

    xStartingPos = (laneWidth / 2) + (i * laneWidth);

    hero.position.set(xStartingPos, yStartingPos);
    lane.addChild(hero);

    PlayerOne.heroes.push(hero);
    PlayerOne.lanes.push(lane);

    Game.stage.addChild(lane);
  }

  setupKeyboard();
};

Game.loop = function() {
  requestAnimationFrame(Game.loop);

  PlayerOne.heroes.forEach(function(hero) {
    // hero.position.y += 1;

    if (hero.position.y === Game.SETTINGS.canvasHeight) {
      hero.position.y = 0;
    }
  });

  Game.renderer.render(Game.stage);
};

Game.init();
Game.loop();
