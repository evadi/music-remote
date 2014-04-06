var Player = (function()
{
   var $this;
   var container;
   var intervalId;
   var delay = 300;
   
   var sendUpdate = function()
   {
      //scrape the page for current state
      var viewModel = $this.toViewModel();

      //send page state back to caller
      chrome.extension.sendRequest({ action:"update", model: viewModel });
   };
   
   function Player()
   {
      $this = this;
      container = $("#player");
   }
   
   Player.prototype.forceUpdate = function()
   {
      //clear any timeouts currently active
      clearInterval(intervalId);
      
      //send the update
      sendUpdate();
      
      //start another schedule
      $this.scheduleUpdate();
   };
   
   Player.prototype.scheduleUpdate = function()
   {
      intervalId = setInterval(function()
      {
         sendUpdate();
      }, delay);
   };
   
   Player.prototype.cancelSchedule = function()
   {
      clearInterval(intervalId);
   }
   
   Player.prototype.play = function()
   {
      $("button[data-id='play-pause']").click();
      $this.forceUpdate();
   };
   
   Player.prototype.rewind = function()
   {
      $("button[data-id='rewind']").click();
      $this.forceUpdate();
   };
   
   Player.prototype.forward = function()
   {
      $("button[data-id='forward']").click();
      $this.forceUpdate();
   };
   
   Player.prototype.repeat = function()
   {
      $("button[data-id='repeat']").click();
      $this.forceUpdate();
   };
   
   Player.prototype.shuffle = function()
   {
      $("button[data-id='shuffle']").click();
      $this.forceUpdate();
   };
   
   Player.prototype.rating = function(value)
   {
      $(".rating-container li[data-rating=" + value + "]").click();
      $this.forceUpdate();
   };
   
   Player.prototype.toViewModel = function()
   {
      //create viewmodel and set default values
      var viewModel = new Object();
      viewModel.play = "disabled";
      viewModel.rewind = "disabled";
      viewModel.forward = "disabled";
      viewModel.repeat = "NO_REPEAT";
      viewModel.shuffle = "NO_SHUFFLE";
      viewModel.rating = 0;
      viewModel.ratingType = "thumb";
      viewModel.thumbsDown = "disabled";
      viewModel.songTitle = "";
      viewModel.artist = "";
      viewModel.album = "";
      viewModel.coverImageUrl = "";
      viewModel.progress = {
         current: "",
         duration: "",
         progress: "",
         maxMilli: 0,
         currentMilli: 0
      };
      
      //now determine the actual values
      var playButton = $("button[data-id='play-pause']");
      if (playButton.length > 0)
      {
         if (!!playButton.attr('disabled'))
         {
            viewModel.play = "disabled";
         }
         else //button is not disabled
         {
            if (playButton.hasClass("playing"))
            {
               viewModel.play = "playing";
            }
            else{
               viewModel.play = "paused";
            }
         }
      }
      
      var rewindButton = $("button[data-id='rewind']");
      if (rewindButton.length > 0)
      {
         if (!!rewindButton.attr('disabled'))
         {
            viewModel.rewind = "disabled";
         }
         else //button is not disabled
         {
            viewModel.rewind = "enabled";
         }
      }
      
      var forwardButton = $("button[data-id='forward']");
      if (forwardButton.length > 0)
      {
         if (!!forwardButton.attr('disabled'))
         {
            viewModel.forward = "disabled";
         }
         else //button is not disabled
         {
            viewModel.forward = "enabled";
         }
      }
      
      var repeatButton = $("button[data-id='repeat']");
      if (repeatButton.length > 0)
      {
         viewModel.repeat = repeatButton.val();
      }
      
      var shuffleButton = $("button.flat-button[data-id='shuffle']");
      if (shuffleButton.length > 0)
      {
         viewModel.shuffle = shuffleButton.val();
      }
      
      var ratingContainer = $(".rating-container");
      if (ratingContainer.length > 0)
      {
         var isStars = ratingContainer.hasClass("stars");
         viewModel.ratingType = isStars ? 'star' : 'thumb';
         
         var ratingButton = ratingContainer.find("li.selected");
         if (ratingButton.length > 0)
         {
            viewModel.rating = parseInt(ratingButton.data("rating"));
         }
      
      }
      
      var songTitleLabel = $("#playerSongTitle");
      if (songTitleLabel.length > 0)
      {
         viewModel.songTitle = songTitleLabel.text();
      }
      
      var artistLabel = $("#player-artist");
      if (artistLabel.length > 0)
      {
         viewModel.artist = artistLabel.text();
      }
      
      var albumLabel = $(".player-album");
      if (albumLabel.length > 0)
      {
         viewModel.album = albumLabel.text();
      }
      
      var coverImage = $("#playingAlbumArt");
      if (coverImage.length > 0)
      {
         viewModel.coverImageUrl = coverImage.attr("src");
      }
      
      var slider = $("#slider");
      if (slider.length > 0)
      {
         var maxMilli = slider.attr("aria-valuemax");
         var currentMilli = slider.attr("aria-valuenow");
         viewModel.progress.maxMilli = parseInt(maxMilli);
         viewModel.progress.currentMilli = parseInt(currentMilli);
      }
      
      var currentTime = $("#time_container_current");
      if (currentTime.length > 0)
      {
         viewModel.progress.current = currentTime.text();
      }
      
      var durationTime = $("#time_container_duration");
      if (durationTime.length > 0)
      {
         viewModel.progress.duration = durationTime.text();
      }
      
      return viewModel;
   };
   
   return Player;
   
})();


$(function() {
   
   var player = new Player();
   
   chrome.extension.sendRequest({ action: "setup" });
    
   chrome.runtime.onMessage.addListener(function(request, sender, response) {
      if (request.action == "remote-available")
      {
         player.forceUpdate();
      }
      else if (request.action == "remote-unavailable")
      {
         player.cancelSchedule();
      }
      else if (request.action == "play-pause")
      {
         player.play();
      }
      else if (request.action == "rewind")
      {
         player.rewind();
      }
      else if (request.action == "forward")
      {
         player.forward();
      }
      else if (request.action == "repeat")
      {
         player.repeat();
      }
      else if (request.action == "shuffle")
      {
         player.shuffle();
      }
      else if (request.action == "rating")
      {
         player.rating(request.value);
      }
   });

   
});