App = Ember.Application.create();

App.Router.map(function(){
  this.resource('/');
  this.resource("setup");
  this.resource("characterAssignment");
  this.resource("poison");
  this.resource("moves");
  this.resource("moveInstructions");
  this.resource("dialogs");
  this.resource("dialogReveals");
  this.resource("shoot");
  this.resource("victory");
});

// setup local storage adapter for data
App.ApplicationSerializer = DS.LSSerializer.extend();
App.ApplicationAdapter = DS.LSAdapter.extend({  
  namespace: 'sneak_game'
});
var attr = DS.attr;
App.ApplicationStore = DS.Store.extend();

// model for storing game config
App.Config = DS.Model.extend({
  onScreen : DS.attr('boolean', {defaultValue: false}),
  updateDebug : function(){
    Game.hidePlayers = this.get("onScreen");
  }.observes("onScreen")
});


App.IndexRoute = Ember.Route.extend({
  setupController : function(controller, model){
    // create the config record for this game
    config = this.store.createRecord('config', {onScreen : false});
    config.save();

    route = this;
    config.addObserver('onScreen',function(){
      route.controllerFor("application").set("debugIsVisible", config.get("onScreen"));
    });

    controller.set("model", config);

  }
});


App.SetupRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("setup");
    Game.drawDebug();

    controller.set("onScreen", this.store.all("config").get("firstObject").get("onScreen"));

    controller.set('exit', Game.exit);
    controller.set('instructions', Game.setupInstructions());
  }
});

App.CharacterAssignmentRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("characterAssignment");
  }
});

App.PoisonRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("poisonInput");
    // NOTE: controller.set("targets") gets set in the PoisonController
    // (rather than heresince it needs to be bound to the PassManager
    // to get updated with each player's turn
  }

});


App.MovesRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("moveInput");
    currPlayer = Game.players[Object.keys(Game.players)[PassManager.playerIdx]];

    model= currPlayer.legalMoves();
    model.onScreen = this.store.all("config").get("firstObject").get("onScreen");

    controller.set("model", model);
  }
});

App.MoveInstructionsRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("moveInstructions");

    gameResult = Game.checkVictory();
    if(gameResult){
      Game.result = gameResult;
      controller.transitionToRoute("victory");
    }

    controller.set("onScreen", this.store.all("config").get("firstObject").get("onScreen"));
    controller.set('instructions', Game.moveInstructions);
    controller.set('victims', Game.newVictims());
  }
});

App.DialogsRoute = Ember.Route.extend({

  setupController : function(controller, model){
    GameManager.transitionTo("dialogs");

    var dialogs = Game.currentDialogs();
    var result = [];
    var keys = Object.keys(dialogs);
    for(var i = 0; i < keys.length; i++){
      result.push(dialogs[keys[i]]);
    }

    controller.set("model", result);
  }
});

App.DialogsController = Ember.ArrayController.extend({
    itemController : 'dialog'
});

App.DialogController = Ember.ObjectController.extend({

  summary : function(){
    return new Handlebars.SafeString(this.get("characters")[0].presentationString() + " and " + this.get("characters")[1].presentationString());
  }.property("characters")
});

App.DialogRevealsRoute = Ember.Route.extend({


  setupController : function(controller, model){
    GameManager.transitionTo("dialogReveal");
    // controller.set("model", currentPlayerKnowledge());
  }
});

App.DialogRevealsController = Ember.ArrayController.extend({
    itemController : 'dialogReveal',
    actions : {
      next : function(){
        PassManager.next();
        if(PassManager.get("currentState.name") == "done"){
          this.transitionToRoute("poison");
        }
      }
    }
});

App.PoisonController = Ember.ObjectController.extend({
  model : {},
  actions : {
    poison : function(){
      // get target and execute poisoning
      console.log("targetColor: " + this.get("targetColor"));
      targetCharacter = Game.characterWithAttribute("color", this.get("targetColor"));
      currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
      currPlayer = Game.players[currPlayerKey];
      Game.poisonCharacter(targetCharacter, {poisoner : currPlayer});

      PassManager.next();
      if(PassManager.get("currentState.name") == "done"){
        this.transitionToRoute("moves");
      }
    },

    next :function(){
      PassManager.next();
      if(PassManager.get("currentState.name") == "done"){
        this.transitionToRoute("moves");
      }
    },
  }
});

