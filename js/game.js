var Game = {
	boardWidth : 6,
	boardHeight: 6,
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
  result : {},
  killings : [],
  moveInstructions : null,
  colorRanks : [],
  hidePlayers : false,

  drawDebug : function(){
    this.drawCharacters(this.characters);
    this.drawExit();
    this.drawInventory();
    Map.highlightIndoorCells();
    Map.highlightDoorCells();

    if(!this.hidePlayers){
      this.drawPlayerDebug();
    }
  },

  drawPlayerDebug : function(){
    result = "<h3>Players</h3><ul>";

    var keys = Object.keys(Game.players);
    for(var i = 0; i < keys.length; i++){
      player = Game.players[keys[i]];
      result += "<li>" + player.displayString() + "</li>";
    }
  
    result += "</ul>";
    $("#playerDebug").html(result);
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

  setupMap : function(){
    Map.setup();

    // these must happen first
    Game.generateExit();
    Game.placeGuns();
    Game.pickSeedSquares();
    Game.setColorRanks();
  },

  setupCharacters : function(){

    Game.createNPCs();
    Game.createPlayers();
    Game.assignPlans();
    Game.endRound(); // setup is round 0. mainly so plan assignment learning is distinct from first real round

  },

  setup : function(){
    this.setupMap();
    this.setupCharacters();
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
    gunPositions.push(Util.getRandomSquare({col : {start : 0, width: w-1}, row : {start: 0, width: h-1}}));
    gunPositions.push(Util.getRandomSquare({col : {start : w, width: w-1}, row : {start: 0, width: h-1}}));
    gunPositions.push(Util.getRandomSquare({col : {start : 0, width: w-1}, row : {start: h, width: h-1}}));
    gunPositions.push(Util.getRandomSquare({col : {start : w, width: w-1}, row : {start: h, width: h-1}}));

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
      setupInstructions.push({"gameObject" : orderedCharacters[i].presentationString(), "instruction" : Util.squareDescription(orderedCharacters[i].position)});
    }


    for(var i = 0; i < Game.inventory.length; i++){
      setupInstructions.push({"gameObject" : Util.capitalize(Game.inventory[i].name), "instruction" : Util.squareDescription(Game.inventory[i].position)});
    }

    setupInstructions.push({"gameObject" : "Exit", "instruction" : Util.squareDescription(Game.exit)})

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
        result.push({character : currentCharacter.presentationString(), move : new Handlebars.SafeString(Util.moveDescription(currentCharacter))});
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
    console.log("createPlayers: " + Game.nPlayers);
    for(var i = 0; i < Game.nPlayers; i++){
      var pid = Game.generateId();
      var p = new Player();
      p.init();
      p.tablePosition = i;
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

    npcs[npcKeys[nid]].gainItemFrom({name : "plans"});//.inventory.push({name : "plans"});
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

  charactersOnSquare : function(square){
    var result = [];
    for(i in this.characters){
      if(Util.sameSquare(this.characters[i].position, square)){
        result.push(this.characters[i]);
      }
    }
    return result;
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

  poisoningTargetsFor : function(character){
    return character.charactersSharingPosition();
  },

  shootingTargetsFor : function(character){
    var result = [];
    charKeys = Util.shuffle(Object.keys(Game.characters));

    for(var i = 0; i < charKeys.length; i++){
      currChar = Game.characters[charKeys[i]];

      if(currChar.name != character.name && !currChar.dead){
        result.push(currChar);
      }
    }

    return result;
  },

  // TODO: Make poison duration be set by player
  poisonCharacter : function(character, opts){
    poisonDuration = Math.floor(Math.random() * 3) + 3; // random from 3-5 
    poisoning = {poisoner: opts.poisoner, victim : character, when : Game.roundNum, duration : poisonDuration};
    character.poisonings.push(poisoning);
    opts.poisoner.poisoningsCommitted.push(poisoning);
  },

  checkPoisonings : function(){
    for(i in this.characters){
      if(this.characters[i].shouldDieFromPoison()){
        this.killCharacter(this.characters[i], {method : "poisoning"})
      }
    }
  },

  // returns false if no victory
  // returns object with info about winner otherwise
  checkVictory : function(){
    var result = false;
    numDeadPlayers = 0;

    soleWinner = null;
    for(i in this.players){
      if(this.players[i].dead){

        numDeadPlayers++;
      } else {
        // only use this if all the other players are dead
        soleWinner = this.players[i];
      }
    }

    if(numDeadPlayers >= (this.nPlayers-1)){
      deathCauses = [];
      for(var i = 0 ; i < Game.killings.length; i++){
        if(Game.killings[i].victim instanceof Player){
          description = new Handlebars.SafeString(Game.deathDescription(Game.killings[i]));
          deathCauses.push({player : Game.killings[i].victim, description : description});
        }
      }

      if(numDeadPlayers == this.nPlayers-1){
        result = {winner : soleWinner, victory : "killing", message : "is the last survivor", deathCauses : deathCauses};
      } else {
        result = {message : "Everyone is dead! It's a draw.", draw : true, deathCauses: deathCauses};
      }
    }

    // check for victory by plans
    charKeys = Object.keys(Game.players);
    for(var i = 0; i < charKeys.length; i++){
      currPlayer = Game.players[charKeys[i]];
      if(currPlayer.hasItem("plans") && Util.sameSquare(currPlayer.position, Game.exit)){
        result = {winner : currPlayer, victory : "plans", message : "escaped with the plans"};
      }
    }
    return result;
  },

  killCharacter : function(character, opts){
    charKeys = Object.keys(Game.characters);
    for(var i = 0; i < charKeys.length; i++){
      currChar = Game.characters[charKeys[i]];
      if(currChar.name == character.name){
        currChar.die();
        break;
      }
    }

    Game.killings.push({killer : opts.killer, method : opts.method, victim : character, when : Game.roundNum});
  },

  deathDescription : function(death){
    if(death.method == "shooting"){
      return death.killer.presentationString() + " shot " + death.victim.presentationString() + ".";

    }
    if(death.method == "poisoning"){
      return death.victim.presentationString() + " died of poison.";
    }
  },

  newVictims : function(){
    var result = [];
    for(var i = 0; i < Game.killings.length; i++){
      if(Game.killings[i].when == Game.roundNum){
        result.push(new Handlebars.SafeString(Game.deathDescription(Game.killings[i])));
      }
    }
    return result;
  },

  generateExit : function(){
    
      
    options = [];

    //a1-<Game.boardWidth>1 and a<Game.boardHeight> - <Game.boardWidth><Game.boardHieght>
    for(var i = 0; i < Game.boardWidth; i++){
      options.push("abcdefghijklmnopqrstuvwxyz".slice(i,i+1) + Game.boardHeight );
      options.push("abcdefghijklmnopqrstuvwxyz".slice(i,i+1) + 1);
    }

    lastRow = "abcdefghijklmnopqrstuvwxyz"[Game.boardWidth-1];
    
    for(var i = 2; i < Game.boardHeight; i++){
      options.push("a" + i);
      options.push(lastRow + i);
    }

    exitSquare = options[Math.floor(Math.random() * options.length)];

    parts = exitSquare.split("");

    col = "abcdefghijklmnopqrstuvwxyz".split("").indexOf(parts[0]);
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
    return 10 - this.nPlayers;
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