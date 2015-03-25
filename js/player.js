Player = function() {
	// this.name = Util.getRandomName();
  // this.color = Util.getRandomColor();
	this.hasNextPos = false;
	this.isPlayer = true;
  this.knowledge = {};
  this.inventory = [];
  this.itemHistory = [];
  this.dead = false;
  this.position = null;
  this.tablePosition = null;
  this.positionHistory = [];
  this.learned = [];
  this.poisonings = [];
  this.poisoningsCommitted = [];

  // startSqrIdx = Math.floor(Math.random() * Game.seedSquares.length);
  // startSqr = Game.seedSquares[startSqrIdx];
  // this.position = {col : startSqr.col, row : startSqr.row};
  this.nextPos = null;
}

Player.prototype = new Character();

Player.prototype.canPoison = function(){
  return (this.poisoningsCommitted.length == 0);
}

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

Player.prototype.hasItem = function(itemName){
  var result = false;

  for(var i = 0; i < this.inventory.length; i++){
    if(this.inventory[i].name == itemName){
      result = true;
      break;
    }
  }

  return result;
}

Player.prototype.legalMoves = function(){
  result = {};
  result["position-top"] = (this.tablePosition == 1);

  if(this.hasItem("gun")){
    result["shoot"] = true;
  } else {
    // default to false
    for(i in Util.moves){
      result[i] = false;
    }
    // can always hold
    result["hold"] = true;

    // go through the connected neighbors
    // and add them as legal options 
    currCell = Map.getCell(this.position);
    legalDestinations = Map.getConnectedNeighbors(currCell);
    for(var i = 0; i < legalDestinations.length; i++){
      d = Util.cardinalDescription(this.position, legalDestinations[i]);
      result[d] = true;
    }
    console.log("legalMoves for " + this.color);
    console.log(result);
    // for(i in Util.moves){
    //   result[i] = this.isMoveLegal(Util.moves[i]);
    // }
  }

  return result;
}

Player.prototype.displayString = function(){
	inventory = [];
     for(var k =0; k < this.inventory.length; k++){
       inventory.push(this.inventory[k].name);
     }

     knowledgeDescription = [];
     for(subject in this.currentKnowledge()){
      console.log(subject);
      console.log(this.currentKnowledge()[subject]);
      k = Util.knowledgeDescription(this.currentKnowledge()[subject])
      console.log(k)
     	knowledgeDescription.push(k);

     }
	return "P : " + this.name + " ("+this.color+") i:["+inventory.join(", ")+"] k:[" + knowledgeDescription.join(", ")+"]";
}

Player.prototype.move = function(){
  if(this.position){
    this.prevPosition.col = this.position.col;
    this.prevPosition.row = this.position.row;
  }

	this.position.col = this.nextPos.col;
  this.position.row = this.nextPos.row;
	this.hasNextPos = false;
  this.positionHistory.push({col:this.position.col, row: this.position.row});
}

Player.prototype.heading = function(){
  return {col : (this.nextPos.col - this.position.col), row : (this.nextPos.row - this.position.row)};
}

Player.prototype.moveLoaded = function(){
	return this.hasNextPos;
}