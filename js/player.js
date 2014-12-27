function Player(){
	this.name = Util.getRandomName();
}
Player.prototype = new Character();