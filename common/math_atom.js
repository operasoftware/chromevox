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
 * @fileoverview Functionality for storing basic mathematical objects.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathAtom');

goog.require('cvox.MathUtil');


/** Basic MathAtom object
 * @param {string} key for the Atomic object.
 * @constructor
 */
cvox.MathAtom = function(key) {

  this.key = key;
  // This might not be used in every atom.
  this.category = '';
  /**
   * Mapping for domains and speech rules.
   * Default mapping is to the key.
   * @type {Object.<string,Object.<string,string>>}
   */
  this.mappings = {'default' : {'default' : key}};

};


/**
 *
 * @return {string} The key of a MathAtom.
 */
cvox.MathAtom.prototype.getKey = function() {
  return this.key;
};


/**
 *  Sets the category of a MathAtom.
 * @param {string} category string.
 */
cvox.MathAtom.prototype.setCategory = function(category) {
  this.category = category;
};


/**
 *
 * @return {string} The category of a MathAtom.
 */
cvox.MathAtom.prototype.getCategory = function() {
  return this.category;
};

/**
 *
 * @return {Object} The mappings objects of a MathAtom.
 * @private
 */
cvox.MathAtom.prototype.getMappings_ = function() {
  return this.mappings;
};


/**
 * Customizes an atom mapping. Possibly updates the old mapping if it existed.
 * @param {string} domain in which the mapping is valid.
 * @param {Object.<string,string>} value Codomain value that should be returned for that domain.
 */
cvox.MathAtom.prototype.addMapping = function(domain, value) {
  this.mappings[domain] = value;
};

/**
 * Customizes an atom mapping. Possibly updates the old mapping if it existed.
 * @param {Object} maps that relate key strings to value strings.
 */
cvox.MathAtom.prototype.addMappings = function(maps) {
  for (var map in maps) {
    this.mappings[map] = maps[map];
  }
};


/**
 * Returns the value of a mapping given its domain. Returns default if
 * no mapping for that domain exists.
 * @param {string} domain of the mapping.
 * @param {string} rule of the mapping.
 * @return {string} Codomain of the mapping for the given rule.
 */
cvox.MathAtom.prototype.map = function(domain, rule) {
  var mapping = this.mappings[domain];
  var value = mapping ? mapping[rule] : this.mappings['default'][rule];
  if (value) {
    return value;
  }
  // In case there is deliberately an empty mapping!
  else if (value === '') {
    return '';
  } else {
    return this.mappings['default']['default'];
  }
};


/**
 * @param {string} domain of the mapping.
 * @return {boolean} True if an atom has a mapping for a particular domain.
 */
cvox.MathAtom.prototype.hasMapping = function(domain) {
  if (this.mappings[domain]) { return true }
  return false;
};


/**
 * @return {Array.<string>} Set of all domains in the atom.
 */
cvox.MathAtom.prototype.allDomains = function() {

  // Explicit cast to keep the compiler happy!
  return Object.keys(/** @type {!Object} */ (this.mappings));
};


/**
 * @return {Array.<string>} Set of all rules in the atom.
 */
cvox.MathAtom.prototype.allRules = function() {

  var rules = [];
  for (var map in this.mappings) {
    // Explicit cast to keep the compiler happy!
    rules = cvox.MathUtil.union(
        rules, Object.keys(/** @type {!Object} */ (this.mappings[map])));
  }
  return rules;
};


/**
 * Makes a MathAtom from an inital objects.
 * @param {string} key For the Atom.
 * @param {string} category of the Atom.
 * @param {Object} mappings for the domain specific translations.
 * @return {cvox.MathAtom} The newly created atom.
 */
cvox.MathAtom.make = function(key, category, mappings) {

  var that = new cvox.MathAtom(key);

  if (category) { that.setCategory(category); }
  if (mappings) { that.addMappings(mappings); }
  return that;
};




// For debugging:

/**
 *
 * @return {string} The Atom as a string.
 */

cvox.MathAtom.prototype.toString = function() {

  var output = '';
  var mappings = this.getMappings_();

  output += 'key:\t\t' + this.getKey();
  output += '\ncategory:\t\t' + this.getCategory();
  output += '\nmappings:';
  for (var domain in mappings) {
    output += '\n\t' + domain + ':';
    for (var rule in mappings[domain]) {
      output += '\n\t\t' + rule + ' -> ' + mappings[domain][rule];
    }
  }
  return output;
};
