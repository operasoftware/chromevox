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
 * @fileoverview Accesses Chrome's accessibility extension API and gives
 * spoken feedback for events that happen in the "Chrome of Chrome".
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

cvoxgoog.provide('cvox.ChromeVoxAccessibilityApiHandler');

cvoxgoog.require('cvox.AbstractEarcons');
cvoxgoog.require('cvox.AbstractEarconsManager');
cvoxgoog.require('cvox.AbstractTtsManager');
cvoxgoog.require('cvox.ChromeVoxEditableTextBase');

/**
 * Class that adds listeners and handles events from the accessibility API.
 */
cvox.ChromeVoxAccessibilityApiHandler = function() {
};

/**
 * The object used to play earcons.
 * @type Object
 */
cvox.ChromeVoxAccessibilityApiHandler.ttsManager = null;

/**
 * The object used to manage speech.
 * @type Object
 */
cvox.ChromeVoxAccessibilityApiHandler.earconsManager = null;

/**
 * The object that can describe changes and cursor movement in a generic
 *     editable text field.
 * @type {Object}
 */
cvox.ChromeVoxAccessibilityApiHandler.editableTextHandler = null;

/**
 * The queue mode for the next focus event.
 * @type {number}
 */
cvox.ChromeVoxAccessibilityApiHandler.nextQueueMode = 0;

/**
 * Initialize the accessibility API Handler.
 * @param {Object} ttsManager The TTS manager to use for speaking.
 * @param {Object} earconsManager The earcons manager to use for playing
 *        earcons.
 */
cvox.ChromeVoxAccessibilityApiHandler.init = function(ttsManager,
    earconsManager) {
  cvox.ChromeVoxAccessibilityApiHandler.ttsManager = ttsManager;
  cvox.ChromeVoxAccessibilityApiHandler.earconsManager = earconsManager;
  try {
    chrome.experimental.accessibility.setAccessibilityEnabled(true);
    cvox.ChromeVoxAccessibilityApiHandler.addEventListeners();
  } catch (err) {
    console.log('Error trying to access accessibility extension api.');
  }
};

/**
 * Adds event listeners.
 */
