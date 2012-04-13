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
 * @fileoverview A collection of JavaScript utilities used to simplify working
 * with keyboard events.
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */


goog.provide('cvox.KeyUtil');

goog.require('cvox.ChromeVox');


/**
 * Create the namespace
 * @constructor
 */
cvox.KeyUtil = function() {
};

/**
 * The time in ms at which the ChromeVox Sticky Mode key was pressed.
 * @type {number}
 */
cvox.KeyUtil.modeKeyPressTime = 0;

/**
 * Indicates if sequencing is currently active for building a keyboard shortcut.
 * @type {boolean}
 */
cvox.KeyUtil.sequencing = false;

/**
 * The sequence buffer that holds the keys pressed when sequencing in ON.
 * @type {Array}
 */
cvox.KeyUtil.sequenceBuffer = [];

/**
 * Maximum number of key codes the sequence buffer may hold. This is the max
 * length of a sequential keyboard shortcut, i.e. the number of key that can be
 * pressed one after the other while modifier keys (Cros+Shift) are held down.
 * @const
 * @type {number}
 */
cvox.KeyUtil.maxSeqLength = 2;

/**
 * Convert a key event into an unambiguous string representation that's
 * unique but also human-readable enough for debugging.
 *
 * A key event with a keyCode of 76 ('L') and the control and alt keys down
 * would return the string 'Ctrl+Alt+L', for example. A key code that doesn't
 * correspond to a letter or number will return a string with a pound and
 * then its keyCode, like 'Ctrl+Alt+#39' for Right Arrow.
 *
 * The modifiers always come in this order:
 *
 *   Ctrl
 *   Alt
 *   Shift
 *   Meta
 *
 * @param {Event} keyEvent The keyEvent to convert.
 * @return {string} A string representation of the key event.
 */
cvox.KeyUtil.keyEventToString = function(keyEvent) {
  var str = '';

  var util = cvox.KeyUtil;
  if (util.maxSeqLength == util.sequenceBuffer.length) {
    // Reset the sequence buffer if max sequence length is reached.
    util.sequencing = false;
    util.sequenceBuffer = [];
  }
  var keyIsPrefixed = util.sequencing || keyEvent['keyPrefixOn'] ||
      keyEvent['stickyMode'];

  // Check if the Cvox key should be considered as pressed because the
  // modifier key combination is active.
  var keyWasCvox = false;
  var modifierKeyCombo = cvox.ChromeVox.modKeyStr.replace(/\+/g, '');

  // For each modifier that is held down, remove it from the combo.
  // If the combo string becomes empty, then the user has activated the combo.
  // We need to check for the keyCode too since Linux will not set the
  // keyEvent.modKey property if it is the modKey by itself.
  if (keyEvent.ctrlKey || (keyEvent.keyCode == 17)) {
    modifierKeyCombo = modifierKeyCombo.replace('Ctrl', '');
    str += 'Ctrl+';
  }
  if (keyEvent.altKey || (keyEvent.keyCode == 18)) {
    modifierKeyCombo = modifierKeyCombo.replace('Alt', '');
    str += 'Alt+';
  }
  if (keyEvent.shiftKey || (keyEvent.keyCode == 16)) {
    modifierKeyCombo = modifierKeyCombo.replace('Shift', '');
    str += 'Shift+';
  }
  if (keyEvent.metaKey || (keyEvent.keyCode == 91) ||
      (keyEvent.keyCode == 93) || keyEvent['searchKeyHeld']) {
    var metaKeyName = cvox.KeyUtil.getReadableNameForKeyCode(91);
    modifierKeyCombo = modifierKeyCombo.replace(metaKeyName, '');
    str += metaKeyName + '+';
  }

  if (modifierKeyCombo.length == 0) {
    keyWasCvox = true;
    str = '';
  }

  if (keyIsPrefixed) {
    str = 'Prefix>' + str;
  } else if (modifierKeyCombo.length == 0) {
    str = 'Cvox+' + str;
  }

  // Prefix followed by any modifier alone does not make sense.
  // Return now and don't get out of sequencing mode; instead, wait for the
  // user to hit a non-modifier key.
  if (keyIsPrefixed && cvox.KeyUtil.isModifierKey(keyEvent.keyCode)) {
    util.sequencing = true;
    return str;
  }

  // TODO (clchen): Make the sticky mode double tap key configurable.
  var currTime = new Date().getTime();
  var stickyKeyCode = cvox.KeyUtil.getStickyKeyCode();
  if (keyEvent.keyCode == stickyKeyCode) {
    // Only the modifier key was pressed. This is a sign that the user may
    // be toggling the sticky mode.
    var prevTime = util.modeKeyPressTime;
    // TODO (chaitanyag,dmazzoni,clchen): Make double tap speed configurable
    // through ChromeVox setting?
    if (prevTime > 0 && currTime - prevTime < 300) {  // Double tap
      var stickyKeyName =
          cvox.KeyUtil.getReadableNameForKeyCode(stickyKeyCode);
      return stickyKeyName + '>' + stickyKeyName + '+';
    }
    util.modeKeyPressTime = currTime;
  } else {
    util.modeKeyPressTime = 0;
  }
  if ((str == 'Cvox+') || (str == 'Prefix>')) {
    if (!util.sequencing && util.isSequenceSwitchKeyCode(keyEvent.keyCode)) {
      util.sequencing = true;
      util.sequenceBuffer.push(keyEvent.keyCode);
    } else if (util.sequencing) {
      util.sequenceBuffer.push(keyEvent.keyCode);
    }
    for (var i = 0; i < util.sequenceBuffer.length; i++) {
      str += util.keyCodeToString(util.sequenceBuffer[i]) +
          (i == util.sequenceBuffer.length - 1 ? '' : '>');
    }
  } else {
    util.sequencing = false;
    util.sequenceBuffer = [];
  }

  if (!util.sequencing && !util.isModifierKey(keyEvent.keyCode)) {
    str += util.keyCodeToString(keyEvent.keyCode);
  }
  return str;
};

