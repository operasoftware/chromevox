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
 * @fileoverview The cvox.NodeState typedef.
 */

goog.provide('cvox.NodeState');
goog.provide('cvox.NodeStateUtil');

/**
 * Holds the state of a node.  It is an Array or Arrays of strings and numbers.
 * Each sub array is in the format:
 * [state, opt_arg, opt_arg, ...].  These sub arrays map directly to a
 * cvox.ChromeVox.getMsg() call. For example [list_position, 3, 5] maps to
 * getMsg('list_position', [3, 5]);
 *
 * @typedef {!Array.<!Array.<string|number>>}
 */
cvox.NodeState;

/**
 * Returns a localized, readable string with the NodeState.
 *
 * NOTE(deboer): Once AriaUtil and DomUtil are using NodeState exclusively, this
 * function can be moved into DescriptionUtil, removing the cvox.ChromeVox
 * dependency here.
 *
 * @param {cvox.NodeState} state The node state.
 * @return {string} The readable state string.
 */
cvox.NodeStateUtil.expand = function(state) {
  try {
    return state.map(function(s) {
      if (s.length < 1) {
        throw new Error('cvox.NodeState must have at least one entry');
      }
      var args = s.slice(1).map(function(a) {
        if (typeof a == 'number') {
          return cvox.ChromeVox.msgs.getNumber(a);
        }
        return a;
      });
      return cvox.ChromeVox.msgs.getMsg(/** @type {string} */ (s[0]), args);
    }).join(' ');
  } catch (e) {
    throw new Error('error: ' + e + ' state: ' + state);
  }
};
