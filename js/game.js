var Game = {
	boardWidth : 8,
	boardHeight: 8,
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
      $(Util.squareSelector(this.inventory[i].position)).addClass('gun');
    }
  },

  endRound : function(){
    this.roundNum++;
  },

  setup : function(){
    // these are order dependent
    Game.generateExit();
    Game.pickSeedSquares();

    Game.createNPCs();
    Game.createPlayers();
    Game.assignPlans();
    Game.placeGuns();
  },

  placeGuns : function(){
    gunPositions = [];
    gunPositions.push(Util.getRandomSquare({col : {start : 0, width: 4}, row : {start: 0, width: 4}}));
    gunPositions.push(Util.getRandomSquare({col : {start : 4, width: 4}, row : {start: 0, width: 4}}));
    gunPositions.push(Util.getRandomSquare({col : {start : 0, width: 4}, row : {start: 4, width: 4}}));
    gunPositions.push(Util.getRandomSquare({col : {start : 4, width: 4}, row : {start: 4, width: 4}}));

    for(var i = 0; i < gunPositions.length; i++){
      Game.inventory.push({name : "gun", position : gunPositions[i]});
    }
  },

  pickSeedSquares : function(){

    while(this.seedSquares.length < this.numSeedSquares){
      t = Util.getRandomSquare();
      if(!Util.sameSquare(t, this.exit) && Util.indexOfSquare(t, this.seedSquares) < 0){
        this.seedSquares.push(t);
      }
    }
  },

  setupInstructions : function(){
    var setupInstructions = [];
    for(i in this.characters){
      setupInstructions.push({"instruction" : this.characters[i].setupInstruction()});
    }

    console.log("place " + Game.inventory.length + " inventory items");

    for(var i = 0; i < Game.inventory.length; i++){
      setupInstructions.push({"instruction" : "Place a " + Game.inventory[i].name + " on " + Util.squareDescription(Game.inventory[i].position)});
    }
    return setupInstructions;
  }, 

  moveInstructions : function(){
    // shuffle order of players
    orderedKeys = Object.keys(this.characters);
    Util.shuffle(orderedKeys);

    var result = [];
    for(var i = 0 ; i < orderedKeys.length; i++){
      currentCharacter = this.characters[orderedKeys[i]];
      result.push(Util.moveDescription(currentCharacter));
    }

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

  propagateKnowledge : function(dialogs){
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

  pickupItems : function(){
    charKeys = Object.keys(Game.characters);
    for(var i = 0; i < this.inventory.length; i++){
      for(var c = 0; c < charKeys.length; c++){
        charKey = charKeys[c]
        if(Util.sameSquare(Game.characters[charKey].position, this.inventory[i].position)){
          console.log("character on gun square")
          Game.characters[charKey].pickupItem(this.inventory[i]);
        }
      }
    }
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

  // setNPCs : function(data){
  //   this.characters = {};
  //   for(i in data){
  //     c = new Character();
  //     c.fromData(data[i]);
  //     this.characters[i] = c;
  //   }

  //   for(key in this.players){
  //     this.characters[key] = this.players[key];
  //   }
  // },

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