App = Ember.Application.create();

App.Router.map(function(){
  this.resource('/');
  this.resource("setup");
});

App.SetupRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("setup");
    controller.set('model', Game.setupInstructions());
  }
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
      Game.setup();
      console.log("entering the setup state. Time to do some setup");
    }
  })
});

