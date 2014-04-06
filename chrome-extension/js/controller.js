var remoteWindow;
var tab;
var _controller;

var actions = Object.freeze({
   PLAY_PAUSE: "play-pause",
   FORWARD: "forward",
   REWIND: "rewind",
   REPEAT: "repeat",
   SHUFFLE: "shuffle",
   RATING: "rating",
   REMOTE_UNAVAILABLE: "remote-unavailable",
   REMOTE_AVAILABLE: "remote-available",
   CONNECTION_LOST: "connection-lost",
   REMOTE_UPDATE: "remote-update"
});


//static controller
var controller = Object.freeze({
   
   setup: function(source) {
      tab = source;
   },
   
   //play or pause has been sent from the remote player
   playPause: function()   {
      chrome.tabs.sendMessage(tab.id, { action: actions.PLAY_PAUSE });
   },
   
   //rewind has been sent from the remote player
   rewind: function() {
      chrome.tabs.sendMessage(tab.id, { action: actions.REWIND });
   },
   
   //forward has been sent from the remote player
   forward: function()   {
      chrome.tabs.sendMessage(tab.id, { action: actions.FORWARD });
   },
   
   //repeat has been sent from the remote player
   repeat: function()   {
      chrome.tabs.sendMessage(tab.id, { action: actions.REPEAT });
   },
   
   //shuffle has been sent from the remote player
   shuffle: function()   {
      chrome.tabs.sendMessage(tab.id, { action: actions.SHUFFLE });
   },
   
   //rating up has been sent from the remote player
   rating: function(value)   {
      chrome.tabs.sendMessage(tab.id, { action: actions.RATING, value: value });
   },
   
   //inform the player that a remote has become available
   remoteAvailable: function()   {
      chrome.tabs.sendMessage(tab.id, { action: actions.REMOTE_AVAILABLE });
   },
   
   //inform the player that a remote has been closed
   remoteUnavailable: function()   {
      chrome.tabs.sendMessage(tab.id, { action: actions.REMOTE_UNAVAILABLE });
   },
   
   //inform the remote that the connection to the player has been lost
   connectionLost: function()   {
      chrome.runtime.sendMessage({ action: actions.CONNECTION_LOST });
   },
   
   //update has been sent from the content script
   updateRemote: function(viewModel)   {
      //sends a message to anyone that is listening that can deal with this action
      chrome.runtime.sendMessage({ action: actions.REMOTE_UPDATE, model: viewModel });
   },
   
   //opens a google play music tab instance
   openPlayer: function()  {
      chrome.tabs.create({ url: "https://play.google.com/music" });
   }
      
});

//messages from content scripts
chrome.extension.onRequest.addListener(function(request, sender, sendResponse)
{
   if (request.action == "setup")
   {
      if (tab !== undefined) {
         tab = sender.tab;
      }
   }
   else if (request.action == "update")
   {
      if (sender.tab.id == tab.id)  {
         controller.updateRemote(request.model);
      }
   }
});

//hookup event for when the user clicks the browserAction. Reuse the same window
chrome.browserAction.onClicked.addListener(function(currentTab) {
   if (remoteWindow === undefined)
   {
      chrome.windows.create({ url: 'player-test.html', type: 'panel', width: 300, height: 400, focused: true }, function(window)
      {
         remoteWindow = window;
         
         if (tab !== undefined)
         {
            //check it
            if (!isTabValid(tab))
            {
               tab = undefined;
               findMatchingTab(function(matchFound)
               {
                  if (matchFound)
                     controller.remoteAvailable(tab.id);
               });
            }
            else //tab is valid
            {
               controller.remoteAvailable(tab.id);
            }
         }
         else
         {
            findMatchingTab(function(matchFound)
            {
               if (matchFound)
                  controller.remoteAvailable(tab.id);
            });
         }
         
      });
   }
   else
   {
      chrome.windows.update(remoteWindow.id, { focused: true });
   }
});

//when the window is closed then clear the cached value
chrome.windows.onRemoved.addListener(function(windowId) {
   if (remoteWindow !== undefined)
   {
      if (remoteWindow.id == windowId)
      {
         remoteWindow = undefined;
         controller.remoteUnavailable(tab.id);
      }
   }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, currentTab)
{
   if (tab !== undefined)
   {
      if (tabId == tab.id)
      {
         //we don't yet have a tab
         var isValid = isTabValid(currentTab);
         if (!isValid)
         {
            tab = undefined;
            controller.connectionLost();
         }
         else
         {
            if (tab.status != "complete" && currentTab.status == "complete")
            {
               tab = currentTab; //update our cached version of the tab
               controller.remoteAvailable(tab.id);
            }
         }
      }
   }
   else
   {
      //we don't yet have a tab
      var isValid = isTabValid(currentTab);
      if (isValid)
      {
         tab = currentTab;
         if (tab.status == "complete")
         {
            controller.remoteAvailable(tab.id);
         }
      }
   }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo)
{
   if (tab !== undefined)
   {
      if (tabId == tab.id)
      {
         tab = undefined;
         controller.connectionLost();
      }
   }
});

//checks the specified tab matches the google play music url
function isTabValid(selectedTab)
{
   var url = selectedTab.url;
   var n = url.indexOf("https://play.google.com");
   if (n > -1)
   {
      return true;
   }
   else
   {
      return false;
   }
}

//finds a tab that matches the google play music url
function findMatchingTab(response)
{
   chrome.tabs.query({
        url: "https://play.google.com/music/*"
    }, function(tabs) {
        if (tabs.length > 0) {
            tab = tabs[0]; //set the tab found
            response(true);
        } else {
            response(false);
        }
    });
}
