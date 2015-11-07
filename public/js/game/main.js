Game = {
  stage: new PIXI.Container()
};

Game.SETTINGS = {
  backgroundColor: 0x1099bb,
  canvasWidth: 800,
  canvasHeight: 600,
  numLanes: 5,
  numZonesPerLane: 8,
  playerOneZoneColor: 0xEDEFF5,
  playerTwoZoneColor: 0x4A565D
};

Game.renderer = PIXI.autoDetectRenderer(Game.SETTINGS.canvasWidth, Game.SETTINGS.canvasHeight,{
  backgroundColor: Game.SETTINGS.backgroundColor
});

Game.init = function init(numLanes) {
  document.body.appendChild(Game.renderer.view);

  var numLanes = numLanes || Game.SETTINGS.numLanes;
  var laneWidth = Game.SETTINGS.canvasWidth / numLanes;

  var graphics = new PIXI.Graphics();
  var zone1 = Game.SETTINGS.playerOneZoneColor;
  var zone2 = Game.SETTINGS.playerTwoZoneColor;
  var zoneHeight = Game.SETTINGS.canvasHeight / Game.SETTINGS.numZonesPerLane;
  var zoneColor = null;
  var zoneTemp = null;

  for (var i = 0; i < numLanes; i++) {
    for (var k = 0; k < Game.SETTINGS.numZonesPerLane; k++) {
      if (k % 2 === 0) {
        zoneColor = zone1;
      } else {
        zoneColor = zone2;
      }

      graphics.beginFill(zoneColor);
      graphics.drawRect(i * laneWidth, k * zoneHeight, laneWidth, zoneHeight);
    }

    zoneTemp = zone1;
    zone1 = zone2;
    zone2 = zoneTemp;
  }

  Game.stage.addChild(graphics);

  var xStartingPos = 0;
  var yStartingPos = Game.SETTINGS.canvasHeight / 2;

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

  Keys.init();
};

Game.loop = function loop() {
  requestAnimationFrame(Game.loop);

  PlayerOne.heroes.forEach(function(hero) {
    hero.position.y += 1;

    if (hero.position.y === Game.SETTINGS.canvasHeight) {
      hero.position.y = 0;
    }
  });

  Game.renderer.render(Game.stage);
};

Game.init();
Game.loop();
