import Ember from "ember";
import Game from "./game"


var PassManager = Ember.StateManager.create({
  initialState : 'pass',
  playerIdx : 0,

  reset : function(){
    console.log("PassManager.reset()");
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
  }),

  isPassing : function(){
    console.log("here");
    return true;
  }
});

// PassManager.reopen({
//   isPassing : function(){
//     console.log("isPassing: " + this.get("currentState.name"));
//     return this.get("currentState.name") == "pass";
//   }.property("currentState.name")
// });

export default PassManager;