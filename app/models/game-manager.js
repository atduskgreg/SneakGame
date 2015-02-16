import Ember from "ember";

export default Ember.StateManager.create({
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
      Game.propagateKnowledge(Game.currentDialogs());
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