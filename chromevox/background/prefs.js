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
 * @fileoverview Common page for reading and writing preferences from
 * the background context (background page or options page).
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.ChromeVoxPrefs');

goog.require('cvox.ChromeVox');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.KeyUtil');


/**
 * This object has default values of preferences and contains the common
 * code for working with preferences shared by the Options and Background
 * pages.
 * @constructor
 */
cvox.ChromeVoxPrefs = function() {
  var lastRunVersion = localStorage['lastRunVersion'];
  if (!lastRunVersion) {
    lastRunVersion = '1.16.0';
  }
  var loadExistingSettings = true;
  if (lastRunVersion == '1.16.0') {
    loadExistingSettings = false;
  }
  localStorage['lastRunVersion'] = chrome.app.getDetails().version;
  this.init(loadExistingSettings);
};


/**
 * The default value of all preferences except the key map.
 * @const
 * @type {Object.<string, Object>}
 */
cvox.ChromeVoxPrefs.DEFAULT_PREFS = {
  'active': true,
  'lensVisible': false,
  'lensAnchored': true,
  'focusFollowsMouse': false,
  'useBriefMode': false,
  'cursorIsBlock': false,
  'cvoxKey': '',
  'siteSpecificScriptBase':
      'https://ssl.gstatic.com/accessibility/javascript/ext/',
  'siteSpecificScriptLoader':
      'https://ssl.gstatic.com/accessibility/javascript/ext/loader.js',
  'filterMap': '{}'
};


/**
 * The current mapping from keys to an array of [command, description].
 * @type {Object.<Array.<string>>}
 */
cvox.ChromeVoxPrefs.prototype.keyMap;


/**
 * A reverse mapping from command to key binding.
 * @type {Object.<string,string>}
 */
cvox.ChromeVoxPrefs.prototype.nameToKeyMap;


/**
 * Merge the default values of all known prefs with what's found in
 * localStorage.
 * @param {boolean} pullFromLocalStorage or not to pull prefs from local
 * storage. True if we want to respect changes the user has already made
 * to prefs, false if we want to overwrite them. Set false if we've made
 * changes to keyboard shortcuts and need to make sure they aren't
 * overridden by the keymap in local storage.
 */
cvox.ChromeVoxPrefs.prototype.init = function(pullFromLocalStorage) {
  // Set the default value of any pref that isn't already in localStorage.
  for (var key in cvox.ChromeVoxPrefs.DEFAULT_PREFS) {
    if (localStorage[key] === undefined) {
      localStorage[key] = cvox.ChromeVoxPrefs.DEFAULT_PREFS[key];
    }
  }
  // Set the default modifier key if isn't already in localStorage.
  if (localStorage['cvoxKey'].length < 1) {
    this.resetModifier_();
  }

  // Try to intelligently merge the key maps; any new command that isn't
  // already in the key map should get added, unless there's a key conflict.
  // If we're pulling from local storage, get the current key map from
  // localStorage.
  if (pullFromLocalStorage) {
    try {
      var currentKeyMap = JSON.parse(localStorage['keyBindings']);
    } catch (e) {
      var currentKeyMap = {};
    }
  } else {
    var currentKeyMap = {};
  }

  // Create a reverse map, from command to key.
  var currentReverseMap = {};  // Map from command to key
  for (var key in currentKeyMap) {
    var command = currentKeyMap[key][0];
    currentReverseMap[command] = key;
    // The sticky key is currently not configurable,
    // so we should not read in any keys that are saved for it.
    if (command == 'toggleStickyMode') {
      delete currentKeyMap[key];
      delete currentReverseMap[command];
    }
  }

  // Now merge the default keyMap.
  var defaultKeyMap = this.createDefaultKeyMap();
  for (var key in defaultKeyMap) {
    var command = defaultKeyMap[key][0];
    if (currentReverseMap[command] === undefined &&
        currentKeyMap[key] === undefined) {
      currentKeyMap[key] = defaultKeyMap[key];
    } else if (currentReverseMap[command] === undefined) {
      var undefinedIndex = 1;
      while (currentKeyMap['Undefined' + undefinedIndex] !== undefined) {
        undefinedIndex++;
      }
      currentKeyMap['Undefined' + undefinedIndex] = defaultKeyMap[key];
    }
  }

  // Now set the keyMap and write it back to localStorage.
  this.keyMap = /** @type {Object.<Array.<string>>} */(currentKeyMap);

  this.saveKeyMap();
};


/**
 * Create and return the default key map.
 * @return {Object.<Array.<string>>} The default key map.
 */
