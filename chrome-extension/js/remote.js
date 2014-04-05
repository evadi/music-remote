window.onload = function()
{
   var defaultWindowTitle = window.document.title;
    var Remote = (function() {
      var $this;
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
         openPlayer: function() { $this.openPlayer(); }
      }
      viewModel.progress.percentage = ko.computed(function() {
         return ((this.currentMilli() / this.maxMilli()) * 100) + "%";
      }, viewModel.progress);
      viewModel.playLabel = ko.computed(function() {
         return this.playState() == "playing" ? "Pause" : "Play";
      }, viewModel);
      viewModel.artistAlbum = ko.computed(function() {
         return this.artist() !== "" ? this.artist() + " - " + this.album() : "";
      }, viewModel);
      viewModel.songArtist = ko.computed(function() {
         return this.songTitle() !== "" ? this.songTitle() + " - " + this.artist() : "";
      }, viewModel);
      viewModel.repeatLabel = ko.computed(function() {
         if (this.repeatState() == "LIST_REPEAT")
         {
            return "Playlist Repeat";
         }
         else if (this.repeatState() == "SINGLE_REPEAT")
         {
            return "Song Repeat";
         }
         else
         {
            return "No Repeat";
         }
      }, viewModel);
      viewModel.shuffleLabel = ko.computed(function() {
         return this.shuffleState() == "ALL_SHUFFLE" ? "Suffle" : "No Suffle";
      }, viewModel);
      viewModel.thumbsUpLabel = ko.computed(function() {
         return this.ratingState() == 5 ? "Up: true" : "Up: false";
      }, viewModel);
      viewModel.thumbsDownLabel = ko.computed(function() {
         return this.ratingState() == 1 ? "Down: true" : "Down: false";
      }, viewModel);
         
      //constructor
      function Remote(){
         $this = this;
      }
      
      Remote.prototype.initialise = function()
      {
         $this.model = viewModel;
         ko.applyBindings(viewModel);
      };
      
      Remote.prototype.playPause = function()
      {
         chrome.extension.sendRequest({ action: "play-pause" });
      };
      
      Remote.prototype.rewind = function()
      {
         chrome.extension.sendRequest({ action: "rewind" });
      };
      
      Remote.prototype.forward = function()
      {
         chrome.extension.sendRequest({ action: "forward" });
      };
      
      Remote.prototype.repeat = function()
      {
         chrome.extension.sendRequest({ action: "repeat" });
      };
      
      Remote.prototype.shuffle = function()
      {
         chrome.extension.sendRequest({ action: "shuffle" });
      };
      
      Remote.prototype.rating = function(value)
      {
         chrome.extension.sendRequest({ action: "rating", value: value });
      };
      
      Remote.prototype.openPlayer = function()
      {
         chrome.extension.sendRequest({ action: "open-player" });
      };
      
      Remote.prototype.processUpdate = function(model)
      {
         if (model === undefined || model === null)
         {
            $this.model.remoteState("notab");
            window.document.title = defaultWindowTitle;
            
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
               window.document.title = defaultWindowTitle;
            }
            else
            {
               $this.model.remoteState("hassong");
               window.document.title = $this.model.songArtist();
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
   
};