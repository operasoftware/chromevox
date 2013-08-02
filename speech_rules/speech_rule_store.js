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
 * @fileoverview Base class for all speech rule stores.
 *
 * A speech rule store exposes the minimal set of methods a speech rule
 * author needs for a particular markup type such as MathML or HTML
 * (definition). A rule provider also acts as the permanent and authoritative
 * store for all rules for such markup (lookup).
 * @author dtseng@google.com (David Tseng)
 */

goog.provide('cvox.SpeechRuleStore');

/**
 * @interface
 */
cvox.SpeechRuleStore = goog.abstractMethod;


/**
 * Adds a new speech rule from given components.
 * @param {string} key Unique rule key.
 * @param {string} category Rule category.
 * @param {string} domain Domain annotation of the rule.
 * @param {string} rule String version of the speech rule.
 * @param {string} prec Precondition of the rule.
 * @param {...string} constr Additional constraints.
 */
cvox.SpeechRuleStore.prototype.defineRule = goog.abstractMethod;


/**
 * Retrieves a rule for the given node if one exists.
 * @param {Node} node A node.
 * @return {cvox.SpeechRule.Rule} The speech rule if it exists.
 */
cvox.SpeechRuleStore.prototype.lookupRule = goog.abstractMethod;
