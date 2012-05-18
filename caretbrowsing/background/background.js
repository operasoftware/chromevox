// Copyright 2011 Google Inc.
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
 * @fileoverview Script that runs on the background page.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

/**
 * The class handling the Caret Browsing background page, which keeps
 * track of the current state, handles the browser action button, and
 * initializes the content script in all running tabs when the extension
 * is first loaded.
 * @constructor
 */
var CaretBkgnd = function() {};

/**
 * The localStorage preference used to remember if caret browsing is enabled.
 * @type {string}
 * @const
 */
CaretBkgnd.ENABLED_FLAG = 'caretBrowsingEnabled';

/**
 * Flag indicating whether caret browsing is enabled. Global, applies to
 * all tabs simultaneously.
 * @type {boolean}
 */
CaretBkgnd.isEnabled;

/**
 * Change the browser action icon and tooltip based on the enabled state.
 */
CaretBkgnd.setIcon = function() {
  chrome.browserAction.setIcon(
      {'path': CaretBkgnd.isEnabled ?
               '../caret_19_on.png' :
               '../caret_19.png'});
  chrome.browserAction.setTitle(
      {'title': CaretBkgnd.isEnabled ?
                'Turn Off Caret Browsing (F7)' :
                'Turn On Caret Browsing (F7)' });
};

/**
 * This is called when the extension is first loaded, so that it can be
 * immediately used in all already-open tabs. It's not needed for any
 * new tabs that open after that, the content script will be automatically
 * injected into any new tab.
 */
CaretBkgnd.injectContentScripts = function() {
  chrome.windows.getAll({'populate': true}, function(windows) {
    for (var i = 0; i < windows.length; i++) {
      var tabs = windows[i].tabs;
      for (var j = 0; j < tabs.length; j++) {
        for (var k = 0; k < CONTENT_SCRIPTS.length; k++) {
          chrome.tabs.executeScript(
              tabs[j].id,
              {file: CONTENT_SCRIPTS[k], allFrames: true});
        }
      }
    }
  });
};

/**
 * Send a message to all tabs with the current state of the enabled flag.
 */
CaretBkgnd.updateTabs = function() {
  chrome.windows.getAll({'populate': true}, function(windows) {
    for (var i = 0; i < windows.length; i++) {
      var tabs = windows[i].tabs;
      for (var j = 0; j < tabs.length; j++) {
        chrome.tabs.sendRequest(
            tabs[j].id,
            {'enabled': CaretBkgnd.isEnabled});
      }
    }
  });
};

/**
 * Toggle caret browsing on or off, and update the browser action icon and
 * all open tabs.
 */
CaretBkgnd.toggle = function() {
  CaretBkgnd.isEnabled = !CaretBkgnd.isEnabled;
  localStorage[CaretBkgnd.ENABLED_FLAG] = CaretBkgnd.isEnabled;
  CaretBkgnd.setIcon();
  CaretBkgnd.updateTabs();
};

/**
 * Initialize the background script. Set the initial value of the flag
 * based on the saved preference in localStorage, update the browser action,
 * inject into running tabs, and then set up communication with content
 * scripts in tabs.
 */
CaretBkgnd.init = function() {
  CaretBkgnd.isEnabled = (localStorage[CaretBkgnd.ENABLED_FLAG] == 'true');
  CaretBkgnd.setIcon();
  CaretBkgnd.injectContentScripts();
  CaretBkgnd.updateTabs();

  chrome.browserAction.onClicked.addListener(function(tab) {
    CaretBkgnd.toggle();
  });

  chrome.extension.onRequest.addListener(
      function(request, sender, sendResponse) {
        if (request['toggle']) {
          CaretBkgnd.toggle();
        }
        if (request['init']) {
          sendResponse({'enabled': CaretBkgnd.isEnabled});
        }
      });
};

CaretBkgnd.init();
