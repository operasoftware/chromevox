// Copyright 2013 Google Inc.
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
 * @type {cvox.TtsInterface}
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
 * The timeout id for the pending text changed event - the return
 * value from window.setTimeout. We need to delay text events slightly
 * and return only the last one because sometimes we get a rapid
 * succession of related events that should all be considered one
 * bulk change - in particular, autocomplete in the location bar comes
 * as multiple events in a row.
 * @type {?number}
 */
cvox.AccessibilityApiHandler.textChangeTimeout = null;

/**
 * Most controls have a "context" - the name of the window, dialog, toolbar,
 * or menu they're contained in. We announce a context once, when you
 * first enter it - and we don't announce it again when you move to something
 * else within the same context. This variable keeps track of the most
 * recent context.
 * @type {?string}
 */
cvox.AccessibilityApiHandler.lastContext = null;

/**
 * Delay in ms between when a text event is received and when it's spoken.
 * @type {number}
 * @const
 */
cvox.AccessibilityApiHandler.TEXT_CHANGE_DELAY = 10;

/**
 * Initialize the accessibility API Handler.
 * @param {cvox.TtsInterface} tts The TTS to use for speaking.
 * @param {Object} earcons The earcons object to use for playing
 *        earcons.
 */
cvox.AccessibilityApiHandler.init = function(tts, earcons) {
  cvox.AccessibilityApiHandler.tts = tts;
  cvox.AccessibilityApiHandler.earcons = earcons;
  try {
    chrome.experimental.accessibility.setAccessibilityEnabled(true);
    cvox.AccessibilityApiHandler.addEventListeners();
    if (cvox.ChromeVox.isActive) {
      cvox.AccessibilityApiHandler.speakAlertsForActiveTab();
    }
  } catch (err) {
    console.log('Error trying to access accessibility extension api.');
  }
};

/**
 * Adds event listeners.
 */
