import Ember from "ember";

export default Ember.ObjectController.extend({
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