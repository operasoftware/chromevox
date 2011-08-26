// Copyright 2010 Google Inc.
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
 * @author clchen@google.com (Charles Chen)
 */

cvoxgoog.provide('cvox.ChromeVoxInit');

cvoxgoog.require('chromevis.ChromeVisLens');
cvoxgoog.require('cvox.AndroidDevTtsEngine');
cvoxgoog.require('cvox.AndroidEarcons');
cvoxgoog.require('cvox.AndroidRelTtsEngine');
cvoxgoog.require('cvox.BuildConfig');
cvoxgoog.require('cvox.ChromeVox');
cvoxgoog.require('cvox.ChromeVoxEventWatcher');
cvoxgoog.require('cvox.ChromeVoxKbHandler');
cvoxgoog.require('cvox.ChromeVoxNavigationManager');
cvoxgoog.require('cvox.ChromeVoxSearch');
cvoxgoog.require('cvox.ExtensionBridge');
cvoxgoog.require('cvox.LiveRegions');
cvoxgoog.require('cvox.LocalEarconsManager');
cvoxgoog.require('cvox.LocalTtsManager');
cvoxgoog.require('cvox.RemoteEarconsManager');
cvoxgoog.require('cvox.RemoteTtsManager');
cvoxgoog.require('cvox.TraverseContent');

/**
 * Initializes cvox.ChromeVox.
 */
cvox.ChromeVox.init = function() {
  if (!cvoxgoog.isDefAndNotNull(BUILD_TYPE)) {
    return;
  }

  // On Windows, cause any existing system screen readers to not try to speak
  // the web content in the browser.
  if (navigator.platform.indexOf('Win') == 0) {
    document.body.setAttribute('aria-hidden', true);
    var originalRole = document.body.getAttribute('role');
    document.body.setAttribute('role', 'application');
    document.body.setAttribute('chromevoxignoreariahidden', true);
  }

  // Setup globals
  cvox.ChromeVox.isActive = true;
  cvox.ChromeVox.traverseContent = new cvox.TraverseContent();
  cvox.ChromeVox.navigationManager =
      new cvox.ChromeVoxNavigationManager();
  cvox.ChromeVox.tts = cvox.ChromeVox.createTtsManager();
  if (window.top == window) {
    cvox.ChromeVox.lens = new chromevis.ChromeVisLens();
    // TODO:(rshearer) Added this multiplier for I/O presentation.
    cvox.ChromeVox.lens.multiplier = 2.25;
    cvox.ChromeVox.tts.setLens(cvox.ChromeVox.lens);
  }
  cvox.ChromeVox.earcons = cvox.ChromeVox.createEarconsManager(
      cvox.ChromeVox.tts);

  // Initialize common components
  cvox.ChromeVoxSearch.init();

  // Start the event watchers
  cvox.LiveRegions.init(new Date());
  cvox.ChromeVoxEventWatcher.addEventListeners();

  // Load the enhancement script loader if it's not already loaded.
  if (!document.querySelector('script[chromevoxScriptLoader]')) {
    var enhancementLoaderScript = document.createElement('script');
    enhancementLoaderScript.type = 'text/javascript';
    enhancementLoaderScript.src = 'https://www.corp.google.com/~clchen/no_crawl/chromevox/scripts/loader.js';
    enhancementLoaderScript.setAttribute('chromevoxScriptLoader', '1');
    document.head.appendChild(enhancementLoaderScript);
  }

  // Perform build type specific initialization
  cvox.ChromeVox.performBuildTypeSpecificInitialization();

  // Read the settings
  cvox.ChromeVox.loadPrefs();

  // Provide a way for modules that can't depend on cvox.ChromeVoxUserCommands
  // to execute commands.
  cvox.ChromeVox.executeUserCommand = function(commandName) {
    cvox.ChromeVoxUserCommands.commands[commandName]();
  };

  // If we're the top-level iframe, speak the title of the page +
  // the active element if it is a user control.
  if (window.parent == window) {
    var message = document.title;
    cvox.ChromeVox.tts.speak(message, 0, null);

    var activeElem = document.activeElement;
    if (cvox.DomUtil.isControl(activeElem)) {
      cvox.ChromeVox.navigationManager.syncToNode(activeElem);
      cvox.ChromeVox.navigationManager.setFocus();
      var description = cvox.DomUtil.getControlDescription(activeElem);
      description.speak(1);
    }
  }

  cvox.ChromeVox.processEmbeddedPdfs();

  if (COMPILED && BUILD_TYPE == BUILD_TYPE_CHROME) {
    cvox.ExtensionBridge.addDisconnectListener(function() {
      cvox.ChromeVox.isActive = false;
      cvox.ChromeVoxEventWatcher.removeEventListeners();
      // Clean up after ourselves on Windows to re-enable native screen readers.
      if (navigator.platform.indexOf('Win') == 0) {
        document.body.removeAttribute('aria-hidden');
        if (originalRole) {
          document.body.setAttribute('role', originalRole);
        } else {
          document.body.removeAttribute('role');
        }
        document.body.removeAttribute('chromevoxignoreariahidden');
      }
    });
  }

  var event = document.createEvent('UIEvents');
  event.initEvent('chromeVoxLoaded', true, false);
  document.dispatchEvent(event);
};

