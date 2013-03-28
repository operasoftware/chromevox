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
 * @fileoverview A global serializer object which returns the current
 * ChromeVox system state.
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.Serializer');

goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxEventWatcher');

/**
 * @constructor
 */
cvox.Serializer = function() { };

/**
 * Stores state variables in a provided object.
 *
 * @param {Object} store The object.
 */
cvox.Serializer.prototype.storeOn = function(store) {
  cvox.ChromeVox.storeOn(store);
  cvox.ChromeVoxEventWatcher.storeOn(store);
};

/**
 * Updates the object with state variables from an earlier storeOn call.
 *
 * @param {Object} store The object.
 */
cvox.Serializer.prototype.readFrom = function(store) {
  cvox.ChromeVox.readFrom(store);
  cvox.ChromeVoxEventWatcher.readFrom(store);
};
