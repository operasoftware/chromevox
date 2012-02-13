// Copyright 2012 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Initializes the injected content script.
 *
 * @author edsun@google.com (Edward Sun)
 */

goog.provide('cvox.ChromeShadesToggle');

var chromeshades_on = true;
var accesserrors_on = false;

/** onToggleRequest is triggered when a toggle request is received.
 * @param {Object} request caught by listener.
 * @param {MessageSender} sender of the request.
 * @param {function()} callback function after request is processed.
 */
function onToggleRequest(request, sender, callback) {
  if (request.toggle == 'chromeshades') {
    if (chromeshades_on == true) {
      chromeshades_on = false;
      chrome.tabs.executeScript(null, {code: 'window.location.reload()'},
      function() {
        alert('ChromeShades disabled.');
      });
    }
    else {
      chromeshades_on = true;
      chrome.tabs.executeScript(null, {code: 'window.location.reload()'},
      function() {
        alert('ChromeShades enabled.');
      });
    }
  }
}

/** injectStuff injects CSS/JavaScript based on the toggle settings
 */
function injectStuff() {

  if (chromeshades_on == true) {

    var cssFiles = ['/chromeshades/chromeshades.css'];
    var jsFiles = ['/chromeShadesInjected.js',
                   '/closure/closure_preinit.js',
                   '/closure/base.js',
                   '/closure/closure_stubs.js',
                   '/common/chromevox_json.js',
                   '/host/chrome/extension_bridge.js',
                   '/common/aria_util.js',
                   '/common/xpath_util.js',
                   '/common/dom_util.js',
                   '/common/interframe.js',
                   '/common/selection_util.js',
                   '/chromeshades/injected/base_modifier.js',
                   '/chromeshades/injected/shades_modifier.js',
                   '/chromeshades/injected/init.js'];
  }

  for (var i = 0; i < cssFiles.length; i++) {
    chrome.tabs.insertCSS(null, {file: cssFiles[i], allFrames: true});
  }
  for (var j = 0; j < jsFiles.length; j++) {
    chrome.tabs.executeScript(null, {file: jsFiles[j], allFrames: true});
  }
}

chrome.tabs.onUpdated.addListener(injectStuff);
chrome.extension.onRequest.addListener(onToggleRequest);
