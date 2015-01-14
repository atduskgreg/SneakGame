function Player(){
	this.name = Util.getRandomName();
	this.hasNextPos = false;
	this.isPlayer = true;
}

Player.prototype = new Character();

Player.prototype.setNextMove = function(dir){
	this.nextPos = {col: this.position.col + dir.col, row:this.position.row + dir.row};
	this.hasNextPos = true;
}

Player.prototype.nextPosition = function(){
	return this.nextPos;
}

Player.prototype.isMoveLegal = function(move){
	off_left  = (this.position.col + move.col < 0);
	off_right = (this.position.col + move.col >= Game.boardWidth);
	off_top   = (this.position.row + move.row < 0);
	off_bot   = (this.position.row + move.row >= Game.boardHeight);

	return (!off_left && !off_right && !off_top && !off_bot);
}

Player.prototype.move = function(){
	this.position = this.nextPos;
	this.hasNextPos = false;
}

Player.prototype.moveLoaded = function(){
	return this.hasNextPos;
}