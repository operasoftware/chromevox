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
 * @fileoverview ChromeVox options page.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.OptionsPage');

goog.require('cvox.ChromeEarcons');
goog.require('cvox.ChromeHost');
goog.require('cvox.ChromeMsgs');
goog.require('cvox.ChromeTts');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxPrefs');
goog.require('cvox.CommandStore');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.HostFactory');
goog.require('cvox.KeyMap');


/**
 * Class to manage the options page.
 * @constructor
 */
cvox.OptionsPage = function() {
};

/**
 * The ChromeVoxPrefs object.
 * @type {cvox.ChromeVoxPrefs}
 */
cvox.OptionsPage.prefs;

/**
 * A mapping from keycodes to their human readable text equivalents.
 * This is initialized in cvox.OptionsPage.init for internationalization.
 * @type {Object.<string, string>}
 */
cvox.OptionsPage.KEYCODE_TO_TEXT = {
};

/**
 * A mapping from human readable text to keycode values.
 * This is initialized in cvox.OptionsPage.init for internationalization.
 * @type {Object.<string, string>}
 */
cvox.OptionsPage.TEXT_TO_KEYCODE = {
};

/**
 * Initialize the options page by setting the current value of all prefs,
 * building the key bindings table, and adding event listeners.
 */
cvox.OptionsPage.init = function() {
  cvox.CommandStore.init();
  cvox.ChromeVox.msgs = cvox.HostFactory.getMsgs();

  cvox.OptionsPage.KEYCODE_TO_TEXT = {
    '#8' : cvox.ChromeVox.msgs.getMsg('backspace_key'),
    '#9' : cvox.ChromeVox.msgs.getMsg('tab_key'),
    '#13' : cvox.ChromeVox.msgs.getMsg('enter_key'),
    '#32' : cvox.ChromeVox.msgs.getMsg('space_key'),
    '#37' : cvox.ChromeVox.msgs.getMsg('left_key'),
    '#38' : cvox.ChromeVox.msgs.getMsg('up_key'),
    '#39' : cvox.ChromeVox.msgs.getMsg('right_key'),
    '#40' : cvox.ChromeVox.msgs.getMsg('down_key'),
    '#186' : ';',
    '#187' : '=',
    '#188' : ',',
    '#189' : '-',
    '#190' : '.',
    '#191' : '/',
    '#192' : '`',
    '#219' : '[',
    '#220' : '\\',
    '#221' : ']',
    '#222' : '\''
  };

  for (var key in cvox.OptionsPage.KEYCODE_TO_TEXT) {
    cvox.OptionsPage.TEXT_TO_KEYCODE[cvox.OptionsPage.KEYCODE_TO_TEXT[key]] =
        key;
  }

  cvox.OptionsPage.prefs = chrome.extension.getBackgroundPage().prefs;
  cvox.OptionsPage.populateSelectKeyMap();
  cvox.OptionsPage.addKeys();
  cvox.OptionsPage.populateVoicesSelect();
  cvox.ChromeVox.msgs.addTranslatedMessagesToDom(document);
  cvox.OptionsPage.update();

  document.addEventListener('change', cvox.OptionsPage.eventListener, false);
  document.addEventListener('click', cvox.OptionsPage.eventListener, false);
  document.addEventListener('keydown', cvox.OptionsPage.eventListener, false);

  cvox.ExtensionBridge.addMessageListener(function(message) {
    if (message['keyBindings'] || message['prefs']) {
      cvox.OptionsPage.update();
    }
  });

  document.getElementById('resetToDefaultKeys').addEventListener('click',
      function() {
        var selectKeyMap = document.getElementById('cvox_keymaps');
        cvox.OptionsPage.prefs.switchToKeyMap(selectKeyMap.selectedIndex);
        document.getElementById('keysContainer').innerHTML = '';
        cvox.OptionsPage.addKeys();
        cvox.ChromeVox.msgs.addTranslatedMessagesToDom(document);
      }, false);
};

/**
 * Update the value of controls to match the current preferences.
 * This happens if the user presses a key in a tab that changes a
 * pref.
 */
cvox.OptionsPage.update = function() {
  var prefs = cvox.OptionsPage.prefs.getPrefs();
  for (var key in prefs) {
    var elements = document.querySelectorAll('*[name="' + key + '"]');
    for (var i = 0; i < elements.length; i++) {
      cvox.OptionsPage.setValue(elements[i], prefs[key]);
    }
  }
};

/**
 * Populate the keymap select element with stored keymaps
 */
cvox.OptionsPage.populateSelectKeyMap = function() {
  var selectKeyMap = document.getElementById('cvox_keymaps');
  for (var i = 0; i < cvox.KeyMap.AVAILABLE_MAP_INFO.length; i++) {
    var availableMapInfo = cvox.KeyMap.AVAILABLE_MAP_INFO[i];
    var option = document.createElement('option');
    option.className = 'i18n';
    option.setAttribute('msgid', availableMapInfo.id);
    if (cvox.OptionsPage.prefs.getPrefs()['currentKeyMap'] == i) {
      option.setAttribute('selected', '');
    }
    selectKeyMap.appendChild(option);
  }
};

/**
 * Add the input elements for the key bindings to the container element
 * in the page. They're sorted in order of description.
 */
