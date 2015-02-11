App = Ember.Application.create();

App.Router.map(function(){
  this.resource('/');
  this.resource("setup");
  this.resource("characterAssignment");
  this.resource("moves");
  this.resource("moveInstructions");
  this.resource("dialogs");
  this.resource("dialogReveals");
  this.resource("shoot");
});

App.SetupRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("setup");

    controller.set('exit', Game.exit);
    controller.set('instructions', Game.setupInstructions());
  }
});

App.CharacterAssignmentRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("characterAssignment");
  }
});

App.MovesRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("moveInput");
    currPlayer = Game.players[Object.keys(Game.players)[PassManager.playerIdx]];
    controller.set("model", currPlayer.legalMoves());
  }
});

App.MoveInstructionsRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("moveInstructions");

    controller.set('instructions', Game.moveInstructions());
  }
});

App.DialogsRoute = Ember.Route.extend({

  setupController : function(controller, model){
    GameManager.transitionTo("dialogs");

    var dialogs = Game.currentDialogs();
    var result = [];
    var keys = Object.keys(dialogs);
    for(var i = 0; i < keys.length; i++){
      result.push(dialogs[keys[i]]);
    }

    controller.set("model", result);
  }
});

App.DialogsController = Ember.ArrayController.extend({
    itemController : 'dialog'
});

App.DialogController = Ember.ObjectController.extend({

  summary : function(){
    return this.get("characters")[0].color + " (" + this.get("characters")[0].name + ") and " + this.get("characters")[1].color+ " (" + this.get("characters")[1].name + ")";
  }.property("characters")
});

App.DialogRevealsRoute = Ember.Route.extend({


  setupController : function(controller, model){
    GameManager.transitionTo("dialogReveal");
    // controller.set("model", currentPlayerKnowledge());
  }
});

App.DialogRevealsController = Ember.ArrayController.extend({
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

// App.DialogRevealController = Ember.ObjectController.extend({

//   knowledge : function(){
//     console.log("knowledge helper");
//     // return Util.knowledgeDescription(this.get("k"));
//   }.property(),

//   inventory : function(){
//     // use PassManager to get the current player
//     // currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
//     // currPlayer = Game.players[currPlayerKey];
//     // itemize (highlight) new items gained
//     // show all itms
    
//   }
// });


App.CharacterAssignmentController = Ember.ObjectController.extend({
  actions : {
    next : function(){
      PassManager.next();
      if(PassManager.get("currentState.name") == "done"){
        this.transitionToRoute("moves");
      }
    }
  }
});

App.ShootRoute = Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("pickTarget");
    currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
    currPlayer = Game.players[currPlayerKey];
    targets = Game.targetsFor(currPlayer);
    targetNames = [];
    for(var i = 0; i < targets.length; i++){
      targetNames.push(targets[i].name);
    }

    controller.set("targets", targetNames);
  }
});

App.ShootController = Ember.ObjectController.extend({
  content : {},
  actions : {
    fire : function(){
      targetCharacter = Game.characterWithAttribute("name", this.get("targetName"));
    }
  }
});

App.MovesController = Ember.ObjectController.extend({
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

App.MoveInstructionsController = Ember.ObjectController.extend({
  instructions : null,
  actions : {
    confirm : function(){
      console.log("confirm moves");
      for(i in Game.characters){
        console.log(Game.characters[i].color + " from " + Util.squareDescription(Game.characters[i].position) +"["+Game.characters[i].position.col+"x"+Game.characters[i].position.row+"]" + " to " + Util.squareDescription(Game.characters[i].nextPosition()) +" [" + Game.characters[i].heading().col +"x" +Game.characters[i].heading().row + "]")
      }
      Game.makeMoves();

      this.transitionToRoute("dialogs");
    }
  }
});

App.ApplicationController = Em.ObjectController.extend({ 
  debugIsVisible : false,

  actions : {
    toggleDebug : function(){
      this.toggleProperty('debugIsVisible');
    },

    // TODO:
    //  temporary hack until Game is an ember model
    //  and this can be handled with bindings
    refreshDebug : function(){
      console.log("refresh debug");
      if(Game.exit && Object.keys(Game.characters).length > 0){
        Game.drawDebug();
      }
    }
  }
});

App.DebugView = Ember.View.extend();

var PassManager = Ember.StateManager.create({
  initialState : 'pass',
  playerIdx : 0,

  reset : function(){
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
  })
});

PassManager.reopen({
  isPassing : function(){
    return this.get("currentState.name") == "pass";
  }.property("currentState.name")
})

var GameManager = Ember.StateManager.create({
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
      console.log("begin moveInput");
      PassManager.reset();
    }
  }),

  moveInstructions : Ember.State.create({
    enter: function(stateManager) {
      console.log("begin moveInstructions");
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
      Game.pickupItems();
      
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

Ember.Handlebars.helper('format-square',function(square){
  return Util.squareDescription(square);
});

Ember.Handlebars.helper('current-player-public',function(){
  return "Player " + (PassManager.playerIdx + 1) ;
});

Ember.Handlebars.helper('current-player-color',function(){
  return Game.players[Object.keys(Game.players)[PassManager.playerIdx]].color;
});

Ember.Handlebars.helper('current-player-name',function(){
  return Game.players[Object.keys(Game.players)[PassManager.playerIdx]].name;
});

Ember.Handlebars.helper('current-player-knowledge',function(){
  currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
  currPlayer = Game.players[currPlayerKey];

  // itemize (highlight) new knowledge gained
  // show total knowledge
  var result = "";

  if(Object.keys(currPlayer.knowledge).length > 0){

    for(i in currPlayer.knowledge){
  
       result += "<li>"
      if(currPlayer.knowledge[i].acquired == Game.roundNum ){
        result += "<b>NEW</b> "
      }
      result += Util.knowledgeDescription(currPlayer.knowledge[i]) + "</li>";
    }
  } else {
    result += "<li>You know nothing.</li>"
  }

  return new Handlebars.SafeString(result);
});

Ember.Handlebars.helper('current-player-inventory',function(){
  currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
  currPlayer = Game.players[currPlayerKey];

  var result = "";

  if(currPlayer.inventory.length > 0){
    for(var k =0; k < currPlayer.inventory.length; k++){
      result += "<li>" + currPlayer.inventory[k].name + "</li>";
    }
  } else {
    result += "<li>You have no items</li>";
  }
  
  return new Handlebars.SafeString(result);
});



// TODO:
//  Horrible hack that should go away when Game
//  and Player become proper model objects.
Ember.Handlebars.helper('debug-view',function(){
  var result = "<div id='debug'><table id='board'>"
  for(var i = Game.boardHeight-1; i >= 0; i--){
      result += "<tr>";
      for(var j = 0; j <= Game.boardWidth-1; j++){
        result += "<td id='"+j+"x"+i+"'><span class='squareDescription'>"+Util.squareDescription({col: j, row: i})+"</span></td>";  
      }
     result += "</tr>";
    }
  result += "</table><div id='playerDebug'></div></div>";

  return new Handlebars.SafeString(result);
});