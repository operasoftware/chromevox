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
 * @fileoverview Puts text on a braille display.
 *
 * @author plundblad@google.com (Peter Lundblad)
 */

goog.provide('cvox.BrailleDisplayManager');

goog.require('cvox.NavBraille');

/**
 * @constructor
 */
cvox.BrailleDisplayManager = function() {
  /**
   * @type {cvox.braille.LibLouisNativeClient.Translator}
   * @private
   */
  this.translator_ = null;
  /**
   * @type {!cvox.NavBraille}
   * @private
   */
  this.content_ = new cvox.NavBraille({});
  /**
   * @type {!ArrayBuffer}
   * @private
   */
  this.translatedContent_ = new ArrayBuffer(0);
  /**
   * @type {number}
   * @private
   */
  this.panPosition_ = 0;
  /**
   * @type {function(!cvox.BrailleKeyEvent)}
   * @private
   */
  this.commandListener_ = function() {};
  /**
   * @type {!{available: boolean, textCellCount: (number|undefined)}}
   * @private
   */
  this.displayState_ = {available: false, textCellCount: undefined};
  /**
   * @type {{brailleToText: !Array.<number>, textToBraille: !Array.<number>}}
   * @private
   */
  this.translatedExtras_ =
      {brailleToText: [], textToBraille: []};
  if (!goog.isDef(chrome.brailleDisplayPrivate)) {
    return;
  }
  var onDisplayState = goog.bind(this.onDisplayState_, this);
  chrome.brailleDisplayPrivate.getDisplayState(onDisplayState);
  chrome.brailleDisplayPrivate.onDisplayStateChanged.addListener(
      onDisplayState);
  chrome.brailleDisplayPrivate.onKeyEvent.addListener(
      goog.bind(this.onKeyEvent_, this));
};


/**
 * Dots representing a cursor.
 * @const
 * @private
 */
cvox.BrailleDisplayManager.CURSOR_DOTS_ = 1 << 6 | 1 << 7;


/**
 * @param {!cvox.NavBraille} content to send to the braille display.
 */
cvox.BrailleDisplayManager.prototype.setContent = function(content) {
  this.content_ = content;
  this.translateContent_();
  var textCells = this.displayState_.textCellCount;
  var startIndex = this.content_.startIndex;
  if (!this.displayState_.available || startIndex < 0 ||
      startIndex >= this.translatedContent_.byteLength) {
    this.panPosition_ = 0;
  } else {
    this.panPosition_ = Math.floor(startIndex / textCells) * textCells;
  }
  this.refresh_();
};


/**
 * Sets the command listener.
 * @param {function(!cvox.BrailleKeyEvent)} func The listener.
 */
cvox.BrailleDisplayManager.prototype.setCommandListener = function(func) {
  this.commandListener_ = func;
};


/**
 * @param {cvox.braille.LibLouisNativeClient.Translator} translator
 */
cvox.BrailleDisplayManager.prototype.setTranslator = function(translator) {
  this.translator_ = translator;
  this.translateContent_();
  this.refresh_();
};


/**
 * @param {!{available: boolean, textCellCount: (number|undefined)}} newState
 * @private
 */
cvox.BrailleDisplayManager.prototype.onDisplayState_ = function(newState) {
  var oldState = this.displayState_;
  this.displayState_ = newState;
  this.panPosition_ = 0;
  if (!oldState.available && newState.available) {
    this.setContent(cvox.NavBraille.fromText(
        cvox.ChromeVox.msgs.getMsg('intro_brl')));
  } else {
    this.refresh_();
  }
};


/** @private */
cvox.BrailleDisplayManager.prototype.refresh_ = function() {
  if (!this.displayState_.available) {
    return;
  }
  var buf = this.translatedContent_.slice(this.panPosition_,
      this.panPosition_ + this.displayState_.textCellCount);
  chrome.brailleDisplayPrivate.writeDots(buf);
};


/**
 * @private
 */
