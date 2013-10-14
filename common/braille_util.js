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
 * @fileoverview A utility class for general braille functionality.
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.BrailleUtil');

goog.require('cvox.DomUtil');
goog.require('cvox.NavBraille');
goog.require('cvox.NodeStateUtil');
goog.require('cvox.Spannable');


/**
 * Trimmable whitespace character that appears between consecutive items in
 * braille.
 * @const{string}
 */
cvox.BrailleUtil.ITEM_SEPARATOR = ' ';


/**
 * Messages considered as containers in braille.
 * Containers are distinguished from roles by their appearance higher up in the
 * DOM tree of a selected node.
 * This list should be very short.
 * @type {!Array.<string>}
 */
cvox.BrailleUtil.CONTAINER = [
  'tag_h1_brl',
  'tag_h2_brl',
  'tag_h3_brl',
  'tag_h4_brl',
  'tag_h5_brl',
  'tag_h6_brl'
];


/**
 * Maps a ChromeVox message id to a braille template.
 * The template takes one-character specifiers:
 * n: replaced with braille name.
 * r: replaced with braille role.
 * s: replaced with braille state.
 * c: replaced with braille container role; this potentially returns whitespace,
 * so place at the beginning or end of templates for trimming.
 * v: replaced with braille value.
 * @type {Object.<string, string>}
 */
cvox.BrailleUtil.TEMPLATE = {
  'base': 'c n v r s',
  'aria_role_button': '[n]',
  'aria_role_textbox': 'n: v r',
  'input_type_button': '[n]',
  'input_type_checkbox': 'n (s)',
  'input_type_email': 'n: v r',
  'input_type_number': 'n: v r',
  'input_type_password': 'n: v r',
  'input_type_search': 'n: v r',
  'input_type_submit': '[n]',
  'input_type_text': 'n: v r',
  'input_type_tel': 'n: v r',
  'input_type_url': 'n: v r',
  'tag_button': '[n]',
  'tag_textarea': 'n: v r'
};


/**
 * Attached to the value region of a braille spannable.
 * @param {number} offset The offset of the span into the value.
 * @constructor
 * @struct
 */
cvox.BrailleUtil.ValueSpan = function(offset) {
  /**
   * The offset of the span into the value.
   * @type {number}
   */
  this.offset = offset;
};


/**
 * Attached to the selected text within a value.
 * @constructor
 * @struct
 */
cvox.BrailleUtil.ValueSelectionSpan = function() {
};


/**
 * Gets the braille name for a node.
 * See DomUtil for a more precise definition of 'name'.
 * Additionally, whitespace is trimmed.
 * @param {Node} node The node.
 * @return {string} The string representation.
 */
cvox.BrailleUtil.getName = function(node) {
  if (!node) {
    return '';
  }
  return cvox.DomUtil.getName(node).trim();
};


/**
 * Gets the braille role message id for a node.
 * See DomUtil for a more precise definition of 'role'.
 * @param {Node} node The node.
 * @return {string} The string representation.
 */
cvox.BrailleUtil.getRoleMsg = function(node) {
  if (!node) {
    return '';
  }
  var roleMsg = cvox.DomUtil.getRoleMsg(node, cvox.VERBOSITY_VERBOSE);
  if (roleMsg) {
    roleMsg = cvox.DomUtil.collapseWhitespace(roleMsg);
  }
  if (roleMsg && (roleMsg.length > 0)) {
    if (cvox.ChromeVox.msgs.getMsg(roleMsg + '_brl')) {
    roleMsg += '_brl';
    }
  }
  return roleMsg;
};


/**
 * Gets the braille role of a node.
 * See DomUtil for a more precise definition of 'role'.
 * @param {Node} node The node.
 * @return {string} The string representation.
 */
cvox.BrailleUtil.getRole = function(node) {
  if (!node) {
    return '';
  }
  var roleMsg = cvox.BrailleUtil.getRoleMsg(node);
  return roleMsg ? cvox.ChromeVox.msgs.getMsg(roleMsg) : '';
};


/**
 * Gets the braille state of a node.
 * @param {Node} node The node.
 * @return {string} The string representation.
 */
cvox.BrailleUtil.getState = function(node) {
  if (!node) {
    return '';
  }
  return cvox.NodeStateUtil.expand(
      cvox.DomUtil.getStateMsgs(node, true).map(function(state) {
          if (cvox.ChromeVox.msgs.getMsg(state[0] + '_brl')) {
            state[0] += '_brl';
          }
          return state;
      }));
};


