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
goog.require('cvox.KeySequence');
goog.require('cvox.PlatformUtil');


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
 * @suppress {missingProperties} Property prefs never defined on Window
 */
cvox.OptionsPage.init = function() {
  cvox.ChromeVox.msgs = cvox.HostFactory.getMsgs();

  cvox.OptionsPage.prefs = chrome.extension.getBackgroundPage().prefs;
  cvox.OptionsPage.populateKeyMapSelect();
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

  document.getElementById('selectKeys').addEventListener(
      'click', cvox.OptionsPage.reset, false);

  if (cvox.PlatformUtil.matchesPlatform(cvox.PlatformFilter.WML)) {
    document.getElementById('version').textContent =
        chrome.app.getDetails().version;
  }
};

/**
 * Update the value of controls to match the current preferences.
 * This happens if the user presses a key in a tab that changes a
 * pref.
 */
cvox.OptionsPage.update = function() {
  var prefs = cvox.OptionsPage.prefs.getPrefs();
  for (var key in prefs) {
    // TODO(rshearer): 'active' is a pref, but there's no place in the
    // options page to specify whether you want ChromeVox active.
    var elements = document.querySelectorAll('*[name="' + key + '"]');
    for (var i = 0; i < elements.length; i++) {
      cvox.OptionsPage.setValue(elements[i], prefs[key]);
    }
  }
};

/**
 * Populate the keymap select element with stored keymaps
 */
cvox.OptionsPage.populateKeyMapSelect = function() {
  var select = document.getElementById('cvox_keymaps');
  for (var id in cvox.KeyMap.AVAILABLE_MAP_INFO) {
    var info = cvox.KeyMap.AVAILABLE_MAP_INFO[id];
    var option = document.createElement('option');
    option.id = id;
    option.className = 'i18n';
    option.setAttribute('msgid', id);
    if (cvox.OptionsPage.prefs.getPrefs()['currentKeyMap'] == id) {
      option.setAttribute('selected', '');
    }
    select.appendChild(option);
  }

  select.addEventListener('change', cvox.OptionsPage.reset, true);
};

/**
 * Add the input elements for the key bindings to the container element
 * in the page. They're sorted in order of description.
 */
