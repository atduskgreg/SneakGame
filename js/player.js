function Player(){
	this.name = Util.getRandomName();
}
Player.prototype = new Character();

Player.prototype.setNextMove = function(dir){
	this.nextPos = {col: this.position.col + dir.col, row:this.position.row + dir.row};
}

Player.prototype.nextPosition = function(){
	return this.nextPos;
}

Player.prototype.move = function(){
	this.position = this.nextPos;
}