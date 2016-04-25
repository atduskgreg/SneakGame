var Map = {
  setupDone : false,
  cells : [],
  DIRS : {E : {col : 1,  row : 0},
          N : {col : 0,  row : 1},
          W : {col : -1, row:  0},
          S : {col : 0,  row: -1}},
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
    if(!this.setupDone){
      for(var row = 0; row < Game.boardHeight; row++){
        for(var col = 0; col < Game.boardWidth; col++){
          this.cells.push({col : col, row: row});
        }
      }
  
      this.buildMap_connectedRooms();
      this.highlightIndoorCells();
      this.highlightCells(this.getDoorCells(), "door");
      doorCells = this.getDoorCells();
      console.log("door cells");
      for(var i = 0; i < doorCells.length; i++){
        dir = this.doorDirection(doorCells[i])
        $(Util.squareSelector(doorCells[i])).addClass(dir + "Door");
      }

      this.setupDone = true;
    }
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
    doorPairs = [];
    while(outdoorCells.length > 0){
      //  pick a random element in the array
      cell = outdoorCells[Math.floor(Math.random() * outdoorCells.length)];
      //  find all the cells connected to that element
      area = Map.getConnectedCells(cell);

      // get the edge cells of this area
      edges = this.getSetEdges(area);

      //  pick a random edge cell and add a door to one of its indoor neighbors
      edgeIdx = Math.floor(Math.random() * edges.length);
      doorTo = edges[edgeIdx];    
      
      indoorNeighbors = this.getDisconnectedNeighbors(doorTo, this.orthoDirs);
      doorFrom = indoorNeighbors[Math.floor(Math.random() * indoorNeighbors.length)];
      doorPairs.push([doorFrom, doorTo]);

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

    for(var i = 0; i < doorPairs.length; i++){
      this.addDoor(doorPairs[i][0], doorPairs[i][1]);
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

  partForCell : function(cell){
    code = this.partCodeForCell(cell);
    
    // // Use this to generate the lookup table:
    // parts = [
    //   {"name": "emt", "codes": ["0000"]},
    //   {"name": "wll", "codes": ["1000", "0100", "0010", "0001"]},
    //   {"name": "dor", "codes": ["2000", "0200", "0020", "0002"]},
    //   {"name": "hll", "codes": ["1010", "0101"]},
    //   {"name": "hdr", "codes": ["2010", "1020", "0102", "0201"]},
    //   {"name": "cnr", "codes": ["0011", "1100", "0110", "0011", "1001"]},
    //   {"name": "cd1", "codes": ["0021", "1002", "2100", "0210"]},
    //   {"name": "cd2", "codes": ["0012", "2001", "1200", "0120"]}
    // ];

    // partDictionary = {}
    // for(var i = 0; i < parts.length; i++){
    //   for(var j = 0; j < parts[i].codes.length; j++){
    //     partDictionary[parts[i].codes[j]] = parts[i].name;
    //   }
    // }
    // parts = JSON.stringify(partDictionary)


    parts = {"1000":"wll","1001":"cnr","1002":"cd1","1010":"hll","1020":"hdr","1100":"cnr","1200":"cd2","2000":"dor","2001":"cd2","2010":"hdr","2100":"cd1","0000":"emt","0100":"wll","0010":"wll","0001":"wll","0200":"dor","0020":"dor","0002":"dor","0101":"hll","0102":"hdr","0201":"hdr","0011":"cnr","0110":"cnr","0021":"cd1","0210":"cd1","0012":"cd2","0120":"cd2"};
    return parts[this.partCodeForCell(cell)];
  },

  partCodeForCell : function(cell){
    // only indoor cells get wall parts to prevent duplication
    if(!cell.indoors){
      return "0000";
    }

    n = this.getNeighbor(cell, this.DIRS.N);
    e = this.getNeighbor(cell, this.DIRS.E);
    w = this.getNeighbor(cell, this.DIRS.W);
    s = this.getNeighbor(cell, this.DIRS.S);

    neighbors = [n,e,s,w]; // clockwise order from north

    partCode = "";
    for(var i = 0; i < neighbors.length; i++){
      if(!neighbors[i]){
        if(cell.indoors){
          partCode += "1"; // outer wall
        } else {
          partCode += "0";
        }
      } else {
        if(Map.areCellsConnected(cell, neighbors[i])){
          if(cell.doorTo && Util.sameSquare(cell.doorTo, neighbors[i])){
            partCode += "2"; // door
          } else {
            partCode += "0"; // no wall
          }
  
          } else {
            partCode += "1"; // wall
          }
      }
      
    }

    return partCode;

  },

  getConnectedCells : function(cell){
    result = this.getPathMap(cell).keys();
    // isolated cells should be connected to themselves
    if(result.length == 0){
      result.push(cell);
    }
    return result;
  },

  getSetEdges : function(cells){
    var edgeCells = [];
    for(var i = 0; i < cells.length; i++){
      connectedNeighbors = this.getConnectedNeighbors(cells[i], this.orthoDirs);
      if(connectedNeighbors.length < this.getNeighbors(cells[i], this.orthoDirs).length || connectedNeighbors.length == 0){
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

  // TODO: store neighbors on cell so this doesn't
  //  requiring looping through all cells.
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
    cell1.doorTo = cell2;
  },

  areCellsConnected : function(cell1, cell2){
    if(!cell || !cell2){
      return false;
    }

    if(cell1.indoors == cell2.indoors){
      return true;
    }
    if(cell1.doorTo && Util.sameSquare(cell1.doorTo, cell2)){
      return true;
    }
    if(cell2.doorTo && Util.sameSquare(cell2.doorTo, cell1)){
      return true;
    }

    return false;
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

  doorDirection : function(cell){
    return Util.cardinalDescription(cell, cell.doorTo);
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

  highlightDoorCells : function(){
    doorCells = this.getDoorCells();
    console.log("door cells");
    for(var i = 0; i < doorCells.length; i++){
      dir = this.doorDirection(doorCells[i])
      $(Util.squareSelector(doorCells[i])).addClass(dir + "Door");
    }
  },



  clearHighlights : function(className){
    $("td").removeClass(className || 'highlight');
  },

  clear : function(){
    this.clearHighlights();
    this.clearHighlights("door");
    this.clearHighlights("nDoor");
    this.clearHighlights("eDoor");
    this.clearHighlights("wDoor");
    this.clearHighlights("sDoor");

    this.clearHighlights("path");
    this.cells = [];
    for(var i = 0; i < this.cells.length; i++){
      this.cells[i].indoors = false;
    }
  }
}