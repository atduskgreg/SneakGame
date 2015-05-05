var InstructionPlayer = {
  soundPath : 'public/sounds',
  colors : ["red", "green", "yellow", "blue","white","black", "pink", "orange","brown", "gray"],
  delay : 3000,
  sounds : {},
  currentSound : null,
  stopped : true,
  instructions : [],
  loadSounds : function(){
    for(var i = 0; i < this.colors.length; i++){
      this.sounds[this.colors[i]] = {};
      this.sounds[this.colors[i]].holds = new Howl({
        urls : [this.soundPath + "/" + this.colors[i]+"_holds.mp3"]
      });
      this.sounds[this.colors[i]].move = new Howl({
        urls : [this.soundPath + "/move_" + this.colors[i]+".mp3"]
      });

      this.sounds.dirs = {};
      dirs = Object.keys(Util.moves);
      for(var j = 0; j < dirs.length; j++){
        if(dirs[j] != "hold"){
          this.sounds.dirs[dirs[j]] = new Howl({
            urls : [this.soundPath + "/" + dirs[j] + ".mp3"]
          });
        }
      }
    }
  },

  playInstructions : function(elems, callback){
    this.instructions = this.parseInstructions(elems);
    this.stopped = false;
    this.currInstruction = 0;
    this.playNextInstruction(callback);
  },

  currInstruction : 0,
  playNextInstruction : function(callback){
    this.playInstruction(this.instructions[this.currInstruction], function(){
    InstructionPlayer.currInstruction++;
      if(InstructionPlayer.currInstruction < InstructionPlayer.instructions.length){
        InstructionPlayer.playNextInstruction(callback);
      } else {
        if(callback){
          callback();
        }
      }
    });
  },

  parseInstructions : function(elems){
    return $("#moveInstructions li").map(function(){
      return InstructionPlayer.parseInstruction($(this))
    });
  },

  stop : function(fadeOutDuration){
    if(this.currentSound){
      this.currentSound.fadeOut(0, fadeOutDuration);
    }
    this.stopped = true;
  },

  parseInstruction : function(e){
    words = e.text().split(".")[0].split(" ");
    return {move :  words[words.length - 1], color: words[words.length - 2].toLowerCase()};
  },

  playSound : function(sound){
    if(!this.stopped){
      sound.play();
      this.currentSound = sound;
    }
  },

  playInstruction : function(opts, callback){
    if(opts.move == "holds"){
      this.sounds[opts.color].holds._onend = [];
      this.sounds[opts.color].holds._onend.push(function(){
        if(callback){
          setTimeout(callback, InstructionPlayer.delay);
        }
      });
      this.playSound(this.sounds[opts.color].holds);
    } else {
      this.sounds[opts.color].move._onend = [];
      this.sounds[opts.color].move._onend.push(function(){
        (function(dir){
          InstructionPlayer.sounds.dirs[dir]._onend = [];
          InstructionPlayer.sounds.dirs[dir]._onend.push(function(){
            if(callback){
              setTimeout(callback, InstructionPlayer.delay);
            }
          });
          InstructionPlayer.playSound(InstructionPlayer.sounds.dirs[dir]);

        })(opts.move)
      });

      this.playSound(this.sounds[opts.color].move);
    }

  }
}