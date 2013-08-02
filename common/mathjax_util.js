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
 * @fileoverview Utility functions used by speech rules for MathJax objects.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathJaxUtil');


// Functionality for rules on Mathjax nodes.
/**
 * Retrieves MathML sub element with same id as MathJax node.
 * @param {!Node} inner A node internal to a MathJax node.
 * @param {!Node} mml The corresponding MathML node.
 * @return {Node} The internal MathML node corresponding to the MathJax node.
 */
cvox.MathJaxUtil.matchMathjaxToMathml = function(inner, mml) {
  return mml.querySelector('[spanID=' + inner.id + ']');
};


/**
 * Retrieve an extender symbol for a given node.
 * @param {!Node} jax The MathJax node.
 * @param {!Node} mml The MathML node containing the MathJax node.
 * @return {Array.<Node>} The resulting node list.
 */
cvox.MathJaxUtil.retrieveMathjaxExtender = function(jax, mml) {
  var ext = cvox.MathJaxUtil.matchMathjaxToMathml(jax, mml);
  if (ext) {
    return [ext];
  }
  return [];
};


/**
 * Retrieve an extender symbol for a given node.
 * @param {!Node} jax The MathJax node.
 * @param {!Node} mml The MathML node containing the MathJax node.
 * @return {Array.<Node>} The resulting node list.
 */
cvox.MathJaxUtil.retrieveMathjaxLeaf = function(jax, mml) {
  var leaf = cvox.MathJaxUtil.matchMathjaxToMathml(jax, mml);
  if (leaf) {
    return [leaf];
  }
  return [];
};


/**
 * For a given MathJax node it returns the equivalent MathML node,
 * if it is of the right tag.
 * @param {!Node} jax The Mathjax node.
 * @param {!Node} mml The MathML node containing the MathJax node.
 * @param {!string} tag The required tag.
 * @return {Array.<Node>} The resulting node list.
 */
cvox.MathJaxUtil.checkMathjaxTag = function(jax, mml, tag) {
  var node = cvox.MathJaxUtil.matchMathjaxToMathml(jax, mml);
  if (node && node.tagName.toUpperCase() == tag) {
    return [node];
  }
  return [];
};


/**
 * Returns MathML node if MathJax is munder.
 * @param {!Node} jax The Mathjax node.
 * @param {!Node} mml The MathML node containing the MathJax node.
 * @return {Array.<Node>} The resulting node list.
 */
cvox.MathJaxUtil.checkMathjaxMunder = function(jax, mml) {
  return cvox.MathJaxUtil.checkMathjaxTag(jax, mml, 'MUNDER');
};


/**
 * Returns MathML node if MathJax is mover.
 * @param {!Node} jax The Mathjax node.
 * @param {!Node} mml The MathML node containing the MathJax node.
 * @return {Array.<Node>} The resulting node list.
 */
cvox.MathJaxUtil.checkMathjaxMover = function(jax, mml) {
  return cvox.MathJaxUtil.checkMathjaxTag(jax, mml, 'MOVER');
};


/**
 * Returns MathML node if MathJax is msub.
 * @param {!Node} jax The Mathjax node.
 * @param {!Node} mml The MathML node containing the MathJax node.
 * @return {Array.<Node>} The resulting node list.
 */
cvox.MathJaxUtil.checkMathjaxMsub = function(jax, mml) {
  return cvox.MathJaxUtil.checkMathjaxTag(jax, mml, 'MSUB');
};


/**
 * Returns MathML node if MathJax is msup.
 * @param {!Node} jax The Mathjax node.
 * @param {!Node} mml The MathML node containing the MathJax node.
 * @return {Array.<Node>} The resulting node list.
 */
cvox.MathJaxUtil.checkMathjaxMsup = function(jax, mml) {
  return cvox.MathJaxUtil.checkMathjaxTag(jax, mml, 'MSUP');
};


/**
 * Maps function names to applicable function.
 * @type {Object.<string, function(Node, Node): Array.<Node>>}
 */
cvox.MathJaxUtil.customFunctionMapping = {
  'extender' : cvox.MathJaxUtil.retrieveMathjaxExtender,
  'mathmlmunder' : cvox.MathJaxUtil.checkMathjaxMunder,
  'mathmlmover' : cvox.MathJaxUtil.checkMathjaxMover,
  'mathmlmsub' : cvox.MathJaxUtil.checkMathjaxMsub,
  'mathmlmsup' : cvox.MathJaxUtil.checkMathjaxMsup,
  'lookupleaf' : cvox.MathJaxUtil.retrieveMathjaxLeaf
};
