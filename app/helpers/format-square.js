import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper('format-square',function(square){
  return Util.squareDescription(square);
});