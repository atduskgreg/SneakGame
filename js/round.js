function squareDescription(square){
	letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"];
	return letters[square.col] + square.row;
}

Round = function(characters){
	this.characters = characters;
	this.charIdx = 0;
}

Round.prototype = {


	moveDescription : function(character){
		return "move the character on " + squareDescription(character.position) + " to " + squareDescription(character.nextPosition());
	},

	currentMoveDescription : function(){
		return this.moveDescription(this.currentCharacter());
	},

	highlightCurrentMove : function(){
		$("td").removeClass("highlight");
		$(squareSelector(this.currentCharacter().position)).addClass("highlight");
		$(squareSelector(this.currentCharacter().nextPosition())).addClass("highlight");

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
			this.currentCharacter().move();
			this.next(callback);
		} else {
			callback();
		}
	},

	currentCharacter : function(){
		return this.characters[this.charIdx];
	}
}