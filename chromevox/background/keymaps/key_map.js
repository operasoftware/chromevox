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
 * @fileoverview This class provides a stable interface for initializing,
 * querying, and modifying a ChromeVox key map.
 *
 * An instance contains an object-based bi-directional mapping from key binding
 * to a function name of a user command (herein simply called a command).
 * A caller is responsible for providing a JSON keymap (a simple Object key
 * value structure), which has (key, command) key value pairs.
 *
 * Due to execution of user commands within the content script, the function
 * name of the command is not explicitly checked within the background page via
 * Closure. Any errors would only be caught at runtime.
 *
 * To retrieve static data about user commands, see both cvox.CommandStore and
 * cvox.UserCommands.
 * @author dtseng@google.com (David Tseng)
 */

goog.provide('cvox.KeyMap');


// TODO(dtseng): Only needed for sticky mode.
goog.require('cvox.KeyUtil');

/**
 * @param {Object.<string, string>} map Valid map from key binding to command.
 * @constructor
 */
cvox.KeyMap = function(map) {
  /**
   * Maps a key to a command.
   * @type {Object.<string, string>}
   * @private
   */
  this.keyToCommand_ = map;

  // TODO(dtseng): Sticky key is platform dependent, so making this ugly
  // exception.
  var stickyKey =
      cvox.KeyUtil.getReadableNameForKeyCode(cvox.KeyUtil.getStickyKeyCode());
  this.keyToCommand_[(stickyKey + '>' + stickyKey + '+')] = 'toggleStickyMode';

  /**
   * Maps a command to a key.
   * @type {Object.<string, string>}
   * @private
   */
  this.commandToKey_ = {};
  for (var key in this.keyToCommand_) {
    this.commandToKey_[this.keyToCommand_[key]] = key;
  }
};


/**
 * Path to dir containing ChromeVox keymap json definitions.
 * @type {string}
 * @const
 */
cvox.KeyMap.KEYMAP_PATH = 'chromevox/background/keymaps/';


/**
 * An array of available key maps sorted by priority.
 * (The first map is the default, the last is the least important).
 * TODO(dtseng): Not really sure this belongs here, but it doesn't seem to be
 * user configurable, so it doesn't make sense to json-stringify it.
 * Should have class to siwtch among and manage multiple key maps.
 * TODO(dtseng): Document the JSON format (it's just a map).
 * @type {Array.<Object.<string, string>>}
 * @const
 */
cvox.KeyMap.AVAILABLE_MAP_INFO = [
  {
    'id': 'keymap_classic',
    'file': 'classic_keymap.json'
  },
  {
    'id': 'keymap_alt1',
    'file': 'alt_keymap_1.json'
  }
];


/**
 * The index of the default key map info in cvox.KeyMap.AVAIABLE_KEYMAP_INFO.
 * @type {number}
 * @const
 */
cvox.KeyMap.DEFAULT_KEYMAP = 0;


/**
 * Merges an input map with this one. The merge preserves this instance's
 * mappings. It only adds new bindings if there isn't one already.
 * If either the incoming binding's command or key exist in this, it will be
 * ignored.
 * @param {!cvox.KeyMap} inputMap The map to merge with this.
 * @return {boolean} True if there were no merge conflicts.
 */
cvox.KeyMap.prototype.merge = function(inputMap) {
  var keys = inputMap.keys();
  var cleanMerge = true;
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    var command = inputMap.commandForKey(key);
    if (command == 'toggleStickyMode') {
      // TODO(dtseng): More uglyness because of sticky key.
      continue;
    } else if (key && command &&
               !this.hasKey(key) && !this.hasCommand(command)) {
      this.bind_(command, key);
    } else {
      cleanMerge = false;
    }
  }
  return cleanMerge;
};


/**
 * Returns all of the keys in the table as an array.
 * @return {Array.<string>} The collection of keys.
 */
cvox.KeyMap.prototype.keys = function() {
  var ret = [];
  for (var key in this.keyToCommand_) {
    ret.push(key);
  }
  return ret;
};


/**
 * This method is called when cvox.KeyMap instances are stringified via
 * JSON.stringify.
 * @return {string} The JSON representation of this instance.
 */
cvox.KeyMap.prototype.toJSON = function() {
  return JSON.stringify(this.keyToCommand_);
};


/**
 * Writes to local storage.
 */
cvox.KeyMap.prototype.toLocalStorage = function() {
  localStorage['keyBindings'] = this.toJSON();
};


/**
 * Checks if this key map has a given binding.
 * @param {string} command The command.
 * @param {string} key The key.
 * @return {boolean} Whether the binding exists.
 */
cvox.KeyMap.prototype.hasBinding = function(command, key) {
  return this.commandToKey_[command] == key &&
      this.keyToCommand_[key] == command;
};


/**
 * Checks if this key map has a given command.
 * @param {string} command The command to check.
 * @return {boolean} Whether 'command' has a binding.
 */
cvox.KeyMap.prototype.hasCommand = function(command) {
  return this.commandToKey_[command] != undefined;
};


/**
 * Checks if this key map has a given key.
 * @param {string} key The key to check.
 * @return {boolean} Whether 'key' has a binding.
 */
