var Util = {
  names : ["joe", "bob", "jane", "cat", "pam", "kit", "van", "lin", "alice", "fin", "mark", "kevin", "max", "june", "tim"],
  colors : ["red", "green", "yellow", "blue","white","black", "pink", "orange","brown", "gray"],
  ranks : ["Private", "Corporal", "Sergant", "Lieutenant", "Captain", "Major", "Colonel", "General", "Vice President", "President" ],
  moves : {
    nw   : {col: -1, row:  1},
    n    : {col:  0, row:  1},
    ne   : {col:  1, row:  1},
    w    : {col: -1, row:  0},
    hold : {col:  0, row:  0},
    e    : {col:  1, row:  0},
    sw   : {col: -1, row: -1},
    s    : {col:  0, row: -1},
    se   : {col:  1, row: -1}
  },  

  getRandomName : function(){
    var idx = Math.floor(Math.random() * Util.names.length);
    return Util.names.splice(idx, 1)[0];
  },

  getRandomColor : function(){
    var idx = Math.floor(Math.random() * Util.colors.length);
    return Util.colors.splice(idx, 1)[0];
  },

  getRandomIndoorSquare : function(){
    indoorSquares = Map.indoorCells();
    result = indoorSquares[Math.floor(Math.random() * indoorSquares.length)];
    return {col : result.col, row : result.row};
  },

  getRandomOutdoorSquare : function(){
    outdoorSquares = Map.outdoorCells();
    result = outdoorSquares[Math.floor(Math.random() * outdoorSquares.length)];
    return {col : result.col, row : result.row};
  },

  getRandomSquare : function(range){
    // default to full width of board
    var c = Math.floor(Math.random() * Game.boardWidth);
    var r = Math.floor(Math.random() * Game.boardHeight);
    
    // apply range limits if present
    if(range && range.col){
      c = range.col.start + Math.floor(Math.random() * range.col.width);
    }
    if(range && range.row){
      r = range.row.start + Math.floor(Math.random() * range.row.width);
    }
    
    return {col : c, row : r};
  },
  
  squareSelector : function(sqr){
    return "#" + sqr.col + "x" + sqr.row;
  },

  squareDescription : function(sqr){
    return ["a", "b", "c", "d", "e", "f","g","h", "i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"][sqr.col] + (sqr.row+1);
  },
  
  moveDescription : function(character){
    console.log(character.color +": " + Util.squareDescription(character.prevPosition) + " to " + Util.squareDescription(character.position) + " dir: " +  Util.cardinalDescription(character.prevPosition, character.position));

    itemActions = character.itemHistoryForRound(Game.roundNum);
    if(itemActions.length > 0 && itemActions[0].itemName == "gun"){
      // land on a gun and pick it up
      if(!Util.sameSquare(character.position, character.prevPosition)){
        result = "Move " + character.presentationString() + " " + Util.cardinalDescription(character.prevPosition, character.position) + ".";
        result += " They " + itemActions[0].action + " a gun";
        return result;
      // drop or shoot a gun you were already holding
      } else {
        return character.presentationString() + itemActions[0].action + " a gun";
      }
    }

    if(Util.sameSquare(character.position, character.prevPosition)){
      return character.presentationString() + " holds";
    } else {
      return "Move "+ character.presentationString() + " " + Util.cardinalDescription(character.prevPosition, character.position);
    }
  },

  cardinalDescription : function(fromPos, toPos){
    col = toPos.col - fromPos.col;
    row = toPos.row - fromPos.row;

    move = {col : col, row : row};

    for( key in this.moves ){
      if(this.moves[key].col == move.col && this.moves[key].row == move.row){
        return key;
      }
    }
  },

  knowledgeDescription : function(knowledge){
    result = "";

    if(!knowledge.receivedFrom){
      if(knowledge.plans){
        result += this.capitalize(knowledge.subject) + " has the plans";
      } else {
        result += this.capitalize(knowledge.subject) + " doesn't have the plans";
      }
    } else {
      if(!knowledge.plans){
        if(knowledge.subject == knowledge.receivedFrom){
          result += this.capitalize(knowledge.receivedFrom) + " says, \"I don't have the plans.\""
        } else {
          result += this.capitalize(knowledge.receivedFrom) + " says, \"" + this.capitalize(knowledge.subject) + " didn't have the plans when I saw them " + this.timeSinceInWords(knowledge.when) + ".\"";
        }    
      } else {
        if(knowledge.subject == knowledge.receivedFrom){

          if(Game.characterWithAttribute("color", knowledge.receivedFrom).isPlayer){
            result += this.capitalize(knowledge.receivedFrom) + " says, \"I have the plans, but I'm keeping them. Shoo!\""
          } else {
            result += this.capitalize(knowledge.receivedFrom) + " says, \"I have the plans. Take them and escape to the exit!\""
          }

        } else {
          result += this.capitalize(knowledge.receivedFrom) + " says, \"" + this.capitalize(knowledge.subject) + " had the plans when I saw them " + this.timeSinceInWords(knowledge.when) + ".\"";
        }
      }
    }
    
    return result;
  },

  timeSinceInWords : function(turn){
    offset = Game.roundNum - turn;

    if(offset == 0){
      return "this turn";
    }
    if(offset == 1){
      return "last turn";
    }

    return offset + " turns ago";
  },

  sortBy : function(arrayOfObjs, comparator){
    arrary = $.map(arrayOfObjs,function(value, index){
      return [value];
    });
    return arrary.sort(comparator);
  },

  // compares two characters based on their rank.
  // used for sorting in order to enforce rank
  // priority for item pickup
  compareRank : function(a,b){
    if(Game.colorRanks.indexOf(a.color) > Game.colorRanks.indexOf(b.color)){
      return 1;
    }
    if(Game.colorRanks.indexOf(a.color) < Game.colorRanks.indexOf(b.color)){
      return -1;
    }

    return 0;
  },

  // Takes an array of game objects
  // that are assumed to have a position field on them
  // compares them based on their position.
  // Meant to be used with Array.sort() for 
  // spatially-coherent sorting.
  comparePosition : function(a,b){
    return Util.compareSpatially(a,b,"position");
  },

  comparePrevPosition : function(a,b){
    return Util.compareSpatially(a,b,"prevPosition");
  },

  compareSpatially : function(a, b, posField){
    if(Util.squareCardinalValue(a[posField]) > Util.squareCardinalValue(b[posField])){
      return 1;
    }
    if(Util.squareCardinalValue(a[posField]) < Util.squareCardinalValue(b[posField])){
      return -1;
    }
    return 0;
  },

  compareChronologically : function(a,b){
    if(a.when > b.when){
      return 1;
    }
    if(a.when < b.when){
      return -1;
    }
    return 0;
  },

  // helper for compareSpatially,
  // converts sqr.col and sqr.row
  // into index for sorting
  squareCardinalValue : function(sqr){
    return sqr.row*Game.boardWidth + sqr.col;
  },

  sameSquare : function(sqrA, sqrB){
    return (sqrA.col == sqrB.col) && (sqrA.row == sqrB.row);
  },

  indexOfSquare : function(sqr, sqrs){
    var result = -1;

    for(var i = 0; i < sqrs.length; i++){
      if(Util.sameSquare(sqr,sqrs[i])){
        result = i;
      }
    }

    return result;
  },

  shuffle : function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
  },

  capitalize : function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

function HashTable() {
    this.hashes = {};
}

HashTable.prototype = {
    constructor: HashTable,

    put: function( key, value ) {
        this.hashes[ JSON.stringify( key ) ] = value;
    },

    get: function( key ) {
        return this.hashes[ JSON.stringify( key ) ];
    },

    keys : function(){
      result = [];
      hashKeys = Object.keys(this.hashes);
      for(var i = 0; i < hashKeys.length; i++){
        result.push(JSON.parse(hashKeys[i]));
      }
      return result;
    }
};