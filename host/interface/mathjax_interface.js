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
 * @fileoverview Interface of ChromeVox's bridge to MathJax.
 *
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathJaxInterface');


/**
 * @interface
 */
cvox.MathJaxInterface = function() { };


/**
 * True if MathJax is injected in a page.
 * @param {function(boolean)} callback A function with the active status as
 *    argument.
 */
cvox.MathJaxInterface.prototype.isMathjaxActive = function(callback) { };


/**
 * Get MathML for all MathJax nodes that already exist by applying the callback
 * to every single MathJax node.
 * @param {function(Node, string)} callback A function taking a node and an id
 * string.
 */
cvox.MathJaxInterface.prototype.getAllJax = function(callback) { };


/**
 * Registers a persistent callback function to be executed by Mathjax on the
 * given signal.
 * @param {function(Node, string)} callback A function taking a node and an id
 * string.
 * @param {string} signal The Mathjax signal to fire the callback.
 */
cvox.MathJaxInterface.prototype.registerSignal = function(callback, signal) { };


/**
 * Injects some minimalistic MathJax script into the page to translate LaTeX
 * expressions.
 */
cvox.MathJaxInterface.prototype.injectScripts = function() { };


/**
 * Loads configurations for MediaWiki pages (e.g., Wikipedia).
 */
cvox.MathJaxInterface.prototype.configMediaWiki = function() { };


/**
 * Get MathML representation of images with tex or latex class if it has an
 * alt text or title.
 * @param {function(Node, string)} callback A function taking a MathML node and
 * an id string.
 * @param {Node} texNode Node with img tag and tex or latex class.
 */
cvox.MathJaxInterface.prototype.getTex = function(callback, texNode) { };


/**
 * Get MathML representation of images that have asciiMath in alt text.
 * @param {function(Node, string)} callback A function taking a MathML node and
 *     an id string.
 * @param {Node} asciiMathNode Node with img tag and class of numberedequation,
 *     inlineformula, or displayformula.
 */
cvox.MathJaxInterface.prototype.getAsciiMath = function(
    callback, asciiMathNode) { };
