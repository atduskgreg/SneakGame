App = Ember.Application.create();

App.Router.map(function(){
  this.resource('/');
  this.resource("setup");
  this.resource("characterAssignment");
  this.resource("moves");
  this.resource("moveInstructions");
  this.resource("dialogs");
});

App.SetupRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("setup");

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
  }
});

App.MoveInstructionsRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("moveInstructions");

    controller.set('instructions', Game.moveInstructions());
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

App.CharacterAssignmentController = Ember.ObjectController.extend({
  actions : {
    next : function(){
      PassManager.next();
      if(PassManager.get("currentState.name") == "done"){
        this.transitionToRoute("moves");
      }
    }
  }
});

App.MovesController = Ember.ObjectController.extend({
  actions : {
    submitMove : function(move){
      console.log("submit move: " + move);
      // HERE: apply move to player
      currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
      console.log(currPlayerKey);
      Game.players[currPlayerKey].setNextMove(Util.moves[move]);
      PassManager.next();
      if(PassManager.get("currentState.name") == "done"){
        this.transitionToRoute("moveInstructions");
      }
    },

    next : function(){
      PassManager.next();

    }
  }
});

App.MoveInstructionsController = Ember.ObjectController.extend({
  instructions : null,
  actions : {
    confirm : function(){
      console.log("confirm moves");
      Game.makeMoves();
      this.transitionToRoute("dialogs");
    }
  }
});

App.ApplicationController = Em.ObjectController.extend({ 
  debugIsVisible : false,

  actions : {
    toggleDebug : function(){
      this.toggleProperty('debugIsVisible');
    },

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

App.DebugView = Ember.View.extend();

var PassManager = Ember.StateManager.create({
  initialState : 'pass',
  playerIdx : 0,

  reset : function(){
    this.players = Game.players;
    PassManager.playerIdx = 0;
    this.transitionTo("pass");
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
      console.log("begin moveInput");
      PassManager.reset();
    }
  }),

  moveInstructions : Ember.State.create({
    enter: function(stateManager) {
      console.log("begin moveInstructions");
    }
  }),

  dialogs : Ember.State.create({
    enter: function(stateManager) {
      console.log("begin dialogs");
    }
  }),
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

// TODO:
//  Horrible hack that should go away when Game
//  and Player become proper model objects.
Ember.Handlebars.helper('debug-view',function(){
  var result = "<table id='board'>"
  for(var i = Game.boardHeight-1; i >= 0; i--){
      result += "<tr>";
      for(var j = 0; j <= Game.boardWidth-1; j++){
        result += "<td id='"+j+"x"+i+"'><span class='squareDescription'>"+Util.squareDescription({col: j, row: i})+"</span></td>";  
      }
     result += "</tr>";
    }
  result += "</table>";
  result += "<div id='players'><h3>Players</h3>";
  result += "<ul>";

  var keys = Object.keys(Game.players);
  console.log(keys.length);
  for(var i = 0; i < keys.length; i++){
    console.log(i);
    player = Game.players[keys[i]];
    result += "<li>" + player.displayString() + "</li>";
  }

  result += "</ul></div>";

  return new Handlebars.SafeString(result);
});