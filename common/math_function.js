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
 * @fileoverview Initialize Math Function mappings.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathFunction');

goog.require('cvox.MathAtom');

/**
 * Create a function mapping.
 * @param {Array.<Object>} atoms Array of initial mappings for
 * some elementary functions.
 * @constructor
 */
cvox.MathFunction = function(atoms) {

  this.FUNCTION_MAP_ = {};

  this.domains = [];
  this.rules = [];
  this.initFunctionMap_(atoms);

};



/**
 * Initializes the mapping for the mathematical functions.
 * @param {Array.<Object>} atoms Array of initial mappings for
 * some elementary functions.
 * @private
 */
cvox.MathFunction.prototype.initFunctionMap_ = function(atoms) {

  var domains = [];
  var rules = [];

  for (var i = 0, func; func = atoms[i]; i++) {
    var funcObject = cvox.MathAtom.make(func.key, func.category,
                                        func['mappings']);
    this.FUNCTION_MAP_[func.key] = funcObject;
    domains = cvox.MathUtil.union(domains, funcObject.allDomains());
    rules = cvox.MathUtil.union(rules, funcObject.allRules());
    for (var j = 0, key; key = func['names'][j]; j++) {
      this.FUNCTION_MAP_[key] = funcObject;
    }
  }
  this.domains = domains;
  this.rules = rules;
};


/**
 *  Retrieves the Atom object for a given function name.
 * @param {string} name of the function.
 * @return {?cvox.MathAtom} The Atom if it exists.
 */
cvox.MathFunction.prototype.getFunctionByName = function(name) {
  // Here we assume that the string has been previously parsed
  // into a sensible format.
  return this.FUNCTION_MAP_[name];
};
