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

/**
 * @fileoverview A collection of JavaScript utilities used to manage focus
 * within a document.
 * @author rshearer@google.com (Rachel Shearer)
 */


goog.provide('cvox.FocusUtil');


/**
 * Utilities for managing focus.
 * @constructor
 */
cvox.FocusUtil = function() {
};

/**
 * Maps whether an input element of specified type accepts text selection or
 * not. True if the element does accept text selection, false if it does not.
 * This can be used to determine whether a visitor to that element should
 * provide interactive text editing to the user.
 * From the W3C table of possible type keywords:
 * http://www.w3.org/TR/html5/the-input-element.html#attr-input-type
 *
 * TODO(dmazzoni): merge this with cvox.DomUtil.isInputTypeText
 *
 * @type {Object}
 */
cvox.FocusUtil.INPUT_TYPE_ACCEPTS_SELECTION_TABLE = {
  'hidden' : false,
  'text' : true,
  'search' : true,
  'tel' : true,
  'url' : true,
  'email' : true,
  'password' : true,
  'datetime' : false,
  'date' : false,
  'month' : false,
  'week' : false,
  'time' : false,
  'datetime-local' : false,
  'number' : false,
  'range' : false,
  'color' : false,
  'checkbox' : false,
  'radio' : false,
  'file' : false,
  'submit' : false,
  'image' : false,
  'reset' : false,
  'button' : false
};

/**
 * Checks if the currently focused element is a field that accepts text input
 * (This can include text fields and selectors)
 *
 * @return {boolean} True if the currently focused element accepts text input.
 */
cvox.FocusUtil.isFocusInTextInputField = function() {
  var activeElement = document.activeElement;

  if (!activeElement) {
    return false;
  }

  if (activeElement.isContentEditable) {
    return true;
  }

  if (activeElement.getAttribute('role') == 'textbox') {
    return true;
  }

  if (activeElement.getAttribute('readOnly') == 'true') {
    return false;
  }

  if (activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT') {
    return true;
  }

  if (activeElement.tagName === 'INPUT') {
    if (!activeElement.hasAttribute('type')) {
      return true;
    } else {
      var activeType = activeElement.getAttribute('type').toLowerCase();
      return cvox.FocusUtil.INPUT_TYPE_ACCEPTS_SELECTION_TABLE[activeType];
    }
  }
  return false;
};
