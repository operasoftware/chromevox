// Copyright 2011 Google Inc.
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

cvoxgoog.provide('cvox.ChromeVoxPrefs');

cvoxgoog.require('cvox.ChromeVox');
cvoxgoog.require('cvox.ExtensionBridge');



/**
 * This object has default values of preferences and contains the common
 * code for working with preferences shared by the Options and Background
 * pages.
 * @constructor
 */
cvox.ChromeVoxPrefs = function() {
  this.init();
};


/**
 * The default value of all preferences except the key map.
 * @const
 * @type {Object.<String, Object>}
 */
cvox.ChromeVoxPrefs.DEFAULT_PREFS = {
  'lensVisible': false,
  'lensAnchored': true,
  'focusFollowsMouse': false,
  'cursorIsBlock': false
};


/**
 * The current mapping from keys to an array of [command, description].
 * @type {Object.<Array.<String>>}
 */
cvox.ChromeVoxPrefs.prototype.keyMap;


/**
 * A reverse mapping from command to key binding.
 * @type {Object.<String,String>}
 */
cvox.ChromeVoxPrefs.prototype.nameToKeyMap;


/**
 * Merge the default values of all known prefs with what's found in
 * localStorage.
 */
cvox.ChromeVoxPrefs.prototype.init = function() {
  // Set the default value of any pref that isn't already in localStorage.
  for (var key in cvox.ChromeVoxPrefs.DEFAULT_PREFS) {
    if (localStorage[key] === undefined) {
      localStorage[key] = cvox.ChromeVoxPrefs.DEFAULT_PREFS[key];
    }
  }

  //
  // Try to intelligently merge the key maps; any new command that isn't
  // already in the key map should get added, unless there's a key conflict.
  //

  // Get the current key map from localStorage.
  try {
    var currentKeyMap = JSON.parse(localStorage['keyBindings']);
  } catch (e) {
    var currentKeyMap = {};
  }

  // Create a reverse map, from command to key.
  var currentReverseMap = {};  // Map from command to key
  for (var key in currentKeyMap) {
    var command = currentKeyMap[key][0];
    currentReverseMap[command] = key;
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
  this.keyMap = /** @type {Object.<Array.<String>>} */(currentKeyMap);
  this.saveKeyMap();
};


/**
 * Create and return the default key map.
 * @return {Object.<Array.<String>>} The default key map.
 */
cvox.ChromeVoxPrefs.prototype.createDefaultKeyMap = function() {
  var stkyKey = cvox.ChromeVox.stickyKeyStr;
  var stkyKeyCode = cvox.ChromeVox.stickyKeyCode;
  var mod1 = cvox.ChromeVox.modKeyStr;

  var keyMap = {};

  keyMap['Ctrl+'] = ['stopSpeech', 'Stop speaking']; // Ctrl
  keyMap['Cvox+'] = ['stopSpeech', 'Stop speaking']; // Ctrl

  // Double tap Modifier#1
  keyMap[(stkyKey + '>' + stkyKey + '+')] =
      ['toggleStickyMode', 'Enable/Disable sticky mode'];

  // TAB/Shift+TAB
  keyMap['#9'] = ['handleTab', 'Jump to next focusable item']; // Tab
  keyMap['Shift+#9'] = ['handleTab', 'Jump to previous focusable item'];

  // Basic navigation
  keyMap[(mod1 + '+#38')] = ['backward', 'Navigate backward'];
  keyMap[(mod1 + '+#40')] = ['forward', 'Navigate forward'];
  keyMap[(mod1 + '+#37')] =
      ['previousGranularity', 'Decrease navigation granularity'];
  keyMap[(mod1 + '+#39')] =
      ['nextGranularity', 'Increase navigation granularity'];
  keyMap['#13'] = ['actOnCurrentItem', 'Take action on current item']; // ENTER
  keyMap[(mod1 + '+#32')] =
      ['forceClickOnCurrentItem', 'Click on current item']; // SPACE
  // Read the URL
  keyMap[(mod1 + '+U')] = ['readLinkURL', 'Announce the URL behind a link'];
  // Read current page title
  keyMap[(mod1 + '+C>T')] =
      ['readCurrentTitle', 'Announce the title of the current page'];
  // Read current page URL
  keyMap[(mod1 + '+C>U')] =
      ['readCurrentURL', 'Announce the URL of the current page'];
  // Start reading from current location
  keyMap[(mod1 + '+R')] =
      ['readFromHere', 'Start reading from current location'];

  // General commands
  keyMap[(mod1 + '+#190')] = ['showPowerKey', 'Show ChromeVox help']; // '.'
  keyMap[(mod1)] = ['hidePowerKey', 'Hide ChromeVox help']; // modifier
  keyMap[(mod1 + '+H')] = ['help', 'Open ChromeVox help documentation'];
  keyMap[(mod1 + '+#191')] =
      ['toggleSearchWidget', 'Toggle search widget'];    // '/'
  keyMap[(mod1 + '+O>B')] = ['showBookmarkManager', 'Open bookmark manager'];
  keyMap[(mod1 + '+O>W')] = ['showOptionsPage', 'Open options page'];
  keyMap[(mod1 + '+O>K')] = ['showKbExplorerPage', 'Open keyboard explorer'];
  // TODO Assign a different shortcut when nextTtsEngine works.
  //keyMap[(mod1 + '+N>A')] = ['nextTtsEngine', 'Switch to next TTS engine'];
  keyMap[(mod1 + '+#189')] =
      ['decreaseTtsRate', 'Decrease rate of speech']; // '-'
  keyMap[(mod1 + '+#187')] =
      ['increaseTtsRate', 'Increase rate of speech']; // '='
  keyMap[(mod1 + '+#186')] = ['decreaseTtsPitch', 'Decrease pitch']; // ';'
  keyMap[(mod1 + '+#222')] = ['increaseTtsPitch', 'Increase pitch']; // '''
  keyMap[(mod1 + '+#219')] =
      ['decreaseTtsVolume', 'Decrease speech volume']; // '['
  keyMap[(mod1 + '+#221')] =
      ['increaseTtsVolume', 'Increase speech volume']; // ']'

  // Lens
  keyMap[(mod1 + '+M>E')] = ['showLens', 'Show lens']; //'M' > 'E'
  keyMap[(mod1 + '+M>#8')] = ['hideLens', 'Hide lens']; // 'M' > 'Backspace'
  keyMap[(mod1 + '+M>M')] = ['toggleLens', 'Toggle lens']; // 'M' > 'M'
  keyMap[(mod1 + '+M>A')] = ['anchorLens', 'Anchor lens at top']; //'M' > 'A'
  keyMap[(mod1 + '+M>F')] = ['floatLens', 'Float lens near text']; // 'M' > 'F'

  // List commands
  keyMap[(mod1 + '+L>F')] = ['showFormsList', 'Show forms list']; //'L' > 'F'
  keyMap[(mod1 + '+L>H')] =
      ['showHeadingsList', 'Show headings list']; //'L' > 'H'
  keyMap[(mod1 + '+L>J')] = ['showJumpsList', 'Show jumps list']; //'L' > 'J'
  keyMap[(mod1 + '+L>L')] = ['showLinksList', 'Show links list']; //'L' > 'L'
  keyMap[(mod1 + '+L>T')] = ['showTablesList', 'Show tables list']; //'L' > 'T'
  keyMap[(mod1 + '+L>#186')] =
      ['showLandmarksList', 'Show landmarks list']; //'L' > ';'

  // Mode commands
  keyMap[(mod1 + '+T>E')] = ['toggleTable', 'Toggle table mode']; //'T' > 'E'

  keyMap[(mod1 + '+T>#38')] =
      ['previousRow', 'Previous table row']; // 'T' > Up
  keyMap[(mod1 + '+T>#40')] = ['nextRow', 'Next table row']; // 'T' > Down
  keyMap[(mod1 + '+T>#37')] =
      ['previousCol', 'Previous table column']; // 'T' > Left
  keyMap[(mod1 + '+T>#39')] =
      ['nextCol', 'Next table column']; // 'T' > Right

  keyMap[(mod1 + '+T>H')] =
      ['announceHeaders', 'Announce the headers of the current cell']; // T > H
  keyMap[(mod1 + '+T>L')] =
      ['speakTableLocation', 'Announce the current table location']; // T > L

  keyMap[(mod1 + '+T>R')] =
      ['guessRowHeader', 'Make a guess at the row header of the current cell'];
  // T > R
  keyMap[(mod1 + '+T>C')] = ['guessColHeader',
    'Make a guess at the column header of the current cell']; // T > L

  keyMap[(mod1 + '+T>#219')] =
      ['skipToBeginning', 'Go to beginning of table']; // 'T' > '['
  keyMap[(mod1 + '+T>#221')] =
      ['skipToEnd', 'Go to end of table']; // 'T' > ']'

  keyMap[(mod1 + '+T>#186')] =
      ['skipToRowBeginning', 'Go to beginning of the current row']; // 'T' > ';'
  keyMap[(mod1 + '+T>#222')] =
      ['skipToRowEnd', 'Go to end of the current row']; // 'T' > '''

  keyMap[(mod1 + '+T>#188')] =
      ['skipToColBeginning', 'Go to beginning of the current column'];
  keyMap[(mod1 + '+T>#190')] =
      ['skipToColEnd', 'Go to end of the current column']; // 'T' > '.'

  // Jump commands
  keyMap[(mod1 + '+N>1')] = ['nextHeading1', 'Next level 1 heading'];
  keyMap[(mod1 + '+P>1')] = ['previousHeading1', 'Previous level 1 heading'];
  keyMap[(mod1 + '+N>2')] = ['nextHeading2', 'Next level 2 heading'];
  keyMap[(mod1 + '+P>2')] = ['previousHeading2', 'Previous level 2 heading'];
  keyMap[(mod1 + '+N>3')] = ['nextHeading3', 'Next level 3 heading'];
  keyMap[(mod1 + '+P>3')] = ['previousHeading3', 'Previous level 3 heading'];
  keyMap[(mod1 + '+N>4')] = ['nextHeading4', 'Next level 4 heading'];
  keyMap[(mod1 + '+P>4')] = ['previousHeading4', 'Previous level 4 heading'];
  keyMap[(mod1 + '+N>5')] = ['nextHeading5', 'Next level 5 heading'];
  keyMap[(mod1 + '+P>5')] = ['previousHeading5', 'Previous level 5 heading'];
  keyMap[(mod1 + '+N>6')] = ['nextHeading6', 'Next level 6 heading'];
  keyMap[(mod1 + '+P>6')] = ['previousHeading6', 'Previous level 6 heading'];
  keyMap[(mod1 + '+N>A')] = ['nextAnchor', 'Next anchor'];
  keyMap[(mod1 + '+P>A')] = ['previousAnchor', 'Previous anchor'];
  keyMap[(mod1 + '+N>C')] = ['nextComboBox', 'Next combo box'];
  keyMap[(mod1 + '+P>C')] = ['previousComboBox', 'Previous combo box'];
  keyMap[(mod1 + '+N>E')] = ['nextEditText', 'Next editable text area'];
  keyMap[(mod1 + '+P>E')] = ['previousEditText', 'Previous editable text area'];
  keyMap[(mod1 + '+N>F')] = ['nextFormField', 'Next form field'];
  keyMap[(mod1 + '+P>F')] = ['previousFormField', 'Previous form field'];
  keyMap[(mod1 + '+N>G')] = ['nextGraphic', 'Next graphic'];
  keyMap[(mod1 + '+P>G')] = ['previousGraphic', 'Previous graphic'];
  keyMap[(mod1 + '+N>H')] = ['nextHeading', 'Next heading'];
  keyMap[(mod1 + '+P>H')] = ['previousHeading', 'Previous heading'];
  keyMap[(mod1 + '+N>I')] = ['nextListItem', 'Next list item'];
  keyMap[(mod1 + '+P>I')] = ['previousListItem', 'Previous list item'];
  keyMap[(mod1 + '+N>J')] = ['nextJump', 'Next jump'];
  keyMap[(mod1 + '+P>J')] = ['previousJump', 'Previous jump'];
  keyMap[(mod1 + '+N>L')] = ['nextLink', 'Next link'];
  keyMap[(mod1 + '+P>L')] = ['previousLink', 'Previous link'];
  keyMap[(mod1 + '+N>O')] = ['nextList', 'Next list'];
  keyMap[(mod1 + '+P>O')] = ['previousList', 'Previous list'];
  keyMap[(mod1 + '+N>Q')] = ['nextBlockquote', 'Next block quote'];
  keyMap[(mod1 + '+P>Q')] = ['previousBlockquote', 'Previous block quote'];
  keyMap[(mod1 + '+N>R')] = ['nextRadio', 'Next radio button'];
  keyMap[(mod1 + '+P>R')] = ['previousRadio', 'Previous radio button'];
  keyMap[(mod1 + '+N>S')] = ['nextSlider', 'Next slider'];
  keyMap[(mod1 + '+P>S')] = ['previousSlider', 'Previous slider'];
  keyMap[(mod1 + '+N>T')] = ['nextTable', 'Next table'];
  keyMap[(mod1 + '+P>T')] = ['previousTable', 'Previous table'];
  keyMap[(mod1 + '+N>B')] = ['nextButton', 'Next button'];
  keyMap[(mod1 + '+P>B')] = ['previousButton', 'Previous button'];
  keyMap[(mod1 + '+N>X')] = ['nextCheckbox', 'Next checkbox'];
  keyMap[(mod1 + '+P>X')] = ['previousCheckbox', 'Previous checkbox'];
  keyMap[(mod1 + '+N>#186')] = ['nextLandmark', 'Next landmark'];  // ';'
  keyMap[(mod1 + '+P>#186')] =
      ['previousLandmark', 'Previous landmark'];  // ';'
  keyMap[(mod1 + '+B>B')] = ['benchmark', 'Debug benchmark'];

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
  return prefs;
};


/**
 * Get the key map, from key binding to an array of [command, description].
 * @return {Object.<Array.<String>>} The key map.
 */
cvox.ChromeVoxPrefs.prototype.getKeyMap = function() {
  return this.keyMap;
};


/**
 * Reset to the default key bindings.
 */
cvox.ChromeVoxPrefs.prototype.resetKeys = function() {
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
 * @param {String} key The pref key.
 * @param {Object} value The new value of the pref.
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
 * @param {String} name The name of the action.
 * @param {String} newKey The new key to assign it to.
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
