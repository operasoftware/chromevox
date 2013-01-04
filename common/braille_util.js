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
 * @fileoverview A utility class for general braille functionality.
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.BrailleUtil');

goog.require('cvox.BareGroupWalker');
goog.require('cvox.BareObjectWalker');
goog.require('cvox.DomUtil');
goog.require('cvox.NavBraille');
goog.require('cvox.NodeStateUtil');


/**
 * @type {!cvox.BareGroupWalker}
 * @private
 */
cvox.BrailleUtil.groupWalker_ = new cvox.BareGroupWalker();


/**
 * @type {!cvox.BareObjectWalker}
 * @private
 */
cvox.BrailleUtil.objectWalker_ = new cvox.BareObjectWalker();


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
 * @type {Object.<string, string>}
 */
cvox.BrailleUtil.TEMPLATE = {
  'base': 'c n r s',
  'aria_role_button': '[n]',
  'input_type_button': '[n]',
  'input_type_checkbox': 'n (s)',
  'input_type_submit': '[n]',
  'input_type_text': 'n:',
  'tag_button': '[n]'
};


/**
 * Gets the braille name for a node.
 * See DomUtil for a more precise definition of 'name'.
 * Additionally, whitespace is trimmed.
 * @param {Node} node The node.
 * @return {string} The string representation.
 */
cvox.BrailleUtil.getName = function(node) {
  return cvox.DomUtil.getName(node).trim();
};


/**
 * Gets the braille role message id for a node.
 * See DomUtil for a more precise definition of 'role'.
 * @param {Node} node The node.
 * @return {string} The string representation.
 */
cvox.BrailleUtil.getRoleMsg = function(node) {
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
  var roleMsg = cvox.BrailleUtil.getRoleMsg(node);
  return roleMsg ? cvox.ChromeVox.msgs.getMsg(roleMsg) : '';
};


/**
 * Gets the braille state of a node.
 * @param {Node} node The node.
 * @return {string} The string representation.
 */
cvox.BrailleUtil.getState = function(node) {
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
 * Gets the templated representation of braille.
 * @param {Node} prev The previous node (during navigation).
 * @param {Node} node The node.
 * @return {string} The string representation.
 */
cvox.BrailleUtil.getTemplated = function(prev, node) {
  var roleMsg = cvox.DomUtil.getRoleMsg(node, cvox.VERBOSITY_VERBOSE);
  var template = cvox.BrailleUtil.TEMPLATE[roleMsg] ||
      cvox.BrailleUtil.TEMPLATE['base'];

  var templated =
      template.replace(/[nrsc]/g, function(match) {
          switch (match) {
            case 'n': return cvox.BrailleUtil.getName(node);
            case 'r': return cvox.BrailleUtil.getRole(node);
            case 's': return cvox.BrailleUtil.getState(node);
            case 'c': return cvox.BrailleUtil.getContainer(prev, node);
          }
        });
  return templated.trim();
};


/**
 * Gets the braille representation of a node-based selection.
 * @param {!cvox.CursorSelection} prevSel A previous selection.
 * @param {!cvox.CursorSelection} sel The current selection.
 * @return {!cvox.NavBraille} The resulting braille.
 */
cvox.BrailleUtil.getBraille = function(prevSel, sel) {
  var groupSel = cvox.BrailleUtil.groupWalker_.sync(sel).setReversed(false);
  var objectSel =
      cvox.BrailleUtil.objectWalker_.sync(groupSel).setReversed(false);
  var braille = '';
  var startOffset = 0, endOffset = 0;

  while (objectSel && groupSel &&
      cvox.DomUtil.isDescendantOfNode(objectSel.start.node,
                                      groupSel.start.node)) {
    var item = cvox.BrailleUtil.getTemplated(prevSel.start.node,
                                             objectSel.start.node);
    if (objectSel.absEquals(sel)) {
      startOffset = braille.length;
      endOffset = braille.length + item.length;
    }
    braille += item + cvox.BrailleUtil.ITEM_SEPARATOR;
    prevSel = objectSel;
    objectSel = cvox.BrailleUtil.objectWalker_.next(objectSel);
  }

  braille = braille.trim();

  return new cvox.NavBraille({
                               text: braille,
                               startIndex: startOffset,
                               endIndex: endOffset
                             });
};
