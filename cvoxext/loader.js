// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview Inject the script into the page.
 * We need to inject since this is the only way to get at the ChromeVox
 * JS APIs that are added to the page.
 * @author clchen@google.com (Charles L. Chen)
 */


/**
  @param {string} url url to load script of. */
var loadScript = function(url) {

  var urlStartsWith = function(str) {
    return url.indexOf(str) == 0;
  }
  var scripts = ['main',
                 'util',
                 'sprintf-0.7-beta1',
                 'speakable',
                 'speakable_parser',
                 'speakable_manager',
                 'traverse_manager',
                 'listeners',
                 'extension'];

  var forceRedownload = '?' + new Date().getTime();

  for (var i = 0; i < scripts.length; ++i) {
    var commonScript = document.createElement('script');
    commonScript.type = 'text/javascript';
    commonScript.src = window.chrome.extension.getURL(
        'cvoxext/common/' + scripts[i] + '.js') + forceRedownload;

    document.head.appendChild(commonScript);
  }

  var apiScript = document.createElement('script');
  apiScript.type = 'text/javascript';
  var scriptName;
  if (urlStartsWith('https://plus.google.com') ||
      urlStartsWith('https://plus.sandbox.google.com')) {
    scriptName = 'plus';
  }
  else if (urlStartsWith('http://books.google.com/books')) {
    scriptName = 'books';
  }
  else if (urlStartsWith('https://mail.google.com')) {
    scriptName = 'gmail';
  }

  else if (urlStartsWith('https://www.google.com/calendar/')) {
    scriptName = 'calendar';
  }
  else if (urlStartsWith('https://news.google.com/') ||
      urlStartsWith('http://news.google.com/')) {
    scriptName = 'news';
  }
  else if (urlStartsWith('https://drive.google.com/')) {
    scriptName = 'drive';
  }
  else if (url == 'http://www.google.com/finance') {
    scriptName = 'finance';
  }
  else if (url == 'http://www.google.com/finance/stockscreener' ||
                  url == 'http://www.google.com/finance#stockscreener') {
    scriptName = 'finance_stock_screener';
  }
  else if (urlStartsWith('http://iplayif.com/?story=')) {
    scriptName = 'iplayif';
  }
  else if (urlStartsWith('http://www.google.com/search') ||
           urlStartsWith('https://www.google.com/search')) {
    scriptName = 'calculator';
  }
  if (scriptName) {
    apiScript.src = window.chrome.extension.getURL('cvoxext/extensions/' +
        scriptName + '.js') + forceRedownload;
  }

  document.head.appendChild(apiScript);
};

/**load appropriate version of ChromeVox, can load Web Store and ChromeOS
versions */
var checkChromeVoxAndLoad = function() {
  /** @const */
  var chromeVoxIDs = {
    webstore: 'kgejglhpjiefppelpmljglcjbhoiplfn',
    chromeos: 'mndnfokpggljbaajbnioimlmbfngpief'
  };
  var port = chrome.extension.connect(chromeVoxIDs.webstore);
  window.setTimeout(
    /** @suppress {checkTypes} postMessage requires 1 argument. */
    function() {
      try {
        port.postMessage();
        loadScript(document.location.href);
      } catch (e) {
        var port2 = chrome.extension.connect(chromeVoxIDs.chromeos);
        window.setTimeout(function() {
          try {
           port2.postMessage();
            loadScript(document.location.href);
          } catch (e) {
            var install = confirm('ChromeVox Extensions needs ChromeVox. ' +
                      'Click OK to install ChromeVox');
            if (install) {
              window.open('https://chrome.google.com/webstore/detail/' +
                'kgejglhpjiefppelpmljglcjbhoiplfn');
            }
          }
        },0);

      }
    },0);
};

checkChromeVoxAndLoad();