cvox.OptionsPage.addKeys = function() {
  var container = document.getElementById('keysContainer');
  var keyMap = cvox.OptionsPage.prefs.getKeyMap();

  // TODO(dtseng): Requires cleanup.
  keyMap.resetModifier();
  document.getElementById('cvoxKey').disabled = true;
  document.getElementById('cvoxKey').textContent = localStorage['cvoxKey'];

  var categories = cvox.CommandStore.categories();
  for (var i = 0; i < categories.length; i++) {
    var headerElement = document.createElement('h3');
    headerElement.className = 'i18n';
    headerElement.setAttribute('msgid', categories[i]);
    container.appendChild(headerElement);

    var commands = cvox.CommandStore.commandsForCategory(categories[i]);
    for (var j = 0; j < commands.length; j++) {
      var command = commands[j];
      var key = keyMap.keyForCommand(command);

      // TODO(dtseng): Decide what to do lack of key binding.
      if (!key) {
        key = '';
      }
      var inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.className = 'key';
      inputElement.id = command;
      var displayedCombo = cvox.OptionsPage.convertBetweenCodesAndText(key,
          cvox.OptionsPage.KEYCODE_TO_TEXT);
      inputElement.value = displayedCombo;

      // Don't allow the user to change the sticky mode key.
      if (command == 'toggleStickyMode') {
        inputElement.disabled = true;
      }
      var message = cvox.CommandStore.messageForCommand(command);
      if (!message) {
        // TODO(dtseng): missing message id's.
        message = command;
      }

      var labelElement = document.createElement('label');
      labelElement.className = 'i18n';
      labelElement.setAttribute('msgid', message);
      labelElement.setAttribute('for', inputElement.id);

      var divElement = document.createElement('div');
      container.appendChild(divElement);
      divElement.appendChild(inputElement);
      divElement.appendChild(labelElement);
    }
  }
};

/**
 * Populates the voices select with options.
 */
cvox.OptionsPage.populateVoicesSelect = function() {
  var select = document.getElementById('voices');
  chrome.tts.getVoices(function(voices) {
    voices.forEach(function(voice) {
      var option = document.createElement('option');
      option.voiceName = voice.voiceName || '';
      option.innerText = option.voiceName;
      if (localStorage['voiceName'] == voice.voiceName) {
        option.setAttribute('selected', '');
      }
      select.add(option);
    });
  });

  select.addEventListener('change', function(evt) {
    var selIndex = select.selectedIndex;
    var sel = select.options[selIndex];
    localStorage['voiceName'] = sel.voiceName;
  }, true);
};

/**
 * Set the html element for a preference to match the given value.
 * @param {Element} element The HTML control.
 * @param {string} value The new value.
 */
cvox.OptionsPage.setValue = function(element, value) {
  if (element.tagName == 'INPUT' && element.type == 'checkbox') {
    element.checked = (value == 'true');
  } else if (element.tagName == 'INPUT' && element.type == 'radio') {
    element.checked = (String(element.value) == value);
  } else {
    element.value = value;
  }
};

/**
 * Event listener, called when an event occurs in the page that might
 * affect one of the preference controls.
 * @param {Event} event The event.
 * @return {boolean} True if the default action should occur.
 */
cvox.OptionsPage.eventListener = function(event) {
  window.setTimeout(function() {
    var target = event.target;
    if (target.classList.contains('pref')) {
      if (target.tagName == 'INPUT' && target.type == 'checkbox') {
        cvox.OptionsPage.prefs.setPref(target.name, target.checked);
      } else if (target.tagName == 'INPUT' && target.type == 'radio') {
        var key = target.name;
        var elements = document.querySelectorAll('*[name="' + key + '"]');
        for (var i = 0; i < elements.length; i++) {
          if (elements[i].checked) {
            cvox.OptionsPage.prefs.setPref(target.name, elements[i].value);
          }
        }
      }
    } else if (target.classList.contains('key')) {
      var keyCode = cvox.OptionsPage.convertBetweenCodesAndText(target.value,
          cvox.OptionsPage.TEXT_TO_KEYCODE);
      var success = false;
      if (target.id == 'cvoxKey') {
        // TODO (clchen): Implement a check when setting the modifier key.
        // TODO(dtseng): This is horribly conflict ridden.
        // cvox.OptionsPage.prefs.setPref(target.id, keyCode);
        success = true;
      } else {
        success = cvox.OptionsPage.prefs.setKey(target.id, keyCode);

        // TODO(dtseng): Don't surface conflicts until we have a better
        // workflow.
      }
    }
  }, 0);
  return true;
};

/**
 * Converts between keycodes and their human readable text equivalents.
 * For example, this can convert Ctrl+#186 to Ctrl+; and vice versa.
 *
 * @param {string} input The input string which is either a keycode
 * string or a human readable text string.
 * @param {Object} conversionTable The conversion table to use. This
 * will determine which way the conversion is going. Valid conversion
 * tables are:
 * cvox.OptionsPage.KEYCODE_TO_TEXT
 * and
 * cvox.OptionsPage.TEXT_TO_KEYCODE.
 * @return {string} The converted string.
 */
cvox.OptionsPage.convertBetweenCodesAndText = function(input, conversionTable) {
  var output = '';
  var keySequences = input.split('>');

  for (var i = 0, keySequence; keySequence = keySequences[i]; i++) {
    var keys = keySequence.split('+');
    for (var j = 0, key; key = keys[j]; j++) {
      if (conversionTable[key] != null) {
        key = conversionTable[key];
      }
      output = output + key + '+';
    }
    // Remove the extra + at the end.
    output = output.substring(0, output.length - 1);
    output = output + '>';
  }
  // Remove the extra > at the end.
  output = output.substring(0, output.length - 1);

  return output;
};

document.addEventListener('DOMContentLoaded', function() {
  cvox.OptionsPage.init();
}, false);