/**
 * Reinitialize ChromeVox, if the extension is disabled and then enabled
 * again, but our injected page script has remained.
 */
cvox.ChromeVox.reinit = function() {
  cvox.ExtensionBridge.init();
  cvox.ChromeVox.init();
};

/**
 * @return {cvox.AbstractTtsManager} New initialized TTS manager.
 */
cvox.ChromeVox.createTtsManager = function() {
  if (BUILD_TYPE == BUILD_TYPE_CHROME) {
    var ttsManager = new cvox.RemoteTtsManager();
    ttsManager.addBridgeListener();
    return ttsManager;
  } else if (BUILD_TYPE == BUILD_TYPE_ANDROID ||
      BUILD_TYPE == BUILD_TYPE_ANDROID_DEV) {
    return new cvox.LocalTtsManager([cvox.AndroidRelTtsEngine], null);
  } else {
    throw 'Unknown build type: ' + BUILD_TYPE;
  }
};

/**
 * @return {Object} New initialized earcons manager.
 * @param {cvox.AbstractTtsManager} ttsManager A TTS Manager.
 */
cvox.ChromeVox.createEarconsManager = function(ttsManager) {
  if (BUILD_TYPE == BUILD_TYPE_CHROME) {
    return new cvox.RemoteEarconsManager();
  } else if (BUILD_TYPE == BUILD_TYPE_ANDROID ||
      BUILD_TYPE == BUILD_TYPE_ANDROID_DEV) {
    return new cvox.LocalEarconsManager([cvox.AndroidEarcons], ttsManager);
  } else {
    throw 'Unknown build type: ' + BUILD_TYPE;
  }
};

/**
 * Performs initialization that is build type specific.
 */
cvox.ChromeVox.performBuildTypeSpecificInitialization = function() {
  if (BUILD_TYPE == BUILD_TYPE_CHROME) {
    // request settings
    cvox.ExtensionBridge.send({
      'target': 'Prefs',
      'action': 'getPrefs'
    });
  } else if (BUILD_TYPE == BUILD_TYPE_ANDROID ||
      BUILD_TYPE == BUILD_TYPE_ANDROID_DEV) {
    /* do nothing */
  } else {
    throw 'Unknown build type: ' + BUILD_TYPE;
  }
};

/**
 * Loads preferences.
 */
cvox.ChromeVox.loadPrefs = function() {
  if (BUILD_TYPE == BUILD_TYPE_CHROME) {
    cvox.ExtensionBridge.addMessageListener(function(message) {
      if (message['keyBindings']) {
        cvox.ChromeVoxKbHandler.loadKeyToFunctionsTable(message['keyBindings']);
      }
      if (message['prefs']) {
        var prefs = message['prefs'];
        cvox.ChromeVoxEditableTextBase.cursorIsBlock =
            (prefs['cursorIsBlock'] == 'true');
        cvox.ChromeVoxEventWatcher.focusFollowsMouse =
            (prefs['focusFollowsMouse'] == 'true');
        if (prefs['lensVisible'] == 'true' &&
            cvox.ChromeVox.lens &&
            !cvox.ChromeVox.lens.isLensDisplayed()) {
          cvox.ChromeVox.lens.showLens(true);
        }
        if (prefs['lensVisible'] == 'false' &&
            cvox.ChromeVox.lens &&
            cvox.ChromeVox.lens.isLensDisplayed()) {
          cvox.ChromeVox.lens.showLens(false);
        }
        if (cvox.ChromeVox.lens) {
          cvox.ChromeVox.lens.setAnchoredLens(prefs['lensAnchored'] == 'true');
        }
      }
    });
  } else if (BUILD_TYPE == BUILD_TYPE_ANDROID ||
      BUILD_TYPE == BUILD_TYPE_ANDROID_DEV) {
    var keyBindings = cvox.ChromeVox.getStringifiedAndroidKeyBindings();
    cvox.ChromeVoxKbHandler.loadKeyToFunctionsTable(
        cvox.ChromeVoxJSON.parse(keyBindings, null));
    return;
  } else {
    throw 'Unknown build type: ' + BUILD_TYPE;
  }
};

