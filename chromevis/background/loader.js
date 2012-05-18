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
 * @fileoverview The background script from ChromeVis.
 * @author deboer@google.com (James deBoer)
 */

goog.require('cvox.ExtensionBridge');

var textMagnification;
var textColor;
var textFont;
var textWeight;
var backgroundColor;

var maxLensWidth;
var minLensWidth;

var lensAnchored;
var lensCentered;

function init() {

  if ((!localStorage['data-textMag']) ||
      (!localStorage['data-textColor'])) {
    localStorage['data-textMag'] = 1.5;
    localStorage['data-textColor'] = '#FFFFFF';
    localStorage['data-bgColor'] = '#000000';
  }
  textMagnification = localStorage['data-textMag'];
  textColor = localStorage['data-textColor'];
  backgroundColor = localStorage['data-bgColor'];

  textFont = 'Verdana, Arial, Helvetica, sans-serif';
  textWeight = 'normal';

  maxLensWidth = 700;
  minLensWidth = 25;

  lensAnchored = true;
  lensCentered = true;

  if (! localStorage['keyShowHideLens']) {
     // Data is not stored in local storage, must initialize
    localStorage['keyShowHideLens'] = '0';
    localStorage['keyStyleLens'] = '9';
    localStorage['keyCenterLens'] = '8';

    localStorage['keyIncreaseMag'] = '=';
    localStorage['keyDecreaseMag'] = '-';

    localStorage['keyForwardSentence'] = 'Shift+s';
    localStorage['keyForwardWord'] = 'Shift+w';
    localStorage['keyForwardCharacter'] = 'Shift+c';
    localStorage['keyForwardParagraph'] = 'Shift+p';

    localStorage['keyBackwardSentence'] = 'Shift+a';
    localStorage['keyBackwardWord'] = 'Shift+q';
    localStorage['keyBackwardCharacter'] = 'Shift+x';
    localStorage['keyBackwardParagraph'] = 'Shift+o';

    localStorage['keyCombo1'] = '1';
    localStorage['keyCombo2'] = '2';

    localStorage['keyCombo3'] = '3';
    localStorage['keyCombo4'] = '4';

    localStorage['keyCombo5'] = '5';
    localStorage['keyCombo6'] = '6';

    localStorage['TextKeyCombo1'] = 'FFFFFF';
    localStorage['BGKeyCombo1'] = '000000';

    localStorage['TextKeyCombo2'] = '000000';
    localStorage['BGKeyCombo2'] = 'FFFFFF';

    localStorage['TextKeyCombo3'] = 'FFFFFF';
    localStorage['BGKeyCombo3'] = '4C4C4C';

    localStorage['TextKeyCombo4'] = '000000';
    localStorage['BGKeyCombo4'] = 'B4B4B4';

    localStorage['TextKeyCombo5'] = 'FFD700';
    localStorage['BGKeyCombo5'] = '000000';

    localStorage['TextKeyCombo6'] = '008000';
    localStorage['BGKeyCombo6'] = '000000';
  }

  // Injects content scripts into open tabs. Required upon extension
  // initialization so that tabs that were already open can still
  // display the lens. Relates to http://crbug.com/36400
  function injectContentScripts() {
    chrome.windows.getAll({populate: true}, function(windows) {
      for (var i = 0; i < windows.length; i++) {
        var tabs = windows[i].tabs;
        for (var j = 0; j < tabs.length; j++) {
          var tab = tabs[j];
          // Include both compiled and uncompiled JS and let one
          // set fail.
          var files =
              ['binary.js',  // compiled.
               'deps.js',  // the rest of the files are uncompiled.
               'keycode.js',
               'closure/closure_preinit.js',
               'closure/base.js',
               'chromevis/injected/loader.js'];
          }
          for (var k = 0; k < files.length; k++) {
            chrome.tabs.executeScript(
                tab.id, {file: files[k], allFrames: true});
          }
        }
    });
  }
  injectContentScripts();

function updatePages(type, val) {
  // Tell views to update
  var views = chrome.windows.getAll({populate: true}, function(windows) {
    for (var i = 0; i < windows.length; i++) {
        var tabs = windows[i].tabs;
        for (var j = 0; j < tabs.length; j++) {
          var tab = tabs[j];
          // Communication between extensions and their content scripts
          // performed through message passing
          chrome.tabs.sendRequest(tab.id, {data: type, value: val});
        }
    }
  });
  localStorage[type] = val;
}

// In response to a message from the extension that indicates a
// particular user action has been performed.
cvox.ExtensionBridge.addMessageListener(function(msg, port) {
if (msg.message == 'get settings') {
  textMagnification = localStorage['data-textMag'];
  textColor = localStorage['data-textColor'];
  backgroundColor = localStorage['data-bgColor'];

  port.postMessage({data: 'data-isAnchored', value: lensAnchored});
  port.postMessage({data: 'data-isCentered', value: lensCentered});
  port.postMessage({data: 'data-textMag', value: textMagnification});
  port.postMessage({data: 'data-textColor', value: textColor});
  port.postMessage({data: 'data-bgColor', value: backgroundColor});

} else if (msg.message == 'user action') {
  // A per-page action is one that only affects the current document.
  // Hiding/showing the lens, and moving the selection around the
  // document are per-page actions.
  // The extension is notified of a per-page action when the background
  // page posts a message.  The extension then alerts the content
  // script in the active document through an event sent to a hidden
  // div in the document.

  // Per-extension actions are those that affect the entire extension.
  // Changing the lens style, centering, foreground color, or
  // background color are per-extension actions.
  // All content scripts are alerted to a per-extension change
  // through a request sent to each tab (the updatePages function in
  // this background page).
  if (msg['values'] == localStorage['keyShowHideLens']) {
    port.postMessage({command: 'show lens'});
  }
  if (msg['values'] == localStorage['keyStyleLens']) {
    if (lensAnchored) {
      lensAnchored = false;
      updatePages('data-isAnchored', lensAnchored);
    } else {
      lensAnchored = true;
      updatePages('data-isAnchored', lensAnchored);
    }
  }
  if (msg['values'] == localStorage['keyCenterLens']) {
    if (lensCentered) {
      lensCentered = false;
      updatePages('data-isCentered', lensCentered);
    } else {
      lensCentered = true;
      updatePages('data-isCentered', lensCentered);
    }
  }

  if (msg['values'] == localStorage['keyIncreaseMag']) {
    textMagnification = textMagnification * 1.25;
    updatePages('data-textMag', textMagnification);
  }
  if (msg['values'] == localStorage['keyDecreaseMag']) {
    textMagnification = textMagnification / 1.25;
    updatePages('data-textMag', textMagnification);
  }

  if (msg['values'] == localStorage['keyForwardSentence']) {
    port.postMessage({command: 'forward sentence'});
  }
  if (msg['values'] == localStorage['keyForwardWord']) {
    port.postMessage({command: 'forward word'});
  }
  if (msg['values'] == localStorage['keyForwardCharacter']) {
    port.postMessage({command: 'forward character'});
  }
  if (msg['values'] == localStorage['keyForwardParagraph']) {
    port.postMessage({command: 'forward paragraph'});
  }

  if (msg['values'] == localStorage['keyBackwardSentence']) {
    port.postMessage({command: 'backward sentence'});
  }
  if (msg['values'] == localStorage['keyBackwardWord']) {
    port.postMessage({command: 'backward word'});
  }
  if (msg['values'] == localStorage['keyBackwardCharacter']) {
    port.postMessage({command: 'backward character'});
  }
  if (msg['values'] == localStorage['keyBackwardParagraph']) {
    port.postMessage({command: 'backward paragraph'});
  }

  if (msg['values'] == localStorage['keyCombo1']) {
    textColor = localStorage['TextKeyCombo1'];
    backgroundColor = localStorage['BGKeyCombo1'];
    updatePages('data-textColor', '#' + textColor);
    updatePages('data-bgColor', '#' + backgroundColor);
  }
  if (msg['values'] == localStorage['keyCombo2']) {
    textColor = localStorage['TextKeyCombo2'];
    backgroundColor = localStorage['BGKeyCombo2'];
    updatePages('data-textColor', '#' + textColor);
    updatePages('data-bgColor', '#' + backgroundColor);
  }

  if (msg['values'] == localStorage['keyCombo3']) {
    textColor = localStorage['TextKeyCombo3'];
    backgroundColor = localStorage['BGKeyCombo3'];
    updatePages('data-textColor', '#' + textColor);
    updatePages('data-bgColor', '#' + backgroundColor);
  }
  if (msg['values'] == localStorage['keyCombo4']) {
    textColor = localStorage['TextKeyCombo4'];
    backgroundColor = localStorage['BGKeyCombo4'];
    updatePages('data-textColor', '#' + textColor);
    updatePages('data-bgColor', '#' + backgroundColor);
  }

  if (msg['values'] == localStorage['keyCombo5']) {
    textColor = localStorage['TextKeyCombo5'];
    backgroundColor = localStorage['BGKeyCombo5'];
    updatePages('data-textColor', '#' + textColor);
    updatePages('data-bgColor', '#' + backgroundColor);
  }
  if (msg['values'] == localStorage['keyCombo6']) {
    textColor = localStorage['TextKeyCombo6'];
    backgroundColor = localStorage['BGKeyCombo6'];
    updatePages('data-textColor', '#' + textColor);
    updatePages('data-bgColor', '#' + backgroundColor);
  }
}
  });

  chrome.browserAction.onClicked.addListener(function(tab) {
chrome.tabs.sendRequest(tab.id, {'command': 'show lens'});
  });


}
goog.exportSymbol('chromevisInit', init);
