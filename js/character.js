

Character = function(){
	this.inventory = [];
	this.knowledge = {};
	this.destination = Util.getRandomSquare();
	this.itemHistory = [];
	this.dead = false;
	this.positionHistory = [];
}

Character.prototype = {
	init : function(){
		this.name = Util.getRandomName();
		this.color =  Util.getRandomColor();
		startSqrIdx = Math.floor(Math.random() * Game.seedSquares.length);
		startSqr = Game.seedSquares[startSqrIdx];
		this.position = {col : startSqr.col, row : startSqr.row};
		this.prevPosition = {col : null, row: null};
		this.positionHistory.push({col : this.position.col , row : this.position.row});

		// if you start at your destination, re-roll destination
		// until you get a different square
		while(this.atDestination()){
			this.destination = Util.getRandomSquare();
		}
	},

	rank : function(){
		return Util.ranks[Game.colorRanks.indexOf(this.color)];
	},

	die : function(){
		this.dead = true;
	},

	// learn knowledge from other character's knowledge and items
	learnFrom : function(other){
		if(this.dead){
			return false;
		}
		// learn about what they're carrying
		var otherHasPlans = false;
		for(var i = 0; i < other.inventory.length; i++){
			this.knowledge[other.inventory[i].name] = {what : other.inventory[i].name, who : other, when : Game.roundNum, acquired : Game.roundNum}
			if(other.inventory[i].name == "plans"){
				otherHasPlans = true;
			}
		}

		if(!otherHasPlans){
			this.knowledge["no-plans-" + other.name] = {what : "plans", absence : true , who : other, when : Game.roundNum, acquired : Game.roundNum}
		}



		for(i in other.knowledge){

			// if we know something about the item,
			// only learn from them if their info is more recent
			if(this.knowledge[i]){
				if(this.knowledge[i].when < other.knowledge[i].when){
					this.knowledge[i] = other.knowledge[i];
					this.knowledge[i].acquired = Game.roundNum;
				}
			}
			// if we know nothing, learn what they know
			else {
				this.knowledge[i] = other.knowledge[i];
				this.knowledge[i].acquired = Game.roundNum;
			}
		}
	},

	acquireItemsFrom : function(other){
		if(this.dead){
			return false;
		}
		itemsToRemove = [];
		for(var i = 0; i < other.inventory.length; i++){
			if(other.inventory[i].name != "gun" && !other.isPlayer){
				this.inventory.push(other.inventory[i]);
				itemsToRemove.push(other.inventory[i]);
			}
		}
 		for(var i = 0; i < itemsToRemove.length; i++){
			index = other.inventory.indexOf(itemsToRemove[i]);
			other.inventory.splice(index,1);
		}
	},

	pickupItem : function(item){
		if(this.dead){
			return false;
		}

		// don't pick up the item if you dropped or fired the gun last turn
		if(!Util.sameSquare(this.prevPosition, this.position) && !this.justDroppedItem("gun")){
		// if(){
			this.inventory.push(item);
			this.itemHistory.push({action : "picked up", itemName : item.name, round : Game.roundNum, where : this.position});
			return true;
		} else {
			return false;
		}
	},

	justDroppedItem : function(itemName){
		lastRoundItemActions = this.itemHistoryForRound(Game.roundNum -1);
		justDropped = false;
		for(var i = 0; i < lastRoundItemActions.length; i++){
			if(lastRoundItemActions[i].itemName == itemName && lastRoundItemActions[i].action == "dropped"){
				justDropped = true;
				break;
			}
		}

		return justDropped;
	},

	dropItem : function(item){
		index = this.inventory.indexOf(item);
		Game.inventory.push(item);
		this.inventory.splice(index, 1);
		this.itemHistory.push({action : "dropped", itemName : item.name, round : Game.roundNum, where : this.position});
	},

	itemHistoryForRound: function(roundNum){
		var result = [];
		for(var i = 0; i < this.itemHistory.length; i++){
			if(this.itemHistory[i].round == roundNum){
				result.push(this.itemHistory[i]);
			}
		}
		return result;
	},

	itemWithAttribute : function(attr, value){
		if(!attr || !value){
			throw "itemWithAttribute: must query by attribute and value";
		}
		var result = null;
		for(var i = 0; i < this.inventory.length; i++){
			if(this.inventory[i][attr] == value){
				result = this.inventory[i];
			}
		}
		return result;
	},

	setupInstruction : function(){
		return "Place " + this.rank() + " " + Util.capitalize(this.color) + " on " + Util.squareDescription(this.position);
	},

	squareSelector : function(){
		return Util.squareSelector(this.position);
	},

	draw : function(){
		var k = this.atDestination() ? "atDestination" : "inTransit";

		

		pString = "<p style='background-color:"+this.color+";' class='"+k+"'>" + this.name;
		if(this.dead){
			pString += " XXX";
		}
		if(this.itemWithAttribute("name", "gun")){
			pString += " GUN";
		}
		pString += "</p>"

		$(this.squareSelector()).append(pString);
	},

	heading : function(){
		var colHeading = 0;
		var rowHeading = 0;
		if(this.destination.col > this.position.col){
			colHeading = 1;
		} else if(this.destination.col == this.position.col){
			colHeading = 0;
		} else {
			colHeading = -1;
		}
		if(this.destination.row > this.position.row){
			rowHeading = 1;
		} else if(this.destination.row == this.position.row){
			rowHeading = 0;
		} else {
			rowHeading = -1;
		}

		return {col : colHeading, row : rowHeading};
	},

	nextPosition : function(){
		// if you have a gun hold
		if(this.itemWithAttribute("name", "gun")){
			return this.position;
		} else {
			h = this.heading();
			nCol = this.position.col + h.col;
			nRow = this.position.row + h.row;
			return {col : nCol, row: nRow};
		}
	},

	move : function(){
		if(this.dead){
			return false;
		}

		gun = this.itemWithAttribute("name", "gun");
		if(gun){
			console.log("npc dropping gun: " + this.color );
			this.dropItem(gun);
			this.prevPosition.col = this.position.col;
			this.prevPosition.row = this.position.row;
		} else {
			if(this.atDestination()){
				this.prevPosition.col = this.position.col;
				this.prevPosition.row = this.position.row;
				if(Math.random() < 0.05){
					this.destination = {col : Math.floor(Math.random() * Game.boardWidth), row: Math.floor(Math.random() * Game.boardHeight)};
				}	
			} else {
				var np = this.nextPosition();
	
				if(this.position){
					this.prevPosition.col = this.position.col;
					this.prevPosition.row = this.position.row;
				}
	
				this.position.col = np.col;
				this.position.row = np.row;
			}
		}

		this.positionHistory.push({col : this.position.col, row: this.position.row});
	},

	atDestination : function(){
		if(this.destination){
			return (this.position.col == this.destination.col) && (this.position.row == this.destination.row);

		} else {
			return false;
		}
	}

}