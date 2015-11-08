var styles = {
  font: 'bold 60px Arial',
  align: 'center',
  stroke: '#FFFFFF',
  strokeThickness: 6,
  dropShadow: true,
  dropShadowColor: '#455455',
  dropShadowAngle: 0,
  fill: '#fbb03b'
};

Game = {
  stage: new PIXI.Container(),
  zones: {},
  scoreA: new PIXI.Text('9990', styles),
  scoreB: new PIXI.Text('9990', styles),
  timerTxt: new PIXI.Text('-', styles),
  gameOverTxt: new PIXI.Text('', styles),
  loopCounter: 0
};

Game.SETTINGS = {
  backgroundColor: 0x1099bb,
  canvasWidth: 1200,
  canvasHeight: 800,
  // gameLength: 123, // for testing quick games
  gameLength: 7680, // seconds * 60 fps (5m5s)
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
  playerTwoLaneScores: [10, 0, 6, 0, 3, 0, 1, 0], // moving left
  // playerOneLaneScores: [-10, 1, -6, 3, -3, 6, -1, 10], // moving right
  // playerTwoLaneScores: [10, -1, 6, -3, 3, -6, 1, -10] // moving left

  numSteps: 40,
};

Game.VIEWPORT = {
  sizePerStep: 1,
};

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

  var numSteps = Game.SETTINGS.numSteps;
  var verticalOffset = 0;
  Game.VIEWPORT.zoneWidth = zoneWidth;
  Game.VIEWPORT.laneHeight = laneHeight;
  Game.VIEWPORT.sizePerStep = (Game.SETTINGS.canvasWidth - verticalOffset)/numSteps;

  Game.SETTINGS.cpuDifficulty = 0;

  var mountain = PIXI.Sprite.fromImage("assets/background.png");
  mountain.anchor.set(0,0);
  mountain.position.set(0,0);
  Game.stage.addChild(mountain);

  Game.stage.addChild(Game.scoreA);
  Game.scoreA.position.set(50, 50);
  Game.scoreA.anchor.set(0, 0.5);

  Game.stage.addChild(Game.scoreB);
  Game.scoreB.position.set(Game.SETTINGS.canvasWidth-50, 50);
  Game.scoreB.anchor.set(1, 0.5);

  Game.stage.addChild(Game.timerTxt);
  Game.timerTxt.position.set(Game.SETTINGS.canvasWidth/2, 20);
  Game.timerTxt.anchor.set(0.5, 0.3);

  Game.stage.addChild(Game.gameOverTxt);
  Game.gameOverTxt.position.set(Game.SETTINGS.canvasWidth/2, Game.SETTINGS.canvasHeight/2);
  Game.gameOverTxt.anchor.set(0.5, 0);


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
      case 0: heroImage = 'assets/heroes/airship.png';
      break;
      case 1: heroImage = 'assets/heroes/snailhouse.png';
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
  Game.SETTINGS.gameLength--;

  if( Game.SETTINGS.gameLength <= 0 ){
    Game.SETTINGS.gameLength = 0;
    var status = determineWinner();
    var winner;
    switch( status ){
      case 0: winner = 'IT\'S A TIE';
      break;
      case 1: winner = 'PLAYER 1 WINS';
      break;
      case 2: winner = 'PLAYER 2 WINS';
      break;
      default: winner = 'PLAY A NEW GAME';
    }


    var playAgain = new PIXI.Graphics();
    var paWidth = Game.SETTINGS.canvasWidth / 4;
    var paHeight = Game.SETTINGS.canvasHeight / 4;

    playAgain.lineStyle(2, 0xF7931E, 1);
    playAgain.beginFill(0xFBB03B, 1);
    playAgain.drawRoundedRect(paWidth + paWidth / 2, paHeight + paHeight / 2, 300, 60, 15);
    playAgain.endFill();

    playAgain.interactive = true;

    playAgain.click = function(evt) {
      window.location.href = '/';
    };

    Game.stage.addChild(playAgain);

    var paStyles = {
      font: 'bold 20px Arial',
      align: 'center',
      strokeThickness: 1,
      fill: '#FFF8B2'
    };

    var playAgainText = new PIXI.Text('Play Again?', paStyles);
    playAgainText.position.set(paWidth * 1.8, paHeight * 1.65);
    playAgainText.anchor.set(0, 0.5);
    Game.stage.addChild(playAgainText);


    Game.timerTxt.text = winner;
    PlayerOne.heroes.forEach( function( hero,i ){
      hero.sprite.position.x = Game.SETTINGS.canvasWidth + 2000;
      hero.sprite.position.y = Game.SETTINGS.canvasWidth + 2000;

    });
    // Game.gameOverTxt.text = winner;
  } else {
    Game.timerTxt.text = ((Game.SETTINGS.gameLength/60)/60).toFixed(2);
    requestAnimationFrame(Game.loop);
  }

  Game.loopCounter++;

  checkLaneStatus(PlayerOne.heroes);

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

    if (!hero.lock) {
      freezeLane(hero, i);
    }

    // score the current lane
    var zone = Math.floor(hero.sprite.position.x / Game.VIEWPORT.zoneWidth);
    var now = Date.now();

    // on the next frame, if hero is still in the same zone, check the time spent in the zone
    if (hero.currentZone === zone && hero.currentZone === hero.previousZone && hero.lock !== true) {
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

  if ((Game.STATE.frame % 60) === 0) {
    socket.emit('update state', JSON.stringify(Game.STATE), roomName, playerName);
    Game.STATE.deltas = [0,0,0,0,0,0,0,0];
  }

  if (Game.loopCounter > Game.SETTINGS.improveStaminaCounter) {
    Game.loopCounter = 0;
  }

  Game.renderer.render(Game.stage);
};

Game.init();
Game.loop();

function freezeLane(hero, lane){
  if ( hero.sprite.position.x >= Game.SETTINGS.canvasWidth || hero.sprite.position.x <= 0 ){
    hero.lock = true;
    hero.sprite.position.x = Game.SETTINGS.canvasWidth + 2000;
    hero.sprite.position.y = Game.SETTINGS.canvasWidth + 2000;
    // console.log('YOU HIT THE END');

    var overlay = new PIXI.Graphics();
    var laneBottom = (lane * Game.VIEWPORT.laneHeight) + (Game.VIEWPORT.laneHeight / 2);
    overlay.beginFill(0x4A565D, 0.7);
    overlay.drawRect(0, laneBottom, Game.SETTINGS.canvasWidth, Game.VIEWPORT.laneHeight / 2);

    Game.stage.addChild(overlay);
  } else {
    // console.log('STILL OK');
  }
}

function determineWinner(){
  if( PlayerOne.totalScoreA === PlayerOne.totalScoreB ){
    return 0; // Tied
  }
  if( PlayerOne.totalScoreA > PlayerOne.totalScoreB ){
    return 1; // player 1 wins
  }
  if( PlayerOne.totalScoreB > PlayerOne.totalScoreA ){
    return 2; // player 2 wins
  }
}

function checkLaneStatus(heroes){
  // soooooooo ugly
  if(heroes[0].lock === true && heroes[1].lock === true && heroes[2].lock === true && heroes[3].lock === true && heroes[4].lock === true ){
    Game.SETTINGS.gameLength = 0;
  }
}