cvox.KeyMap.prototype.hasKey = function(key) {
  return this.keyToCommand_[key] != undefined;
};


/**
 * Gets a command given a key.
 * @param {string} key The key to query.
 * @return {?string} The command, if any.
 */
cvox.KeyMap.prototype.commandForKey = function(key) {
  return this.keyToCommand_[key];
};


/**
 * Gets a key given a command.
 * @param {string} command The command to query.
 * @return {?string} The key, if any.
 */
cvox.KeyMap.prototype.keyForCommand = function(command) {
  return this.commandToKey_[command];
};


/**
 * Changes an existing key binding to a new key. If the key is already bound to
 * a command, the rebind will fail.
 * @param {string} command The command to set.
 * @param {string} newKey The new key to assign it to.
 * @return {boolean} Whether the rebinding succeeds.
 */
cvox.KeyMap.prototype.rebind = function(command, newKey) {
  if (this.commandToKey_[command]) {
    this.bind_(command, newKey);
    return true;
  }
  return false;
};


/**
 * Changes a key binding. Any existing bindings to the given key will be
 * deleted. Use this.rebind to have non-overwrite behavior.
 * @param {string} command The command to set.
 * @param {string} newKey The new key to assign it to.
 * @private
 */
cvox.KeyMap.prototype.bind_ = function(command, newKey) {
  // TODO(dtseng): Need unit test to ensure command is valid for every *.json
  // keymap.
  var oldKey = this.commandToKey_[command];
  delete this.keyToCommand_[oldKey];
  this.keyToCommand_[newKey] = command;
  this.commandToKey_[command] = newKey;
};


// TODO(dtseng): Move to a manager class.
/**
 * Convenience method for getting a default key map.
 * @return {!cvox.KeyMap} The default key map.
 */
cvox.KeyMap.fromDefaults = function() {
  return /** @type {!cvox.KeyMap} */ (
    cvox.KeyMap.fromPath(cvox.KeyMap.KEYMAP_PATH +
                         cvox.KeyMap.AVAILABLE_MAP_INFO[0].file));
};


/**
 * Convenience method for creating a key map based on a JSON (key, value) Object
 * where the key is a literal keyboard string and value is a command string.
 * @param {string} json The JSON.
 * @return {cvox.KeyMap} The resulting object; null if unable to parse.
 */
cvox.KeyMap.fromJSON = function(json) {
  try {
    var map = /** @type {Object.<string, string>} */ JSON.parse(json);
  } catch (e) {
    return null;
  }

  // Validate the type of the map is Object.<string, string>.
  for (var key in map) {
    if (typeof(key) != 'string' || typeof(map[key]) != 'string') {
      return null;
    }
  }
  return new cvox.KeyMap(map);
};


/**
 * Convenience method for creating a map from local storage.
 * @return {cvox.KeyMap} A map that reads from local storage.
 */
cvox.KeyMap.fromLocalStorage = function() {
  if (localStorage['keyBindings']) {
    return cvox.KeyMap.fromJSON(localStorage['keyBindings']);
  }
  return null;
};


/**
 * Convenience method for creating a cvox.KeyMap based on a path.
 * Warning: you should only call this within a background page context.
 * @param {string} path A valid path of the form
 * chromevox/background/keymaps/*.json.
 * @return {cvox.KeyMap} A valid KeyMap object; null on error.
 */
cvox.KeyMap.fromPath = function(path) {
  return cvox.KeyMap.fromJSON(cvox.KeyMap.readJSON_(path));
};


/**
 * Convenience method for getting a currently selected key map.
 * @return {!cvox.KeyMap} The currently selected key map.
 */
cvox.KeyMap.fromCurrentKeyMap = function() {
  if (localStorage['currentKeyMap'] < cvox.KeyMap.AVAILABLE_MAP_INFO.length) {
    return /** @type {!cvox.KeyMap} */ (cvox.KeyMap.fromPath(
        cvox.KeyMap.KEYMAP_PATH + cvox.KeyMap.AVAILABLE_MAP_INFO[
            localStorage['currentKeyMap']].file));
  } else {
    return cvox.KeyMap.fromDefaults();
  }
};


/**
 * Takes a path to a JSON file and returns a JSON Object.
 * @param {string} path Contains the path to a JSON file.
 * @return {string} JSON.
 * @private
 * @suppress {missingProperties}
 */
cvox.KeyMap.readJSON_ = function(path) {
  var url = chrome.extension.getURL(path);
  if (!url) {
    throw 'Invalid path: ' + path;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send();
  return xhr.responseText;
};


/**
 * Resets the default modifier keys.
 * TODO(dtseng): Move elsewhere when we figure out our localStorage story.
 */
cvox.KeyMap.prototype.resetModifier = function() {
  if (cvox.ChromeVox.isChromeOS) {
    localStorage['cvoxKey'] = 'Shift+Search';
  } else if (cvox.ChromeVox.isMac) {
    localStorage['cvoxKey'] = 'Ctrl+Cmd';
  } else {
    localStorage['cvoxKey'] = 'Ctrl+Alt';
  }
};
