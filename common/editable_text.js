// Copyright 2010 Google Inc.
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

goog.provide('cvox.ChromeVoxEditableContentEditable');
goog.provide('cvox.ChromeVoxEditableHTMLInput');
goog.provide('cvox.ChromeVoxEditableTextArea');
goog.provide('cvox.ChromeVoxEditableTextBase');

goog.require('cvox.DomUtil');

/**
 * @fileoverview Gives the user spoken feedback as they type, select text,
 * and move the cursor in editable text controls, including multiline
 * controls.
 *
 * The majority of the code is in ChromeVoxEditableTextBase, a generalized
 * class that takes the current state in the form of a text string, a
 * cursor start location and a cursor end location, and calls a speak
 * method with the resulting text to be spoken. If the control is multiline,
 * information about line breaks (including automatic ones) is also needed.
 *
 * Two subclasses, ChromeVoxEditableHTMLInput and
 * ChromeVoxEditableTextArea, take a HTML input (type=text) or HTML
 * textarea node (respectively) in the constructor, and automatically
 * handle retrieving the current state of the control, including
 * computing line break information for a textarea using an offscreen
 * shadow object. It is still the responsibility of the user of this
 * class to trap key and focus events and call this class's update
 * method.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

/**
 * A class representing an abstracted editable text control.
 * @param {string} value The string value of the editable text control.
 * @param {number} start The 0-based start cursor/selection index.
 * @param {number} end The 0-based end cursor/selection index.
 * @param {boolean} isPassword Whether the text control if a password field.
 * @param {Object} tts A TTS object implementing speak() and stop() methods.
 * @constructor
 */
cvox.ChromeVoxEditableTextBase = function(value, start, end, isPassword, tts) {
  this.value = value;
  this.start = start;
  this.end = end;
  this.isPassword = isPassword;
  this.tts = tts;
};

/**
 * Whether or not the text field is multiline.
 * @type {boolean}
 */
cvox.ChromeVoxEditableTextBase.prototype.multiline = false;

/**
 * Whether or not moving the cursor from one character to another considers
 * the cursor to be a block (true) or an i-beam (false).
 *
 * If the cursor is a block, then the value of the character to the right
 * of the cursor index is always read when the cursor moves, no matter what
 * the previous cursor location was - this is how PC screenreaders work.
 *
 * If the cursor is an i-beam, moving the cursor by one character reads the
 * character that was crossed over, which may be the character to the left or
 * right of the new cursor index depending on the direction.
 *
 * @type {boolean}
 */
cvox.ChromeVoxEditableTextBase.prototype.cursorIsBlock = false;

/**
 * The maximum number of characters that are short enough to speak in response
 * to an event. For example, if the user selects "Hello", we will speak
 * "Hello, selected", but if the user selects 1000 characters, we will speak
 * "text selected" instead.
 * @type {number}
 */
cvox.ChromeVoxEditableTextBase.prototype.maxShortPhraseLen = 60;

cvox.ChromeVoxEditableTextBase.prototype.isPassword = false;

/**
 * Describe the current state of the text control.
 */
cvox.ChromeVoxEditableTextBase.prototype.describe = function() {
  this.speak(this.getDescription());
};

/**
 * Get a speakable text string describing the current state of the
 * text control and its title and/or label.
 * @return {string} The speakable description.
 */
cvox.ChromeVoxEditableTextBase.prototype.getDescription = function() {
  var speech = '';
  if (this.multiline) {
    speech += 'multiline editable text. ';
    if (this.start == this.end) {
      // It's a cursor: read the current line.
      var line = this.getLine(this.getLineIndex(this.start));
      if (line) {
        speech += line;
      } else {
        speech += 'blank.';
      }
    }
  } else {
    if (this.node) {
      speech += cvox.DomUtil.getControlValueAndStateString(this.node, true);
    } else {
      speech += this.value;
    }
    if (speech.length <= this.maxShortPhraseLen) {
      speech += ', editable text.';
    } else {
      speech += 'editable text.';
    }
  }
  return speech;
};

/**
 * Get the line number corresponding to a particular index.
 * Default implementation that can be overridden by subclasses.
 * @param {number} index The 0-based character index.
 * @return {number} The 0-based line number corresponding to that character.
 */
