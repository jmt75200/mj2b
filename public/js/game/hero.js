function Hero(sprite) {
  this.sprite = sprite;
  this.currentZone = -1;
  this.currentZoneTimeLastPolled = null;
  this.previousZone = -1;
  this.score = 0;
}
