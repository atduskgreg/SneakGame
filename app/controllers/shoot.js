import Ember from "ember";
import GameManager from "../models/game-manager";
// import PassManager from "../models/pass-manager";

export default Ember.ObjectController.extend({
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