function Hero(sprite) {
  this.sprite = sprite;
  this.lock = false;
  this.currentZone = -1;
  this.currentZoneTimeLastPolled = null;
  this.previousZone = -1;
  this.score = 0;
  // stamina capacity (the lower this value, the greater the distance
  //   the hero can move per keypress)
  this.stamina = 0;
}