/**
 * Gets the braille container role of a node.
 * @param {Node} prev The previous node in navigation.
 * @param {Node} node The node.
 * @return {string} The string representation.
 */
cvox.BrailleUtil.getContainer = function(prev, node) {
  if (!prev || !node) {
    return '';
  }
  var ancestors = cvox.DomUtil.getUniqueAncestors(prev, node);
  for (var i = 0, container; container = ancestors[i]; i++) {
    var msg = cvox.BrailleUtil.getRoleMsg(container);
    if (msg && cvox.BrailleUtil.CONTAINER.indexOf(msg) != -1) {
      return cvox.ChromeVox.msgs.getMsg(msg);
    }
  }
  return '';
};


/**
 * Gets the braille value of a node. A cvox.BrailleUtil.ValueSpan will be
 * attached, along with (possibly) a cvox.BrailleUtil.ValueSelectionSpan.
 * @param {Node} node The node.
 * @return {!cvox.Spannable} The value spannable.
 */
cvox.BrailleUtil.getValue = function(node) {
  if (!node) {
    return new cvox.Spannable();
  }
  var valueSpan = new cvox.BrailleUtil.ValueSpan(0 /* offset */);
  if (cvox.DomUtil.isInputTypeText(node)) {
    var value = node.value
    if (node.type === 'password') {
      value = value.replace(/./g, '*');
    }
    var spannable = new cvox.Spannable(value, valueSpan);
    if (node === document.activeElement) {
      spannable.setSpan(new cvox.BrailleUtil.ValueSelectionSpan(),
          node.selectionStart, node.selectionEnd);
    }
    return spannable;
  } else if (node instanceof HTMLTextAreaElement) {
    var shadow = new cvox.EditableTextAreaShadow();
    shadow.update(node);
    var lineIndex = shadow.getLineIndex(node.selectionEnd);
    var lineStart = shadow.getLineStart(lineIndex);
    var lineEnd = shadow.getLineEnd(lineIndex);
    var lineText = node.value.substring(lineStart, lineEnd);
    valueSpan.offset = lineStart;
    var spannable = new cvox.Spannable(lineText, valueSpan);
    if (node === document.activeElement) {
      var selectionStart = Math.max(node.selectionStart - lineStart, 0);
      var selectionEnd = Math.min(node.selectionEnd - lineStart,
          spannable.getLength());
      spannable.setSpan(new cvox.BrailleUtil.ValueSelectionSpan(),
          selectionStart, selectionEnd);
    }
    return spannable;
  } else {
    return new cvox.Spannable(cvox.DomUtil.getValue(node), valueSpan);
  }
};


/**
 * Gets the templated representation of braille.
 * @param {Node} prev The previous node (during navigation).
 * @param {Node} node The node.
 * @param {{name:(undefined|string),
 * role:(undefined|string),
 * roleMsg:(undefined|string),
 * state:(undefined|string),
 * container:(undefined|string),
 * value:(undefined|string)}|Object} opt_override Override a specific property
 * for the given node.
 * @return {!cvox.Spannable} The string representation.
 */
cvox.BrailleUtil.getTemplated = function(prev, node, opt_override) {
  opt_override = opt_override ? opt_override : {};
  var roleMsg = opt_override.roleMsg ||
      (node ? cvox.DomUtil.getRoleMsg(node, cvox.VERBOSITY_VERBOSE) : '');
  var template = cvox.BrailleUtil.TEMPLATE[roleMsg] ||
      cvox.BrailleUtil.TEMPLATE['base'];

  var templated = new cvox.Spannable();
  var mapChar = function(c) {
    switch (c) {
      case 'n':
        return opt_override.name || cvox.BrailleUtil.getName(node);
      case 'r':
        return opt_override.role || cvox.BrailleUtil.getRole(node);
      case 's':
        return opt_override.state || cvox.BrailleUtil.getState(node);
      case 'c':
        return opt_override.container ||
            cvox.BrailleUtil.getContainer(prev, node);
      case 'v':
        if (opt_override.value) {
          return new cvox.Spannable(opt_override.value,
              new cvox.BrailleUtil.ValueSpan(0 /* offset */));
        } else {
          return cvox.BrailleUtil.getValue(node);
        }
      default:
        return c;
    }
  };
  for (var i = 0; i < template.length; i++) {
    var component = mapChar(template[i]);
    templated.append(component);
    // Ignore the next whitespace separator if the current component is empty.
    if (!component.toString() && template[i + 1] == ' ') {
      i++;
    }
  }
  return templated.trim();
};
