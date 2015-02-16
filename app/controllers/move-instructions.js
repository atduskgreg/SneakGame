import Ember from "ember";

export default Ember.ObjectController.extend({
  model : {},
  instructions : null,
  actions : {
    confirm : function(){
      console.log("confirm moves");
      // Game.makeMoves();

      this.transitionToRoute("dialogs");
    }
  }
});