cvox.ChromeVoxEditableTextBase.prototype.getLineIndex = function(index) {
  return 0;
};

/**
 * Get the start character index of a line.
 * Default implementation that can be overridden by subclasses.
 * @param {number} index The 0-based line index.
 * @return {number} The 0-based index of the first character in this line.
 */
cvox.ChromeVoxEditableTextBase.prototype.getLineStart = function(index) {
  return 0;
};

/**
 * Get the end character index of a line.
 * Default implementation that can be overridden by subclasses.
 * @param {number} index The 0-based line index.
 * @return {number} The 0-based index of the end of this line.
 */
cvox.ChromeVoxEditableTextBase.prototype.getLineEnd = function(index) {
  return this.value.length;
};

/**
 * Get the full text of the current line.
 * @param {number} index The 0-based line index.
 * @return {string} The text of the line.
 */
cvox.ChromeVoxEditableTextBase.prototype.getLine = function(index) {
  var lineStart = this.getLineStart(index);
  var lineEnd = this.getLineEnd(index);
  var line = this.value.substr(lineStart, lineEnd - lineStart);
  return line.replace(/^\s+|\s+$/g, '');
};

/**
 * @param {string} ch The character to test.
 * @return {boolean} True if a character is whitespace.
 */
cvox.ChromeVoxEditableTextBase.prototype.isWhitespaceChar = function(ch) {
  return ch == ' ' || ch == '\n' || ch == '\r' || ch == '\t';
};

/**
 * @param {string} ch The character to test.
 * @return {boolean} True if a character breaks a word, used to determine
 *     if the previous word should be spoken.
 */
cvox.ChromeVoxEditableTextBase.prototype.isWordBreakChar = function(ch) {
  return ch == ' ' || ch == '\n' || ch == '\r' || ch == '\t' ||
         ch == ',' || ch == '.' || ch == '/';
};



/**
 * Speak text, but if it's a single character, describe the character.
 * TODO(dmazzoni) make this more general, for use outside editable text.
 * @param {string} ch The character to speak.
 * @return {string} ch The character to speak.
 */
cvox.ChromeVoxEditableTextBase.prototype.describeChar = function(ch) {
  if (ch.length != 1) {
    return ch;
  }

  switch (ch) {
    case ' ': return 'space.';
    case '`': return 'backtick.';
    case '~': return 'tilde.';
    case '!': return 'bang.';
    case '@': return 'at.';
    case '#': return 'pound.';
    case '$': return 'dollar.';
    case '%': return 'percent.';
    case '^': return 'caret.';
    case '&': return 'ampersand.';
    case '*': return 'asterisk.';
    case '(': return 'open paren.';
    case ')': return 'close paren.';
    case '-': return 'hyphen.';
    case '_': return 'underscore.';
    case '=': return 'equals.';
    case '+': return 'plus.';
    case '[': return 'left bracket.';
    case ']': return 'right bracket.';
    case '{': return 'left brace.';
    case '}': return 'right brace.';
    case '|': return 'pipe.';
    case ';': return 'semicolon.';
    case ':': return 'colon.';
    case ',': return 'comma.';
    case '.': return 'period.';
    case '<': return 'less than.';
    case '>': return 'greater than.';
    case '/': return 'slash.';
    case '?': return 'question mark.';
    case '\t': return 'tab.';
    case '\r': return 'return.';
    case '\n': return 'return.';
    case '\\': return 'backslash.';
    default:
      return ch.toUpperCase() + '.';
      break;
  }
};

/**
 * Speak text, but if it's a single character, describe the character.
 * @param {string} str The string to speak.
 */
cvox.ChromeVoxEditableTextBase.prototype.speak = function(str) {
  if (str.length == 1) {
    this.tts.speak(this.describeChar(str), 0, {});
  } else if (str.length > 1) {
    this.tts.speak(str, 0, {});
  }
};

/**
 * Return the state as an opaque object so that a client can restore it
 *     to this state later without needing to know about its internal fields.
 *
 * @return {Object} The state as an opaque object.
 */
cvox.ChromeVoxEditableTextBase.prototype.saveState = function() {
  return { 'value': this.value, 'start': this.start, 'end': this.end };
};

