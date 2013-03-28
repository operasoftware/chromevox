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
 * @fileoverview Base class for Lens.
 *
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.AbstractLens');

/**
 * @constructor
 */
cvox.AbstractLens = function() { };

/**
 * Displays or hides the lens.
 * @param {boolean} show Whether or not the lens should be shown.
 */
cvox.AbstractLens.prototype.showLens = function(show) { };


/**
 * @return {boolean} True if the lens is currently shown.
 */
cvox.AbstractLens.prototype.isLensDisplayed = function() { };


/**
 * Sets whether the lens is anchored to the top of the page or whether it floats
 * near the selected text.
 * @param {boolean} anchored Whether or not the lens is anchored.
 */
cvox.AbstractLens.prototype.setAnchoredLens = function(anchored) { };


/**
 * Sets the lens multiplier.
 * @param {number} multiplier The new multiplier.
 */
cvox.AbstractLens.prototype.setMultiplier = function(multiplier) { };
