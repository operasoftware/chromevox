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

goog.provide('cvox.AccessibilityApiHandler');

goog.require('cvox.AbstractEarcons');
goog.require('cvox.AbstractTts');
goog.require('cvox.ChromeVoxEditableTextBase');


/**
 * Class that adds listeners and handles events from the accessibility API.
 */
cvox.AccessibilityApiHandler = function() {
};

/**
 * The object used to play earcons.
 * @type Object
 */
cvox.AccessibilityApiHandler.tts = null;

/**
 * The object used to manage speech.
 * @type Object
 */
cvox.AccessibilityApiHandler.earcons = null;

/**
 * The object that can describe changes and cursor movement in a generic
 *     editable text field.
 * @type {Object}
 */
cvox.AccessibilityApiHandler.editableTextHandler = null;

/**
 * The queue mode for the next focus event.
 * @type {number}
 */
cvox.AccessibilityApiHandler.nextQueueMode = 0;

/**
 * Initialize the accessibility API Handler.
 * @param {Object} tts The TTS to use for speaking.
 * @param {Object} earcons The earcons object to use for playing
 *        earcons.
 */
cvox.AccessibilityApiHandler.init = function(tts, earcons) {
  cvox.AccessibilityApiHandler.tts = tts;
  cvox.AccessibilityApiHandler.earcons = earcons;
  try {
    chrome.experimental.accessibility.setAccessibilityEnabled(true);
    cvox.AccessibilityApiHandler.addEventListeners();
  } catch (err) {
    console.log('Error trying to access accessibility extension api.');
  }
};

/**
 * Adds event listeners.
 */
cvox.AccessibilityApiHandler.addEventListeners = function() {
  /** Alias getMsg as msg. */
  var msg = cvox.ChromeVox.msgs.getMsg;

  var accessibility = chrome.experimental.accessibility;

  chrome.tabs.onCreated.addListener(function(tab) {
    var tts = cvox.AccessibilityApiHandler.tts;
    var title = tab.title ? tab.title : tab.url;
    tts.speak(msg('chrome_tab_created', [title]), 0, {});
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);
  });

  chrome.tabs.onRemoved.addListener(function(tab) {
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_CLOSE);
  });

  chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    chrome.tabs.get(tabId, function(tab) {
      var tts = cvox.AccessibilityApiHandler.tts;
      var title = tab.title ? tab.title : tab.url;
      tts.speak(msg('chrome_tab_selected', [title]), 0, {});
      var earcons = cvox.AccessibilityApiHandler.earcons;
      earcons.playEarcon(cvox.AbstractEarcons.OBJECT_SELECT);
    });
  });

  chrome.tabs.onUpdated.addListener(function(tabId, selectInfo) {
    chrome.tabs.get(tabId, function(tab) {
      var earcons = cvox.AccessibilityApiHandler.earcons;
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
        var tts = cvox.AccessibilityApiHandler.tts;
        var msg_id = window.incognito ? 'chrome_incognito_window_selected' :
          'chrome_normal_window_selected';
        var title = tab.title ? tab.title : tab.url;
        tts.speak(msg(msg_id, [title]), 0, {});
        var earcons = cvox.AccessibilityApiHandler.earcons;
        earcons.playEarcon(cvox.AbstractEarcons.OBJECT_SELECT);
      });
    });
  });

  chrome.experimental.accessibility.onWindowOpened.addListener(function(win) {
    var tts = cvox.AccessibilityApiHandler.tts;
    tts.speak(win.name, 0, {});
    // Queue the next utterance because a window opening is always followed
    // by a focus event.
    cvox.AccessibilityApiHandler.nextQueueMode = 1;
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);
  });

  chrome.experimental.accessibility.onWindowClosed.addListener(function(win) {
    // Don't speak, just play the earcon.
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_CLOSE);
  });

  chrome.experimental.accessibility.onMenuOpened.addListener(function(menu) {
    var tts = cvox.AccessibilityApiHandler.tts;
    tts.speak(msg('chrome_menu_opened', [menu.name]), 0, {});
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);
  });

  chrome.experimental.accessibility.onMenuClosed.addListener(function(menu) {
    // Don't speak, just play the earcon.
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_CLOSE);
  });

  chrome.experimental.accessibility.onVolumeChanged.addListener(
      function(volume) {
    // Don't speak, just play the earcon.
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.TASK_SUCCESS);
  });

  chrome.experimental.accessibility.onScreenUnlocked.addListener(
      function(volume) {
    // Don't speak, just play the earcon.
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.TASK_SUCCESS);
  });

  chrome.experimental.accessibility.onWokeUp.addListener(function(volume) {
    // Don't speak, just play the earcon.
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);
  });

  chrome.experimental.accessibility.onControlFocused.addListener(
    /**
     * @param {AccessibilityObject} ctl The focused control.
     */
    function(ctl) {
      var tts = cvox.AccessibilityApiHandler.tts;
      if (ctl.type == 'textbox') {
        cvox.AccessibilityApiHandler.trimWhitespace(ctl);
        cvox.AccessibilityApiHandler.editableTextHandler =
            new cvox.ChromeVoxEditableTextBase(
                ctl.details.value,
                ctl.details.selectionStart,
                ctl.details.selectionEnd,
                ctl.details.isPassword,
                tts);
      } else {
        cvox.AccessibilityApiHandler.editableTextHandler = null;
      }

      var description = cvox.AccessibilityApiHandler.describe(ctl, false);
      tts.speak(description.utterance,
                cvox.AccessibilityApiHandler.nextQueueMode,
                {});
      cvox.AccessibilityApiHandler.nextQueueMode = 0;
      if (description.earcon) {
          var earcons = cvox.AccessibilityApiHandler.earcons;
          earcons.playEarcon(description.earcon);
      }
    });

  chrome.experimental.accessibility.onControlAction.addListener(function(ctl) {
    var tts = cvox.AccessibilityApiHandler.tts;
    var description = cvox.AccessibilityApiHandler.describe(ctl, true);
    tts.speak(description.utterance, 0, {});
    if (description.earcon) {
      var earcons = cvox.AccessibilityApiHandler.earcons;
      earcons.playEarcon(description.earcon);
    }
  });

  chrome.experimental.accessibility.onTextChanged.addListener(function(ctl) {
    if (cvox.AccessibilityApiHandler.editableTextHandler) {
      cvox.AccessibilityApiHandler.trimWhitespace(ctl);
      var textChangeEvent = new cvox.TextChangeEvent(
          ctl.details.value,
          ctl.details.selectionStart,
          ctl.details.selectionEnd,
          true);  // triggered by user
      cvox.AccessibilityApiHandler.editableTextHandler.changed(textChangeEvent);
    }
  });
};

