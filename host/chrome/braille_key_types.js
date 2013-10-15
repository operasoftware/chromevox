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
 * @fileoverview Braille command definitions.
 * These types are adapted from Chrome's private braille API.
 * They can be found in the Chrome source repo at:
 * src/chrome/common/extensions/api/braille_display_private.idl
 * We define them here since they don't actually exist as bindings under
 * chrome.brailleDisplayPrivate.*.
 * @author plundblad@google.com (Peter Lundblad)
 */

goog.provide('cvox.BrailleKeyCommand');
goog.provide('cvox.BrailleKeyEvent');

goog.require('cvox.ChromeVox');


/**
 * The set of commands sent from a braille display.
 * @enum {string}
 */
cvox.BrailleKeyCommand = {
  PAN_LEFT: 'pan_left',
  PAN_RIGHT: 'pan_right',
  LINE_UP: 'line_up',
  LINE_DOWN: 'line_down',
  TOP: 'top',
  BOTTOM: 'bottom',
  ROUTING: 'routing',
  SECONDARY_ROUTING: 'secondary_routing',
  DOTS: 'dots',
  STANDARD_KEY: 'standard_key'
};


/**
 * Represents a key event from a braille display.
 *
 * @typedef {{command: cvox.BrailleKeyCommand,
 *            displayPosition: (undefined|number),
 *            brailleDots: (undefined|number)
 *          }}
 *  command The name of the command.
 *  displayPosition The 0-based position relative to the start of the currently
 *                  displayed text.  Used for commands that involve routing
 *                  keys or similar.  The position is given in characters,
 *                  not braille cells.
 *  dots Dots that were pressed for braille input commands.  Bit mask where
 *       bit 0 represents dot 1 etc.
 */
cvox.BrailleKeyEvent = {};