/**
 * @return {string} The Android key bindings as a JSON string.
 */
cvox.ChromeVox.getStringifiedAndroidKeyBindings = function() {
  // TODO(svetoslavganov): Change the bindings for Android
  return cvox.ChromeVoxJSON.stringify({
     // Stop TTS
    '#17' : ['stopSpeech', 'Stop speaking'], // Ctrl

    // TODO(svetoslavganov): Uncomment the key bindings below once
    // our handleTab implementation is fixed and the handeShiftTab
    // is implemented. For now we use the default browser behavior.
    // TAB/Shift+TAB
    // '#9' : 'handleTab', // Tab
    // 'Shift+#9' : 'handleShiftTab',

    // Basic navigation
    // Note that the arrows are bound this way so they
    // are consistent with the built-in accessibility support
    // in the case of disabled JavaScript.
    '#38' : ['backward', 'Navigate backward'],
    '#40' : ['forward', 'Navigate forward'],
    'Shift+#38' : ['nop', ''], // swallow Shift + up arrow
    'Shift+#40' : ['nop', ''], // swallow Shift + down arrow
    '#37' : ['nop', ''], // swallow left arrow
    '#39' : ['nop', ''], // swallow right arrow
    'Shift+#37' : ['previousGranularity', 'Decrease navigation granularity'],
    'Shift+#39' : ['nextGranularity', 'Increase navigation granularity'],
    '#13' : ['actOnCurrentItem', 'Take action on current item'], // ENTER
    'Shift+#16' : ['nop', ''], // swallow Shift

    // General commands
    'Ctrl+Alt+#191' : ['toggleSearchWidget', 'Toggle search widget'], // '/'
    'Ctrl+Alt+B' : ['showBookmarkManager', 'Open bookmark manager'],
    'Ctrl+Alt+A' : ['nextTtsEngine', 'Switch to next TTS engine'],
    'Ctrl+Alt+#189' : ['decreaseTtsRate', 'Decreaste rate of speech'], // '-'
    'Ctrl+Alt+#187' : ['increaseTtsRate', 'Increase rate of speech'], // '='
    'Ctrl+Alt+Shift+#189' : ['decreaseTtsPitch', 'Decrease pitch'], // '-'
    'Ctrl+Alt+Shift+#187' : ['increaseTtsPitch', 'Increase pitch'], // '='
    'Ctrl+Alt+#219' : ['decreaseTtsVolume', 'Decrease speech volume'], // '['
    'Ctrl+Alt+#221' : ['increaseTtsVolume', 'Increase speech volume'], // ']'

    // Jump commands
    'Ctrl+Alt+1' : ['nextHeading1', 'Next level 1 heading'],
    'Ctrl+Alt+Shift+1' : ['previousHeading1', 'Previous level 1 heading'],
    'Ctrl+Alt+2' : ['nextHeading2', 'Next level 2 heading'],
    'Ctrl+Alt+Shift+2' : ['previousHeading2', 'Previous level 2 heading'],
    'Ctrl+Alt+3' : ['nextHeading3', 'Next level 3 heading'],
    'Ctrl+Alt+Shift+3' : ['previousHeading3', 'Previous level 3 heading'],
    'Ctrl+Alt+4' : ['nextHeading4', 'Next level 4 heading'],
    'Ctrl+Alt+Shift+4' : ['previousHeading4', 'Previous level 4 heading'],
    'Ctrl+Alt+5' : ['nextHeading5', 'Next level 5 heading'],
    'Ctrl+Alt+Shift+5' : ['previousHeading5', 'Previous level 5 heading'],
    'Ctrl+Alt+6' : ['nextHeading6', 'Next level 6 heading'],
    'Ctrl+Alt+Shift+6' : ['previousHeading6', 'Previous level 6 heading'],
    'Ctrl+Alt+C' : ['nextCheckbox', 'Next checkbox'],
    'Ctrl+Alt+Shift+C' : ['previousCheckbox', 'Previous checkbox'],
    'Ctrl+Alt+E' : ['nextEditText', 'Next editable text area'],
    'Ctrl+Alt+Shift+E' : ['previousEditText', 'Previous editable text area'],
    'Ctrl+Alt+F' : ['nextFormField', 'Next form field'],
    'Ctrl+Alt+Shift+F' : ['previousFormField', 'Previous form field'],
    'Ctrl+Alt+G' : ['nextGraphic', 'Next graphic'],
    'Ctrl+Alt+Shift+G' : ['previousGraphic', 'Previous graphic'],
    'Ctrl+Alt+H' : ['nextHeading', 'Next heading'],
    'Ctrl+Alt+Shift+H' : ['previousHeading', 'Previous heading'],
    'Ctrl+Alt+I' : ['nextListItem', 'Next list item'],
    'Ctrl+Alt+Shift+I' : ['previousListItem', 'Previous list item'],
    'Ctrl+Alt+L' : ['nextLink', 'Next link'],
    'Ctrl+Alt+Shift+L' : ['previousLink', 'Previous link'],
    'Ctrl+Alt+O' : ['nextList', 'Next list'],
    'Ctrl+Alt+Shift+O' : ['previousList', 'Previous list'],
    'Ctrl+Alt+Q' : ['nextBlockquote', 'Next block quote'],
    'Ctrl+Alt+Shift+Q' : ['previousBlockquote', 'Previous block quote'],
    'Ctrl+Alt+R' : ['nextRadio', 'Next radio button'],
    'Ctrl+Alt+Shift+R' : ['previousRadio', 'Previous radio button'],
    'Ctrl+Alt+S' : ['nextSlider', 'Next slider'],
    'Ctrl+Alt+Shift+S' : ['previousSlider', 'Previous slider'],
    'Ctrl+Alt+T' : ['nextTable', 'Next table'],
    'Ctrl+Alt+Shift+T' : ['previousTable', 'Previous table'],
    'Ctrl+Alt+U' : ['nextButton', 'Next button'],
    'Ctrl+Alt+Shift+U' : ['previousButton', 'Previous button'],
    'Ctrl+Alt+X' : ['nextComboBox', 'Next combo box'],
    'Ctrl+Alt+Shift+X' : ['previousComboBox', 'Previous combo box']
  }, null, null);
};