App.PoisonController.reopen({
  updateTargets : function(){
    currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
    currPlayer = Game.players[currPlayerKey];

    // we seem to get called at a weird point in the PM lifecycle
    // where sometimes playerIdx is wrong. Also we don't need to
    // do set targets when we're out of the poisoning phase
    if(currPlayer && GameManager.get("currentState.name") == "poisonInput"){
      
      if(currPlayer.canPoison()){
        targets = Game.poisoningTargetsFor(currPlayer);
        targetColors = [];
        for(var i = 0; i < targets.length; i++){
          targetColors.push(targets[i].color);
        }

        this.set("firstTarget", targetColors[0]);
        this.set("targets", targetColors);
        if(targetColors.length == 0){
          this.set("noTargets", true);
        } else {
          this.set("noTargets", false);
        }

        this.set("canPoison", true);
      } else {
        this.set("noTargets", false);
        this.set("canPoison", false);
      }
    }
  }.observes("PassManager.currentState.name")
});

App.CharacterAssignmentController = Ember.ObjectController.extend({
  actions : {
    next : function(){
      PassManager.next();
      if(PassManager.get("currentState.name") == "done"){
        this.transitionToRoute("moves");
      } else {

      }
    }
  }
});

App.ShootRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("pickTarget");
    currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
    currPlayer = Game.players[currPlayerKey];
    targets = Game.shootingTargetsFor(currPlayer);
    targetColors = [];
    for(var i = 0; i < targets.length; i++){
      targetColors.push(targets[i].color);
    }

    controller.set("targets", targetColors);
  }
});

App.ShootController = Ember.ObjectController.extend({
  model : {},
  actions : {
    fire : function(){
      currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
      currPlayer = Game.players[currPlayerKey];

      targetCharacter = Game.characterWithAttribute("color", this.get("targetColor"));
      // TODO: refactor this to use Game.checkVictory (and killCharacter)
      if(targetCharacter.isPlayer){
        Game.result.winner = currPlayer;
        Game.result.message = targetCharacter.color + " was shot by " + currPlayer.color + "."; 
        this.transitionToRoute("victory");
      } else {
        console.log("hit NPC");
        Game.killCharacter(targetCharacter, {killer : currPlayer, method : "shooting"});

        gun = currPlayer.itemWithAttribute("name", "gun");
        currPlayer.dropItem(gun);
        Game.removeItem(gun);

        // hidePlayers = this.store.all("config").get("firstObject").get("onScreen")
        Game.drawDebug();
        PassManager.next();
        if(PassManager.get("currentState.name") == "done"){
          this.transitionToRoute("moveInstructions");
        } else {
          this.transitionToRoute("moves");
        }
      }
    }
  }
});

App.VictoryRoute = Ember.Route.extend({
  setupController : function(controller, model){
    controller.set("oneWinner", !Game.result.draw);
    controller.set("result", Game.result);

  }
});

App.MovesController = Ember.ObjectController.extend({
  content : {},
  actions : {
    submitMove : function(move){
      console.log("submit move: " + move);
      currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
      currPlayer = Game.players[currPlayerKey];
      // here's where we resolve gun actions
      if(move == "shoot"){
        console.log("shoot");
        this.transitionToRoute("shoot");
        return;
      } else if(move == "drop"){
        console.log("drop");
        gun = currPlayer.itemWithAttribute("name", "gun");
        currPlayer.dropItem(gun);
      } else {
        currPlayer.setNextMove(Util.moves[move]);
      }

      console.log("moves pass next");
      PassManager.next();

      if(PassManager.get("currentState.name") == "done"){
        this.transitionToRoute("moveInstructions");
      } else {
        // load up the model so we can hide illegal move inputs
        // for the next player
        currPlayer = Game.players[Object.keys(Game.players)[PassManager.playerIdx]];
        model = currPlayer.legalMoves();
        model.onScreen = this.store.all("config").get("firstObject").get("onScreen");
        this.set("model", model);
      }
    },

    next : function(){
      PassManager.next();

    }
  }
});

App.MoveInstructionsController = Ember.ObjectController.extend({
  model : {},
  instructions : null,
  actions : {
    confirm : function(){
      console.log("confirm moves");

      this.transitionToRoute("dialogs");
    }
  }
});

