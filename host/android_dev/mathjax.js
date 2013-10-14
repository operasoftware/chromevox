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
 * @fileoverview Implementation of AndroidVox's bridge to MathJax.
 *
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.AndroidMathJax');

goog.require('cvox.AbstractMathJax');
goog.require('cvox.HostFactory');
goog.require('cvox.MathJaxExternalUtil');


/**
 * @constructor
 * @extends {cvox.AbstractMathJax}
 */
cvox.AndroidMathJax = function() {
  goog.base(this);

  /**
   * The ids for converted TeX nodes.
   * @type {number}
   * @private
   */
  this.altMathNodeId_ = 0;
};
goog.inherits(cvox.AndroidMathJax, cvox.AbstractMathJax);


/**
 * Constructs a callback that takes a string representation of a MathML object
 * and a node id and calls function converting it to an actual DOM element.  It
 * is envoked when MathJax returns the MathML representation of one of its
 * objects.
 * @param {function(Node, string)} callback A function taking a node and an id
 * string.
 * @return {function(string, string)} A function taking a Mathml expression and
 * an id string.
 * @private
 */
cvox.AndroidMathJax.prototype.getMathmlToDomCallback_ = function(callback) {
  return goog.bind(function(mml, id) {
    return this.convertMarkupToDom(callback, mml, id);
  }, this);
};


/**
 * @override
 */
cvox.AndroidMathJax.prototype.isMathjaxActive = function(callback) {
  var retries = 0;

  var fetch = function() {
    retries++;
    if (cvox.MathJaxExternalUtil.isActive()) {
      callback(true);
    } else if (retries < 5) {
      setTimeout(fetch, 1000);
    }
  };

  fetch();
};


/**
 * @override
 */
cvox.AndroidMathJax.prototype.getAllJax = function(callback) {
  cvox.MathJaxExternalUtil.getAllJax(
      this.getMathmlToDomCallback_(callback));
};


/**
 * @override
 */
cvox.AndroidMathJax.prototype.registerSignal = function(
    callback, signal) {
    cvox.MathJaxExternalUtil.registerSignal(
        this.getMathmlToDomCallback_(callback), signal);
};


/**
 * @override
 */
cvox.AndroidMathJax.prototype.injectScripts = function() {
  cvox.MathJaxExternalUtil.injectConfigScript();
  cvox.MathJaxExternalUtil.injectLoadScript();
};


/**
 * @override
 */
cvox.AndroidMathJax.prototype.configMediaWiki = function() {
  cvox.MathJaxExternalUtil.configMediaWiki();
};


/**
 * @override
 */
cvox.AndroidMathJax.prototype.getTex = function(callback, texNode) {
  var altText = texNode['alt'] || texNode['title'];
  if (altText) {
    var newId = 'cvoxId-' + this.altMathNodeId_++;
    texNode.setAttribute('cvoxId', newId);
    cvox.MathJaxExternalUtil.texToMml(
        goog.bind(function(mmlStr) {
                    this.convertMarkupToDom(callback, mmlStr, newId);
                  },
                  this),
        altText);
  }
};


/**
 * @override
 */
cvox.AndroidMathJax.prototype.getAsciiMath = function(callback, asciiMathNode) {
  var altText = asciiMathNode['alt'] || asciiMathNode['title'];
  if (altText) {
    var newId = 'cvoxId-' + this.altMathNodeId_++;
    asciiMathNode.setAttribute('cvoxId', newId);
    cvox.MathJaxExternalUtil.asciiMathToMml(
        goog.bind(function(mmlStr) {
                    this.convertMarkupToDom(callback, mmlStr, newId);
                  },
                  this),
        altText);
  }
};


/** Export platform constructor. */
cvox.HostFactory.mathJaxConstructor =
    cvox.AndroidMathJax;
