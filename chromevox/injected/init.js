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

goog.provide('cvox.ChromeVoxInit');

goog.require('chromevis.ChromeVisLens');
goog.require('cvox.AndroidDevTtsEngine');
goog.require('cvox.AndroidEarcons');
goog.require('cvox.AndroidRelTtsEngine');
goog.require('cvox.BuildConfig');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxEventWatcher');
goog.require('cvox.ChromeVoxKbHandler');
goog.require('cvox.ChromeVoxNavigationManager');
goog.require('cvox.ChromeVoxSearch');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.LocalEarconsManager');
goog.require('cvox.LocalTtsManager');
goog.require('cvox.RemoteEarconsManager');
goog.require('cvox.RemoteTtsManager');
goog.require('cvox.TraverseContent');

/**
 * Initializes cvox.ChromeVox.
 */
cvox.ChromeVox.init = function() {
  if (!goog.isDefAndNotNull(BUILD_TYPE)) {
    return;
  }

  // Setup globals
  cvox.ChromeVox.isActive = true;
  cvox.ChromeVox.lens = new chromevis.ChromeVisLens();
  // TODO:(rshearer) Added this multiplier for I/O presentation.
  cvox.ChromeVox.lens.multiplier = 2.25;
  cvox.ChromeVox.traverseContent = new cvox.TraverseContent();
  cvox.ChromeVox.navigationManager =
      new cvox.ChromeVoxNavigationManager();
  cvox.ChromeVox.tts = cvox.ChromeVox.createTtsManager();
  cvox.ChromeVox.tts.setLens(cvox.ChromeVox.lens);
  cvox.ChromeVox.earcons = cvox.ChromeVox.createEarconsManager(
      cvox.ChromeVox.tts);

  // Initialize common components
  cvox.ChromeVoxSearch.init();

  // Start the event watchers
  cvox.ChromeVoxEventWatcher.addEventListeners();

  // Load the enhancement script loader
  var enhancementLoaderScript = document.createElement('script');
  enhancementLoaderScript.type = 'text/javascript';
  enhancementLoaderScript.src = 'https://ssl.gstatic.com/accessibility/javascript/ext/loader.js';
  document.head.appendChild(enhancementLoaderScript);

  // Perform build type specific initialization
  cvox.ChromeVox.performBuildTypeSpecificInitialization();

  // Read the settings
  cvox.ChromeVox.loadPrefs();

  // Provide a way for modules that can't dependon cvox.ChromeVoxUserCommands
  // to execute commands.
  cvox.ChromeVox.executeUserCommand = function(commandName) {
    cvox.ChromeVoxUserCommands.commands[commandName]();
  };

  // If we're the top-level iframe, speak the title of the page +
  // the active element if it is a user control.
  if (window.parent == window) {
    var message = document.title;
    var activeElem = document.activeElement;
    if (cvox.DomUtil.isControl(activeElem)) {
      cvox.ChromeVox.navigationManager.syncToNode(activeElem);
      cvox.ChromeVox.navigationManager.setFocus();
      message = message + '. ' +
          cvox.DomUtil.getControlValueAndStateString(activeElem, true);
    }
    cvox.ChromeVox.tts.speak(message, 0, null);
  }
};

/**
 * @return {cvox.AbstractTtsManager} New initialized TTS manager.
 */
cvox.ChromeVox.createTtsManager = function() {
  if (BUILD_TYPE == BUILD_TYPE_CHROME) {
      return new cvox.RemoteTtsManager();
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
      'target': 'Options',
      'action': 'getSettings'
    });
    if (window.location.toString().indexOf('chrome-extension://') == 0 &&
        window.location.toString().indexOf('bdcfgfeioooifpgmbfjpopbcbgdmehnb') == -1) {
      // If we are connecting from an extension page of another extension,
      // explicitly request for key bindings since sendRequest from the
      // background will not work as we are not in a tab. e.g. browser action
      // popup pages.
      cvox.ExtensionBridge.send({
        'target': 'KeyBindings',
        'action': 'getBindings'
      });
    }
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
        if (prefs['lensVisible'] == '1' &&
            cvox.ChromeVox.lens &&
            !cvox.ChromeVox.lens.isLensDisplayed()) {
          cvox.ChromeVox.lens.showLens(true);
        }
        if (prefs['lensVisible'] == '0' &&
            cvox.ChromeVox.lens &&
            cvox.ChromeVox.lens.isLensDisplayed()) {
          cvox.ChromeVox.lens.showLens(false);
        }
        if (cvox.ChromeVox.lens) {
          cvox.ChromeVox.lens.setAnchoredLens(prefs['lensAnchored'] == '1');
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

window.setTimeout(cvox.ChromeVox.init, 0);
