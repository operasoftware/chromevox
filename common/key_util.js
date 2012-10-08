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
goog.require('cvox.KeySequence');


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
 * The previous KeySequence when sequencing is ON.
 * @type {cvox.KeySequence}
 */
cvox.KeyUtil.prevKeySequence = null;


/**
 * Maximum number of key codes the sequence buffer may hold. This is the max
 * length of a sequential keyboard shortcut, i.e. the number of key that can be
 * pressed one after the other while modifier keys (Cros+Shift) are held down.
 * @const
 * @type {number}
 */
cvox.KeyUtil.maxSeqLength = 2;


/**
 * Convert a key event into a Key Sequence representation.
 *
 * @param {Event} keyEvent The keyEvent to convert.
 * @return {cvox.KeySequence} A key sequence representation of the key event.
 */
cvox.KeyUtil.keyEventToKeySequence = function(keyEvent) {
  var util = cvox.KeyUtil;
  if (util.prevKeySequence &&
      (util.maxSeqLength == util.prevKeySequence.length())) {
    // Reset the sequence buffer if max sequence length is reached.
    util.sequencing = false;
    util.prevKeySequence = null;
  }
  // Either we are in the middle of a key sequence (N > H), or the key prefix
  // was pressed before (Ctrl+Z), or sticky mode is enabled
  var keyIsPrefixed = util.sequencing || keyEvent['keyPrefix'] ||
      keyEvent['stickyMode'];

  // Create key sequence.
  var keySequence = new cvox.KeySequence(keyEvent);

  // Check if the Cvox key should be considered as pressed because the
  // modifier key combination is active.
  var keyWasCvox = keySequence.cvoxModifier;

  // TODO (rshearer): Make the sticky mode double tap key configurable.
  // Sticky mode is when a sequence contains two key events (where the sticky
  // key is pressed) within a short duration.
  var currTime = new Date().getTime();
  var stickyKeyCode = cvox.KeyUtil.getStickyKeyCode();
  if (keyEvent.keyCode == stickyKeyCode) {
    // Only the modifier key was pressed. This is a sign that the user may
    // be toggling the sticky mode.
    var prevTime = util.modeKeyPressTime;
    // TODO (clchen): Make double tap speed configurable
    // through ChromeVox setting?
    if (prevTime > 0 && currTime - prevTime < 300) {  // Double tap
      if (util.prevKeySequence.addKeyEvent(keyEvent)) {
        keySequence = util.prevKeySequence;
        util.prevKeySequence = null;
        return keySequence;
      } else {
        throw 'Think sticky mode is enabled (by double-tapping), yet ' +
            'util.prevKeySequence already has two key codes ' +
                util.prevKeySequence;
      }
    }
    // The user double tapped the sticky key but didn't do it within the
    // required time. It's possible they will try again, so keep track of the
    // time the sticky key was pressed and keep track of the corresponding
    // key sequence.
    util.modeKeyPressTime = currTime;
    util.prevKeySequence = keySequence;
  } else {
    util.modeKeyPressTime = 0;
  }
  // TODO (rshearer): Clean up this logic and give all key sequences a timer
  // just like sticky mode.
  if (keyIsPrefixed || keyWasCvox) {
    if (!util.sequencing && util.isSequenceSwitchKeyCode(keyEvent.keyCode)) {
      // If this is the beginning of a sequence
      util.sequencing = true;
      util.prevKeySequence = keySequence;
    } else if (util.sequencing) {
      if (util.prevKeySequence.addKeyEvent(keyEvent)) {
        keySequence = util.prevKeySequence;
        util.prevKeySequence = null;
        util.sequencing = false;
        return keySequence;
      } else {
        throw 'Think sequencing is enabled, yet util.prevKeySequence already' +
            'has two key codes' + util.prevKeySequence;
      }
    }
  } else {
    util.sequencing = false;
  }
  return keySequence;
};

/**
 * Returns the string representation of the specified key code.
 *
 * @param {number} keyCode key code.
 * @return {string} A string representation of the key event.
 */