cvox.ChromeVoxPrefs.prototype.createDefaultKeyMap = function() {
  var mod1 = 'Cvox';
  /** Alias getMsg as msg. */
  var msg = goog.bind(cvox.ChromeVox.msgs.getMsg, cvox.ChromeVox.msgs);

  var keyMap = {};

  keyMap['Ctrl+'] = ['stopSpeech', msg('stop_speech_key')]; // Cvox

  // Double tap the sticky key to toggle sticky mode.
  var stickyKeyName =
      cvox.KeyUtil.getReadableNameForKeyCode(cvox.KeyUtil.getStickyKeyCode());
  keyMap[(stickyKeyName + '>' + stickyKeyName + '+')] =
      ['toggleStickyMode', msg('toggle_sticky_mode')];

  // Turning on prefix key
  keyMap[('Ctrl+Z')] = ['toggleKeyPrefix', msg('toggle_key_prefix')];

  // TAB/Shift+TAB
  keyMap['#9'] = ['handleTab', msg('handle_tab_next')]; // Tab
  keyMap['Shift+#9'] = ['handleTab', msg('handle_tab_prev')];

  // Basic navigation
  keyMap[(mod1 + '+#38')] = ['backward', msg('backward')];
  keyMap[(mod1 + '+#40')] = ['forward', msg('forward')];
  keyMap[(mod1 + '+#37')] =
      ['left', msg('left')];
  keyMap[(mod1 + '+#39')] =
      ['right', msg('right')];

  keyMap['#37'] = ['skipBackward', msg('skip_backward')];
  keyMap['#39'] = ['skipForward', msg('skip_forward')];

  keyMap[(mod1 + '+#189')] =
      ['previousGranularity', msg('previous_granularity')]; // -
  keyMap[(mod1 + '+#187')] =
      ['nextGranularity', msg('next_granularity')]; //+

  keyMap[(mod1 + '+#32')] =
      ['forceClickOnCurrentItem',
      msg('force_click_on_current_item')]; // SPACE
  // Read the URL
  keyMap[(mod1 + '+U')] = ['readLinkURL', msg('read_link_url')];
  // Read current page title
  keyMap[(mod1 + '+C>T')] =
      ['readCurrentTitle', msg('read_current_title')];
  // Read current page URL
  keyMap[(mod1 + '+C>U')] =
      ['readCurrentURL', msg('read_current_url')];
  // Start reading from current location
  keyMap[(mod1 + '+R')] =
      ['readFromHere', msg('read_from_here')];
  // Announce the current position
  keyMap[(mod1 + '+J')] = ['announcePosition', msg('announce_position')];
  // Announce the current position with full path
  keyMap[(mod1 + '+K')] = ['fullyDescribe', msg('fully_describe')];

  // General commands
  keyMap[(mod1 + '+#190')] =
      ['showPowerKey', msg('show_power_key')]; // '.'
  keyMap[(mod1)] =
      ['hidePowerKey', msg('hide_power_key')]; // modifier
  keyMap[(mod1 + '+H')] = ['help', msg('help')];
  keyMap[(mod1 + '+I>F')] =
  ['toggleFilteringWidget', msg('toggle_filtering_widget')];
      keyMap[(mod1 + '+#191')] =
      ['toggleSearchWidget', msg('toggle_search_widget')];    // '/'
  keyMap[(mod1 + '+O>W')] =
      ['showOptionsPage', msg('show_options_page')];
  keyMap[(mod1 + '+O>K')] =
      ['showKbExplorerPage', msg('show_kb_explorer_page')];
  keyMap[(mod1 + '+A>A')] = ['toggleChromeVox', msg('toggle_chromevox_active')];

  // TODO Assign a different shortcut when nextTtsEngine works.
  //keyMap[(mod1 + '+N>A')] = ['nextTtsEngine', 'Switch to next TTS engine'];

  keyMap[(mod1 + '+#186')] =
      ['decreaseTtsPitch', msg('decrease_tts_pitch')]; // ';'
  keyMap[(mod1 + '+#222')] =
      ['increaseTtsPitch', msg('increase_tts_pitch')]; // '''

  keyMap[(mod1 + '+#219')] =
      ['decreaseTtsRate', msg('decrease_tts_rate')]; // '['
  keyMap[(mod1 + '+#221')] =
      ['increaseTtsRate', msg('increase_tts_rate')]; // ']'

  // Lens
  keyMap[(mod1 + '+M>E')] =
      ['showLens', msg('show_lens')]; //'M' > 'E'
  keyMap[(mod1 + '+M>#8')] =
      ['hideLens', msg('hide_lens')]; // 'M' > 'Backspace'
  keyMap[(mod1 + '+M>M')] =
      ['toggleLens', msg('toggle_lens')]; // 'M' > 'M'
  keyMap[(mod1 + '+M>A')] =
      ['anchorLens', msg('anchor_lens')]; //'M' > 'A'
  keyMap[(mod1 + '+M>F')] =
      ['floatLens', msg('float_lens')]; // 'M' > 'F'

  // List commands
  keyMap[(mod1 + '+L>F')] =
      ['showFormsList', msg('show_forms_list')]; //'L' > 'F'
  keyMap[(mod1 + '+L>H')] =
      ['showHeadingsList', msg('show_headings_list')]; //'L' > 'H'
  keyMap[(mod1 + '+L>J')] =
      ['showJumpsList', msg('show_jumps_list')]; //'L' > 'J'
  keyMap[(mod1 + '+L>L')] =
      ['showLinksList', msg('show_links_list')]; //'L' > 'L'
  keyMap[(mod1 + '+L>T')] =
      ['showTablesList', msg('show_tables_list')]; //'L' > 'T'
  keyMap[(mod1 + '+L>#186')] =
      ['showLandmarksList',
      msg('show_landmarks_list')]; //'L' > ';'

  // Mode commands
  keyMap[(mod1 + '+T>E')] =
      ['toggleTable', msg('toggle_table')]; //'T' > 'E'

  keyMap[(mod1 + '+T>H')] =
      ['announceHeaders', msg('announce_headers')]; // T > H
  keyMap[(mod1 + '+T>L')] =
      ['speakTableLocation', msg('speak_table_location')]; // T > L

  keyMap[(mod1 + '+T>R')] =
      ['guessRowHeader', msg('guess_row_header')];
  // T > R
  keyMap[(mod1 + '+T>C')] =
      ['guessColHeader', msg('guess_col_header')]; // T > L

  keyMap[(mod1 + '+T>#219')] =
      ['skipToBeginning', msg('skip_to_beginning')]; // 'T' > '['
  keyMap[(mod1 + '+T>#221')] =
      ['skipToEnd', msg('skip_to_end')]; // 'T' > ']'

  keyMap[(mod1 + '+T>#186')] =
      ['skipToRowBeginning', msg('skip_to_row_beginning')]; // 'T' > ';'
  keyMap[(mod1 + '+T>#222')] =
      ['skipToRowEnd', msg('skip_to_row_end')]; // 'T' > '''

  keyMap[(mod1 + '+T>#188')] =
      ['skipToColBeginning', msg('skip_to_col_beginning')];
  keyMap[(mod1 + '+T>#190')] =
      ['skipToColEnd', msg('skip_to_col_end')]; // 'T' > '.'

  // Jump commands
  keyMap[(mod1 + '+N>1')] = ['nextHeading1', msg('next_heading1')];
  keyMap[(mod1 + '+P>1')] =
      ['previousHeading1', msg('previous_heading1')];
  keyMap[(mod1 + '+N>2')] = ['nextHeading2', msg('next_heading2')];
  keyMap[(mod1 + '+P>2')] =
      ['previousHeading2', msg('previous_heading2')];
  keyMap[(mod1 + '+N>3')] = ['nextHeading3', msg('next_heading3')];
  keyMap[(mod1 + '+P>3')] =
      ['previousHeading3', msg('previous_heading3')];
  keyMap[(mod1 + '+N>4')] = ['nextHeading4', msg('next_heading4')];
  keyMap[(mod1 + '+P>4')] =
      ['previousHeading4', msg('previous_heading4')];
  keyMap[(mod1 + '+N>5')] = ['nextHeading5', msg('next_heading5')];
  keyMap[(mod1 + '+P>5')] =
      ['previousHeading5', msg('previous_heading5')];
  keyMap[(mod1 + '+N>6')] = ['nextHeading6', msg('next_heading6')];
  keyMap[(mod1 + '+P>6')] =
      ['previousHeading6', msg('previous_heading6')];
  keyMap[(mod1 + '+N>A')] = ['nextAnchor', msg('next_anchor')];
  keyMap[(mod1 + '+P>A')] =
      ['previousAnchor', msg('previous_anchor')];
  keyMap[(mod1 + '+N>C')] =
      ['nextComboBox', msg('next_combo_box')];
  keyMap[(mod1 + '+P>C')] =
      ['previousComboBox', msg('previous_combo_box')];
  keyMap[(mod1 + '+N>D')] =
      ['nextDifferentElement', 'next different element'];
  keyMap[(mod1 + '+P>D')] =
      ['previousDifferentElement', 'previous different element'];
  keyMap[(mod1 + '+N>E')] =
      ['nextEditText', msg('next_edit_text')];
  keyMap[(mod1 + '+P>E')] =
      ['previousEditText', msg('previous_edit_text')];
  keyMap[(mod1 + '+N>F')] =
      ['nextFormField', msg('next_form_field')];
  keyMap[(mod1 + '+P>F')] =
      ['previousFormField', msg('previous_form_field')];
  keyMap[(mod1 + '+N>G')] = ['nextGraphic', msg('next_graphic')];
  keyMap[(mod1 + '+P>G')] =
      ['previousGraphic', msg('previous_graphic')];
  keyMap[(mod1 + '+N>H')] = ['nextHeading', msg('next_heading')];
  keyMap[(mod1 + '+P>H')] =
      ['previousHeading', msg('previous_heading')];
  keyMap[(mod1 + '+N>I')] =
      ['nextListItem', msg('next_list_item')];
  keyMap[(mod1 + '+P>I')] =
      ['previousListItem', msg('previous_list_item')];
  keyMap[(mod1 + '+N>J')] = ['nextJump', msg('next_jump')];
  keyMap[(mod1 + '+P>J')] = ['previousJump', msg('previous_jump')];
  keyMap[(mod1 + '+N>L')] = ['nextLink', msg('next_link')];
  keyMap[(mod1 + '+P>L')] = ['previousLink', msg('previous_link')];
  keyMap[(mod1 + '+N>O')] = ['nextList', msg('next_list')];
  keyMap[(mod1 + '+P>O')] = ['previousList', msg('previous_list')];
  keyMap[(mod1 + '+N>Q')] =
      ['nextBlockquote', msg('next_blockquote')];
  keyMap[(mod1 + '+P>Q')] =
      ['previousBlockquote', msg('previous_blockquote')];
  keyMap[(mod1 + '+N>R')] = ['nextRadio', msg('next_radio')];
  keyMap[(mod1 + '+P>R')] =
      ['previousRadio', msg('previous_radio')];
  keyMap[(mod1 + '+N>S')] = ['nextSimilarElement', 'nextSimilarElement'];
  keyMap[(mod1 + '+P>S')] =
      ['previousSimilarElement', msg('previous_slider')];
  keyMap[(mod1 + '+N>T')] = ['nextTable', msg('next_table')];
  keyMap[(mod1 + '+P>T')] =
      ['previousTable', msg('previous_table')];
  keyMap[(mod1 + '+N>B')] = ['nextButton', msg('next_button')];
  keyMap[(mod1 + '+P>B')] =
      ['previousButton', msg('previous_button')];
  keyMap[(mod1 + '+N>X')] = ['nextCheckbox', msg('next_checkbox')];
  keyMap[(mod1 + '+P>X')] =
      ['previousCheckbox', msg('previous_checkbox')];
  keyMap[(mod1 + '+N>#186')] =
      ['nextLandmark', msg('next_landmark')];  // ';'
  keyMap[(mod1 + '+P>#186')] =
      ['previousLandmark', msg('previous_landmark')];  // ';'
  keyMap[(mod1 + '+B>B')] = ['benchmark', msg('benchmark')];
  keyMap[(mod1 + '+B>F')] = ['readMacroFromHtml', 'Read macro from HTML'];

  // TODO(deboer): Better keys and i18n.
  keyMap[(mod1 + '+B>G')] = ['addMacroWriter', 'Add the macro writer to the page'];
  keyMap[(mod1 + '+B>H')] = ['startHistoryRecording', 'Start history recording'];
  keyMap[(mod1 + '+B>U')] = ['stopHistoryRecording', 'Stop history recording'];
  keyMap[(mod1 + '+B>T')] = ['runTests',
      'Run some basic tests using the current page'];
  keyMap[(mod1 + '+B>C')] = ['enableConsoleTts',
      'Write debugging TTS output to window.console'];

  // Filtering commands.
  keyMap[(mod1 + '+G')] = ['enterCssSpace', msg('enter_css_space')];
  keyMap[(mod1 + '+I>I')] = ['filterLikeCurrentItem', msg('filter_item')];

  return keyMap;
};