/**
 * Restore the state that was previously saved using saveState, without
 *     speaking any feedback.
 *
 * @param {Object} state A state returned by saveState.
 */
cvox.ChromeVoxEditableTextBase.prototype.restoreState = function(state) {
  this.value = state.value;
  this.start = state.start;
  this.end = state.end;
};

/**
 * Check if the underlying text control has changed and an update is needed.
 * The default implementation always returns false, but subclasses that
 * track an INPUT or TEXTAREA element will return true if the underlying
 * element has changed.
 *
 * @return {boolean} True if the object needs to be updated.
 */
cvox.ChromeVoxEditableTextBase.prototype.needsUpdate = function() {
  return false;
};

/**
 * Update the state of the text and selection and describe any changes as
 * appropriate.
 * @param {string} newValue The new string value of the editable text control.
 * @param {number} newStart The new 0-based start cursor/selection index.
 * @param {number} newEnd The new 0-based end cursor/selection index.
 */
cvox.ChromeVoxEditableTextBase.prototype.changed = function(
    newValue, newStart, newEnd) {
  if (newValue == this.value && newStart == this.start && newEnd == this.end) {
    return;
  }

  if (newValue == this.value) {
    this.describeSelectionChanged(newStart, newEnd);
  } else {
    this.describeTextChanged(newValue, newStart, newEnd);
  }

  this.value = newValue;
  this.start = newStart;
  this.end = newEnd;
};

/**
 * Describe a change in the selection or cursor position when the text
 * stays the same.
 * @param {number} newStart The new 0-based start cursor/selection index.
 * @param {number} newEnd The new 0-based end cursor/selection index.
 */
cvox.ChromeVoxEditableTextBase.prototype.describeSelectionChanged =
    function(newStart, newEnd) {
  if (this.isPassword) {
    this.speak('*');
    return;
  }
  if (newStart == newEnd) {
    // It's currently a cursor.
    if (this.start != this.end) {
      // It was previously a selection, so just announce 'unselected'.
      this.speak('Unselected.');
    } else if (this.getLineIndex(this.start) != this.getLineIndex(newStart)) {
      // Moved to a different line; read it.
      this.speak(this.getLine(this.getLineIndex(newStart)));
    } else if (this.start == newStart + 1 || this.start == newStart - 1) {
      // Moved by one character; read it.
      if (this.cursorIsBlock) {
        if (newStart == this.value.length) {
          this.speak('end');
        } else {
          this.speak(this.value.substr(newStart, 1));
        }
      } else {
        this.speak(this.value.substr(Math.min(this.start, newStart), 1));
      }
    } else {
      // Moved by more than one character. Read all characters crossed.
      this.speak(this.value.substr(Math.min(this.start, newStart),
                                   Math.abs(this.start - newStart)));
    }
  } else {
    // It's currently a selection.
    if (this.start + 1 == newStart &&
        this.end == this.value.length &&
        newEnd == this.value.length) {
      // Autocomplete: the user typed one character of autocompleted text.
      this.speak(this.describeChar(this.value.substr(this.start, 1)) +
                 ', ' +
                 this.describeChar(this.value.substr(newStart)));
    } else if (this.start == this.end) {
      // It was previously a cursor.
      this.speak(this.describeChar(
                     this.value.substr(newStart, newEnd - newStart)) +
                 ', selected.');
    } else if (this.start == newStart && this.end < newEnd) {
      this.speak(this.describeChar(
                     this.value.substr(this.end, newEnd - this.end)) +
                 ', added to selection.');
    } else if (this.start == newStart && this.end > newEnd) {
      this.speak(this.describeChar(
                     this.value.substr(newEnd, this.end - newEnd)) +
                 ', removed from selection.');
    } else if (this.end == newEnd && this.start > newStart) {
      this.speak(this.describeChar(
                     this.value.substr(newStart, this.start - newStart)) +
                 ', added to selection.');
    } else if (this.end == newEnd && this.start < newStart) {
      this.speak(this.describeChar(
                     this.value.substr(this.start, newStart - this.start)) +
                 ', removed from selection.');
    } else {
      // The selection changed but it wasn't an obvious extension of
      // a previous selection. Just read the new selection.
      this.speak(this.describeChar(
                     this.value.substr(newStart, newEnd - newStart)) +
                 ', selected.');
    }
  }
};