/**
 * Process PDFs created with Chrome's built-in PDF plug-in, which has an
 * accessibility hook.
 */
cvox.ChromeVox.processEmbeddedPdfs = function() {
  var es = document.querySelectorAll('embed[type="application/pdf"]');
  for (var i = 0; i < es.length; i++) {
    var e = es[i];
    if (typeof e.accessibility === 'function') {
      var infoJSON = e.accessibility();
      var info = JSON.parse(infoJSON);

      if (!info.copyable)
        continue;
      if (!info.loaded) {
        setTimeout(cvox.ChromeVox.processEmbeddedPdfs, 100);
        continue;
      }

      var div = document.createElement('DIV');

      // Document Styles
      div.style.position = 'relative';
      div.style.background = '#CCC';
      div.style.paddingTop = '1pt';
      div.style.paddingBottom = '1pt';
      div.style.width = '100%';
      div.style.minHeight = '100%';

      var displayPage = function(i) {
        var json = e.accessibility(i);
        var page = JSON.parse(json);
        var pageDiv = document.createElement('DIV');
        var pageAnchor = document.createElement('A');

        // Page Achor Setup
        pageAnchor.name = 'page' + i;

        // Page Styles
        pageDiv.style.position = 'relative';
        pageDiv.style.background = 'white';
        pageDiv.style.margin = 'auto';
        pageDiv.style.marginTop = '20pt';
        pageDiv.style.marginBottom = '20pt';
        pageDiv.style.height = page.height + 'pt';
        pageDiv.style.width = page.width + 'pt';
        pageDiv.style.boxShadow = '0pt 0pt 10pt #333';

        // Text Nodes
        var texts = page.textBox;
        for (var j = 0; j < texts.length; j++) {
          var text = texts[j];
          var textSpan = document.createElement('Span');

          // Text Styles
          textSpan.style.position = 'absolute';
          textSpan.style.left = text.left + 'pt';
          textSpan.style.top = text.top + 'pt';
          textSpan.style.fontSize = text.fontSize + 'pt';

          // Text Content
          for (var k = 0; k < text.textNodes.length; k++) {
            var node = text.textNodes[k];
            if (node.type == 'text') {
              textSpan.appendChild(document.createTextNode(node.text));
            } else if (node.type == 'url') {
              var a = document.createElement('A');
              a.href = node.url;
              a.appendChild(document.createTextNode(node.text));
              textSpan.appendChild(a);
            }
          }

          pageDiv.appendChild(textSpan);
        }
        div.appendChild(pageAnchor);
        div.appendChild(pageDiv);

        if (i < info.numberOfPages - 1) {
          setTimeout(function() { displayPage(i + 1); }, 0);
        } else {
          e.parentNode.replaceChild(div, e);
        }
      };

      setTimeout(function() { displayPage(0); }, 0);
    }
  }
};

window.setTimeout(cvox.ChromeVox.init, 0);