/**
 * Save the key map to localStorage, and update our reverse mapping.
 */
cvox.ChromeVoxPrefs.prototype.saveKeyMap = function() {
  this.nameToKeyMap = {};
  for (var key in this.keyMap) {
    var name = this.keyMap[key][0];
    this.nameToKeyMap[name] = key;
  }
  localStorage['keyBindings'] = JSON.stringify(this.keyMap);
};


/**
 * Get the prefs (not including keys).
 * @return {Object} A map of all prefs except the key map from localStorage.
 */
cvox.ChromeVoxPrefs.prototype.getPrefs = function() {
  var prefs = {};
  for (var key in cvox.ChromeVoxPrefs.DEFAULT_PREFS) {
    prefs[key] = localStorage[key];
  }
  prefs['version'] = chrome.app.getDetails().version;
  return prefs;
};


/**
 * Reloads the key map from local storage.
 */
cvox.ChromeVoxPrefs.prototype.reloadKeyMap = function() {
  // Get the current key map from localStorage.
  try {
    var currentKeyMap = JSON.parse(localStorage['keyBindings']);

    // Now set the keyMap and write it back to localStorage.
    this.keyMap = /** @type {Object.<Array.<string>>} */(currentKeyMap);

    // Create the reverse map, from command to key.
    this.nameToKeyMap = {};
    for (var key in this.keyMap) {
      var name = this.keyMap[key][0];
      this.nameToKeyMap[name] = key;
    }
  } catch (e) {
    console.log('ERROR: Could not reload keymap from localStorage');
  }
};