cvox.ChromeVoxAccessibilityApiHandler.addEventListeners = function() {
  var accessibility = chrome.experimental.accessibility;

  chrome.tabs.onCreated.addListener(function(tab) {
    var tts = cvox.ChromeVoxAccessibilityApiHandler.ttsManager;
    var title = tab.title ? tab.title : tab.url;
    tts.speak(title + ', tab created.', 0, {});
    var earcons = cvox.ChromeVoxAccessibilityApiHandler.earconsManager;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);
  });

  chrome.tabs.onRemoved.addListener(function(tab) {
    var earcons = cvox.ChromeVoxAccessibilityApiHandler.earconsManager;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_CLOSE);
  });

  chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    chrome.tabs.get(tabId, function(tab) {
      var tts = cvox.ChromeVoxAccessibilityApiHandler.ttsManager;
      var title = tab.title ? tab.title : tab.url;
      tts.speak(title + ', tab.', 0, {});
      var earcons = cvox.ChromeVoxAccessibilityApiHandler.earconsManager;
      earcons.playEarcon(cvox.AbstractEarcons.OBJECT_SELECT);
    });
  });

  chrome.tabs.onUpdated.addListener(function(tabId, selectInfo) {
    chrome.tabs.get(tabId, function(tab) {
      var earcons = cvox.ChromeVoxAccessibilityApiHandler.earconsManager;
      if (tab.status == 'loading') {
        earcons.playEarcon(cvox.AbstractEarcons.BUSY_PROGRESS_LOOP);
      } else {
        earcons.playEarcon(cvox.AbstractEarcons.TASK_SUCCESS);
      }
    });
  });

  chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
      return;
    }
    chrome.windows.get(windowId, function(window) {
      chrome.tabs.getSelected(windowId, function(tab) {
        var tts = cvox.ChromeVoxAccessibilityApiHandler.ttsManager;
        var window_text = window.incognito ? 'incognito window, ' : 'window, ';
        var title = tab.title ? tab.title : tab.url;
        tts.speak(window_text + title + ', tab.', 0, {});
        var earcons = cvox.ChromeVoxAccessibilityApiHandler.earconsManager;
        earcons.playEarcon(cvox.AbstractEarcons.OBJECT_SELECT);
      });
    });
  });

  chrome.experimental.accessibility.onWindowOpened.addListener(function(win) {
    var tts = cvox.ChromeVoxAccessibilityApiHandler.ttsManager;
    tts.speak(win.name, 0, {});
    // Queue the next utterance because a window opening is always followed
    // by a focus event.
    cvox.ChromeVoxAccessibilityApiHandler.nextQueueMode = 1;
    var earcons = cvox.ChromeVoxAccessibilityApiHandler.earconsManager;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);
  });

  chrome.experimental.accessibility.onWindowClosed.addListener(function(win) {
    // Don't speak, just play the earcon.
    var earcons = cvox.ChromeVoxAccessibilityApiHandler.earconsManager;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_CLOSE);
  });

  chrome.experimental.accessibility.onMenuOpened.addListener(function(menu) {
    var tts = cvox.ChromeVoxAccessibilityApiHandler.ttsManager;
    tts.speak(menu.name + ', menu opened.', 0, {});
    var earcons = cvox.ChromeVoxAccessibilityApiHandler.earconsManager;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);
  });

  chrome.experimental.accessibility.onMenuClosed.addListener(function(menu) {
    // Don't speak, just play the earcon.
    var earcons = cvox.ChromeVoxAccessibilityApiHandler.earconsManager;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_CLOSE);
  });

  chrome.experimental.accessibility.onControlFocused.addListener(
    /**
     * @param {AccessibilityObject} ctl The focused control.
     */
    function(ctl) {
      var tts = cvox.ChromeVoxAccessibilityApiHandler.ttsManager;
      if (ctl.type == 'textbox') {
        cvox.ChromeVoxAccessibilityApiHandler.trimWhitespace(ctl);
        cvox.ChromeVoxAccessibilityApiHandler.editableTextHandler =
            new cvox.ChromeVoxEditableTextBase(
                ctl.details.value,
                ctl.details.selectionStart,
                ctl.details.selectionEnd,
                ctl.details.isPassword,
                tts);
      } else {
        cvox.ChromeVoxAccessibilityApiHandler.editableTextHandler = null;
      }

      var description = cvox.ChromeVoxAccessibilityApiHandler.describe(ctl,
          false);
      tts.speak(description.utterance,
                cvox.ChromeVoxAccessibilityApiHandler.nextQueueMode,
                {});
      cvox.ChromeVoxAccessibilityApiHandler.nextQueueMode = 0;
      if (description.earcon) {
          var earcons =
              cvox.ChromeVoxAccessibilityApiHandler.earconsManager;
          earcons.playEarcon(description.earcon);
      }
    });

  chrome.experimental.accessibility.onControlAction.addListener(function(ctl) {
    var tts = cvox.ChromeVoxAccessibilityApiHandler.ttsManager;
    var description = cvox.ChromeVoxAccessibilityApiHandler.describe(ctl,
        true);
    tts.speak(description.utterance, 0, {});
    if (description.earcon) {
      var earcons = cvox.ChromeVoxAccessibilityApiHandler.earconsManager;
      earcons.playEarcon(description.earcon);
    }
  });

  chrome.experimental.accessibility.onTextChanged.addListener(function(ctl) {
    if (cvox.ChromeVoxAccessibilityApiHandler.editableTextHandler) {
      cvox.ChromeVoxAccessibilityApiHandler.trimWhitespace(ctl);
      var textChangeEvent = new cvox.TextChangeEvent(
          ctl.details.value,
          ctl.details.selectionStart,
          ctl.details.selectionEnd,
          true);  // triggered by user
      cvox.ChromeVoxAccessibilityApiHandler.editableTextHandler.changed(
          textChangeEvent);
    }
  });
};

