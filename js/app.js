

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
    SoundManager.initSounds();
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
      e.data.controller.refresh();
    },
    startGame : function(e){
      e.preventDefault;
      Dog.goToRoute("setupMap")
    }
  }
}));

var sketches = [];
Dog.route("/setupMap", new Dog.Controller({
  template : "setupMap",
  enter : function(){
    SoundManager.sounds.openingTheme.play();
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
      var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
              if(mutation.addedNodes.length > 0 && mutation.addedNodes[0].nodeName == "CANVAS"){
                $("#blueprintWrapper").append($("#blueprint")); 
                $("#blueprint").show();
              }
          });
      });
      var config = { attributes: false, childList: true, characterData: false }
      target = $("#blueprint")[0];
      observer.observe(target, config);
      var blueprintSketch = new p5(blueprint, target);
      sketches.push(blueprintSketch);

      printableSketch = new p5(blueprint, $("#printableCanvasWrapper")[0]);
      printableSketch.drawPrintable();
      sketches.push(printableSketch);

      blankSketch = new p5(blueprint, $("#blankBoardWrapper")[0]);
      blankSketch.drawBlankBoard();
      sketches.push(blankSketch);

      $("canvas").hide();
      $("#blueprint canvas").show();

  },
  exit : function(){
    $("#blueprint").hide();
    for(var i = 0; i < sketches.length; i++){
      sketches[i].remove();
    }
    SoundManager.sounds.openingTheme.fadeOut(0, 2000);
  },
  actions : {
    printBlank : function(e){
      e.preventDefault();
      var dataUrl = $("canvas")[2].toDataURL(); 
      var windowContent = '<!DOCTYPE html>';
      windowContent += '<html>'
      windowContent += '<head><title>Sneak Board</title></head>';
      windowContent += '<body>'
      windowContent += '<img width="100%" src="' + dataUrl + '">';
      windowContent += '</body>';
      windowContent += '</html>';
      var printWin = window.open('','');
      printWin.document.open();
      printWin.document.write(windowContent);
      printWin.document.close();
      printWin.focus();
      printWin.print();
      printWin.close();
    },
    printBoard : function(e){
      e.preventDefault();
      var dataUrl = $("canvas")[1].toDataURL(); 
      var windowContent = '<!DOCTYPE html>';
      windowContent += '<html>'
      windowContent += '<head><title>Sneak Board</title></head>';
      windowContent += '<body>'
      windowContent += '<img width="100%" src="' + dataUrl + '">';
      windowContent += '</body>';
      windowContent += '</html>';
      var printWin = window.open('','');
      printWin.document.open();
      printWin.document.write(windowContent);
      printWin.document.close();
      printWin.focus();
      printWin.print();
      printWin.close();
    },
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

    receivedItems = PM.currentPlayer().itemsReceivedInRound(Game.roundNum);

    // hack because from is stored as color
    for(var i = 0; i < receivedItems.length; i++){
      receivedItems[i].from = Game.characterWithAttribute("color", receivedItems[i].from);
    }
    acquiredFrom = [];
    for(var i = 0; i < receivedItems.length; i++){
      acquiredFrom.push(receivedItems[i].from.color);
    }

    playerKnowledge = PM.currentPlayer().currentKnowledge();

    newKnowledge = [];
    for(color in playerKnowledge){
      if(playerKnowledge[color].when == Game.roundNum || playerKnowledge[color].receivedAt == Game.roundNum){
        if(color != PM.currentPlayer().color){
          // prevent someone who just gave you the plans from telling you they don't have them
          if(acquiredFrom.indexOf(playerKnowledge[color].receivedFrom) == -1){
            newKnowledge.push(Util.knowledgeDescription(playerKnowledge[color]));
          }
        }
      }
    }

    somethingLearned = (newKnowledge.length > 0) || (acquiredFrom.length > 0);

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

    // FIXME: refactor this to just use this array in the template
    others = PM.currentPlayer().shootingTargets();
    shootingTargets = [];
    for(var i =0 ; i< others.length; i++){
      shootingTargets.push({color: others[i].color, displayName : others[i].presentationString()});
    }

    poisonTargets = Game.poisoningTargetsFor(PM.currentPlayer());

    return {
      receivedItems : receivedItems,
      knowledge : characters,
      newKnowledge : newKnowledge,
      somethingLearned : somethingLearned,
      you : you,
      hasGun : you.hasItem("gun"),
      shootingTargets : shootingTargets,
      canPoison : you.canPoison(),
      poisonTargets : poisonTargets,
      hasPlans : you.hasItem("plans"),
      firstRound : firstRound,
      moveInputs : moveInputs
    }
  }, actions :{
    submitMove : function(e){
      e.preventDefault();
      move = $(this).attr("x-move");
      
      if(move == "shoot"){
        console.log("shooting: " + $("#shoot input[name='targetColor']").val());
        // do shooting things
        target = Game.characterWithAttribute("color", $("#shoot input[name='targetColor']:checked").val())
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
        target = Game.characterWithAttribute("color", $("#poison input[name='targetColor']:checked").val())
        Game.poisonCharacter(target, {poisoner : PM.currentPlayer()});

        // TODO: should you be able to both poison and move on the same turn?
        PM.currentPlayer().setNextMove(Util.moves["hold"]);

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

    gameResult = Game.checkVictory();
    if(gameResult){
      Game.result = gameResult;
      Dog.goToRoute("gameOver");
    }

  },

  afterRender : function(){
    InstructionPlayer.loadSounds();
  },

  exit : function(){
    Game.endRound();
    Game.transferKnowledgeAndItems(Game.currentDialogs());
    InstructionPlayer.stop();
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
    playInstructions : function(e){
      $("#playButton").attr('disabled', true);
      InstructionPlayer.playInstructions($(".moveInstruction"),function(){
        $("#playButton").attr('disabled', false);
      });
    },
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

Dog.route("/gameOver", new Dog.Controller({
  template : "gameOver",
  getData : function(){
    Game.result.message = new Handlebars.SafeString(Game.result.message);
   

    return {
      oneWinner: !Game.result.draw,
      result : Game.result,
      deathCauses : Game.result.deathCauses
    }
  },
  afterRender : function(){
    $("#losers").css("width", Game.result.deathCauses.length*252 + "px");
  },
  actions : {

  }
}));

Dog.route("/pass", new Dog.Controller({
  template : "pass",
  getData : function(){
    return {
      nextPlayerNum : (PM.currentPlayer().tablePosition+1)
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
        $("#debugViewInner").toggle();
      }
    }
  }));
})

PassManager = function(args){
  this.i = 0;
  this.complete = false;
  this.currentRoute = args.current;
  this.nextRoute = args.next;
  this.updateActivePlayers();
}

PassManager.prototype.updateActivePlayers = function(){
  this.activePlayers = [];
  for(key in Game.players){
    if(!Game.players[key].dead){
      this.activePlayers.push(Game.players[key]);
    }
  }
}

PassManager.prototype.currentPlayer = function(){
  return this.activePlayers[this.i];
}

PassManager.prototype.next = function(){
  this.i++;

  if(this.i >= this.activePlayers.length){
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

SoundManager = {
  sounds : {},
  initSounds : function(){
    console.log("initSounds");
    this.sounds.openingTheme = new Howl({
      urls : ["public/sounds/opening_theme.mp3"],
      volume : 0.5
    });

    // No place to use this right now
    // this.sounds.chatter = new Howl({
    //   urls : ["public/sounds/crowd_noise.mp3"],
    //   volume : 0.5,
    //   loop : true
    // });
  },
  mute : function(){
    for(key in this.sounds){
      this.sounds[key].mute();
    }
  }
}

Handlebars.registerHelper("any", function(arr, options){
  if(arr.length > 0){
     return options.fn(this);
  } else {
    return options.inverse(this);
  }
})

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

Handlebars.registerHelper("formatPlayer", function(player, options){
  return "Player " + (player.tablePosition + 1);
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