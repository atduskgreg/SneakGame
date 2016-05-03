

Dog.route("*", new Dog.Controller({
  template: "404",
  enter : function(){
    console.log("404.enter()");
  }
}))

Dog.route("/", new Dog.Controller({
  template : "start",
  enter : function(){
    Game.setupMap();

  },
  exit : function(){
    console.log("/.exit()");
    Game.setupCharacters();
    Game.drawDebug();
  },
  getData : function(){
    playerCountOptions = [];
    for(var i = 2; i <= 4; i++){
      playerCountOptions.push({
        n : i,
        selected : (i == Game.nPlayers)
      });
    }
    return {
      playerCountOptions : playerCountOptions
    }
  },
  actions : {
    pickNumPlayers : function(e){
      e.preventDefault();
      Game.nPlayers = parseInt($(this).val());
    },
    startGame : function(e){
      e.preventDefault;
      Dog.goToRoute("setupMap")
    }
  }
}));

var sketch;
Dog.route("/setupMap", new Dog.Controller({
  template : "setupMap",
  enter : function(){
    sketch = new p5(blueprint);
    $("#blueprint").show();
  },
  exit : function(){
    $("#blueprint").hide();
    sketch.remove();
  },
  actions : {
    next : function(e){
      e.preventDefault();
      Dog.goToRoute("setupCharacters");
    }
  }
}));

// public pass manager
var PM;

Dog.route("/setupCharacters", new Dog.Controller({
  template : "setupCharacters",
  getData : function(){
    return {
      instructions : Game.setupInstructions()
    }
  }, 
  actions : {
    next : function(e){
      e.preventDefault();
      PM = new PassManager({
        current : "player",
        next : "move"
      })
      Dog.goToRoute("pass");
    }
  }
}));



Dog.route("/player", new Dog.Controller({
  template : "player",
  
  getData : function(){
    console.log("/player.getData()");
    receivedItems = PM.currentPlayer().itemsReceivedInRound(Game.round);


    playerKnowledge = PM.currentPlayer().currentKnowledge();
    newKnowledge = [];
    for(color in playerKnowledge){
      if(playerKnowledge[color].when == Game.roundNum || playerKnowledge[color].receivedAt == Game.roundNum){
        if(color != PM.currentPlayer().color){
          // TODO: eliminated knowledge about the plans on the round you receive them
          //if(acquiredFrom.indexOf(playerKnowledge[color].receivedFrom) == -1){
            newKnowledge.push(Util.knowledgeDescription(playerKnowledge[color]));
          //}
        }
      }
    }

    somethingLearned = (newKnowledge.length > 0);

    sortedCharacters = Util.sortBy(Game.characters, Util.compareRank);
    sortedCharacters.splice(sortedCharacters.indexOf(PM.currentPlayer()), 1);

    characters = [];
    for(var i = 0; i < sortedCharacters.length; i++){
      result = {character : sortedCharacters[i]};

      charKnowledge = playerKnowledge[sortedCharacters[i].color]

      result.hasPlans = false;
      result.noPlans = false;
      if(charKnowledge && !charKnowledge.plans){
        result.noPlans = true;
      }

      if(charKnowledge && charKnowledge.plans){
        result.hasPlans = true;
      } 
      characters.push(result);
    }

    you = PM.currentPlayer();
    firstRound = (Game.roundNum == 1);

    order = Player.moveInputOrder[PM.currentPlayer().tablePosition]
    legalMoves = you.legalMoves();
    moveInputs = [];
    for(var i = 0; i < order.length; i++){
      dir = order[i];
      moveInputs.push({dir : dir, legal : legalMoves[dir]});
    }

    others = PM.currentPlayer().shootingTargets();

    shootingTargets = [];
    for(var i =0 ; i< others.length; i++){
      shootingTargets.push({color: others[i].color, displayName : others[i].presentationString()});
    }


    return {
      receivedItems : receivedItems,
      knowledge : characters,
      newKnowledge : newKnowledge,
      somethingLearned : somethingLearned,
      you : you,
      hasGun : you.hasItem("gun"),
      shootingTargets : shootingTargets,
      canPoison : you.canPoison(),
      hasPlans : you.hasItem("plans"),
      firstRound : firstRound,
      moveInputs : moveInputs
    }
  }, actions :{
    submitMove : function(e){
      e.preventDefault();
      move = $(this).attr("x-move");
      
      if(move == "shoot"){
        // do shooting things
        target = Game.characterWithAttribute("color", $(".targetColor").val())
        Game.killCharacter(target, {killer : PM.currentPlayer(), method : "shooting"});

        gun = PM.currentPlayer().itemWithAttribute("name", "gun");
        PM.currentPlayer().dropItem(gun);
        Game.removeItem(gun);
      } else if(move == "drop"){
        //drop the gun
        gun = PM.currentPlayer().itemWithAttribute("name", "gun");
        PM.currentPlayer().dropItem(gun);
      } else if(move == "poison"){
        //do poisoning things
      } else { // it's a movement with a direction
        PM.currentPlayer().setNextMove(Util.moves[move]);
      }

      PM.next();
      Dog.goToRoute(PM.actionRoute());
    }
  }
}));


