import Ember from "ember";

export default Ember.ArrayController.extend({
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