cvox.BrailleDisplayManager.prototype.translateContent_ = function() {
  if (this.content_.isEmpty() || !this.translator_) {
    this.translatedContent_ = new ArrayBuffer(0);
    this.refresh_();
    return;
  }
  this.translator_.translate(this.content_.text.toString(), {},
      goog.bind(function(cells, extras) {
        if (cells != null) {
          this.translatedContent_ = cells;
        } else {
          this.translatedContent_ = new ArrayBuffer(0);
        }
        this.translatedExtras_ =
            extras || {brailleToText: [], textToBraille: []};
        if (extras && this.content_.startIndex >= 0) {
          var translatedStartIndex =
              extras.textToBraille[this.content_.startIndex];
          var translatedEndIndex = extras.textToBraille[this.content_.endIndex];
          if (translatedStartIndex == translatedEndIndex) {
            this.writeCursor_(translatedStartIndex, translatedStartIndex + 1);
          } else {
            this.writeCursor_(translatedStartIndex, translatedEndIndex);
          }
        }
        this.refresh_();
      }, this));
};


/**
 * @param {cvox.BrailleKeyEvent} event
 * @private
 */
cvox.BrailleDisplayManager.prototype.onKeyEvent_ = function(event) {
  switch (event.command) {
    case cvox.BrailleKeyCommand.ROUTING:
      var backtranslatedPosition = this.translatedExtras_
          .brailleToText[event.displayPosition + this.panPosition_];
      if (!goog.isDef(backtranslatedPosition)) {
        backtranslatedPosition = event.displayPosition + this.panPosition_;
      }
      event.displayPosition = backtranslatedPosition;
    case cvox.BrailleKeyCommand.LINE_UP:
    case cvox.BrailleKeyCommand.LINE_DOWN:
    case cvox.BrailleKeyCommand.TOP:
    case cvox.BrailleKeyCommand.BOTTOM:
      this.commandListener_(event);
      break;
    case cvox.BrailleKeyCommand.PAN_LEFT:
      this.panLeft_();
      break;
    case cvox.BrailleKeyCommand.PAN_RIGHT:
      this.panRight_();
      break;
  }
};


/**
 * Shift the display by one full display size and refresh the content.
 * Sends the appropriate command if the display is already at the leftmost
 * position.
 * @private
 */
cvox.BrailleDisplayManager.prototype.panLeft_ = function() {
  if (this.panPosition_ <= 0) {
    this.commandListener_({
      command: cvox.BrailleKeyCommand.PAN_LEFT
    });
    return;
  }
  this.panPosition_ = Math.max(
      0, this.panPosition_ - this.displayState_.textCellCount);
  this.refresh_();
};


/**
 * Shifts the display position to the right by one full display size and
 * refreshes the content.  Sends the appropriate command if the display is
 * already at its rightmost position.
 * @private
 */
cvox.BrailleDisplayManager.prototype.panRight_ = function() {
  var newPosition = this.panPosition_ + this.displayState_.textCellCount;
  if (newPosition >= this.translatedContent_.byteLength) {
    this.commandListener_({
      command: cvox.BrailleKeyCommand.PAN_RIGHT
    });
    return;
  }
  this.panPosition_ = newPosition;
  this.refresh_();
};


/**
 * Writes a cursor in the specified range into translated content.
 * @param {number} startIndex The start index to place the cursor.
 * @param {number} endIndex The end index to place the cursor (exclusive).
 * @private
 */
cvox.BrailleDisplayManager.prototype.writeCursor_ = function(
    startIndex, endIndex) {
  if (startIndex < 0 || startIndex >= this.translatedContent_.byteLength ||
      endIndex < 0 || endIndex > this.translatedContent_.byteLength) {
    return;
  }
  var dataView = new DataView(this.translatedContent_);
  while (startIndex < endIndex) {
    var value = dataView.getUint8(startIndex);
    value |= cvox.BrailleDisplayManager.CURSOR_DOTS_;
    dataView.setUint8(startIndex, value);
    startIndex++;
  }
};
