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
 * @fileoverview A Choice Widget presenting a list of nodes with the ability
 * to sync selection when chosen.
 * @author dtseng@google.com (David Tseng)
 */

goog.provide('cvox.NodeChooserWidget');

goog.require('cvox.ChoiceWidget');
goog.require('cvox.ChromeVox');
goog.require('cvox.DomUtil');
goog.require('cvox.SpokenMessages');

// TODO(dtseng): This class should have a name reflecting its tagName
// (i.e. 'headings chooser').
/**
 * @constructor
 * @param {Array} elementsArray The set of elements to present.
* @param {Array} opt_descriptionsArray An optional list of descriptions.
 * @extends {cvox.ChoiceWidget}
 */
cvox.NodeChooserWidget = function(elementsArray, opt_descriptionsArray) {
  var functions = new Array();
  var descriptions = new Array();
  for (var i = 0, node; node = elementsArray[i]; i++) {
    if (cvox.DomUtil.hasContent(node)) {
      if (opt_descriptionsArray == null) {
        descriptions.push(cvox.DomUtil.collapseWhitespace(
            cvox.DomUtil.getValue(node) + ' ' + cvox.DomUtil.getName(node)));
      }
      functions.push(this.createSimpleNavigateToFunction_(node));
    }
  }
  if (opt_descriptionsArray) {
    descriptions = opt_descriptionsArray;
  }
  goog.base(this, descriptions, functions);
};
goog.inherits(cvox.NodeChooserWidget, cvox.ChoiceWidget);


/**
 * Creates a simple function that will navigate to the given targetNode when
 * invoked.
 * Note that we are using this function because functions created inside a loop
 * have to be created by another function and not within the loop directly.
 *
 * See: http://joust.kano.net/weblog/archive/2005/08/08/
 * a-huge-gotcha-with-javascript-closures/
 * @param {Node} targetNode The target node to navigate to.
 * @return {function()} A function that will navigate to the given targetNode.
 * @private
 */
cvox.NodeChooserWidget.prototype.createSimpleNavigateToFunction_ = function(
    targetNode) {
  return goog.bind(function() {
      this.hide();
      cvox.ChromeVox.navigationManager.updateSel(
          cvox.CursorSelection.fromNode(targetNode));
      cvox.ChromeVox.navigationManager.sync();
    }, this);
};
