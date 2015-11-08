Game = {
  stage: new PIXI.Container(),
  zones: {},
  scoreA: new PIXI.Text('9990'),
  scoreB: new PIXI.Text('9990', {align: 'right'}),
  loopCounter: 0
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
  staminaThreshold: 100,
  improveStaminaCounter: 60, // decrease stamina once per second
  improveStaminaAmount: 10, // decrease stamina by 10
  // scores for each zone, index 0 to 7
  playerOneLaneScores: [0, 1, 0, 3, 0, 6, 0, 10], // moving right
  playerTwoLaneScores: [10, 0, 6, 0, 3, 0, 1, 0] // moving left
  // playerOneLaneScores: [-10, 1, -6, 3, -3, 6, -1, 10], // moving right
  // playerTwoLaneScores: [10, -1, 6, -3, 3, -6, 1, -10] // moving left
};

Game.VIEWPORT = {
  sizePerStep: 1,
}

Game.STATE = new GameState();

Game.renderer = PIXI.autoDetectRenderer(Game.SETTINGS.canvasWidth, Game.SETTINGS.canvasHeight,{
  backgroundColor: Game.SETTINGS.backgroundColor
});

Game.init = function init(numLanes) {
  document.body.appendChild(Game.renderer.view);

  var numLanes = numLanes || Game.SETTINGS.numLanes;
  var laneHeight = Game.SETTINGS.canvasHeight / numLanes;

  var zone1 = Game.SETTINGS.playerOneZoneColor;
  var zone2 = Game.SETTINGS.playerTwoZoneColor;
  var zoneWidth = Game.SETTINGS.canvasWidth / Game.SETTINGS.numZonesPerLane;
  var zoneColor = null;
  var zoneTemp = null;

  var numSteps = 40;
  var verticalOffset = 0;
  Game.VIEWPORT.zoneWidth = zoneWidth;
  Game.VIEWPORT.sizePerStep = (Game.SETTINGS.canvasWidth - verticalOffset)/numSteps;

  Game.SETTINGS.cpuDifficulty = 0;

  var mountain = PIXI.Sprite.fromImage("assets/background.png");
  mountain.anchor.set(0,0);
  mountain.position.set(0,-80);
  Game.stage.addChild(mountain);

  Game.stage.addChild(Game.scoreA);
  Game.scoreA.position.set(50, 50);
  Game.scoreA.anchor.set(0, 0.5);
  Game.stage.addChild(Game.scoreB);
  Game.scoreB.position.set(Game.SETTINGS.canvasWidth, 50);
  Game.scoreB.anchor.set(1, 0.5);


  for (var i = 0; i < numLanes; i++) {
    for (var k = 0; k < Game.SETTINGS.numZonesPerLane; k++) {
      if (k % 2 === 0) {
        zoneColor = zone1;
      } else {
        zoneColor = zone2;
      }

      var zone = new PIXI.Graphics();
      zone.beginFill(zoneColor,0.1);
      zone.drawRect(k * zoneWidth, i * laneHeight, zoneWidth, laneHeight);
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

    var heroImage;
    switch( i ){
      case 0: heroImage = 'assets/heroes/gunner.png';
      break;
      case 1: heroImage = 'assets/heroes/test.png';
      break;
      case 2: heroImage = 'assets/heroes/wizzard.png';
      break;
      case 3: heroImage = 'assets/heroes/swordsmen.png';
      break;
      case 4: heroImage = 'assets/heroes/gunner.png';
      break;
      default: heroImage = 'assets/heroes/bunny.png';
    }

    var hero = PIXI.Sprite.fromImage( heroImage );
    hero.lock = false; // LANE LOCK VARIABLE
    hero.anchor.set(0.5, 0.35);
    hero.scale.set(0.9, 0.9);
    yStartingPos = (laneHeight / 2) + (i * laneHeight);

    hero.position.set(xStartingPos, yStartingPos);
    lane.addChild(hero);

    PlayerOne.heroes.push(new Hero(hero));
    PlayerOne.lanes.push(lane);

    Game.stage.addChild(lane);
  }

  Keys.init();
};

Game.loop = function loop() {
  Game.STATE.frame++;

  requestAnimationFrame(Game.loop);

  Game.loopCounter++;

  PlayerOne.heroes.forEach(function(hero, i) {
    if (Game.loopCounter === Game.SETTINGS.improveStaminaCounter) {
      hero.stamina -= Game.SETTINGS.improveStaminaAmount;
      if (hero.stamina < 0) {
        hero.stamina = 0;
      }
    }
    hero.sprite.position.x -= (Game.SETTINGS.cpuDifficulty/60 * Game.VIEWPORT.sizePerStep);

    if (hero.sprite.position.x >= Game.SETTINGS.canvasWidth) {
      hero.sprite.position.x = Game.SETTINGS.canvasWidth;
    }
    if (hero.sprite.position.x < 0) {
      hero.sprite.position.x = 0;
    }

    freezeLane(hero);

    // score the current lane
    var zone = Math.floor(hero.sprite.position.x / Game.VIEWPORT.zoneWidth);
    var now = Date.now();

    // on the next frame, if hero is still in the same zone, check the time spent in the zone
    if (hero.currentZone === zone && hero.currentZone === hero.previousZone) {
      var timeSpentInZone = now - hero.currentZoneTimeLastPolled;

      if (timeSpentInZone >= 3000) { // 3000 ms = 3 s
        // hero.score += Game.SETTINGS.playerOneLaneScores[zone];
        if( isNaN((Game.SETTINGS.playerOneLaneScores[zone])) ){
          Game.SETTINGS.playerOneLaneScores[zone] = 0;
        }
        if( isNaN((Game.SETTINGS.playerTwoLaneScores[zone])) ){
          Game.SETTINGS.playerTwoLaneScores[zone] = 0;
        }
        PlayerOne.totalScoreA += Game.SETTINGS.playerOneLaneScores[zone];
        PlayerOne.totalScoreB += Game.SETTINGS.playerTwoLaneScores[zone];

        hero.currentZoneTimeLastPolled = now; // reset zone entered time

        // console.log('A Hero ' + i + ' gained ' + Game.SETTINGS.playerOneLaneScores[zone] + ' points in zone ' + zone + ', hero score: ' + hero.score + '; total score: ' + PlayerOne.totalScoreA);
        // console.log('B Hero ' + i + ' gained ' + Game.SETTINGS.playerTwoLaneScores[zone] + ' points in zone ' + zone + ', hero score: ' + hero.score + '; total score: ' + PlayerOne.totalScoreB);
      }

      // currentZone and previousZone values remain the same
    } else {
      // hero has left the zone, so reset all values
      hero.previousZone = hero.currentZone;
      hero.currentZone = zone;
      hero.currentZoneTimeLastPolled = now;
    }
  });

  // document.getElementById("p1score").innerHTML = Game.STATE.score[0];
  // document.getElementById("p2score").innerHTML = Game.STATE.score[1];

  Game.scoreA.text = PlayerOne.totalScoreA.toString();
  Game.scoreB.text = PlayerOne.totalScoreB.toString();
  // Game.scoreB.text = Game.STATE.score[1];


  if ((Game.STATE.frame % 60) == 0) {
    socket.emit('update state', JSON.stringify(Game.STATE) );
    Game.STATE.deltas = [0,0,0,0,0,0,0,0];
  }

  if (Game.loopCounter > Game.SETTINGS.improveStaminaCounter) {
    Game.loopCounter = 0;
  }

  Game.renderer.render(Game.stage);
};

Game.init();
Game.loop();

function freezeLane( hero ){
  if ( hero.sprite.position.x >= Game.SETTINGS.canvasWidth || hero.sprite.position.x <= 0 ){
    hero.sprite.position.x = Game.SETTINGS.canvasWidth + 2000;
    hero.sprite.position.y = Game.SETTINGS.canvasWidth + 2000;
    // console.log('YOU HIT THE END');
  } else {
    // console.log('STILL OK');
  }
}