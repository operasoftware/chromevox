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

goog.require('cvox.ChromeVox');
goog.require('cvox.XpathUtil');


// Functionality to compute MathML representation of MathJax nodes.
/**
 * Cleans a MathJax node of all display related content.
 * @param {Node} jax MathJax node.
 * @return {Node} A cleaned clone of the node.
 */
cvox.MathJaxUtil.purgeMathjax = function(jax) {

  /**
   * Cleans a MathJax node recursively.
   * @param {Node} jax MathJax node.
   * @return {Array.<Node>} A cleaned node list.
   */
  var purgeRecursive = function(jax) {
    if (jax.nodeType == Node.TEXT_NODE) {
      return [jax];
    }
    var children = cvox.DomUtil.toArray(jax.childNodes);
    var newChildren = [];
    for (var i = 0, child; child = children[i]; i++) {
      var result = purgeRecursive(child);
      if (result.length > 0) {
        newChildren = newChildren.concat(result);
      }
      child.parentNode.removeChild(child);
    }
    if (jax.tagName == 'SPAN' && jax.className) {
      for (var i = 0, child; child = newChildren[i]; i++) {
        jax.appendChild(child);
      }
      return [jax];
    }
    return newChildren;
  };

  var result = purgeRecursive(jax.cloneNode(true));
  if (result.length > 0) {
    return result[0];
  }
  return null;
};


/**
 * Since MathJax is pretty unclean, we have to consider mappings of
 * distinct MathML tags to single MathJax classes,
 * e.g., mover, munder to moverunder and msub, msup to msubsup.
 * @type {Object.<string, string>}
 */
cvox.MathJaxUtil.mapMmlToMj = {
  'MOVER' : 'MUNDEROVER',
  'MUNDER' : 'MUNDEROVER',
  'MSUB' : 'MSUBSUP',
  'MSUP' : 'MSUBSUP'
};


/**
 * Compares MathJax and MathML tags taking MathJax's peculiarities into account.
 * @param {!Node} jax MathJax node.
 * @param {!Node} mml MathML node.
 * @return {boolean} True if the nodes match.
 */
cvox.MathJaxUtil.compareMjToMml = function(jax, mml) {
  var jaxClass = jax.className;
  var mmlTag = mml.tagName;
  if (!jaxClass || !mmlTag) {
    return false;
  }
  jaxClass = jaxClass.toUpperCase();
  mmlTag = mmlTag.toUpperCase();
  return jaxClass == mmlTag || cvox.MathJaxUtil.mapMmlToMj[mmlTag] == jaxClass;
};


/**
 * Links MathJax nodes to nodes in their MathML representation by giving
 * them the same id.
 * @param {Node} jax MathJax node.
 * @param {Node} mml MathML node.
 */
cvox.MathJaxUtil.pairMmlToMj = function(jax, mml) {
  var cleanJax = cvox.MathJaxUtil.purgeMathjax(jax);

  /**
   * Pairs recursively the MathJax and MathML nodes.
   * @param {Node} jax MathJax node.
   * @param {Node} mml MathML node.
   */
  var pairMmlToMj = function(jax, mml) {
    if (!jax || !mml ||
        mml.nodeType == Node.TEXT_NODE || mml.nodeType == Node.COMMENT_NODE ||
        jax.nodeType == Node.TEXT_NODE || jax.nodeType == Node.COMMENT_NODE) {
      return;
    }
    if (cvox.MathJaxUtil.compareMjToMml(jax, mml)) {
      mml.setAttribute('id', jax.id);
      var mmlChildren = mml.childNodes;
      var jaxChildren = jax.childNodes;
      while (jaxChildren.length == 1 && mmlChildren.length > 1) {
        jaxChildren = jaxChildren[0].childNodes;
      }
      for (var i = 0; i < mmlChildren.length; i++) {
        if (jaxChildren[i]) {
          pairMmlToMj(jaxChildren[i], mmlChildren[i]);
        }
      }
    } else {
      pairMmlToMj(jax.firstChild, mml);
    }
  };

  pairMmlToMj(cleanJax, mml);
};


/**
 * Return all MathML for all mathjaxs elements.
 * @param {Object.<string, Node>} result An object mapping node ids to
 *     nodes to which the Mathjax elements are added.
 */
cvox.MathJaxUtil.getAllMathjaxsMml = function(result) {
  /**
   * Returns a customized callback for registering MathML of Mathjax elements.
   * @param {Node} jax MathJax node.
   * @return {function(Node)} The callback.
   */
  var pairById = function(jax) {
    return function(y) {
      result[jax.id] = y;
      cvox.MathJaxUtil.pairMmlToMj(jax, y);
    };
  };
  cvox.MathJaxImplementation.isMathjaxActive(
      goog.bind(function(x) {
                  if (x) {
                    var jaxs = document.querySelectorAll('span.math');
                    for (var i = 0, jax; jax = jaxs[i]; i++) {
                      cvox.MathJaxImplementation.getMathMLById(
                          pairById(jax), jax.id);
                    }
                  }
                }
                , cvox.MathJaxUtil));
};


/**
 * Initialises Mathjax objects of the page, if they exist.
 * @param {!Object.<string, Node>} result The object where the results
 *     are stored.
 */
cvox.MathJaxUtil.initializeMathjaxs = function(result) {
  if (Object.keys(result).length == 0) {
    window.setTimeout(
        goog.bind(function() {
                    cvox.MathJaxUtil.getAllMathjaxsMml(result);},
                  cvox.MathJaxUtil), 300);
  }
};


// Functionality for rules on Mathjax nodes.
/**
 * Retrieves MathML sub element with same id as MathJax node.
 * @param {!Node} inner A node internal to a MathJax node.
 * @param {!Node} mml The corresponding MathML node.
 * @return {Node} The internal MathML node corresponding to the MathJax node.
 */
cvox.MathJaxUtil.matchMathjaxToMathml = function(inner, mml) {
  return mml.querySelector('#' + inner.id);
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
  'mathmlmsup' : cvox.MathJaxUtil.checkMathjaxMsup
};