/**
 * Describe a change where the text changes.
 * @param {string} newValue The new string value of the editable text control.
 * @param {number} newStart The new 0-based start cursor/selection index.
 * @param {number} newEnd The new 0-based end cursor/selection index.
 */
cvox.ChromeVoxEditableTextBase.prototype.describeTextChanged = function(
    newValue, newStart, newEnd) {
  var value = this.value;
  var len = value.length;
  var newLen = newValue.length;
  var autocompleteSuffix = '';
  var savedValue = newValue;

  // First, see if there's a selection at the end that might have been
  // added by autocomplete. If so, strip it off into a separate variable.
  if (newStart < newEnd && newEnd == newLen) {
    autocompleteSuffix = newValue.substr(newStart);
    newValue = newValue.substr(0, newStart);
    newEnd = newStart;
  }

  // Now see if the previous selection (if any) was deleted
  // and any new text was inserted at that character position.
  // This handles pasting and entering text by typing, both from
  // a cursor and from a selection.
  var prefixLen = this.start;
  var suffixLen = len - this.end;
  if (newLen >= prefixLen + suffixLen + (newEnd - newStart) &&
      newValue.substr(0, prefixLen) == value.substr(0, prefixLen) &&
      newValue.substr(newLen - suffixLen) == value.substr(this.end)) {
    this.describeTextChangedHelper(
        newValue, newStart, newEnd, prefixLen, suffixLen, autocompleteSuffix);
    return;
  }

  // Next, see if one or more characters were deleted from the previous
  // cursor position and the new cursor is in the expected place. This
  // handles backspace, forward-delete, and similar shortcuts that delete
  // a word or line.
  prefixLen = newStart;
  suffixLen = newLen - newEnd;
  if (this.start == this.end &&
      newStart == newEnd &&
      newValue.substr(0, prefixLen) == value.substr(0, prefixLen) &&
      newValue.substr(newLen - suffixLen) == value.substr(len - suffixLen)) {
    this.describeTextChangedHelper(
        newValue, newStart, newEnd, prefixLen, suffixLen, autocompleteSuffix);
    return;
  }

  // If all else fails, we assume the change was not the result of a normal
  // user editing operation, so we'll have to speak feedback based only
  // on the changes to the text, not the cursor position / selection.
  // First, restore the autocomplete text if any.
  newValue += autocompleteSuffix;

  // If the text is short, just speak the whole thing.
  if (newLen <= this.maxShortPhraseLen) {
    this.describeTextChangedHelper(newValue, newStart, newEnd, 0, 0, '');
    return;
  }

  // Otherwise, look for the common prefix and suffix, but back up so
  // that we can speak complete words, to be minimally confusing.
  prefixLen = 0;
  while (prefixLen < len &&
         prefixLen < newLen &&
         value[prefixLen] == newValue[prefixLen]) {
    prefixLen++;
  }
  while (prefixLen > 0 && !this.isWordBreakChar(value[prefixLen - 1])) {
    prefixLen--;
  }

  suffixLen = 0;
  while (suffixLen < (len - prefixLen) &&
         suffixLen < (newLen - prefixLen) &&
         value[len - suffixLen - 1] == newValue[newLen - suffixLen - 1]) {
    suffixLen++;
  }
  while (suffixLen > 0 && !this.isWordBreakChar(value[len - suffixLen])) {
    suffixLen--;
  }

  this.describeTextChangedHelper(
      newValue, newStart, newEnd, prefixLen, suffixLen, '');
};

/**
 * The function called by describeTextChanged after it's figured out
 * what text was deleted, what text was inserted, and what additional
 * autocomplete text was added.
 * @param {string} newValue The new string value of the editable text control.
 * @param {number} newStart The new 0-based start cursor/selection index.
 * @param {number} newEnd The new 0-based end cursor/selection index.
 * @param {number} prefixLen The number of characters in the common prefix
 *     of this.value and newValue.
 * @param {number} suffixLen The number of characters in the common suffix
 *     of this.value and newValue.
 * @param {string} autocompleteSuffix The autocomplete string that was added
 *     to the end, if any. It should be spoken at the end of the utterance
 *     describing the change.
 */
