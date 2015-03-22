

Character = function(){
	this.inventory = [];
	this.knowledge = {};
	this.destination = null;//Util.getRandomSquare();
	this.itemHistory = [];
	this.dead = false;
	this.positionHistory = [];
	this.learned = [];
	this.newDestinationProbability = Math.min(Math.random() + 0.15, 0.85);
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

		// TODO: once there are doors this won't be needed
		// for now, pick a random connected cell as the destination
		destinationOptions = Map.getConnectedCells(Map.getCell(this.position));
		dest = destinationOptions[Math.floor(Math.random() * destinationOptions.length)];
		this.destination = {col : dest.col, row : dest.row};

		// everyone starts off knowing they don't have the plans
		this.learned.push({subject : this.color, when : -1, plans : false});

		// give a 15% chance of having a hold on the first turn
		if(Math.random() < 0.15){
			this.destination.col = this.position.col;
			this.destination.row = this.position.row;
		}
	},

	pathToDestination : function(){
		return Map.getPath(Map.getCell(this.destination), Map.getCell(this.position));
	},

	gainItemFrom : function(item, other){
		this.inventory.push(item);
		if(item.name == "plans"){
			this.learned.push({subject : this.color, when : Game.roundNum, plans : true});
			if(other){
				this.learned.push({subject : other.color, when : Game.roundNum, plans : false, receivedFrom : other.color});
			}
		}

		item = {action : "got", itemName : item.name, when : Game.roundNum, where : this.position};
		if(other){
			item.from = other.color;
		}
		this.itemHistory.push(item);
	},

	loseItemTo : function(item, other){
		index = this.inventory.indexOf(item);
		this.inventory.splice(index,1);
		console.log(item.name);
		if(item.name == "plans"){
			this.learned.push({subject : other.color, when : Game.roundNum, plans : true});
			this.learned.push({subject : this.color, when : Game.roundNum, plans : false});
		}

		this.itemHistory.push({action : "gave", itemName : item.name, to : other.color, when : Game.roundNum, where : this.position});
	},

	rank : function(){
		return Util.ranks[Game.colorRanks.indexOf(this.color)];
	},

	die : function(){
		this.dead = true;
	},

	currentKnowledge : function(){
		result = {};
		sortedInfo = this.learned.sort(Util.compareChronologically);
		for(var i = 0; i < sortedInfo.length; i++){
			// if we already know something about this subject
			// and we learned that from the horse's mouth
			if(result[sortedInfo[i].subject] && result[sortedInfo[i].subject].receivedFrom == sortedInfo[i].subject){
				// then only update if the newer
				if(sortedInfo[i].when > result[sortedInfo[i].subject].when){
					result[sortedInfo[i].subject] = sortedInfo[i];
				}
			} else {
				result[sortedInfo[i].subject] = sortedInfo[i];
			}

		}

		return result;
	},

	hasPlans : function(){
		for(var i = 0; i < this.inventory.length; i++){
			if(this.inventory[i].name == "plans"){
				return true;
			}
		}
		return false;
	},

	// learn knowledge from other character's knowledge and items
	learnFrom : function(other){
		if(this.dead){
			return false;
		}

		// observe whether or not they have the plans
		// this.learned.push({subject : other.color, when : Game.roundNum, plans : other.hasPlans()});
		
		// learn from their current best knowledge
		theirKnowledge = other.currentKnowledge();
		for(subject in theirKnowledge){
			// don't learn things about myself
			if(subject != this.color){
				item = JSON.parse(JSON.stringify(theirKnowledge[subject]));
				item.receivedFrom = other.color;
				item.receivedAt = Game.roundNum;
				this.learned.push(item);
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
				this.gainItemFrom(other.inventory[i], other);
				itemsToRemove.push(other.inventory[i]);
			}
		}
 		for(var i = 0; i < itemsToRemove.length; i++){
 			other.loseItemTo(itemsToRemove[i], this);
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
			this.itemHistory.push({action : "picked up", itemName : item.name, when : Game.roundNum, where : this.position});
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
		this.itemHistory.push({action : "dropped", itemName : item.name, when : Game.roundNum, where : this.position});
	},

	itemHistoryForRound: function(roundNum){
		var result = [];
		for(var i = 0; i < this.itemHistory.length; i++){
			if(this.itemHistory[i].when == roundNum){
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

	drawPath : function(){
		path = this.pathToDestination();
		if(path){
			Map.highlightCells(path, "path");
		}
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
			// h = this.heading();
			// nCol = this.position.col + h.col;
			// nRow = this.position.row + h.row;
			// return {col : nCol, row: nRow};
			path = this.pathToDestination();
			if(path && path.length > 0){
				return {col : path[1].col, row : path[1].row};
			} else {
				return {col : this.position.col, row : this.position.row};
			}
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
				if(Math.random() < this.newDestinationProbability){
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