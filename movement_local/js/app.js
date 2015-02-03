App = Ember.Application.create();

App.Router.map(function(){
  this.resource('/');
  this.resource("setup");
  this.resource("characterAssignment");
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
    // controller.set('currentPlayer', Game.players[PassManager.playerIdx]);
  }
});

App.CharacterAssignmentController = Ember.ObjectController.extend({
  // currentPlayer : Game.players[PassManager.playerIdx],

  actions : {
    next : function(){
      PassManager.next();
    }
  }
});


var PassManager = Ember.StateManager.create({
  initialState : 'pass',
  // players : [],
  playerIdx : 0,

  reset : function(){
    this.players = Game.players;
    this.playerIdx = 0;
  },

  next : function(){
    console.log("this: " + this.get("currentState.name") + " ember: " + Ember.get("PassManager.currentState.name") );

    console.log("playerIdx: " + PassManager.playerIdx);
    if(Ember.get("PassManager.currentState.name") == "pass"){
      this.transitionTo("act");
    } else {
      console.log("playerIdx: " + Ember.get("PassManager.playerIdx") + " players.length "+ Object.keys(Game.players).length );

      if(Ember.get("PassManager.playerIdx") == Object.keys(Game.players).length - 1){
        this.transitionTo("done");
      } else {
        this.transitionTo("pass");
      }
    }
  },

  // currentPlayer : function(){
  //   return "Player " + (players[playerIdx] + 1);
  // },

  // isPassing : function(){
  //   return this.get("currentState.name") == "pass";
  // },

  isActing : function(){
    return this.get("currentState.name") == "act";
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
      Ember.set("PassManager.playerIdx", PassManager.playerIdx + 1);
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
    console.log("isPassing: " + this.get("currentState.name"));
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
      Game.setup();
      console.log("entering the setup state. Time to do some setup");
    }
  }),

  characterAssignment : Ember.State.create({
    enter: function(stateManager) {
      PassManager.reset();
    }
  })
});

Ember.Handlebars.helper('format-square',function(square){
  return Util.squareDescription(square);
});

Ember.Handlebars.helper('current-player-public',function(){
  return "Player " + (PassManager.playerIdx + 1) ;
});

Ember.Handlebars.helper('current-player-reveal',function(){
  return Game.players[PassManager.playerIdx].color;
});