cvox.ChromeVoxEditableTextBase.prototype.describeTextChangedHelper = function(
    newValue, newStart, newEnd, prefixLen, suffixLen, autocompleteSuffix) {
  if (this.isPassword) {
    this.speak('*');
    return;
  }
  var len = this.value.length;
  var newLen = newValue.length;
  var deletedLen = len - prefixLen - suffixLen;
  var deleted = this.value.substr(prefixLen, deletedLen);
  var insertedLen = newLen - prefixLen - suffixLen;
  var inserted = newValue.substr(prefixLen, insertedLen);
  var utterance = '';

  if (insertedLen > 1) {
    utterance = inserted;
  } else if (insertedLen == 1) {
    if (this.isWordBreakChar(inserted) &&
        prefixLen > 0 &&
        !this.isWordBreakChar(newValue.substr(prefixLen - 1, 1))) {
      // Speak previous word.
      var index = prefixLen;
      while (index > 0 && !this.isWordBreakChar(newValue[index - 1])) {
        index--;
      }
      if (index < prefixLen) {
        utterance = newValue.substr(index, prefixLen + 1 - index);
      } else {
        utterance = this.describeChar(inserted);
      }
    } else {
      utterance = this.describeChar(inserted);
    }
  } else if (deletedLen > 1 && !autocompleteSuffix) {
    utterance = deleted + ', deleted.';
  } else if (deletedLen == 1) {
    utterance = this.describeChar(deleted);
  }

  if (autocompleteSuffix && utterance) {
    utterance += ', ' + autocompleteSuffix;
  } else if (autocompleteSuffix) {
    utterance = autocompleteSuffix;
  }

  this.speak(utterance);
};

/******************************************/

/**
 * A subclass of ChromeVoxEditableTextBase a text element that's part of
 * the webpage DOM. Contains common code shared by both EditableHTMLInput
 * and EditableTextArea, but that might not apply to a non-DOM text box.
 * @extends {cvox.ChromeVoxEditableTextBase}
 * @constructor
 */
cvox.ChromeVoxEditableElement = function() {
  this.justSpokeDescription = false;
};
goog.inherits(cvox.ChromeVoxEditableElement,
    cvox.ChromeVoxEditableTextBase);

/**
 * @type boolean
 */
cvox.ChromeVoxEditableElement.prototype.justSpokeDescription = false;

/**
 * Update the state of the text and selection and describe any changes as
 * appropriate.
 * @param {string} newValue The new string value of the editable text control.
 * @param {number} newStart The new 0-based start cursor/selection index.
 * @param {number} newEnd The new 0-based end cursor/selection index.
 */
cvox.ChromeVoxEditableElement.prototype.changed = function(
    newValue, newStart, newEnd) {
  // Ignore changes to the cursor and selection if they happen immediately
  // after the description was just spoken. This avoid double-speaking when,
  // for example, a text field is focused and then a moment later the
  // contents are selected. If the value changes, though, this change will
  // not be ignored.
  if (this.justSpokeDescription && this.value == newValue) {
    this.value = newValue;
    this.start = newStart;
    this.end = newEnd;
    this.justSpokeDescription = false;
  }

  cvox.ChromeVoxEditableTextBase.prototype.changed.apply(
      this, [newValue, newStart, newEnd]);
};

/**
 * Get a speakable text string describing the current state of the
 * text control and its title and/or label.
 * @return {string} The speakable description.
 */
cvox.ChromeVoxEditableElement.prototype.getDescription = function() {
  this.justSpokeDescription = true;

  return cvox.ChromeVoxEditableTextBase.prototype.getDescription.apply(this);
};

/******************************************/

/**
 * A subclass of ChromeVoxEditableElement for an HTMLInputElement.
 * @param {HTMLInputElement} node The HTMLInputElement node.
 * @param {Object} tts A TTS object implementing speak() and stop() methods.
 * @extends {cvox.ChromeVoxEditableElement}
 * @constructor
 */
cvox.ChromeVoxEditableHTMLInput = function(node, tts) {
  this.node = node;
  this.value = node.value;
  this.start = node.selectionStart;
  this.end = node.selectionEnd;
  this.tts = tts;

  if (this.node.type == 'password') {
    this.value = this.value.replace(/./g, '*');
  }
};
goog.inherits(cvox.ChromeVoxEditableHTMLInput,
    cvox.ChromeVoxEditableElement);

