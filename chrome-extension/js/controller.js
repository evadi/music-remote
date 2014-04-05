var Controller = (function()
{
   var $this;
   
   //contructor
   function Controller()
   {
      $this = this;
   }
   
   //play or pause has been sent from the remote player
   Controller.prototype.playPause = function(targetId)
   {
      chrome.tabs.sendMessage(targetId, { action: "play-pause" });
   };
   
   //rewind has been sent from the remote player
   Controller.prototype.rewind = function(targetId)
   {
      chrome.tabs.sendMessage(targetId, { action: "rewind" });
   };
   
   //forward has been sent from the remote player
   Controller.prototype.forward = function(targetId)
   {
      chrome.tabs.sendMessage(targetId, { action: "forward" });
   };
   
   //repeat has been sent from the remote player
   Controller.prototype.repeat = function(targetId)
   {
      chrome.tabs.sendMessage(targetId, { action: "repeat" });
   };
   
   //shuffle has been sent from the remote player
   Controller.prototype.shuffle = function(targetId)
   {
      chrome.tabs.sendMessage(targetId, { action: "shuffle" });
   };
   
   //rating up has been sent from the remote player
   Controller.prototype.rating = function(targetId, value)
   {
      chrome.tabs.sendMessage(targetId, { action: "rating", value: value });
   };
   
   //inform the player that a remote has become available
   Controller.prototype.remoteAvailable = function(targetId)
   {
      chrome.tabs.sendMessage(targetId, { action: "remote-available" });
   };
   
   //inform the player that a remote has been closed
   Controller.prototype.remoteUnavailable = function(targetId)
   {
      chrome.tabs.sendMessage(targetId, { action: "remote-unavailable" });
   };
   
   //inform the remote that the connection to the player has been lost
   Controller.prototype.connectionLost = function()
   {
      chrome.runtime.sendMessage({ action: "connection-lost" });
   };
   
   //update has been sent from the content script
   Controller.prototype.updateRemote = function(viewModel)
   {
      //sends a message to anyone that is listening that can deal with this action
      chrome.runtime.sendMessage({ action: "remote-update", model: viewModel });
   };
   
   
   return Controller;
      
})();


