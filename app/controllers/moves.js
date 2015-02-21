import Ember from "ember";
import GameManager from "../models/game-manager";
// import PassManager from "../models/pass-manager";

export default Ember.ObjectController.extend({
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