/**
 * Update the state of the text and selection and describe any changes as
 * appropriate.
 */
cvox.ChromeVoxEditableHTMLInput.prototype.update = function() {
  var newValue = this.node.value;
  if (this.node.type == 'password') {
    newValue = newValue.replace(/./g, '*');
  }

  this.changed(newValue, this.node.selectionStart, this.node.selectionEnd);
};

/**
 * @return {boolean} True if the object needs to be updated.
 */
cvox.ChromeVoxEditableHTMLInput.prototype.needsUpdate = function() {
  var newValue = this.node.value;
  if (this.node.type == 'password') {
    newValue = newValue.replace(/./g, '*');
  }
  return (this.value != newValue ||
          this.start != this.node.selectionStart ||
          this.end != this.node.selectionEnd);
};

/******************************************/

/**
 * A subclass of ChromeVoxEditableElement for an HTMLTextAreaElement.
 * @param {HTMLTextAreaElement} node The HTMLTextAreaElement node.
 * @param {Object} tts A TTS object implementing speak() and stop() methods.
 * @extends {cvox.ChromeVoxEditableElement}
 * @constructor
 */
cvox.ChromeVoxEditableTextArea = function(node, tts) {
  this.node = node;
  this.value = node.value;
  this.start = node.selectionStart;
  this.end = node.selectionEnd;
  this.tts = tts;
  this.multiline = true;
  this.shadowIsCurrent = false;
  this.characterToLineMap = {};
  this.lines = {};
};
goog.inherits(cvox.ChromeVoxEditableTextArea,
    cvox.ChromeVoxEditableElement);

/**
 * An offscreen div used to compute the line numbers. A single div is
 * shared by all instances of the class.
 */
cvox.ChromeVoxEditableTextArea.shadow;

/**
 * Update the state of the text and selection and describe any changes as
 * appropriate.
 */
cvox.ChromeVoxEditableTextArea.prototype.update = function() {
  if (this.node.value != this.value) {
    this.shadowIsCurrent = false;
  }

  this.changed(
      this.node.value, this.node.selectionStart, this.node.selectionEnd);
};

/**
 * @return {boolean} True if the object needs to be updated.
 */
cvox.ChromeVoxEditableTextArea.prototype.needsUpdate = function() {
  return (this.value != this.node.value ||
          this.start != this.node.selectionStart ||
          this.end != this.node.selectionEnd);
};

/**
 * Get the line number corresponding to a particular index.
 * @param {number} index The 0-based character index.
 * @return {number} The 0-based line number corresponding to that character.
 */
cvox.ChromeVoxEditableTextArea.prototype.getLineIndex = function(index) {
  if (!this.shadowIsCurrent) {
    this.updateShadow();
  }
  return this.characterToLineMap[index];
};

/**
 * Get the start character index of a line.
 * @param {number} index The 0-based line index.
 * @return {number} The 0-based index of the first character in this line.
 */
cvox.ChromeVoxEditableTextArea.prototype.getLineStart = function(index) {
  if (!this.shadowIsCurrent) {
    this.updateShadow();
  }

  return this.lines[index].startIndex;
};

/**
 * Get the end character index of a line.
 * @param {number} index The 0-based line index.
 * @return {number} The 0-based index of the end of this line.
 */
cvox.ChromeVoxEditableTextArea.prototype.getLineEnd = function(index) {
  if (!this.shadowIsCurrent) {
    this.updateShadow();
  }

  return this.lines[index].endIndex;
};

/**
 * Update the shadow object, an offscreen div used to compute line numbers.
 */
