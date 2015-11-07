var renderer = PIXI.autoDetectRenderer(900, 600,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

var lane1 = new PIXI.Container();
var lane2 = new PIXI.Container();
var lane3 = new PIXI.Container();

// create a texture from an image path
var hero1 = PIXI.Sprite.fromImage('assets/heroes/bunny.png');
var hero2 = PIXI.Sprite.fromImage('assets/heroes/bunny.png');
var hero3 = PIXI.Sprite.fromImage('assets/heroes/bunny.png');

// center the sprite's anchor point
hero1.anchor.x = 0.5;
hero1.anchor.y = 0.5;
hero2.anchor.x = 0.5;
hero2.anchor.y = 0.5;
hero3.anchor.x = 0.5;
hero3.anchor.y = 0.5;

// move the sprite to the center of the screen
hero1.position.x = 150;
hero1.position.y = 300;
lane1.addChild(hero1);

hero2.position.x = 450;
hero2.position.y = 300;
lane2.addChild(hero2);

hero3.position.x = 750;
hero3.position.y = 300;
lane3.addChild(hero3);

stage.addChild(lane1);
stage.addChild(lane2);
stage.addChild(lane3);

// start animating
animate();
function animate() {
  requestAnimationFrame(animate);

  hero1.position.y += 1;
  hero2.position.y += 1;
  hero3.position.y += 1;

  if (hero1.position.y === 600) {
    hero1.position.y = 0;
  }
  if (hero2.position.y === 600) {
    hero2.position.y = 0;
  }
  if (hero3.position.y === 600) {
    hero3.position.y = 0;
  }

  // render the container
  renderer.render(stage);
}
