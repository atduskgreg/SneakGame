var InstructionPlayer = {
  soundPath : 'public/sounds',
  sounds : {},
  loadSounds : function(){
    for(var i = 0 ; i < Util.colors.length; i++){
      this.sounds[Util.colors[i]] = {};
      this.sounds[Util.colors[i]].hold = new Howl({
        urls : [this.soundPath + "/" + Util.colors[i]+"_holds.mp3"]
      });
      this.sounds[Util.colors[i]].move = new Howl({
        urls : [this.soundPath + "/move_" + Util.colors[i]+".mp3"]
      });

      this.sounds.dirs = {};
      dirs = Object.keys(Util.moves);
      for(var i = 0; i < dirs.length; i++){
        if(dirs[i] != "hold"){
          this.sounds.dirs[dirs[i]] = new Howl({
            urls : [this.soundPath + "/" + dirs[i] + ".mp3"]
          });
        }
      }
    }
  },

  playInstruction : function(opts, callback){
    console.log(opts)

    if(opts.move == "hold"){
      this.sounds[opts.color].hold.play();
    } else {
      this.sounds[opts.color].move._onend = [];
      this.sounds[opts.color].move._onend.push(function(){
        (function(dir){
          InstructionPlayer.sounds.dirs[dir]._onend = [];
          InstructionPlayer.sounds.dirs[dir]._onend.push(function(){
            if(callback){
              callback();
            }
          });
          InstructionPlayer.sounds.dirs[dir].play();
        })(opts.move)
      });

      this.sounds[opts.color].move.play();
    }

  }
}