cvox.ChromeVoxEditableTextArea.prototype.updateShadow = function() {
  var shadow = cvox.ChromeVoxEditableTextArea.shadow;
  if (!shadow) {
    shadow = document.createElement('div');
    document.body.appendChild(shadow);
    cvox.ChromeVoxEditableTextArea.shadow = shadow;
  }

  while (shadow.childNodes.length) {
    shadow.removeChild(shadow.childNodes[0]);
  }

  shadow.style.cssText = window.getComputedStyle(this.node, null).cssText;
  shadow.style.visibility = 'hidden';
  shadow.style.position = 'absolute';
  shadow.style.top = -9999;
  shadow.style.left = -9999;

  var shadowWrap = document.createElement('div');
  shadow.appendChild(shadowWrap);

  var text = this.node.value;
  var outputHtml = '';
  var lastWasWhitespace = false;
  var currentSpan = null;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    var isWhitespace = this.isWhitespaceChar(ch);
    if ((isWhitespace != lastWasWhitespace) || i == 0) {
      currentSpan = document.createElement('span');
      currentSpan.startIndex = i;
      shadowWrap.appendChild(currentSpan);
    }
    currentSpan.innerText += ch;
    currentSpan.endIndex = i;
    lastWasWhitespace = isWhitespace;
  }
  if (currentSpan) {
    currentSpan.endIndex = text.length;
  } else {
    currentSpan = document.createElement('span');
    currentSpan.startIndex = 0;
    currentSpan.endIndex = 0;
    shadowWrap.appendChild(currentSpan);
  }

  this.characterToLineMap = {};
  this.lines = {};
  var firstSpan = shadowWrap.childNodes[0];
  var lineIndex = -1;
  var lineOffset = -1;
  for (var n = firstSpan; n; n = n.nextSibling) {
    if (n.offsetTop > lineOffset) {
      lineIndex++;
      this.lines[lineIndex] = {};
      this.lines[lineIndex].startIndex = n.startIndex;
      lineOffset = n.offsetTop;
    }
    this.lines[lineIndex].endIndex = n.endIndex;
    for (var j = n.startIndex; j <= n.endIndex; j++) {
      this.characterToLineMap[j] = lineIndex;
    }
  }

  this.shadowIsCurrent = true;
};

/******************************************/

/**
 * A subclass of ChromeVoxEditableElement for elements that are contentEditable.
 * @param {Element} node The contentEditable node.
 * @param {Object} tts A TTS object implementing speak() and stop() methods.
 * @extends {cvox.ChromeVoxEditableElement}
 * @constructor
 */
cvox.ChromeVoxEditableContentEditable = function(node, tts) {
  this.node = node;
  this.value = node.textContent;

  // TODO (clchen): This ignores the case of the selection going across more
  // than one child node.
  var sel = window.getSelection();
  this.currentChildNode = sel.anchorNode;
  this.start = 0;
  this.end = 0;

  this.tts = tts;
  this.multiline = true;
  this.shadowIsCurrent = false;
  this.characterToLineMap = {};
  this.lines = {};
};
goog.inherits(cvox.ChromeVoxEditableContentEditable,
    cvox.ChromeVoxEditableElement);

/**
 * An offscreen div used to compute the line numbers. A single div is
 * shared by all instances of the class.
 */
cvox.ChromeVoxEditableContentEditable.shadow;

/**
 * Update the state of the text and selection and describe any changes as
 * appropriate.
 */
cvox.ChromeVoxEditableContentEditable.prototype.update = function() {
  var sel = window.getSelection();
  var cursorNode = sel.anchorNode;

  if (this.currentChildNode != cursorNode) {
    this.currentChildNode = cursorNode;
    this.start = 0;
    this.end = 0;
  }

  var cursorOffset = sel.anchorOffset;

  var updatedValue = cursorNode.textContent;
  var updatedSelectionStart = sel.anchorOffset;
  var updatedSelectionEnd = sel.focusOffset;
  var goingBackwards = false;

  // This can be backwards if the user is navigating in reverse. Flip it around.
  if (updatedSelectionStart > updatedSelectionEnd) {
    updatedSelectionEnd = sel.anchorOffset;
    updatedSelectionStart = sel.focusOffset;
    goingBackwards = true;
  }

  // TODO (clchen): Fix this! this.value doesn't make sense since
  // contentEditable doesn't have value!
  if (updatedValue != this.value) {
    this.shadowIsCurrent = false;
  }

  this.changed(
      updatedValue, updatedSelectionStart, updatedSelectionEnd);

  // Move the start pointer after the change has been processed.
  if (goingBackwards) {
    this.start = updatedSelectionStart;
  } else {
    this.start = updatedSelectionEnd;
  }
};

