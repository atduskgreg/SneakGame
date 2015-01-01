Round = function(characters){
	this.characters = characters;
	Util.shuffle(this.characters);
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

	makeMove : function(moveCallback, roundCallback){
		this.currentCharacter().move();
		this.next(moveCallback, roundCallback);
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

	next : function(moveCallback, roundCallback){

		this.charIdx++;
		if(this.charIdx >= this.characters.length){
			this.charIdx = 0;
			Util.shuffle(this.characters);
			roundCallback()
		}
		console.log(this.charIdx);
		if(this.sameSquare(this.currentCharacter().position, this.currentCharacter().nextPosition())){
			console.log("move is a no-op, skipping: " + this.moveDescription(this.currentCharacter()));
			this.currentCharacter().move();
			this.next(moveCallback, roundCallback);
		} else {
			moveCallback();
		}
	},

	currentCharacter : function(){
		return this.characters[this.charIdx];
	}
}