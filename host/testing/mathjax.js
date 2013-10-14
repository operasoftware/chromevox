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
 * @fileoverview Testing stub for MathJax.
 *
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.TestMathJax');

goog.require('cvox.AbstractMathJax');
goog.require('cvox.HostFactory');


/**
 * @constructor
 * @extends {cvox.AbstractMathJax}
 */
cvox.TestMathJax = function() {
  goog.base(this);
};
goog.inherits(cvox.TestMathJax, cvox.AbstractMathJax);


/**
 * @override
 */
cvox.TestMathJax.prototype.isMathjaxActive = function(callback) { };


/**
 * @override
 */
cvox.TestMathJax.prototype.getAllJax = function(callback) { };


/**
 * @override
 */
cvox.TestMathJax.prototype.registerSignal = function(
    callback, signal) { };


/**
 * @override
 */
cvox.TestMathJax.prototype.injectScripts = function() { };


/**
 * @override
 */
cvox.TestMathJax.prototype.configMediaWiki = function() { };


/**
 * @override
 */
cvox.TestMathJax.prototype.getTex = function(callback, texNode) { };


/**
 * @override
 */
cvox.TestMathJax.prototype.getAsciiMath = function(callback, asciiMathNode) { };


/** Export platform constructor. */
cvox.HostFactory.mathJaxConstructor =
    cvox.TestMathJax;
