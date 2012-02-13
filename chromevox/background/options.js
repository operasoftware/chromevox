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

goog.require('cvox.ChromeEarcons');
goog.require('cvox.ChromeHost');
goog.require('cvox.ChromeMsgs');
goog.require('cvox.ChromeTts');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxPrefs');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.HostFactory');



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
  cvox.ChromeVox.msgs = cvox.HostFactory.getMsgs();

  cvox.ChromeVox.msgs.addTranslatedMessagesToDom(document);

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

  cvox.OptionsPage.prefs = new cvox.ChromeVoxPrefs();
  cvox.OptionsPage.addKeys();
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
        cvox.OptionsPage.prefs.resetKeys();
        document.getElementById('keysContainer').innerHTML = '';
        cvox.OptionsPage.addKeys();
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
 * Add the input elements for the key bindings to the container element
 * in the page. They're sorted in order of description.
 */
cvox.OptionsPage.addKeys = function() {
  var container = document.getElementById('keysContainer');
  var keyMap = cvox.OptionsPage.prefs.getKeyMap();
  var descriptionToKeyMap = {};
  var descriptions = [];
  for (var key in keyMap) {
    var description = keyMap[key][1];
    descriptionToKeyMap[description] = key;
    descriptions.push(description);
  }
  descriptions.sort();

  for (var i = 0; i < descriptions.length; i++) {
    var description = descriptions[i];
    var key = descriptionToKeyMap[description];
    var name = keyMap[key][0];

    var inputElem = document.createElement('input');
    inputElem.type = 'text';
    inputElem.className = 'key';
    inputElem.name = name;
    inputElem.id = name;
    var displayedCombo = cvox.OptionsPage.convertBetweenCodesAndText(key,
          cvox.OptionsPage.KEYCODE_TO_TEXT);
    inputElem.value = displayedCombo;

    var labelElem = document.createElement('label');
    container.appendChild(labelElem);
    labelElem.appendChild(inputElem);
    labelElem.appendChild(document.createTextNode(description));
  }
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
    if (target.className == 'pref') {
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
    } else if (target.className == 'key') {
      var keyCode = cvox.OptionsPage.convertBetweenCodesAndText(target.value,
          cvox.OptionsPage.TEXT_TO_KEYCODE);
      var success = false;
      if (target.name == 'cvoxKey') {
        // TODO (clchen): Implement a check when setting the modifier key.
        cvox.OptionsPage.prefs.setPref(target.name, keyCode);
        success = true;
      } else {
        success = cvox.OptionsPage.prefs.setKey(target.name, keyCode);
      }
      if (success) {
        target.removeAttribute('aria-invalid');
      } else {
        target.setAttribute('aria-invalid', 'true');
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

/**
 * Called by options.html when the page is loaded.
 * @export
 */
function load() {
  cvox.OptionsPage.init();
}
