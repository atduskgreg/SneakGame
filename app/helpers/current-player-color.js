import Ember from "ember";
import PassManager from "../models/pass-manager";

export default Ember.Handlebars.makeBoundHelper(function(){
  return Game.players[Object.keys(Game.players)[PassManager.playerIdx]].color;
});
