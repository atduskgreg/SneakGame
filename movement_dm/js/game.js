var Game = {
	boardWidth : 8,
	boardHeight: 8,
	numNPCs : 8,
  nPlayers : 2,
	characters : {},
  players : {},
  round : null,
  clientId: 0, 

	drawCharacters : function(characters){
		$("#board p").remove();
		for(i in characters){
			characters[i].draw();
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

  // HERE: execute knowledge propagation
  //       -> Notify player of knowledge transfer
  propagateKnowledge : function(dialogs){
    for( i in dialogs){
      for(var j = 0; j < dialogs[i].characters.length; j++){
        char1 = dialogs[i].characters[j];
        for(var k = 0; k < dialogs[i].characters.length; k++){
            if(j != k){
              char2 = dialogs[i].characters[k];
              console.log(char1.name + " learning from " + char2.name);
              char1.learnFrom(char2);
            }
        }

      }
    }
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