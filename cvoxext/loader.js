// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview Inject the script into the page.
 * We need to inject since this is the only way to get at the ChromeVox
 * JS APIs that are added to the page.
 * @author clchen@google.com (Charles L. Chen)
 */

/**
  @param {String} url url to load script of. */
var loadScript = function(url) {
  var urlStartsWith = function(str) {
    return url.indexOf(str) == 0;
  }
  var scripts = ['namespaces',
                 'speakable',
                 'speakableManager',
                 'util',
                 'iframe_util',
                 'listeners_loader',
                 'alias'];

  var forceRedownload = '?' + new Date().getTime();
/*
  for (var i=0; i<scripts.length; ++i) {
    var commonScript = document.createElement('script');
    commonScript.type = 'text/javascript';
    commonScript.src = window.chrome.extension.getURL(
        'common/'+scripts[i]+'.js') + forceRedownload;

    document.head.appendChild(commonScript);
  }
*/
  var commonScript = document.createElement('script');
  commonScript.type = 'text/javascript';
  commonScript.src = window.chrome.extension.getURL(
       'common/extensions_common.js') + forceRedownload;
  document.head.appendChild(commonScript);


  var apiScript = document.createElement('script');
  apiScript.type = 'text/javascript';
  var scriptName;

  if (urlStartsWith('https://plus.google.com/hangouts') ||
      urlStartsWith('https://plus.sandbox.google.com/hangouts') ||
      urlStartsWith('https://plus.google.com/u/0')) {
    scriptName = 'hangoutvox';
  }
  else if (urlStartsWith('https://plus.google.com') ||
      urlStartsWith('https://plus.sandbox.google.com')) {
    scriptName = 'plus';
  }
  else if (urlStartsWith('http://books.google.com')) {
    scriptName = 'booksvox';
  }

  else if (urlStartsWith('https://mail.google.com')) {
    console.log('came here');
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
  else if (urlStartsWith('http://www.google.com/finance')) {
    scriptName = 'finance';
  }
  else if (urlStartsWith('http://iplayif.com/?story=')) {
    scriptName = 'iplayif';
  }
  apiScript.src = window.chrome.extension.getURL('extensions/' +
      scriptName + '.js') + forceRedownload;

  //apiScript.src = window.chrome.extension.getURL(
  //    'common/test.js') + forceRedownload;
  document.head.appendChild(apiScript);
};
loadScript(document.location.href);
