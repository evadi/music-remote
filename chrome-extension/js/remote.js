window.onload = function()
{
   var defaultWindowTitle = window.document.title;
   
   var commands = Object.freeze({
      NEXT: "next_song",
      PLAYPAUSE: "play-pause_song",
      PREVIOUS: "previous_song"
   });
   
   ko.extenders.logChange = function(target, option) {
       target.subscribe(function(newValue) {
          console.log(option + ": " + newValue);
       });
       return target;
   };
   
   var Remote = (function() {
      var $this;
      var controller;
      var viewModel = {
         remoteState: ko.observable("notab"),
         playState: ko.observable("disabled"),
         rewindState: ko.observable("disabled"),
         forwardState: ko.observable("disabled"),
         repeatState: ko.observable("NO_REPEAT"),
         shuffleState: ko.observable("NO_SHUFFLE"),
         ratingState: ko.observable(0),
         ratingType: ko.observable("thumb"),
         songTitle: ko.observable(""),
         artist: ko.observable(""),
         album: ko.observable(""),
         coverImageUrl: ko.observable(""),
         progress: {
            current: ko.observable(""),
            duration: ko.observable(""),
            progress: ko.observable(""),
            currentMilli: ko.observable(1),
            maxMilli: ko.observable(0)
         },
         
         playPause: function() { $this.playPause(); },
         rewind: function() { $this.rewind(); },
         forward: function() { $this.forward(); },
         repeat: function() { $this.repeat(); },
         shuffle: function() { $this.shuffle(); },
         rating: function(item, e) {
            var ratingValue = e.target.getAttribute("data-rating");
            $this.rating(ratingValue);
         },
         toggleSize: function() {
            $this.resize();
         },
         openPlayer: function() { $this.openPlayer(); }
      }
      viewModel.progress.percentage = ko.computed(function() {
         return ((this.currentMilli() / this.maxMilli()) * 100) + "%";
      }, viewModel.progress);
         
      //constructor
      function Remote () {
         $this = this;
         $this.controller = chrome.extension.getBackgroundPage().controller;
      }
      
      Remote.prototype.initialise = function () {
         $this.model = viewModel;
         ko.applyBindings(viewModel);
      };
      
      Remote.prototype.playPause = function () {
         $this.controller.playPause();
      };
      
      Remote.prototype.rewind = function () {
         $this.controller.rewind();
      };
      
      Remote.prototype.forward = function () {
         $this.controller.forward();
      };
      
      Remote.prototype.repeat = function () {
         $this.controller.repeat();
      };
      
      Remote.prototype.shuffle = function () {
         $this.controller.shuffle();
      };
      
      Remote.prototype.rating = function (value) {
         $this.controller.rating(value);
      };
      
      Remote.prototype.openPlayer = function () {
         $this.controller.openPlayer();
      };
      
      Remote.prototype.resize = function () {
         $this.controller.resizeRemote();
      };
      
      Remote.prototype.processUpdate = function(model)
      {
         if (model === undefined || model === null)
         {
            $this.model.remoteState("notab");
            
            //clear the current viewModel to defaults
         }
         else{
            $this.model.playState(model.play);
            $this.model.rewindState(model.rewind);
            $this.model.forwardState(model.forward);
            $this.model.repeatState(model.repeat);
            $this.model.shuffleState(model.shuffle);
            $this.model.ratingState(parseInt(model.rating));
            $this.model.ratingType(model.ratingType);
            $this.model.songTitle(model.songTitle);
            $this.model.artist(model.artist);
            $this.model.album(model.album);
            $this.model.coverImageUrl("https://" + model.coverImageUrl);
            $this.model.progress.current(model.progress.current);
            $this.model.progress.duration(model.progress.duration);
            $this.model.progress.currentMilli(model.progress.currentMilli);
            $this.model.progress.maxMilli(model.progress.maxMilli);
            
            if (model.songTitle === "")
            {
               $this.model.remoteState("nosong");
            }
            else
            {
               $this.model.remoteState("hassong");
            }
         }
      }
      
      return Remote;
         
   })();
   
   var remote = new Remote();
   remote.initialise();
   
   //capture messages sent from the controller
   chrome.runtime.onMessage.addListener(function(request, sender) {
      if (request.action == "remote-update")
      {
         if (remote !== undefined)
         {
            remote.processUpdate(request.model);
         }
      }
      else if (request.action == "connection-lost")
      {
         remote.processUpdate();
      }
   });
   
   chrome.commands.onCommand.addListener(function(command) {
      if (command == commands.NEXT)
      {
         remote.forward();
      }
      else if (command == commands.PLAYPAUSE)
      {
         remote.playPause();
      }
      else if (command == commands.PREVIOUS)
      {
         remote.rewind();
      }
   });
   
};