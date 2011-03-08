var COMPILED_FLAG = false;
var TEST_FLAG = false;
var BASE_URL = '';

/**
 * Loads the bookmark manager.
 */
function loadBookmarkManager() {
  if (document.location.toString().indexOf(
      'http://www.corp.google.com/~chaitanyag/speech/flash.html') == 0) {
    return;
  }

  // Use a hidden div to send messages from the injected content script
  // to the extension background page.
  var port = chrome.extension.connect({name: 'content2Chrome'});
  var hiddenDiv = document.createElement('div');
  hiddenDiv.id = 'cvoxPage2ExtensionDiv';
  hiddenDiv.style.display = 'none';
  document.body.appendChild(hiddenDiv);
  document.addEventListener('cvoxPage2ExtensionEvent', function() {
      var message = JSON.parse(hiddenDiv.innerHTML);
      port.postMessage(message);
    });

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

  loadScript('chromevox/injected/extension_bridge.js');
  loadScript('browser/chromeVox_ttsBridge.js');
  loadScript('tts/chromeVox_earcons.js');
  loadScript('chromevox/background/bookmark_manager_ui.js');
}

loadBookmarkManager();
