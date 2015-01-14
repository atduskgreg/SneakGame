var Game = {
	boardWidth : 8,
	boardHeight: 8,
	numNPCs : 8,
	characters : {},
  players : {},
  round : null,
  clientId: 0, 

	drawCharacters : function(characters){
		$("#board p").remove();
		for(var i = 0; i < characters.length; i++){
			characters[i].draw();
		}
	},

  addPlayerForClient : function(player, clientId){
    Game.characters[clientId] = player;
    Game.players[clientId] = player;
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

  generateClientId : function(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}