/**
 * Given a text control received from the accessibility api, trim any
 * leading or trailing whitespace from control.details.value and from
 * selectionStart and selectionEnd.
 * @param {Object} control The text control object.
 */
cvox.ChromeVoxAccessibilityApiHandler.trimWhitespace = function(control) {
  var d = control.details;
  var prefix = new RegExp(/^[\s\u200b]+/).exec(d.value);
  var suffix = new RegExp(/[\s\u200b]+$/).exec(d.value);
  var prefixLen = prefix ? prefix.length : 0;
  var suffixLen = suffix ? suffix.length : 0;
  d.value = d.value.substr(prefix, d.value.length - prefixLen - suffixLen);
  d.selectionStart -= prefixLen;
  d.selectionEnd -= prefixLen;
  if (d.selectionEnd > d.value.length) {
    d.selectionEnd = d.value.length;
  }
};

/**
 * Given a control received from the accessibility api, determine an
 * utterance to speak and an earcon to play to describe it.
 * @param {Object} control The control that had an action performed on it.
 * @param {boolean} isSelect True if the action is a select action,
 *     otherwise it's a focus action.
 * @return {Object} An object containing a string field |utterance| and
 *     earcon |earcon|.
 */
cvox.ChromeVoxAccessibilityApiHandler.describe = function(control,
    isSelect) {
  var s = '';
  var earcon = undefined;
  var name = control.name.replace(/[_&]+/g, '').replace('...', '');
  switch (control.type) {
    case 'checkbox':
      s += name;
      if (control.details.isChecked) {
        earcon = cvox.AbstractEarcons.CHECK_ON;
        s += ', checkbox checked';
      } else {
        earcon = cvox.AbstractEarcons.CHECK_OFF;
        s += ', checkbox not checked';
      }
      break;
    case 'radiobutton':
      s += name;
      if (control.details.isChecked) {
        earcon = cvox.AbstractEarcons.CHECK_ON;
        s += ', radio button selected';
      } else {
        earcon = cvox.AbstractEarcons.CHECK_OFF;
        s += ', radio button unselected';
      }
      break;
    case 'menu':
      s += name + ', menu';
      break;
    case 'menuitem':
      s += name + ', menu item';
      if (control.details.hasSubmenu) {
        s += ', with submenu';
      }
      break;
    case 'window':
      s += name + ', window';
      break;
    case 'textbox':
      earcon = cvox.AbstractEarcons.EDITABLE_TEXT;
      s += control.details.value;
      if (name != '') {
        s += ', ' + name;
      }
      s += ', ' + (control.details.isPassword ? ', password ' : '') +
          ', text box';
      break;
    case 'button':
      earcon = cvox.AbstractEarcons.BUTTON;
      s += name + ', button';
      break;
    case 'combobox':
      earcon = cvox.AbstractEarcons.LISTBOX;
      s += control.details.value;
      if (name != '') {
        s += ', ' + name;
      }
      s += ', combo box';
      break;
    case 'listbox':
      earcon = cvox.AbstractEarcons.LISTBOX;
      s += control.details.value;
      if (name != '') {
        s += ', ' + name;
      }
      s += ', list box';
      break;
    case 'link':
      earcon = cvox.AbstractEarcons.LINK;
      s += name + ', link';
      break;
    case 'tab':
      s += name + ', tab';
      break;

    default:
      s += name + ', ' + control.type;
  }

  if (isSelect) {
    s += ', selected';
  }
  try {
    if (control.details.itemCount >= 0) {
      s += ', ' + (control.details.itemIndex + 1) +
          ' of ' + control.details.itemCount;
    }
  } catch (err) {
  }

  s += '.';

  var description = {};
  description.utterance = s;
  description.earcon = earcon;
  return description;
};
