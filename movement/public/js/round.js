Round = function(characters){
	this.characters = characters;
	// Util.shuffle(this.characters);
	this.charIdx = 0;
}

Round.prototype = {
	order : [],

	shuffleOrder : function(){
		this.order = Object.keys(this.characters);
		Util.shuffle(this.order);
		console.log(this.order);
	},

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

	currentCharacterNum : function(){
		return this.charIdx;
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
		for(var i = 0; i < this.order.length; i++){
			console.log(this.order[i]);
			result.push(this.moveDescription(this.characters[this.order[i]]));
		}
		console.log("move descriptions")
		console.log(result);
		return result;
	},

	next : function(moveCallback, roundCallback){

		this.charIdx++;
		if(this.charIdx >= Object.keys(this.characters).length){
			this.charIdx = 0;
			this.shuffleOrder();
			roundCallback()
		}
		// console.log(this.charIdx + " >= " + this.characters.length);
		if(this.sameSquare(this.currentCharacter().position, this.currentCharacter().nextPosition())){
			console.log("move is a no-op, skipping: " + this.moveDescription(this.currentCharacter()));
			this.currentCharacter().move();
			this.next(moveCallback, roundCallback);
		} else {
			moveCallback();
		}
	},

	currentCharacter : function(){
		return this.characters[this.order[this.charIdx]];
	}
}