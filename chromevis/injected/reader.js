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
 * @fileoverview Provides selection navigation and lens visitor functionality.
 * Additional navigation and lens APIs could be added/substituted here.
 * @author rshearer@google.com (Rachel Shearer)
 */


goog.provide('chromevis.ChromeVisReader');

goog.require('cvox.ExtensionBridge');
goog.require('cvox.Lens');
goog.require('cvox.TraverseContent');

/**
 * Initializes the selection navigation (TraverseContent) and lens
 * (cvox.Lens)
 * @constructor
 */
chromevis.ChromeVisReader = function() {
  this.traverseContent = new cvox.TraverseContent();
  this.lens = new cvox.Lens();
  cvox.ExtensionBridge.addMessageListener(
      goog.bind(this.lens.handleBackgroundMessage, this.lens));
};

/**
 * Move to the next element.
 * @param {string} granularity Specifies "sentence", "word", "character", or
 *     "paragraph" granularity.
 * @return {?string} Either:
 *                1) The new selected text.
 *                2) null if the end of the domObj has been reached.
 */
chromevis.ChromeVisReader.prototype.nextElement = function(granularity) {
  this.traverseContent.syncToSelection();
  var result = this.traverseContent.nextElement(granularity);
  this.traverseContent.updateSelection();
  return result;
};

/**
 * Move to the previous element.
 * @param {string} granularity Specifies "sentence", "word", "character", or
 *     "paragraph" granularity.
 * @return {?string} Either:
 *                1) The new selected text.
 *                2) null if the end of the domObj has been reached.
 */
chromevis.ChromeVisReader.prototype.prevElement = function(granularity) {
  this.traverseContent.syncToSelection();
  var result = this.traverseContent.prevElement(granularity);
  this.traverseContent.updateSelection();
  return result;
};

/**
 * Reset the content traversal.
 */
chromevis.ChromeVisReader.prototype.reset = function() {
  this.traverseContent.reset();
};

/**
 * Provides the lens.
 * @return {cvox.Lens} The lens.
 */
chromevis.ChromeVisReader.prototype.getLens = function() {
  return this.lens;
};


