// Copyright 2010 Google Inc.
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

cvoxgoog.provide('cvox.CustomWalker');


/**
 * @fileoverview A skeleton JavaScript class for performing site specific
 * navigation. Site specific scripts should create a CustomWalker object,
 * implement these methods, and pass it back to the navigation manager.
 * @author clchen@google.com (Charles L. Chen)
 */



/**
 * @constructor
 */
cvox.CustomWalker = function() {

};


/**
 * Moves selection to the next item.
 * @return {boolean} Returns true if the selection was moved successfully.
 */
cvox.CustomWalker.prototype.next = function() {
  return false;
};


/**
 * Moves selection to the previous item.
 * @return {boolean} Returns true if the selection was moved successfully.
 */
cvox.CustomWalker.prototype.previous = function() {
  return false;
};


/**
 * Does the primary action for the current item (ie, if it is a link,
 * click on it).
 *
 * TODO (clchen): Add a default action.
 *
 * @return {boolean} Returns true if the action was done successfully.
 */
cvox.CustomWalker.prototype.actOnCurrentItem = function() {
  return false;
};


/**
 * Returns the current node.
 * @return {Object} The current node.
 */
cvox.CustomWalker.prototype.getCurrentNode = function() {
  return null;
};


/**
 * Returns the current content.
 * @return {String} The current content.
 */
cvox.CustomWalker.prototype.getCurrentContent = function() {
  return '';
};


/**
 * Returns a description of the current content. This is secondary
 * information about the current content which may be omitted if
 * the user has a lower verbosity setting.
 * @return {Array.<string>} An array of length 2 containing the current text
 * content in the first cell and the description annotations in the second
 * cell in the form [<content>, <description>]}.
 */
cvox.CustomWalker.prototype.getCurrentDescription = function() {
  return [];
};


/**
 * Sets the given targetNode as the current position.
 * @param {Object} targetNode The node to set the position to.
 */
cvox.CustomWalker.prototype.setCurrentNode = function(targetNode) {
};


/**
 * Moves selection to the current item and speaks it.
 */
cvox.CustomWalker.prototype.goToCurrentItem = function() {
};


/**
 * Checks if the custom walker is able to act on the current item.
 *
 * @return {boolean} True if some action is possible.
 */
cvox.CustomWalker.prototype.canActOnCurrentItem = function() {
  return true;
};