cvox.KeyUtil.keyCodeToString = function(keyCode) {
  if (keyCode == 17) {
    return 'Ctrl';
  }
  if (keyCode == 18) {
    return 'Alt';
  }
  if (keyCode == 16) {
    return 'Shift';
  }
  if ((keyCode == 91) || (keyCode == 93)) {
    if (cvox.ChromeVox.isChromeOS) {
      return 'Search';
    } else if (cvox.ChromeVox.isMac) {
      return 'Cmd';
    } else {
      return 'Win';
    }
  }
  // TODO(rshearer): This is a hack to work around the special casing of the
  // sticky mode string that used to happen in keyEventToString. We won't need
  // it once we move away from strings completely.
  if (keyCode == 45) {
    return 'Insert';
  }
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
  // TODO (rshearer): This should not be hard-coded here.
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


/**
 * Creates a string representation of a KeySequence.
 * A KeySequence  with a keyCode of 76 ('L') and the control and alt keys down
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
 * @param {cvox.KeySequence} keySequence The KeySequence object.
 * @return {string} Readable string representation of the KeySequence object.
 */
cvox.KeyUtil.keySequenceToString = function(keySequence) {
  // TODO(rshearer): Move this method and the getReadableNameForKeyCode and the
  // method to KeySequence after we refactor isModifierActive (when the modifie
  // key becomes customizable and isn't stored as a string). We can't do it
  // earlier because isModifierActive uses KeyUtil.getReadableNameForKeyCode,
  // and I don't want KeySequence to depend on KeyUtil.
  var str = '';

  var numKeys = keySequence.length();

  for (var index = 0 ; index < numKeys ; index++) {
    if (str != '') {
      str += '>';
    }
    // This iterates through the sequence. Either we're on the first key
    // pressed or the second
    var tempStr = '';
    for (var keyPressed in keySequence.keys) {
      // This iterates through the actual key, taking into account any
      // modifiers.
      if (!keySequence.keys[keyPressed][index]) {
        continue;
      }
        if (keyPressed == 'ctrlKey') {
          // TODO(rshearer): This is a hack to work around the special casing
          // of the Ctrl key that used to happen in keyEventToString. We won't
          // need it once we move away from strings completely.
          tempStr += 'Ctrl+';
        }
        if (keyPressed == 'searchKeyHeld') {
          var searchKey = cvox.KeyUtil.getReadableNameForKeyCode(91) + '+';
          tempStr += searchKey;
        }
        if (keyPressed == 'altKey') {
          tempStr += 'Alt+';
        }
        if (keyPressed == 'altGraphKey') {
          tempStr += 'AltGraph+';
        }
        if (keyPressed == 'shiftKey') {
          tempStr += 'Shift+';
        }
        if (keyPressed == 'metaKey') {
          var metaKey = cvox.KeyUtil.getReadableNameForKeyCode(91) + '+';
          tempStr += metaKey;
        }
      var keyCode = keySequence.keys[keyPressed][index];
      // We make sure the keyCode isn't for a modifier key. If it is, then
      // we've already added that into the string above.
      if (keyPressed == 'keyCode' && !keySequence.isModifierKey(keyCode)) {
        tempStr += cvox.KeyUtil.keyCodeToString(keyCode);
      }
    }
    str += tempStr;

    // Strip trailing +.
    if (str[str.length - 1] == '+') {
      str = str.slice(0, -1);
    }
  }

  // TODO(rshearer): This is a hack to work around the special casing of the
  // sticky mode key that used to happen in keyEventToString. We won't need it
  // once we move away from strings completely.
  var stickyKeyCode = cvox.KeyUtil.getStickyKeyCode();
  var stickyKeyName = cvox.KeyUtil.getReadableNameForKeyCode(stickyKeyCode);
  var stickyString = stickyKeyName + '>' + stickyKeyName;
  if (str == stickyString) {
    str += '+';
  } else {
    if (keySequence.cvoxModifier || keySequence.stickyMode ||
        keySequence.prefixKey) {
      if (str != '') {
        str = 'Cvox+' + str;
      } else {
        str = 'Cvox' + str;
      }
    }
  }
  return str;
};