/**
 * Get the key map, from key binding to an array of [command, description].
 * @return {Object.<Array.<string>>} The key map.
 */
cvox.ChromeVoxPrefs.prototype.getKeyMap = function() {
  return this.keyMap;
};

/**
 * Reset to the default key bindings.
 * @private
 */
cvox.ChromeVoxPrefs.prototype.resetModifier_ = function() {
  if (cvox.ChromeVox.isChromeOS) {
    localStorage['cvoxKey'] = 'Shift+Search';
  } else if (cvox.ChromeVox.isMac) {
    localStorage['cvoxKey'] = 'Ctrl+Cmd';
  } else {
    localStorage['cvoxKey'] = 'Ctrl+Alt';
  }
};

/**
 * Reset to the default key bindings.
 */
cvox.ChromeVoxPrefs.prototype.resetKeys = function() {
  this.resetModifier_();
  this.keyMap = this.createDefaultKeyMap();
  this.saveKeyMap();
  this.sendPrefsToAllTabs(false, true);
};


/**
 * Send all of the settings to all tabs.
 * @param {boolean} sendPrefs Whether to send the prefs.
 * @param {boolean} sendKeyBindings Whether to send the key bindings.
 */
cvox.ChromeVoxPrefs.prototype.sendPrefsToAllTabs =
    function(sendPrefs, sendKeyBindings) {
  var context = this;
  var message = {};
  if (sendPrefs) {
    message['prefs'] = context.getPrefs();
  }
  if (sendKeyBindings) {
    message['keyBindings'] = this.keyMap;
  }
  chrome.windows.getAll({populate: true}, function(windows) {
    for (var i = 0; i < windows.length; i++) {
      var tabs = windows[i].tabs;
      for (var j = 0; j < tabs.length; j++) {
        chrome.tabs.sendRequest(tabs[j].id, message);
      }
    }
  });
};


