Player = function() {
	// this.name = Util.getRandomName();
  // this.color = Util.getRandomColor();
	this.hasNextPos = false;
	this.isPlayer = true;
  // startSqrIdx = Math.floor(Math.random() * Game.seedSquares.length);
  // startSqr = Game.seedSquares[startSqrIdx];
  // this.position = {col : startSqr.col, row : startSqr.row};
  this.nextPos = null;
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

Player.prototype.displayString = function(){
	inventory = [];
     for(var k =0; k < this.inventory.length; k++){
       inventory.push(this.inventory[k].name);
     }

     knowledgeDescription = [];
     for(i in this.knowledge){
     	knowledgeDescription.push(this.knowledge[i].who + " had the "+ i + " " + (Game.roundNum - this.knowledge[i].when) + " turns ago " );
     }
	return "P : " + this.name + " ("+this.color+") i:["+inventory.join(", ")+"] k:[" + knowledgeDescription.join(", ")+"]";
}

Player.prototype.move = function(){
	this.position = this.nextPos;
	this.hasNextPos = false;
}

Player.prototype.heading = function(){
  return {col : (this.nextPos.col - this.position.col), row : (this.nextPos.row - this.position.row)};
}

Player.prototype.moveLoaded = function(){
	return this.hasNextPos;
}