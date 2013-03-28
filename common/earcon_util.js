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
 * @fileoverview Earcon utils.
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.EarconUtil');

goog.require('cvox.AbstractEarcons');
goog.require('cvox.AriaUtil');
goog.require('cvox.DomUtil');

/**
 * Returns the id of an earcon to play along with the description for a node.
 *
 * @param {Node} node The node to get the earcon for.
 * @return {number?} The earcon id, or null if none applies.
 */
cvox.EarconUtil.getEarcon = function(node) {
  var earcon = cvox.AriaUtil.getEarcon(node);
  if (earcon != null) {
    return earcon;
  }

  switch (node.tagName) {
    case 'BUTTON':
      return cvox.AbstractEarcons.BUTTON;
    case 'A':
      if (node.hasAttribute('href')) {
        return cvox.AbstractEarcons.LINK;
      }
      break;
    case 'IMG':
      if (cvox.DomUtil.hasLongDesc(node)) {
        return cvox.AbstractEarcons.LONG_DESC;
      }
      break;
    case 'LI':
      return cvox.AbstractEarcons.LIST_ITEM;
    case 'SELECT':
      return cvox.AbstractEarcons.LISTBOX;
    case 'TEXTAREA':
      return cvox.AbstractEarcons.EDITABLE_TEXT;
    case 'INPUT':
      switch (node.type) {
        case 'button':
        case 'submit':
        case 'reset':
          return cvox.AbstractEarcons.BUTTON;
        case 'checkbox':
        case 'radio':
          if (node.checked) {
            return cvox.AbstractEarcons.CHECK_ON;
          } else {
            return cvox.AbstractEarcons.CHECK_OFF;
          }
        default:
          if (cvox.DomUtil.isInputTypeText(node)) {
            // 'text', 'password', etc.
            return cvox.AbstractEarcons.EDITABLE_TEXT;
          }
      }
  }
  return null;
};
