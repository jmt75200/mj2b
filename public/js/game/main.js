Game = {
  stage: new PIXI.Container(),
  zones: {}
};

Game.SETTINGS = {
  backgroundColor: 0x1099bb,
  canvasWidth: 1100,
  canvasHeight: 700,
  numLanes: 5,
  numZonesPerLane: 8,
  playerOneZoneColor: 0xEDEFF5,
  playerTwoZoneColor: 0x4A565D,
  botMode: true,
  laneScoring: [-10, 1, -6, 3, -3, 6, -1, 10],
};

Game.VIEWPORT = {
  sizePerStep: 1,
}

Game.STATE = new GameState();

Game.renderer = PIXI.autoDetectRenderer(Game.SETTINGS.canvasWidth, Game.SETTINGS.canvasWidth,{
  backgroundColor: Game.SETTINGS.backgroundColor
});

Game.init = function init(numLanes) {
  document.body.appendChild(Game.renderer.view);

  var numLanes = numLanes || Game.SETTINGS.numLanes;
  var laneWidth = Game.SETTINGS.canvasHeight / numLanes;

  var zone1 = Game.SETTINGS.playerOneZoneColor;
  var zone2 = Game.SETTINGS.playerTwoZoneColor;
  var zoneHeight = Game.SETTINGS.canvasWidth / Game.SETTINGS.numZonesPerLane;
  var zoneColor = null;
  var zoneTemp = null;

  var numSteps = 80;
  var verticalOffset = 0;
  Game.VIEWPORT.zoneHeight = zoneHeight;
  Game.VIEWPORT.sizePerStep = (Game.SETTINGS.canvasWidth - verticalOffset)/numSteps;

  Game.SETTINGS.cpuDifficulty = 0;

  for (var i = 0; i < numLanes; i++) {
    for (var k = 0; k < Game.SETTINGS.numZonesPerLane; k++) {
      if (k % 2 === 0) {
        zoneColor = zone1;
      } else {
        zoneColor = zone2;
      }

      var zone = new PIXI.Graphics();
      zone.beginFill(zoneColor);
      zone.drawRect(k * zoneHeight, i * laneWidth, zoneHeight, laneWidth);

      Game.zones['l' + i + 'z' + k] = zone; // "lane 0 zone 0"
      Game.stage.addChild(zone);
    }

    zoneTemp = zone1;
    zone1 = zone2;
    zone2 = zoneTemp;
  }

  var xStartingPos = Game.SETTINGS.canvasWidth / 2;
  var yStartingPos = 0;

  for (var i = 0; i < numLanes; i++) {
    var lane = new PIXI.Container();

    var hero = PIXI.Sprite.fromImage('assets/heroes/bunny.png');
    hero.anchor.set(0.5, 0.5);
    hero.scale.set(0.3, 0.3);

    yStartingPos = (laneWidth / 2) + (i * laneWidth);

    hero.position.set(xStartingPos, yStartingPos);
    lane.addChild(hero);

    PlayerOne.heroes.push(hero);
    PlayerOne.lanes.push(lane);

    Game.stage.addChild(lane);
  }

  Keys.init();
};

Game.loop = function loop() {
  Game.STATE.frame++;

  requestAnimationFrame(Game.loop);

  PlayerOne.heroes.forEach(function(hero, i) {
    hero.position.x -= (Game.SETTINGS.cpuDifficulty/60 * Game.VIEWPORT.sizePerStep);

    if (hero.position.x >= Game.SETTINGS.canvasWidth) {
      hero.position.x = Game.SETTINGS.canvasWidth;
    }
    if (hero.position.x < 0) {
      hero.position.x = 0;
    }

    // score the current lane
    var zone = Math.floor(hero.position.x / Game.VIEWPORT.zoneHeight);
    if (Game.SETTINGS.laneScoring[zone] > 0) {
      Game.STATE.score[0] += Game.SETTINGS.laneScoring[zone]/60.0
    }
    else {
      Game.STATE.score[1] -= Game.SETTINGS.laneScoring[zone]/60.0
    }

//    Game.STATE.lanes[i] = hero.position.x
  });

  // document.getElementById("p1score").innerHTML = Game.STATE.score[0];
  // document.getElementById("p2score").innerHTML = Game.STATE.score[1];

  if ((Game.STATE.frame % 60) == 0) {
    socket.emit('update state', JSON.stringify(Game.STATE) );
    Game.STATE.deltas = [0,0,0,0,0,0,0,0];
  }


  Game.renderer.render(Game.stage);
};

Game.init();
Game.loop();