/**
 * Given a text control received from the accessibility api, trim any
 * leading or trailing whitespace from control.details.value and from
 * selectionStart and selectionEnd.
 * @param {Object} control The text control object.
 */
cvox.AccessibilityApiHandler.trimWhitespace = function(control) {
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
cvox.AccessibilityApiHandler.describe = function(control, isSelect) {
  /** Alias getMsg as msg. */
  var msg = cvox.ChromeVox.msgs.getMsg;

  var s = '';
  var earcon = undefined;
  var name = control.name.replace(/[_&]+/g, '').replace('...', '');
  switch (control.type) {
    case 'checkbox':
      if (control.details.isChecked) {
        earcon = cvox.AbstractEarcons.CHECK_ON;
        s += msg('describe_checkbox_checked', [name]);
      } else {
        earcon = cvox.AbstractEarcons.CHECK_OFF;
        s += msg('describe_checkbox_unchecked', [name]);
      }
      break;
    case 'radiobutton':
      s += name;
      if (control.details.isChecked) {
        earcon = cvox.AbstractEarcons.CHECK_ON;
        s += msg('describe_radio_selected', [name]);
      } else {
        earcon = cvox.AbstractEarcons.CHECK_OFF;
        s += msg('describe_radio_unselected', [name]);
      }
      break;
    case 'menu':
      s += msg('describe_menu', [name]);
      break;
    case 'menuitem':
      s += msg(
          control.details.hasSubmenu ?
              'describe_menu_item_with_submenu' : 'describe_menu', [name]);
      break;
    case 'window':
      s += msg('describe_window', [name]);
      break;
    case 'textbox':
      earcon = cvox.AbstractEarcons.EDITABLE_TEXT;
      var unnamed = name == '' ? 'unnamed_' : '';
      var type, value;
      if (control.details.isPassword) {
        type = 'password';
        value = control.details.value.replace(/./g, '*');
      } else {
        type = 'textbox';
        value = control.details.value;
      }
      s += msg('describe_' + unnamed + type, [value, name]);
      break;
    case 'button':
      earcon = cvox.AbstractEarcons.BUTTON;
      s += msg('describe_button', [name]);
      break;
    case 'combobox':
    case 'listbox':
      earcon = cvox.AbstractEarcons.LISTBOX;
      var unnamed = name == '' ? 'unnamed_' : '';
      s += msg('describe_' + unnamed + control.type,
                            [control.details.value, name]);
      break;
    case 'link':
      earcon = cvox.AbstractEarcons.LINK;
      s += msg('describe_link', [name]);
      break;
    case 'tab':
      s += msg('describe_tab', [name]);
      break;

    default:
      s += name + ', ' + control.type;
  }

  if (isSelect) {
    s += msg('describe_selected');
  }
  if (control.details && control.details.itemCount >= 0) {
    s += msg('describe_index',
        [control.details.itemIndex + 1, control.details.itemCount]);
  }

  s += '.';

  var description = {};
  description.utterance = s;
  description.earcon = earcon;
  return description;
};
