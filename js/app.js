App = Ember.Application.create();

App.Router.map(function(){
  this.resource('/');
  this.resource("setup");
  this.resource("characterAssignment");
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

    controller.set('exit', Game.exit);
    controller.set('instructions', Game.setupInstructions());
  }
});

App.CharacterAssignmentRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("characterAssignment");
  }
});

App.MovesRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("moveInput");
    currPlayer = Game.players[Object.keys(Game.players)[PassManager.playerIdx]];
    console.log("legal moves: ");
    console.log(currPlayer.legalMoves());
    controller.set("model", currPlayer.legalMoves());
  }
});

App.MoveInstructionsRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("moveInstructions");

    controller.set('instructions', Game.moveInstructions);
    controller.set('victims', Game.newShootingVictims());
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
    return this.get("characters")[0].color + " (" + this.get("characters")[0].name + ") and " + this.get("characters")[1].color+ " (" + this.get("characters")[1].name + ")";
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
          this.transitionToRoute("moves");
        }
      }
    }
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
    targets = Game.targetsFor(currPlayer);
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
      if(targetCharacter.isPlayer){
        Game.winner = currPlayer;
        this.transitionToRoute("victory");
      } else {
        console.log("hit NPC");
        Game.killCharacter(targetCharacter, {killer : currPlayer});

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
    controller.set("winner", Game.winner);

  }
});

App.MovesController = Ember.ObjectController.extend({
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
        this.set("model", currPlayer.legalMoves());
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
})

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
  return p.rank() + " " + Util.capitalize(p.color);
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

  var result = "<p>Learned this turn:</p>"
  result += "<ul>"

  numLearned = 0;

  playerKnowledge = currPlayer.currentKnowledge();

  itemActions = currPlayer.itemHistoryForRound(Game.roundNum);
  acquiredFrom = [];
  for(var i = 0; i < itemActions.length; i++){
    if(itemActions[0].action == "got"){
      acquiredFrom.push(itemActions[0].from);
      result += "<li>";
      result += Util.capitalize(itemActions[0].from) + " says, \"I have the plans. Take them and escape to the exit!\"";
      result += "</li>";
    }
  }

  for(color in playerKnowledge){
    if(playerKnowledge[color].when == Game.roundNum || playerKnowledge[color].receivedAt == Game.roundNum){
      if(color != currPlayer.color){
        numLearned++;
        if(acquiredFrom.indexOf(playerKnowledge[color].receivedFrom) == -1){
          result += "<li>";
          result += Util.knowledgeDescription(playerKnowledge[color]);
          result += "</li>";
        }
      }
    }
  }
  if(numLearned == 0){
    result += "<li>Nothing learned this turn.</li>";
  }

  result += "</ul>"

  // itemize (highlight) new knowledge gained
  // show total knowledge
  result +=  "<p>Characters you've been told don't have the plans are marked with an 'X'. The character you believe has the plans is marked with a 'P'.</p>";

  result += "<table id='checklist'>";
  result += "<tr>"
  sortedChars = Util.sortBy(Game.characters, Util.compareRank);

  for(var i = 0; i < sortedChars.length; i++){
    if( i == sortedChars.length/2){
      result += "</tr><tr>";
    }  

    charKnowledge = playerKnowledge[sortedChars[i].color];


    result += "<td style='background-color:" + sortedChars[i].color +"'";
    if(charKnowledge && (charKnowledge.when == Game.roundNum || charKnowledge.receivedAt == Game.roundNum)){
      if(sortedChars[i].color == "red"){
        result += " class='newKnowledgeRed'"
      } else {
        result += " class='newKnowledge'"
      }
    }

    result += "'>";

    if(charKnowledge){

      if(sortedChars[i].color == "black"){
        result += "<span class='blackKnowledge'>"
      }
      if(charKnowledge.plans){
        result += "P";
      } else {
        result += "X";

      }

      if(sortedChars[i].color == "black"){
        result += "</span>"
      }

      
    }

    result += "</td>";
  }

  result += "</tr></table>"


  return new Handlebars.SafeString(result);
});

Ember.Handlebars.helper('current-player-inventory',function(){
  currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
  currPlayer = Game.players[currPlayerKey];

  var result = "";

  if(currPlayer.inventory.length > 0){
    for(var k =0; k < currPlayer.inventory.length; k++){
      result += "<li>" + currPlayer.inventory[k].name + "</li>";
    }
  } else {
    result += "<li>You have no items</li>";
  }
  
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
        result += "<td id='"+j+"x"+i+"'><span class='squareDescription'>"+Util.squareDescription({col: j, row: i})+"</span></td>";  
      }
     result += "</tr>";
    }
  result += "</table><div id='playerDebug'></div></div>";
  return new Handlebars.SafeString(result);
});