App.ApplicationController = Em.ObjectController.extend({ 
  debugIsVisible : false,

  actions : {
    toggleDebug : function(){
      if(Game.exit && Object.keys(Game.characters).length > 0){
        Game.drawDebug();
      }
      this.toggleProperty('debugIsVisible');
    }.observes(""),

    // TODO:
    //  temporary hack until Game is an ember model
    //  and this can be handled with bindings
    refreshDebug : function(){
      console.log("refresh debug");
      if(Game.exit && Object.keys(Game.characters).length > 0){
        Game.drawDebug();
      }
    }
  }
});

// App.ApplicationController.reopen({

// });

App.DebugView = Ember.View.extend();

var PassManager = Ember.StateManager.create({
  initialState : 'pass',
  playerIdx : 0,

  reset : function(){
    this.players = Game.players;
    PassManager.playerIdx = 0;
    this.transitionTo("pass");
    Game.drawDebug();
  },

  next : function(){
    if(PassManager.currentState.name == "pass"){
      this.transitionTo("act");
    } else {
      if(PassManager.playerIdx == Object.keys(Game.players).length - 1){
        this.transitionTo("done");
      } else {
        this.transitionTo("pass");
      }
    }
    Game.drawDebug();

  },

  pass : Ember.State.create({
    enter: function(stateManager) {
      console.log("PM entering pass");
    } 
  }),

  act : Ember.State.create({
    enter: function(stateManager) {
      console.log("PM entering act");
    },
    exit: function(stateManager) {
      PassManager.playerIdx = PassManager.playerIdx + 1;
    } 
  }),

  done : Ember.State.create({
    enter: function(stateManager) {
      console.log("PassManager done");
    } 
  })
});

PassManager.reopen({
  isPassing : function(){
    return this.get("currentState.name") == "pass";
  }.property("currentState.name")
});

var GameManager = Ember.StateManager.create({
  initialState: 'start',

  start: Ember.State.create({
    exit: function(stateManager) {
      console.log("exiting the start state");
    }
  }),

  setup: Ember.State.create({
    enter: function(stateManager) {
      console.log("entering the setup state. Time to do some setup");
      Game.setup();
    }
  }),

  characterAssignment : Ember.State.create({
    enter: function(stateManager) {
      console.log("enter characterAssignment");
      PassManager.reset();
    }
  }),

  poisonInput : Ember.State.create({
    enter: function(stateManager) {
      console.log("enter poisonInput");
      PassManager.reset();
    },

    exit : function(stateManager){
      console.log("exit poisonInput");
    }
  }),

  moveInput : Ember.State.create({
    enter: function(stateManager) {
      console.log("begin moveInput playerIdx: " + PassManager.playerIdx);
      if(PassManager.playerIdx > 1){
        PassManager.reset();
      }
    },

    exit : function(stateManager){
      console.log("exit moveInput");
    }
  }),

  moveInstructions : Ember.State.create({
    enter: function(stateManager) {
      console.log("begin moveInstructions");
      Game.makeMoves();
      Game.checkPoisonings();
      Game.pickupItems();
      Game.calculateMoveInstructions();
    }
  }),

  dialogs : Ember.State.create({
    enter: function(stateManager) {
      console.log("begin dialogs");
            PassManager.reset();

    },
    exit : function(stateManager){
      PassManager.reset();

    }
  }),

  dialogReveal : Ember.State.create({
    enter: function(stateManager) {
      console.log("begin dialogReveal");
      Game.transferKnowledgeAndItems(Game.currentDialogs());
      // Game.pickupItems();
      
      PassManager.reset();
    }, 
    exit : function(stateManager) {
      Game.endRound();
    } 
  }),

  pickTarget : Ember.State.create({
    enter: function(stateManager) {
      console.log("begin pickTarget");
    }, 
    exit : function(stateManager) {
    } 
  })
});

Ember.Handlebars.helper('format-square',function(square){
  return Util.squareDescription(square);
});

Ember.Handlebars.helper('current-player-public',function(){
  return "Player " + (PassManager.playerIdx + 1) ;
});

Ember.Handlebars.helper('current-player-color',function(){
  return Game.players[Object.keys(Game.players)[PassManager.playerIdx]].color;
});

Ember.Handlebars.helper('current-player-rank-color',function(){
  p = Game.players[Object.keys(Game.players)[PassManager.playerIdx]];
  return p.presentationString();
});

Ember.Handlebars.helper('current-player-name',function(){
  return Game.players[Object.keys(Game.players)[PassManager.playerIdx]].name;
});

Ember.Handlebars.helper('rank-list',function(){
  return Util.ranks.join(", ");
});

