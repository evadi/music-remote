var remoteWindow;
var tab;

var controller = new Controller();

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

//main routing functionality
chrome.extension.onRequest.addListener(function(request, sender, sendResponse)
{
   if (request.action == "setup")
   {
      tab = sender.tab;
   }
   else if (request.action == "play-pause")
   {
      controller.playPause(tab.id);
   }
   else if (request.action == "rewind")
   {
      controller.rewind(tab.id);
   }
   else if (request.action == "forward")
   {
      controller.forward(tab.id);
   }
   else if (request.action == "repeat")
   {
      controller.repeat(tab.id);
   }
   else if (request.action == "shuffle")
   {
      controller.shuffle(tab.id);
   }
   else if (request.action == "rating")
   {
      controller.rating(tab.id, request.value);
   }
   else if (request.action == "update")
   {
      controller.updateRemote(request.model);
   }
   else if (request.action == "open-player")
   {
      chrome.tabs.create({ url: "https://play.google.com/music" });
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