var COMPILED_FLAG = false;
var TEST_FLAG = false;
var BASE_URL = '';

// Append this to the end of a remote URL to force it to bypass the cache
// and be redownloaded.
var forceRedownload = '?' + new Date().getTime();

function loadScript(src) {
  var theScript = document.createElement('script');
  theScript.type = 'text/javascript';
  if (src.substr(0, 4) == 'http')
    theScript.src = src + forceRedownload;
  else if (BASE_URL)
    theScript.src = BASE_URL + src + forceRedownload;
  else
    theScript.src = chrome.extension.getURL(src) + forceRedownload;
  document.getElementsByTagName('head')[0].appendChild(theScript);
}

loadScript('chromevox/background/bookmark_manager.js');