Dog.route("/move", new Dog.Controller({
  template : "move",
  enter : function(){
    Game.makeMoves();
    Game.checkPoisonings();
    Game.pickupItems();
    Game.calculateMoveInstructions();
    Game.drawDebug();

  },
  exit : function(){
    Game.endRound();
    Game.transferKnowledgeAndItems(Game.currentDialogs());

  },
  getData : function(){
    anyVictims = (Game.newVictims().length > 0);
    instructions = Game.moveInstructions;
    victims = Game.newVictims;

    return {
      anyVictims : anyVictims,
      instructions : instructions,
      victims : victims
    }
  },
  actions : {
    next : function(e){
      e.preventDefault();
      PM = new PassManager({
        current : "player",
        next : "move"
      })
      Dog.goToRoute("pass");
    }
  }
}));

Dog.route("/pass", new Dog.Controller({
  template : "pass",
  getData : function(){
    return {
      nextPlayerNum : (PM.i+1)
    }
  },
  actions : {
    next : function(){
      Dog.goToRoute(PM.currentRoute);
    }
  }
  
}));

$(document).ready(function(){
  Dog.component("#debugView", new Dog.Controller({
    template : "debug",
    actions : {
      toggle : function(e){
        e.preventDefault();
        console.log("toggle");
        $("#debugViewInner").toggle();
      }
    }
  }));
})

PassManager = function(args){
  this.n = Game.nPlayers;
  this.i = 0;
  this.complete = false;
  this.currentRoute = args.current;
  this.nextRoute = args.next;
}

PassManager.prototype.currentPlayer = function(){
  currPlayerKey = Object.keys(Game.players)[this.i];
  return Game.players[currPlayerKey];
}

PassManager.prototype.next = function(){
  this.i++;
  if(this.i >= this.n){
    this.complete = true;
  }
}

PassManager.prototype.actionRoute = function(){
  if(this.complete){
    return this.nextRoute;
  } else {
    return "pass";
  }
}

Handlebars.registerHelper("everyX", function(index, x, options){
   if(index != 0 && (index % x) == 0){
      return options.fn(this);
  } else {
      return options.inverse(this);
  }
});

Handlebars.registerHelper("formatCharacter", function(character,options){
  return character.presentationString();
});

Handlebars.registerHelper('debug-view',function(){
  var result = "<div id='debug'><table id='board'>"
  for(var i = Game.boardHeight-1; i >= 0; i--){
      result += "<tr>";
      for(var j = 0; j <= Game.boardWidth-1; j++){
        result += "<td id='"+j+"x"+i+"'><span class='squareDescription'>" +Util.squareDescription({col: j, row: i})+"</span></td>";  
      }
     result += "</tr>";
    }
  result += "</table><div id='playerDebug'></div></div>";
  return new Handlebars.SafeString(result);
});