var Game = {
	boardWidth : 7,
	boardHeight: 7,
	numNPCs : 8,
  nPlayers : 2,
	characters : {},
  players : {},
  round : null,
  clientId: 0,
  exit : null, 
  seedSquares : [],
  numSeedSquares : 6,
  roundNum : 0,
  numGuns : 4,
  inventory : [],
  winner : null,
  shootingVictims : [],
  moveInstructions : null,
  colorRanks : [],

  drawDebug : function(){
    this.drawCharacters(this.characters);
    this.drawExit();
    this.drawPlayerDebug();
    this.drawInventory();
  },

  drawPlayerDebug : function(){
    result = "<h3>Players</h3><ul>";

    var keys = Object.keys(Game.players);
    for(var i = 0; i < keys.length; i++){
      player = Game.players[keys[i]];
      result += "<li>" + player.displayString() + "</li>";
    }
  
    result += "</ul>";
    $("#playerDebug").html(result)
  },

	drawCharacters : function(characters){
		$("#board p").remove();
		for(i in characters){
			characters[i].draw();
		}
	},

  drawExit : function(){
    $(Util.squareSelector(this.exit)).css("background-color", "pink");
    $(Util.squareSelector(this.exit)).append("<p id='exit'>exit</p>")
  },

  drawInventory : function(){
    $("#board td").removeClass('gun');
    for(var i = 0; i < this.inventory.length; i++){
      $(Util.squareSelector(this.inventory[i].position)).addClass(this.inventory[i].name);
    }
  },

  endRound : function(){
    this.roundNum++;
  },

  setup : function(){
    // these must happen first
    Game.generateExit();
    Game.placeGuns();
    Game.pickSeedSquares();
    Game.setColorRanks();

    Game.createNPCs();
    Game.createPlayers();
    Game.assignPlans();
  },

  // this needs to happen before we assign
  // colors to characters or else Util.colors
  // will be empty
  setColorRanks : function(){
    for(var i = 0; i < Util.colors.length; i++){
      this.colorRanks.push(Util.colors[i]);
    }
  },

  placeGuns : function(){
    // NOTE: this gets funky (with +1s below) when width/height are odd
    w = Math.floor(Game.boardWidth/2);
    h = Math.floor(Game.boardHeight/2);

    gunPositions = [];
    gunPositions.push(Util.getRandomSquare({col : {start : 0,   width: w}, row : {start: 0,   width: h}}));
    gunPositions.push(Util.getRandomSquare({col : {start : w+1, width: w}, row : {start: 0,   width: h}}));
    gunPositions.push(Util.getRandomSquare({col : {start : 0,   width: w}, row : {start: h+1, width: h}}));
    gunPositions.push(Util.getRandomSquare({col : {start : w+1, width: w}, row : {start: h+1, width: h}}));

    for(var i = 0; i < gunPositions.length; i++){
      Game.inventory.push({name : "gun", position : gunPositions[i]});
    }
  },

  isGunOnSquare :function(sqr){
    var result = false;
    for(var i = 0; i < this.inventory.length; i++){
      if(this.inventory[i].name == "gun"){
        if(Util.sameSquare(Game.inventory[i].position, sqr)){
          result = true;
          break;
        }
      }
    }
    return result;
  },

  pickSeedSquares : function(){

    while(this.seedSquares.length < this.numSeedSquares){
      t = Util.getRandomSquare();
      if(!Util.sameSquare(t, this.exit) && Util.indexOfSquare(t, this.seedSquares) < 0 && !this.isGunOnSquare(t)){
        this.seedSquares.push(t);
      }
    }
  },

  setupInstructions : function(){
    var setupInstructions = [];

    orderedCharacters = Util.sortBy(this.characters, Util.comparePosition);

    for(var i = 0 ; i < orderedCharacters.length; i++){
      setupInstructions.push({"instruction" : orderedCharacters[i].setupInstruction()});
    }

    console.log("place " + Game.inventory.length + " inventory items");

    for(var i = 0; i < Game.inventory.length; i++){
      setupInstructions.push({"instruction" : "Place a " + Game.inventory[i].name + " on " + Util.squareDescription(Game.inventory[i].position)});
    }
    return setupInstructions;
  },

  // TODO: we should really store all the moves
  //       on the players as commands which this
  //       could then use.
  calculateMoveInstructions : function(){
    orderedCharacters = Util.sortBy(this.characters, Util.comparePrevPosition);

    var result = [];
    for(var i = 0 ; i < orderedCharacters.length; i++){
      currentCharacter = orderedCharacters[i];
      if(!currentCharacter.dead){
        result.push(Util.moveDescription(currentCharacter));
      }
    }
    this.moveInstructions = result;
    return result;
  },

  makeMoves : function(){

    console.log("makeMoves");
    for( key in this.characters){
      this.characters[key].move();
    }
  },

  createPlayers : function(){
    for(var i = 0; i < Game.nPlayers; i++){
      var pid = Game.generateId();
      var p = new Player();
      p.init();
      Game.addPlayerForClient(p, pid);
    }
  },

  createNPCs : function(){
    for(var i = 0; i < Game.getNumNPCs(); i++){
      Game.addCharacter();
    }
  },

  assignPlans : function(){
    npcs = this.getNPCs();

    npcKeys = Object.keys(npcs);
    nid = Math.floor(Math.random() * npcKeys.length);

    npcs[npcKeys[nid]].inventory.push({name : "plans"});
  },

  characterWithItem : function(item){
    result = null;
    for(var i in this.characters){
      for(var k = 0; k < this.characters[i].inventory.length; k++){
        if(this.characters[i].inventory[k].name == item){
          result = this.characters[i];
          break;
        }
      }
    }

    return result;
  },


  characterWithAttribute : function(key, value){
    for(var i in this.characters){
      if(this.characters[i][key] == value){
        return this.characters[i];
      }
    }
  },

  // TODO:
  //  Maybe mark the dialogs that involve a dead person
  //  so they can be displayed separately: "blue is rifling the corpse of green"
  currentDialogs : function(){
    results = {};
    for(i in this.characters){
      for(j in this.characters){
        if(this.characters[i].name != this.characters[j].name 
          && Util.sameSquare(this.characters[i].position, this.characters[j].position)){
            pairKey = [this.characters[i].name, this.characters[j].name].sort().join("-");
            results[pairKey] = {location : this.characters[i].position, characters : [this.characters[i], this.characters[j]]};
        }
      }
    }
    return results;
  },

  transferKnowledgeAndItems : function(dialogs){
    for( i in dialogs){
      for(var j = 0; j < dialogs[i].characters.length; j++){
        char1 = dialogs[i].characters[j];
        for(var k = 0; k < dialogs[i].characters.length; k++){
            if(j != k){
              char2 = dialogs[i].characters[k];
              console.log(char1.name + " learning from " + char2.name);
              char1.learnFrom(char2);
              if(char1.isPlayer){ // shouldn't plans be able to move amongst characters?
                char1.acquireItemsFrom(char2);
              }
            }
        }

      }
    }
  },

  takeItemFromSquare : function(item, square){
    var result = null;
    var removedIndex = null;
    for(var i = 0; i < Game.inventory.length; i++){
      if(Util.sameSquare(Game.inventory[i].position, square)){
        if(Game.inventory[i].name == item){
          result = Game.inventory[i];
          removedIndex = i;
          break;
        }
      }
    }

    if(result){
      Game.inventory.splice(removedIndex, 1);
    }

    return result;
  },

  pickupItems : function(){
    console.log(Game.inventory.length + " game items on the board");

    sortedCharacters = Util.sortBy(Game.characters, Util.compareRank);
    sortedCharacters.reverse();

    for(var c = 0; c < sortedCharacters.length; c++){
      currCharacter = sortedCharacters[c];

      gun = Game.takeItemFromSquare("gun", currCharacter.position);
      if(gun){
        // if the character refuses to pick up the item
        // (for example because they just declined to use it)
        if(!currCharacter.pickupItem(gun)){
          // put the item back
          Game.inventory.push(gun);
        } 
      }
    }
  },

  removeItem : function(item){
    index = Game.inventory.indexOf(item);
    console.log("removing item at index: " + index);
    Game.inventory.splice(index, 1);
  },

  targetsFor : function(character){
    var result = [];
    charKeys = Object.keys(Game.characters);

    for(var i = 0; i < charKeys.length; i++){
      currChar = Game.characters[charKeys[i]];

      if(currChar.name != character.name && !currChar.dead){
        result.push(currChar);
      }
    }

    return result;
  },

  killCharacter : function(character, opts){
    charKeys = Object.keys(Game.characters);
    removeKey = null;
    for(var i = 0; i < charKeys.length; i++){
      currChar = Game.characters[charKeys[i]];
      if(currChar.name == character.name){
        //removeKey = charKeys[i];
        currChar.die();
        break;
      }
    }

    Game.shootingVictims.push({killer : opts.killer, name : character.name, color : character.color, position : character.position, when : Game.roundNum});

    delete Game.characters[removeKey];
  },

  newShootingVictims : function(){
    var result = [];
    for(var i = 0; i < Game.shootingVictims.length; i++){
      if(Game.shootingVictims[i].when == Game.roundNum){
        result.push(Game.shootingVictims[i]);
      }
    }
    return result;
  },

  generateExit : function(){
    
      
    options = [];

    //a-h8
    for(var i = 0; i < 8; i++){
     options.push("abcdefgh".slice(i,i+1) + "8");
    }

    //h7-1
    for(var i = 0; i < 7; i++){
     options.push("h" + (i+1));
    }

    //a-g1
    for(var i = 0; i < 7; i++){
     options.push("abcdefgh".slice(i,i+1) + 1);
    }

    //a8-2
    for(var i = 0; i < 7; i++){
     options.push("a" + (i+1));
    }



    exitSquare = options[Math.floor(Math.random() * options.length)];

    parts = exitSquare.split("");

    col = "abcdefgh".split("").indexOf(parts[0]);
    row = parseInt(parts[1]) - 1;

    this.exit = {col : col, row : row};
  },

  addPlayerForClient : function(player, clientId){
    Game.characters[clientId] = player;
    Game.players[clientId] = player;
  },

  addCharacter : function(){
    character = new Character();
    character.init();
    this.characters[this.generateId()] = character;

  },

  getClientPlayer : function(){
    return this.players[this.clientId];
  },

  allPlayersReady : function(){
    result = true;
    for(clientId in this.players){
      result = result && this.players[clientId].moveLoaded();
    }

    return result;
  },

  getNPCs : function(){
    result = {};
    for(i in this.characters){
      if(!this.characters[i].isPlayer){
        result[i] = this.characters[i];
      }

    }
    return result;
  },

  getNumNPCs : function(){
    return this.numNPCs;
  },

	moveCharacters : function(characters){
		for(i in this.characters){
			this.characters[i].move();
		}
	},
  updateInstruction : function(){
    $("#instruction").html(Game.round.currentMoveDescription());
  },

  generateId : function(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}