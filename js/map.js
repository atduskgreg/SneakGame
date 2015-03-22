var Map = {
  cells : [],
  dirs : [{col: 1,  row:  0},
          {col: 0,  row:  1},
          {col: -1, row:  0},
          {col: 0,  row: -1},
          // add these for diagonal connectivity
          {col: 1,  row:  1},
          {col: 1,  row: -1},
          {col: -1, row: -1},
          {col: -1, row:  1}],

  setup : function(){
    for(var row = 0; row < Game.boardHeight; row++){
      for(var col = 0; col < Game.boardWidth; col++){
        this.cells.push({col : col, row: row});
      }
    }

    this.buildMap_connectedRooms();
    this.highlightIndoorCells();
  },

  buildMap_connectedRooms : function(){
    var nSeeds = 3;
    seeds = [];
    for(var i = 0; i < nSeeds; i++){
      seed = this.randomCell();
      seeds.push(seed);
      seed.indoors = true;
      Map.makeCellsIndoors(Map.getNeighbors(seed));
    }

    for(var i = 0; i < seeds.length; i++){
      for(var j = 0; j < seeds.length; j++){
        if(i != j){
          this.connectCells(seeds[i], seeds[j]);
        }
      
      } 
    }
  },

  getPathMap : function(cell){
    var frontier = new Queue();
    frontier.enqueue(cell);
    var pathMap = new HashTable();

    while(!frontier.isEmpty()){
      current = frontier.dequeue();
      neighbors = this.getConnectedNeighbors(current);
      for(var i = 0; i < neighbors.length; i++){
        neighbor = neighbors[i];
        if(!pathMap.get(neighbor)){
          frontier.enqueue(neighbor);
          pathMap.put(neighbor, current);
        }
      }
    }
    return pathMap;
  },

  getConnectedCells : function(cell){
    return this.getPathMap(cell).keys();
  },

  getSetEdges : function(cells){
    var edgeCells = [];
    for(var i = 0; i < cells.length; i++){
      connectedNeighbors = this.getConnectedNeighbors(cells[i]);
      if(connectedNeighbors.length < this.getNeighbors(cells[i]).length){
        edgeCells.push(cells[i])
      }
    }
    return edgeCells;
  },

  getPath : function(fromCell, toCell){
    var path = []
    pathMap = this.getPathMap(fromCell);
    current = toCell;
    path.push(current);
    while(current && !Util.sameSquare(current, fromCell)){
      current = pathMap.get(current);
      if(current){
        path.push(current);
      }
    }

    if(Util.sameSquare(path[path.length-1], fromCell)){
      return path;
    } else { // no path from here to there
      return false;
    }

  },

  connectCells : function(cell1, cell2){
    var i = cell1.col;
    if (cell1.col != cell2.col) {
      var colDir = (cell2.col - cell1.col)/Math.abs((cell1.col - cell2.col));
      i = cell1.col;

      while (i != cell2.col) {
        i += colDir;
        this.getCell({col : i, row : cell1.row}).indoors = true;
      }
    }

    if (cell1.row != cell2.row) {
      var rowDir = (cell2.row - cell1.row)/Math.abs((cell1.row - cell2.row));
      var j = cell1.row;
      while (j != cell2.row) {
        j += rowDir;
        this.getCell({col: i, row: j}).indoors = true;
      }
    }
  },

  highlightIndoorCells : function(){
    this.highlightCells(this.indoorCells());
  },

  indoorCells : function(){
    result = [];
    for(var i = 0; i < this.cells.length; i++){
      if(this.cells[i].indoors){
        result.push(this.cells[i]);
      }
    }

    return result;
  },

  outdoorCells : function(){
    result = [];
    for(var i = 0; i < this.cells.length; i++){
      if(!this.cells[i].indoors){
        result.push(this.cells[i]);
      }
    }

    return result;
  },

  randomCell : function(){
    return this.getCell(Util.getRandomSquare());
  },

  getNeighbor : function(cell, dir){
    return this.getCell({row : (cell.row + dir.row), col : (cell.col + dir.col)});
  },

  getCell : function(cell){
    for(var i = 0; i < this.cells.length; i++){
      if(this.cells[i].col == cell.col && this.cells[i].row == cell.row ){
        return this.cells[i];
      }
    }

    return false;
  },

  // TODO : this is where doors get implemented
  areCellsConnected : function(cell1, cell2){
    return (cell1.indoors == cell2.indoors)
  },

  getConnectedNeighbors : function(cell){
    var result = [];
    for(var i = 0; i < this.dirs.length; i++){
      dir = this.dirs[i];
      neighbor = this.getNeighbor(cell, dir);
      if(neighbor && this.areCellsConnected(neighbor,cell)){
        result.push(neighbor);
      }
    }
    return result;
  },

  getNeighbors : function(cell){
    var result = [];
    for(var i = 0; i < this.dirs.length; i++){
      dir = this.dirs[i];
      neighbor = this.getNeighbor(cell, dir);
      if(neighbor){
        result.push(neighbor);
      }
    }
    return result;
  },

  makeCellsIndoors : function(cells){
    for(var i = 0; i < cells.length; i++){
      cells[i].indoors = true;
    }
  },

  highlightCell : function(cell, className){
    $(Util.squareSelector(cell)).addClass(className || 'highlight');
  },

  highlightCells : function(arr, className){
    this.clearHighlights(className);
    for(var i = 0; i < arr.length; i++){
      this.highlightCell(arr[i], className);
    }
  },

  clearHighlights : function(className){
    $("td").removeClass(className || 'highlight');
  },

  clear : function(){
    this.clearHighlights();
    for(var i = 0; i < this.cells.length; i++){
      this.cells[i].indoors = false;
    }
  }
}