cvox.OptionsPage.addKeys = function() {
  var container = document.getElementById('keysContainer');
  var modifier_keys_container =
      document.getElementById('modifier_keys_container');
  var keyMap = cvox.OptionsPage.prefs.getKeyMap();

  this.prevTime = new Date().getTime();
  this.keyCount = 0;
  container.addEventListener('keypress', goog.bind(function(evt) {
    if (evt.target.id == 'cvoxKey') {
      return;
    }
    this.keyCount++;
    var currentTime = new Date().getTime();
    if (currentTime - this.prevTime > 1000 || this.keyCount > 2) {
      if (document.activeElement.id == 'toggleKeyPrefix') {
        this.keySequence = new cvox.KeySequence(evt, false);
        this.keySequence.keys['ctrlKey'][0] = true;
      } else {
        this.keySequence = new cvox.KeySequence(evt, true);
      }

      this.keyCount = 1;
    } else {
      this.keySequence.addKeyEvent(evt);
    }

    var keySeqStr = cvox.KeyUtil.keySequenceToString(this.keySequence, true);
    var announce = keySeqStr.replace(/\+/g,
        ' ' + cvox.ChromeVox.msgs.getMsg('then') + ' ');
    announce = announce.replace(/>/g,
        ' ' + cvox.ChromeVox.msgs.getMsg('followed_by') + ' ');
    announce = announce.replace('Cvox',
        ' ' + cvox.ChromeVox.msgs.getMsg('modifier_key') + ' ');

    // TODO(dtseng): Only basic conflict detection; it does not speak the
    // conflicting command. Nor does it detect prefix conflicts like Cvox+L vs
    // Cvox+L>L.
    if (cvox.OptionsPage.prefs.setKey(document.activeElement.id,
        this.keySequence)) {
      document.activeElement.value = keySeqStr;
    } else {
      announce = cvox.ChromeVox.msgs.getMsg('key_conflict', [announce]);
    }
    chrome.extension.getBackgroundPage().speak(announce);
    this.prevTime = currentTime;

    evt.preventDefault();
    evt.stopPropagation();
  }, cvox.OptionsPage), true);

  var categories = cvox.CommandStore.categories();
  for (var i = 0; i < categories.length; i++) {
    var headerElement = document.createElement('h3');
    headerElement.className = 'i18n';
    headerElement.setAttribute('msgid', categories[i]);
    headerElement.id = categories[i];
    container.appendChild(headerElement);
    var commands = cvox.CommandStore.commandsForCategory(categories[i]);
    for (var j = 0; j < commands.length; j++) {
      var command = commands[j];
      // TODO: Someday we may want to have more than one key
      // mapped to a command, so we'll need to figure out how to display
      // that. For now, just take the first key.
      var keySeqObj = keyMap.keyForCommand(command)[0];

      // Explicitly skip toggleChromeVox in ChromeOS.
      if (command == 'toggleChromeVox' &&
          cvox.PlatformUtil.matchesPlatform(cvox.PlatformFilter.CHROMEOS)) {
        continue;
      }

      var inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.className = 'key active-key';
      inputElement.id = command;

      var displayedCombo;
      if (keySeqObj != null) {
        displayedCombo = cvox.KeyUtil.keySequenceToString(keySeqObj, true);
      } else {
        displayedCombo = '';
      }
      inputElement.value = displayedCombo;

      // Don't allow the user to change the sticky mode or stop speaking key.
      if (command == 'toggleStickyMode' || command == 'stopSpeech') {
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
      divElement.className = 'key-container';
      container.appendChild(divElement);
      divElement.appendChild(inputElement);
      divElement.appendChild(labelElement);
    }
      var brElement = document.createElement('br');
      container.appendChild(brElement);
  }

  if (document.getElementById('cvoxKey') == null) {
    // Add the cvox key field
    var inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.className = 'key';
    inputElement.id = 'cvoxKey';

    var labelElement = document.createElement('label');
    labelElement.className = 'i18n';
    labelElement.setAttribute('msgid', 'options_cvox_modifier_key');
    labelElement.setAttribute('for', 'cvoxKey');

    var modifierSectionSibling =
        document.getElementById('modifier_keys').nextSibling;
    var modifierSectionParent = modifierSectionSibling.parentNode;
    modifierSectionParent.insertBefore(labelElement, modifierSectionSibling);
    modifierSectionParent.insertBefore(inputElement, labelElement);
    var cvoxKey = document.getElementById('cvoxKey');
    cvoxKey.value = localStorage['cvoxKey'];

    cvoxKey.addEventListener('keydown', function(evt) {
      if (!this.modifierSeq_) {
        this.modifierCount_ = 0;
        this.modifierSeq_ = new cvox.KeySequence(evt, false);
      } else {
        this.modifierSeq_.addKeyEvent(evt);
      }

      //  Never allow non-modified keys.
      if (!this.modifierSeq_.isAnyModifierActive()) {
        // Indicate error and instructions excluding tab.
        if (evt.keyCode != 9) {
          chrome.extension.getBackgroundPage().speak(
              cvox.ChromeVox.msgs.getMsg('modifier_entry_error'), 0, {});
        }
        this.modifierSeq_ = null;
      } else {
        this.modifierCount_++;
      }

      // Don't trap tab or shift.
      if (!evt.shiftKey && evt.keyCode != 9) {
        evt.preventDefault();
        evt.stopPropagation();
      }
    }, true);

    cvoxKey.addEventListener('keyup', function(evt) {
      if (this.modifierSeq_) {
        this.modifierCount_--;

        if (this.modifierCount_ == 0) {
          var modifierStr =
              cvox.KeyUtil.keySequenceToString(this.modifierSeq_, true, true);
          evt.target.value = modifierStr;
          chrome.extension.getBackgroundPage().speak(
              cvox.ChromeVox.msgs.getMsg('modifier_entry_set', [modifierStr]));
          localStorage['cvoxKey'] = modifierStr;
          this.modifierSeq_ = null;
        }
        evt.preventDefault();
        evt.stopPropagation();
      }
    }, true);
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
      var keySeq = cvox.KeySequence.fromStr(target.value);
      var success = false;
      if (target.id == 'cvoxKey') {
        cvox.OptionsPage.prefs.setPref(target.id, target.value);
        cvox.OptionsPage.prefs.sendPrefsToAllTabs(true, true);
        success = true;
      } else {
        success =
            cvox.OptionsPage.prefs.setKey(target.id, keySeq);

        // TODO(dtseng): Don't surface conflicts until we have a better
        // workflow.
      }
    }
  }, 0);
  return true;
};

/**
 * Refreshes all dynamic content on the page.
This includes all key related information.
 */
cvox.OptionsPage.reset = function() {
  var selectKeyMap = document.getElementById('cvox_keymaps');
  var id = selectKeyMap.options[selectKeyMap.selectedIndex].id;

  var msgs = cvox.ChromeVox.msgs;
  var announce = cvox.OptionsPage.prefs.getPrefs()['currentKeyMap'] == id ?
      msgs.getMsg('keymap_reset', [msgs.getMsg(id)]) :
      msgs.getMsg('keymap_switch', [msgs.getMsg(id)]);
  cvox.OptionsPage.updateStatus_(announce);

  cvox.OptionsPage.prefs.switchToKeyMap(id);
  document.getElementById('keysContainer').innerHTML = '';
  cvox.OptionsPage.addKeys();
  cvox.ChromeVox.msgs.addTranslatedMessagesToDom(document);
};

/**
 * Updates the status live region.
 * @param {string} status The new status.
 * @private
 */
cvox.OptionsPage.updateStatus_ = function(status) {
  document.getElementById('status').innerText = status;
};


document.addEventListener('DOMContentLoaded', function() {
  cvox.OptionsPage.init();
}, false);
