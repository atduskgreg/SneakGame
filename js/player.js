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

Player.prototype.isMoveLegal = function(move){
	result = true;
	if(this.position.col == 0){
		result = (move.col > -1);
	}
	if(this.position.col == Game.boardWidth-1){
		result = (move.col < 1);
	}

	if(this.position.row == 0 ){
		result = (move.row > -1);
	}
	if(this.position.row == Game.boardHeight-1 ){
		result = (move.row < 1);
	}

	return result;
}

Player.prototype.move = function(){
	this.position = this.nextPos;
}