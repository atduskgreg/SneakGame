var Map = {
  cells : [],
  orthoDirs : [{col: 1,  row:  0},
               {col: 0,  row:  1},
               {col: -1, row:  0},
               {col: 0,  row: -1}],
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

    // connect outdoor areas to the indoors with doors

    outdoorCells = this.outdoorCells();
    while(outdoorCells.length > 0){
      console.log("outdoorCells.length : " + outdoorCells.length);
      //  pick a random element in the array
      cell = outdoorCells[Math.floor(Math.random() * outdoorCells.length)];
      //  find all the cells connected to that element
      area = Map.getConnectedCells(cell)
      // get the edge cells of this area
      edges = this.getSetEdges(area);
      //  pick a random edge cell and add a door to one of its indoor neighbors
      doorTo = edges[Math.floor(Math.random() * edges.length)];    
      
      indoorNeighbors = this.getDisconnectedNeighbors(doorTo, this.orthoDirs);
      console.log("indoorNeighbors");
      console.log(indoorNeighbors);
      doorFrom = indoorNeighbors[Math.floor(Math.random() * indoorNeighbors.length)];
      this.addDoor(doorFrom, doorTo);
  
      //  remove all the area cells from the array
      toRemove = [];
      for(var i = 0; i < area.length; i++){
         for(var j = 0; j < outdoorCells.length; j++){
           if(Util.sameSquare(area[i], outdoorCells[j])){
             toRemove.push(outdoorCells[j]);
           }
         }
      }
      for(var i = 0; i < toRemove.length; i++){
        idx = outdoorCells.indexOf(toRemove[i]);
        outdoorCells.splice(idx,1);
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
      connectedNeighbors = this.getConnectedNeighbors(cells[i], this.orthoDirs);
      if(connectedNeighbors.length < this.getNeighbors(cells[i], this.orthoDirs).length){
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

  addDoor : function(cell1, cell2){
    console.log("from");
    console.log(cell1);
    console.log("to");
    console.log(cell2);

    cell1.doorTo = cell2;
  },

  // TODO : this is where doors get implemented
  // use doorTo (see above)
  areCellsConnected : function(cell1, cell2){
    // HERE
    return (cell1.indoors == cell2.indoors)
  },

  getDoorCells : function(){
    var result = [];
    indoorCells = this.indoorCells();
    for(var i = 0; i < indoorCells.length; i++){
      if(indoorCells[i].doorTo){
        result.push(indoorCells[i]);
      }
    }
    return result;
  },

  getConnectedNeighbors : function(cell, selectedDirs){
    dirs = selectedDirs || this.dirs
    var result = [];
    for(var i = 0; i < dirs.length; i++){
      dir = dirs[i];
      neighbor = this.getNeighbor(cell, dir);
      if(neighbor && this.areCellsConnected(neighbor,cell)){
        result.push(neighbor);
      }
    }
    return result;
  },

  getDisconnectedNeighbors : function(cell, selectedDirs){
    dirs = selectedDirs || this.dirs
    var result = [];
    for(var i = 0; i < dirs.length; i++){
      dir = dirs[i];
      console.log(dir);
      neighbor = this.getNeighbor(cell, dir);
      if(neighbor && !this.areCellsConnected(neighbor,cell)){
        result.push(neighbor);
      }
    }
    return result;
  },

  getNeighbors : function(cell, selectedDirs){
    dirs = selectedDirs || this.dirs
    var result = [];
    for(var i = 0; i < dirs.length; i++){
      dir = dirs[i];
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
    this.cells = [];
    for(var i = 0; i < this.cells.length; i++){
      this.cells[i].indoors = false;
    }
  }
}