/**
 * Send all of the settings over the specified port.
 * @param {Port} port The port representing the connection to a content script.
 */
cvox.ChromeVoxPrefs.prototype.sendPrefsToPort = function(port) {
  port.postMessage({
    'keyBindings': this.keyMap,
    'prefs': this.getPrefs()});
};


/**
 * Set the value of a pref and update all active tabs if it's changed.
 * @param {string} key The pref key.
 * @param {Object|string} value The new value of the pref.
 */
cvox.ChromeVoxPrefs.prototype.setPref = function(key, value) {
  if (localStorage[key] != value) {
    localStorage[key] = value;
    this.sendPrefsToAllTabs(true, false);
  }
};


/**
 * Try to change a key binding. This will not succeed if the command is
 * unknown or if the key is already bound to another command.
 * @param {string} name The name of the action.
 * @param {string} newKey The new key to assign it to.
 * @return {boolean} True if the key was unique.
 */
cvox.ChromeVoxPrefs.prototype.setKey = function(name, newKey) {
  var oldKey = this.nameToKeyMap[name];
  if (oldKey === undefined) {
    // Unknown name, this shouldn't happen.
    return false;
  }

  if (oldKey == newKey) {
    // No change.
    return true;
  }

  var nameAndDescription = this.keyMap[oldKey];
  var current = this.keyMap[newKey];
  if (current) {
    // Key already bound to something else!
    return false;
  }

  delete this.keyMap[oldKey];
  this.keyMap[newKey] = nameAndDescription;
  this.nameToKeyMap[name] = newKey;
  this.saveKeyMap();

  this.sendPrefsToAllTabs(false, true);

  return true;
};
