Round = function(characters){
	this.characters = characters;
	this.charIdx = 0;
}

Round.prototype = {
	squareDescription : function(square){
		letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"];
		return letters[square.col] + square.row;
	},

	moveDescription : function(character){
		return "move the piece on " + this.squareDescription(character.position) + " to " + this.squareDescription(character.nextPosition());
	},

	currentMoveDescription : function(){
		return this.moveDescription(this.currentCharacter());
	},

	makeMove : function(callback){
		this.currentCharacter().move();
		this.next(callback);
	},

	sameSquare : function(fromPos, toPos){
		return (fromPos.col == toPos.col) && (fromPos.row == toPos.row);
	},

	next : function(callback){
		// use sameSquare to skip to the next actual move

		this.charIdx++;
		if(this.charIdx >= this.characters.length){
			this.charIdx = 0;
			// end-of-round callback goes here
		}
		console.log(this.charIdx);
		if(this.sameSquare(this.currentCharacter().position, this.currentCharacter().nextPosition())){
			console.log("move is a no-op, skipping: " + this.moveDescription(this.currentCharacter()));
			this.next(callback);
		} else {
			callback();
		}
	},

	currentCharacter : function(){
		return this.characters[this.charIdx];
	}
}