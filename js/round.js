Round = function(characters){
	this.characters = characters;
	this.charIdx = 0;
}

Round.prototype = {
	moveDescription : function(character){
		if(this.sameSquare(character.position, character.nextPosition())){
			return "the character on " + Util.squareDescription(character.position) + " holds";
		} else {
			return "move the character on " + Util.squareDescription(character.position) + " to " + Util.squareDescription(character.nextPosition());
		}

	},

	currentMoveDescription : function(){
		return this.moveDescription(this.currentCharacter());
	},

	highlightCurrentMove : function(){
		$("td").removeClass("highlight");
		$(Util.squareSelector(this.currentCharacter().position)).addClass("highlight");
		$(Util.squareSelector(this.currentCharacter().nextPosition())).addClass("highlight");

	},

	makeMove : function(callback){
		this.currentCharacter().move();
		this.next(callback);
	},

	sameSquare : function(fromPos, toPos){
		return (fromPos.col == toPos.col) && (fromPos.row == toPos.row);
	},

	allMoveDescriptions : function(){
		result = [];
		for(var i = 0; i < this.characters.length; i++){
			result.push(this.moveDescription(this.characters[i]));
		}
		return result;
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