/**
 * Returns the string representation of the specified key code.
 *
 * @param {number} keyCode key code.
 * @return {string} A string representation of the key event.
 */
cvox.KeyUtil.keyCodeToString = function(keyCode) {
  if (keyCode >= 65 && keyCode <= 90) {
    // A - Z
    return String.fromCharCode(keyCode);
  } else if (keyCode >= 48 && keyCode <= 57) {
    // 0 - 9
    return String.fromCharCode(keyCode);
  } else {
    // Anything else
    return '#' + keyCode;
  }
};

/**
 * Checks if the specified key code represents a modifier key, i.e. Ctrl, Alt,
 * Shift, Search (on ChromeOS) or Meta.
 *
 * @param {number} keyCode key code.
 * @return {boolean} true if it is a modifier keycode, false otherwise.
 */
cvox.KeyUtil.isModifierKey = function(keyCode) {
  // Shift, Ctrl, Alt, Search/LWin
  return keyCode == 16 || keyCode == 17 || keyCode == 18 || keyCode == 91;
};

/**
 * Checks if the specified key code is a key used for switching into a sequence
 * mode. Sequence switch keys are specified in
 * cvox.KeyUtil.sequenceSwitchKeyCodes
 *
 * @param {number} keyCode key code.
 * @return {boolean} true if it is a sequence switch keycode, false otherwise.
 */
cvox.KeyUtil.isSequenceSwitchKeyCode = function(keyCode) {
  var keyStr = cvox.KeyUtil.keyCodeToString(keyCode);
  if (cvox.ChromeVox.sequenceSwitchKeyCodes[keyStr]) {
    return true;
  } else {
    return false;
  }
};


/**
 * Get readable string description of the specified keycode.
 *
 * @param {number} keyCode The key code.
 * @return {string} Returns a string description.
 */
cvox.KeyUtil.getReadableNameForKeyCode = function(keyCode) {
  if (keyCode == 0) {
    return 'Power button';
  } else if (keyCode == 17) {
    return 'Control';
  } else if (keyCode == 18) {
    return 'Alt';
  } else if (keyCode == 16) {
    return 'Shift';
  } else if (keyCode == 9) {
    return 'Tab';
  } else if ((keyCode == 91) || (keyCode == 93)) {
    if (cvox.ChromeVox.isChromeOS) {
      return 'Search';
    } else if (cvox.ChromeVox.isMac) {
      return 'Cmd';
    } else {
      return 'Win';
    }
  } else if (keyCode == 8) {
    return 'Backspace';
  } else if (keyCode == 32) {
    return 'Space';
  } else if (keyCode == 37) {
    return 'Left arrow';
  } else if (keyCode == 38) {
    return 'Up arrow';
  } else if (keyCode == 39) {
    return 'Right arrow';
  } else if (keyCode == 40) {
    return 'Down arrow';
  } else if (keyCode == 45) {
    return 'Insert';
  } else if (keyCode == 13) {
    return 'Enter';
  } else if (keyCode == 27) {
    return 'Escape';
  } else if (keyCode == 112) {
    return cvox.ChromeVox.isChromeOS ? 'Back' : 'F1';
  } else if (keyCode == 113) {
    return cvox.ChromeVox.isChromeOS ? 'Forward' : 'F2';
  } else if (keyCode == 114) {
    return cvox.ChromeVox.isChromeOS ? 'Refresh' : 'F3';
  } else if (keyCode == 115) {
    return cvox.ChromeVox.isChromeOS ? 'Toggle full screen' : 'F4';
  } else if (keyCode == 186) {
    return 'Semicolon';
  } else if (keyCode == 187) {
    return 'Equal sign';
  } else if (keyCode == 188) {
    return 'Comma';
  } else if (keyCode == 189) {
    return 'Dash';
  } else if (keyCode == 190) {
    return 'Period';
  } else if (keyCode == 191) {
    return 'Forward slash';
  } else if (keyCode == 192) {
    return 'Grave accent';
  } else if (keyCode == 219) {
    return 'Open bracket';
  } else if (keyCode == 220) {
    return 'Back slash';
  } else if (keyCode == 221) {
    return 'Close bracket';
  } else if (keyCode == 222) {
    return 'Single quote';
  } else if (keyCode == 115) {
    return 'Toggle full screen';
  } else if (keyCode >= 48 && keyCode <= 90) {
    return String.fromCharCode(keyCode);
  }
};

/**
 * Get the platform specific sticky key keycode.
 *
 * @return {number} The platform specific sticky key keycode.
 */
cvox.KeyUtil.getStickyKeyCode = function() {
  var stickyKeyCode = 45; // Insert for Linux and Windows
  if (cvox.ChromeVox.isChromeOS || cvox.ChromeVox.isMac) {
    stickyKeyCode = 91; // GUI key (Search/Cmd) for ChromeOs and Mac
  }
  return stickyKeyCode;
};


/**
 * Get readable string description for an internal string representation of a
 * key or a keyboard shortcut.
 *
 * @param {string} keyStr The internal string repsentation of a key or
 *     a keyboard shortcut.
 * @return {?string} Readable string representation of the input.
 */
cvox.KeyUtil.getReadableNameForStr = function(keyStr) {
  // TODO (clchen): Refactor this function away since it is no longer used.
  return null;
};