/**
 * @return {boolean} True if the object needs to be updated.
 */
cvox.ChromeVoxEditableContentEditable.prototype.needsUpdate = function() {
  // TODO: Fix this! Make it agree with the window selection.
  return (this.value != this.node.textContent ||
          this.start != this.node.selectionStart ||
          this.end != this.node.selectionEnd);
};

/**
 * Get the line number corresponding to a particular index.
 * @param {number} index The 0-based character index.
 * @return {number} The 0-based line number corresponding to that character.
 */
cvox.ChromeVoxEditableContentEditable.prototype.getLineIndex = function(index) {
  if (!this.shadowIsCurrent) {
    this.updateShadow();
  }

  // TODO: Change this back to using the characterToLineMap once updateShadow
  // is fixed. Returning 0 all the time is a hack and is not always correct.
  //return this.characterToLineMap[index];
  return 0;
};

/**
 * Get the start character index of a line.
 * @param {number} index The 0-based line index.
 * @return {number} The 0-based index of the first character in this line.
 */
cvox.ChromeVoxEditableContentEditable.prototype.getLineStart = function(index) {
  if (!this.shadowIsCurrent) {
    this.updateShadow();
  }
  return this.lines[index].startIndex;
};

/**
 * Get the end character index of a line.
 * @param {number} index The 0-based line index.
 * @return {number} The 0-based index of the end of this line.
 */
cvox.ChromeVoxEditableContentEditable.prototype.getLineEnd = function(index) {
  if (!this.shadowIsCurrent) {
    this.updateShadow();
  }

  return this.lines[index].endIndex;
};

/**
 * Update the shadow object, an offscreen div used to compute line numbers.
 * TODO (clchen): Go through this code and make it work for contentEditable.
 * Currently, it is just a clone of what was there for textArea and it does
 * is not giving the right results.
 */
cvox.ChromeVoxEditableContentEditable.prototype.updateShadow = function() {
  var shadow = cvox.ChromeVoxEditableContentEditable.shadow;
  if (!shadow) {
    shadow = document.createElement('div');
    document.body.appendChild(shadow);
    cvox.ChromeVoxEditableContentEditable.shadow = shadow;
  }

  while (shadow.childNodes.length) {
    shadow.removeChild(shadow.childNodes[0]);
  }

  shadow.style.cssText = window.getComputedStyle(this.node, null).cssText;
  shadow.style.visibility = 'hidden';
  shadow.style.position = 'absolute';
  shadow.style.top = -9999;
  shadow.style.left = -9999;

  var shadowWrap = document.createElement('div');
  shadow.appendChild(shadowWrap);

  var text = this.node.value;
  if (!text) {
    text = this.node.textContent;
  }
  var outputHtml = '';
  var lastWasWhitespace = false;
  var currentSpan = null;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    var isWhitespace = this.isWhitespaceChar(ch);
    if ((isWhitespace != lastWasWhitespace) || i == 0) {
      currentSpan = document.createElement('span');
      currentSpan.startIndex = i;
      shadowWrap.appendChild(currentSpan);
    }
    currentSpan.innerText += ch;
    currentSpan.endIndex = i;
    lastWasWhitespace = isWhitespace;
  }
  if (currentSpan) {
    currentSpan.endIndex = text.length;
  } else {
    currentSpan = document.createElement('span');
    currentSpan.startIndex = 0;
    currentSpan.endIndex = 0;
    shadowWrap.appendChild(currentSpan);
  }

  this.characterToLineMap = {};
  this.lines = {};
  var firstSpan = shadowWrap.childNodes[0];
  var lineIndex = -1;
  var lineOffset = -1;
  for (var n = firstSpan; n; n = n.nextSibling) {
    if (n.offsetTop > lineOffset) {
      lineIndex++;
      this.lines[lineIndex] = {};
      this.lines[lineIndex].startIndex = n.startIndex;
      lineOffset = n.offsetTop;
    }
    this.lines[lineIndex].endIndex = n.endIndex;
    for (var j = n.startIndex; j <= n.endIndex; j++) {
      this.characterToLineMap[j] = lineIndex;
    }
  }

  this.shadowIsCurrent = true;
};
