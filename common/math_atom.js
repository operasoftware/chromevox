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
 * @fileoverview Functionality for storing basic mathematical objects.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathAtom');

goog.require('cvox.MathUtil');
goog.require('cvox.SpeechRule');


/** Basic MathAtom object
 * @param {string} key For the Atom.
 * @param {string} category The category of the Atom.
 * @param {cvox.MathAtom.DomainMapping} mappings Domain mappings for speech
 * rules.
 * @constructor
 */
cvox.MathAtom = function(key, category, mappings) {
  /**
   * @type {string}
   */
  this.key = key;

  /**
   * @type {string}
   */
  this.category = '';

  /**
   * Mapping for domains and styles.
   * Here domains is meant to be the mathematical domain while styles are the
   * particular ways in which rules for the domain are implemented.
   * For example, we could have three different type of styles for the domain
   * of geometry: default, verbose, short.
   * Hence a math atom has domain mappings, associating mathematical domains
   * with one or several styles, and style mappings associating particular
   * styles with actual speech rules.
   * Default mapping (default domain and default style) is to the key.
   * @type {cvox.MathAtom.DomainMapping}
   * @private
   */
  this.mappings_ = mappings ? mappings :
      {'default': {'default': cvox.MathAtom.textRuleFromString_(key)}};
};


/**
 * Type of style mappings for Math Atoms.
 * @typedef {Object.<string, cvox.SpeechRule.Rule>}
 */
cvox.MathAtom.StyleMapping;


/**
 * Type of domain mappings for Math Atoms.
 * @typedef {Object.<string, cvox.MathAtom.StyleMapping>}
 */
cvox.MathAtom.DomainMapping;


/**
 * Accesses the key of the MathAtom.
 * @return {string} The key of a MathAtom.
 */
cvox.MathAtom.prototype.getKey = function() {
  return this.key;
};


/**
 * Sets the category of a MathAtom.
 * @param {string} category The category string.
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
 * @return {cvox.MathAtom.DomainMapping} The domain mappings of a MathAtom.
 */
cvox.MathAtom.prototype.getMappings = function() {
  return this.mappings_;
};


/**
 * Customizes an atom mapping. Possibly updates the old mapping if it existed.
 * @param {string} domain Domain to which the style mapping is to be attached.
 * @param {cvox.MathAtom.StyleMapping} maps The new style mapping.
 */
cvox.MathAtom.prototype.addMapping = function(domain, maps) {
  for (var style in maps) {
    this.mappings_[domain][style] = maps[style];
  }
};


/**
 * Customizes an atom mapping. Possibly updates the old mapping if it existed.
 * @param {cvox.MathAtom.DomainMapping} maps that relate key strings to value
 * strings.
 */
cvox.MathAtom.prototype.addMappings = function(maps) {
  for (var domain in maps) {
    this.hasMapping(domain) ?
        this.addMapping(domain, maps[domain]) :
            this.mappings_[domain] = maps[domain];
  }
};


/**
 * Returns the speech rule of a mapping if it exists.
 * @param {string} domain of the mapping.
 * @param {string} style of the mapping.
 * @return {cvox.SpeechRule.Rule} Speech rule of the given domain and style.
 */
cvox.MathAtom.prototype.mappingRule = function(domain, style) {
  var mapping = this.mappings_[domain];
  var value = mapping ? mapping[style] : this.mappings_['default'][style];
  if (value) {
    return value;
  }
  return this.mappings_['default']['default'];
};


/**
 * Returns the string value of a mapping given by domain and style.
 * Here the string value is the concatenation of content strings of the speech
 * rule components.
 * @param {string} domain of the mapping.
 * @param {string} style of the mapping.
 * @return {string} String version of the speech rule.
 */
cvox.MathAtom.prototype.mappingString = function(domain, style) {
  var speechRule = this.mappingRule(domain, style);
  return speechRule.components.
      map(function(x) {return x.content;}).
          join(' ');
};


/**
 * @param {string} domain of the mapping.
 * @return {boolean} True if an atom has a mapping for a particular domain.
 */
cvox.MathAtom.prototype.hasMapping = function(domain) {
  if (this.getMappings()[domain]) { return true; }
  return false;
};


/**
 * @return {Array.<string>} Set of all domains in the atom.
 */
cvox.MathAtom.prototype.allDomains = function() {

  // Explicit cast to keep the compiler happy!
  return Object.keys(/** @type {!Object} */ (this.getMappings()));
};


/**
 * @return {Array.<string>} Set of all styles in the atom.
 */
cvox.MathAtom.prototype.allStyles = function() {
  var styles = [];
  for (var map in this.getMappings()) {
    // Explicit cast to keep the compiler happy!
    styles = cvox.MathUtil.union(
        styles, Object.keys(/** @type {!Object} */ (this.getMappings()[map])));
  }
  return styles;
};


/**
 * Types for the MathSpeak object.
 * @enum {string}
 */
cvox.MathAtom.Types = {
  SURROGATE: 'surrogate',
  SYMBOL: 'symbol',
  FUNCTION: 'function',
  REST: 'rest'
};


/**
 * Turns a domain mapping from its JSON representation containing simple strings
 * only into a domain mapping containing speech rules.
 * @param {Object.<string, Object.<string, string>>} mappings Simple string
 * mapping.
 * @return {cvox.MathAtom.DomainMapping} The updated domain mapping.
 */
cvox.MathAtom.mappingsFromJSON = function(mappings) {
  var newMappings = new Object;
  for (var domain in mappings) {
    newMappings[domain] = new Object;
    for (var style in mappings[domain]) {
      newMappings[domain][style] =
          cvox.MathAtom.textRuleFromString_(mappings[domain][style]);
    }
  }
  return newMappings;
};


/**
 * @override
 */
cvox.MathAtom.prototype.toString = function() {
  var output = this.getKey() + ':';
  var mappings = this.getMappings();
  for (var domain in mappings) {
    for (var style in mappings[domain]) {
      output += '\t' + domain + ', ' + style + ': ' +
          mappings[domain][style].toString() + '\n';
    }
  }
  return output.slice(0, -1);
};


// TODO (sorge) Move eventually into speech_rule.
/**
 * Creates a simple speech rule with singular text component from a string.
 * @param {string} str The text for the speech rule.
 * @return {!cvox.SpeechRule.Rule} The new speech rule.
 * @private
 */
cvox.MathAtom.textRuleFromString_ = function(str) {
  var comp = new cvox.SpeechRule.Component({type: cvox.SpeechRule.Type.TEXT,
                                            content: str});
  return new cvox.SpeechRule.Rule([comp]);
};
