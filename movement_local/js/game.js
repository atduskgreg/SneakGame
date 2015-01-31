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

  drawDebug : function(){
    this.drawCharacters(this.characters);
    console.log("exit");
    console.log(this.exit);
    this.drawExit();
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

  setup : function(){
    Game.createNPCs();
    Game.createPlayers();
    Game.assignPlans();
    Game.generateExit();
  },

  setupInstructions : function(){
    var setupInstructions = [];
    for(i in this.characters){
      setupInstructions.push({"id" : i, "instruction" : this.characters[i].setupInstruction()});
    }
    return setupInstructions;
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

  // HERE: why does what affects one player
  //       seem to also affect the other?
  propagateKnowledge : function(dialogs){
    for( i in dialogs){
      for(var j = 0; j < dialogs[i].characters.length; j++){
        char1 = dialogs[i].characters[j];
        for(var k = 0; k < dialogs[i].characters.length; k++){
            if(j != k){
              char2 = dialogs[i].characters[k];
              console.log(char1.name + " learning from " + char2.name);
              char1.learnFrom(char2);
              if(char1.isPlayer){
                char1.acquireItemsFrom(char2);
              }
            }
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
    this.characters[this.generateId()] = new Character();
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

  setNPCs : function(data){
    this.characters = {};
    for(i in data){
      c = new Character();
      c.fromData(data[i]);
      this.characters[i] = c;
    }

    for(key in this.players){
      this.characters[key] = this.players[key];
    }
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