Ember.Handlebars.helper('current-player-knowledge',function(){
  currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
  currPlayer = Game.players[currPlayerKey];
  playerKnowledge = currPlayer.currentKnowledge();

  result = "<div class='span-14' style='margin-bottom: 20px'>";
  sortedChars = Util.sortBy(Game.characters, Util.compareRank);

  for(var i = 0; i < sortedChars.length; i++){
    if(i == 5){
      result += "</div><div class='span-14'>"
    }    

    charKnowledge = playerKnowledge[sortedChars[i].color];

    result += "<div class='candidateContainer";
    
    result += "'>\
              <div class='candidateImage";
    
    result += "' style=\"background-image: url(\'public/images/"+sortedChars[i].color+".png\');\"  class='span-2'>";
    if(charKnowledge && !charKnowledge.plans){
      result += "<img class='marked' src='public/images/x.png' />";
    }
    if(charKnowledge && charKnowledge.plans){
      result += "<img class='marked' src='public/images/circle.png' />";
    }

    result +="</div>\
              <p class='name'>("+sortedChars[i].nameAndRank()+")</p>\
            </div>"
  }

  result += "</div>"


  return new Handlebars.SafeString(result);

});

Ember.Handlebars.helper('current-player-conversations',function(){
  currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
  currPlayer = Game.players[currPlayerKey];

  var result = "<table>"
  result += "<tr class='tableHeader'><td>Source</td> <td>Statement</td></tr>"

  numLearned = 0;

  playerKnowledge = currPlayer.currentKnowledge();

  itemActions = currPlayer.itemHistoryForRound(Game.roundNum);
  acquiredFrom = [];
  for(var i = 0; i < itemActions.length; i++){
    if(itemActions[0].action == "got"){
      acquiredFrom.push(itemActions[0].from);
      result += "<tr>";
      result += "<td>"+Util.displayCharacterWithColor(itemActions[0].from) +"</td><td>\"I have the plans. Take them and escape to the exit!\"</td>";
      result += "</tr>";
    }
  }

  for(color in playerKnowledge){
    if(playerKnowledge[color].when == Game.roundNum || playerKnowledge[color].receivedAt == Game.roundNum){
      if(color != currPlayer.color){
        numLearned++;
        if(acquiredFrom.indexOf(playerKnowledge[color].receivedFrom) == -1){
          result += "<tr>";
          result += Util.knowledgeDescription(playerKnowledge[color]);
          result += "</tr>";
        }
      }
    }
  }

  if(numLearned == 0){
    result += "<td><em>none</em></td><td><em>none</em></td>";
  }
  result += "</table>";

  return new Handlebars.SafeString(result);
});

Ember.Handlebars.helper('current-player-inventory',function(){
  currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
  currPlayer = Game.players[currPlayerKey];


  ownedInventory = {gun : false, poison : currPlayer.canPoison(), plans : false}
  if(currPlayer.inventory.length > 0){
    for(var k =0; k < currPlayer.inventory.length; k++){
      ownedInventory[currPlayer.inventory[k].name] = true;
    }
  }

  var result = "<div class='inventoryItem'>\
    <div class='itemName'>Gun</div>";
  if(ownedInventory.gun){
     result += "<div class='itemPossession possessed'>Yes</div>"

  } else {
    result += "<div class='itemPossession'>No</div>"
  }

    
  result += "<br style='clear:both' /></div><div class='inventoryItem'>\
    <div class='itemName'>Plans</div>";
  if(ownedInventory.plans){
     result += "<div class='itemPossession possessed'>Yes</div>"
  } else {
    result += "<div class='itemPossession'>No</div>"
  }
  result += "<br style='clear:both' /></div><div class='inventoryItem'>\
    <div class='itemName'>Poison</div>"
  if(ownedInventory.poison){
     result += "<div class='itemPossession possessed'>Yes</div>"
  } else {
    result += "<div class='itemPossession'>No</div>"
  }
  result += "<br style='clear:both' /> </div>";


  // if(currPlayer.inventory.length > 0){
  //   for(var k =0; k < currPlayer.inventory.length; k++){
  //     result += "<li>" + currPlayer.inventory[k].name + "</li>";
  //   }
  // } else {
  //   result += "<li>You have no items</li>";
  // }
  
  return new Handlebars.SafeString(result);
});



// TODO:
//  Horrible hack that should go away when Game
//  and Player become proper model objects.
Ember.Handlebars.helper('debug-view',function(){
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