cvox.AccessibilityApiHandler.addEventListeners = function() {
  /** Alias getMsg as msg. */
  var msg = goog.bind(cvox.ChromeVox.msgs.getMsg, cvox.ChromeVox.msgs);
  var ttsProps = {
    'lang': cvox.ChromeVox.msgs.getLocale()
  };

  var accessibility = chrome.experimental.accessibility;

  chrome.tabs.onCreated.addListener(function(tab) {
    if (!cvox.ChromeVox.isActive) {
      return;
    }
    var tts = cvox.AccessibilityApiHandler.tts;
    tts.speak(msg('chrome_tab_created'), 0, ttsProps);
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);
  });

  chrome.tabs.onRemoved.addListener(function(tab) {
    if (!cvox.ChromeVox.isActive) {
      return;
    }
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_CLOSE);
  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    if (!cvox.ChromeVox.isActive) {
      return;
    }
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      if (tab.status == 'loading') {
        return;
      }
      var tts = cvox.AccessibilityApiHandler.tts;
      var title = tab.title ? tab.title : tab.url;
      tts.speak(msg('chrome_tab_selected', [title]), 0, ttsProps);
      var earcons = cvox.AccessibilityApiHandler.earcons;
      earcons.playEarcon(cvox.AbstractEarcons.OBJECT_SELECT);
    });
  });

  chrome.tabs.onUpdated.addListener(function(tabId, selectInfo) {
    if (!cvox.ChromeVox.isActive) {
      return;
    }
    chrome.tabs.get(tabId, function(tab) {
      if (!tab.active) {
        return;
      }
      var earcons = cvox.AccessibilityApiHandler.earcons;
      if (tab.status == 'loading') {
        earcons.playEarcon(cvox.AbstractEarcons.BUSY_PROGRESS_LOOP);
      } else {
        earcons.playEarcon(cvox.AbstractEarcons.TASK_SUCCESS);
      }
    });
  });

  chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (!cvox.ChromeVox.isActive) {
      return;
    }
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
      return;
    }
    chrome.windows.get(windowId, function(window) {
      chrome.tabs.getSelected(windowId, function(tab) {
        var tts = cvox.AccessibilityApiHandler.tts;
        var msg_id = window.incognito ? 'chrome_incognito_window_selected' :
          'chrome_normal_window_selected';
        var title = tab.title ? tab.title : tab.url;
        tts.speak(msg(msg_id, [title]), 0, ttsProps);
        var earcons = cvox.AccessibilityApiHandler.earcons;
        earcons.playEarcon(cvox.AbstractEarcons.OBJECT_SELECT);
      });
    });
  });

  chrome.experimental.accessibility.onWindowOpened.addListener(function(win) {
    if (!cvox.ChromeVox.isActive) {
      return;
    }
    var tts = cvox.AccessibilityApiHandler.tts;
    tts.speak(win.name, 0, ttsProps);
    // Queue the next utterance because a window opening is always followed
    // by a focus event.
    cvox.AccessibilityApiHandler.nextQueueMode = 1;
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);
  });

  chrome.experimental.accessibility.onWindowClosed.addListener(function(win) {
    if (!cvox.ChromeVox.isActive) {
      return;
    }
    // Don't speak, just play the earcon.
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_CLOSE);
  });

  chrome.experimental.accessibility.onMenuOpened.addListener(function(menu) {
    if (!cvox.ChromeVox.isActive) {
      return;
    }
    var tts = cvox.AccessibilityApiHandler.tts;
    tts.speak(msg('chrome_menu_opened', [menu.name]), 0, ttsProps);
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);
  });

  chrome.experimental.accessibility.onMenuClosed.addListener(function(menu) {
    if (!cvox.ChromeVox.isActive) {
      return;
    }
    // Don't speak, just play the earcon.
    var earcons = cvox.AccessibilityApiHandler.earcons;
    earcons.playEarcon(cvox.AbstractEarcons.OBJECT_CLOSE);
  });

  // systemPrivate API is only available when this extension is loaded as a
  // component extension embedded in Chrome.
  chrome.permissions.contains(
      /** @type !Permissions */ ({ permissions: ['systemPrivate'] }),
      function(result) {
    if (result) {
      chrome.systemPrivate.onVolumeChanged.addListener(function(volume) {
        if (!cvox.ChromeVox.isActive) {
          return;
        }
        // Don't speak, just play the earcon.
        var earcons = cvox.AccessibilityApiHandler.earcons;
        earcons.playEarcon(cvox.AbstractEarcons.TASK_SUCCESS);
      });

      chrome.systemPrivate.onBrightnessChanged.addListener(
          /**
           * @param {{brightness: number, userInitiated: boolean}} brightness
           */
          function(brightness) {
        if (brightness.userInitiated) {
          var earcons = cvox.AccessibilityApiHandler.earcons;
          earcons.playEarcon(cvox.AbstractEarcons.TASK_SUCCESS);
          var tts = cvox.AccessibilityApiHandler.tts;
          tts.speak(msg('chrome_brightness_changed', [brightness.brightness]),
                    0, ttsProps);
        }
      });

      chrome.systemPrivate.onScreenUnlocked.addListener(function() {
        chrome.systemPrivate.getUpdateStatus(function(status) {
          if (!cvox.ChromeVox.isActive) {
            return;
          }
          // Speak about system update when it's ready, otherwise speak nothing.
          if (status.state == 'NeedRestart') {
            var tts = cvox.AccessibilityApiHandler.tts;
            tts.speak(msg('chrome_system_need_restart'), 0, ttsProps);
          }
          var earcons = cvox.AccessibilityApiHandler.earcons;
          earcons.playEarcon(cvox.AbstractEarcons.TASK_SUCCESS);
        });
      });

      chrome.systemPrivate.onWokeUp.addListener(function() {
        if (!cvox.ChromeVox.isActive) {
          return;
        }
        // Don't speak, just play the earcon.
        var earcons = cvox.AccessibilityApiHandler.earcons;
        earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);
      });
    }
  });

  chrome.experimental.accessibility.onControlFocused.addListener(
    /**
     * @param {AccessibilityObject} ctl The focused control.
     */
    function(ctl) {
      if (!cvox.ChromeVox.isActive) {
        return;
      }

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
                ttsProps);
      cvox.AccessibilityApiHandler.nextQueueMode = 0;
      if (description.earcon) {
          var earcons = cvox.AccessibilityApiHandler.earcons;
          earcons.playEarcon(description.earcon);
      }
    });

  chrome.experimental.accessibility.onControlAction.addListener(function(ctl) {
    if (!cvox.ChromeVox.isActive) {
      return;
    }

    var tts = cvox.AccessibilityApiHandler.tts;
    var description = cvox.AccessibilityApiHandler.describe(ctl, true);
    tts.speak(description.utterance, 0, ttsProps);
    if (description.earcon) {
      var earcons = cvox.AccessibilityApiHandler.earcons;
      earcons.playEarcon(description.earcon);
    }
  });

  chrome.experimental.accessibility.onTextChanged.addListener(function(ctl) {
    if (!cvox.ChromeVox.isActive) {
      return;
    }

    if (!cvox.AccessibilityApiHandler.editableTextHandler) {
      return;
    }

    cvox.AccessibilityApiHandler.trimWhitespace(ctl);
    var start = ctl.details.selectionStart;
    var end = ctl.details.selectionEnd;
    if (start > end) {
      start = ctl.details.selectionEnd;
      end = ctl.details.selectionStart;
    }

    // Only send the most recent text changed event - throw away anything
    // that was pending.
    if (cvox.AccessibilityApiHandler.textChangeTimeout) {
      window.clearTimeout(cvox.AccessibilityApiHandler.textChangeTimeout);
    }

    // Handle the text change event after a small delay, so multiple
    // events in rapid succession are handled as a single change. This is
    // specifically for the location bar with autocomplete - typing a
    // character and getting the autocompleted text and getting that
    // text selected may be three separate events.
    cvox.AccessibilityApiHandler.textChangeTimeout = window.setTimeout(
        function() {
          var textChangeEvent = new cvox.TextChangeEvent(
              ctl.details.value,
              start,
              end,
              true);  // triggered by user
          cvox.AccessibilityApiHandler.editableTextHandler.changed(
              textChangeEvent);
        }, cvox.AccessibilityApiHandler.TEXT_CHANGE_DELAY);
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
  var msg = goog.bind(cvox.ChromeVox.msgs.getMsg, cvox.ChromeVox.msgs);

  var s = '';

  var context = control.context;
  if (context && context != cvox.AccessibilityApiHandler.lastContext) {
    s += context + ', ';
    cvox.AccessibilityApiHandler.lastContext = context;
  }

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
    case 'slider':
      s += msg('describe_slider', [control.details.stringValue, name]);
      break;

    default:
      s += name + ', ' + control.type;
  }

  if (isSelect && control.type != 'slider') {
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

/**
 * Speaks alerts for the active tab.  This method is intended to be used to
 * speak alerts which were shown before ChromeVox loading.
 */
cvox.AccessibilityApiHandler.speakAlertsForActiveTab = function() {
  var tts = cvox.AccessibilityApiHandler.tts;
  var earcons = cvox.AccessibilityApiHandler.earcons;

  chrome.tabs.query({'active': true}, function(tabs) {
    if (tabs.length < 1)
      return;
    chrome.experimental.accessibility.getAlertsForTab(tabs[0].id,
                                                      function(alerts) {
      if (alerts.length == 0)
        return;

      var string = '';
      for (var i = 0; i < alerts.length; i++)
        string += alerts[i].message + ' ';
      var speakAlerts = function() {
        earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);
        tts.speak(string, 0, {});
      };

      // If tab content is already loaded, speak immediately.
      if (tabs[0].status == 'complete') {
        speakAlerts();
        return;
      }

      // If tab content loading is not complete, wait to avoid interruption
      // from other messages.
      var removeListeners = function() {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        chrome.tabs.onRemoved.removeListener(removeListeners);
      };
      var onUpdated = function(tabId, changeInfo, tab) {
        if (tabId != tabs[0].id || changeInfo.status != 'complete')
          return;
        speakAlerts();
        removeListeners();
      };
      var onRemoved = function(tabId, removeInfo) {
        if (tabId != tabs[0].id)
          return;
        removeListeners();
      };
      chrome.tabs.onUpdated.addListener(onUpdated);
      chrome.tabs.onRemoved.addListener(onRemoved);
    });
  });
};
