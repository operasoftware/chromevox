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
 * @fileoverview A class for loading and storing the maps for math atoms from
 * JSON files. The class (and entries) can then be used as via the
 * background page.
 * @author sorge@google.com (Volker Sorge)
 */


goog.provide('cvox.MathMap');

goog.require('cvox.MathFunction');
goog.require('cvox.MathNode');
goog.require('cvox.MathSymbol');
goog.require('cvox.MathUtil');


/**
 *
 * @constructor
 */
cvox.MathMap = function() {

  /**
   * A symbol mapping object.
   * @type {cvox.MathSymbol}
   * @private
   */
  this.symbols_ = new cvox.MathSymbol(cvox.MathMap.fromJSON(
      cvox.MathMap.SYMBOLS_FILES_.map(
          function(x) {return cvox.MathMap.SYMBOLS_PATH_ + x;})));

  /**
   * A function mapping object.
   * @type {cvox.MathFunction}
   * @private
   */
  this.functions_ = new cvox.MathFunction(cvox.MathMap.fromJSON(
      cvox.MathMap.FUNCTIONS_FILES_.map(
          function(x) {return cvox.MathMap.FUNCTIONS_PATH_ + x;})));

  /**
   * A node mapping object.
   * @type {cvox.MathNode}
   * @private
   */
  this.nodes_ = cvox.MathNode.create();

  /**
   * Array of domain names.
   * @type {Array.<string>}
   */
  this.allDomains = cvox.MathUtil.union(this.functions_.domains,
                                        this.symbols_.domains);
  /**
   * Array of speech rule names.
   * @type {Array.<string>}
   */
  this.allRules = cvox.MathUtil.union(this.functions_.rules,
                                      this.symbols_.rules);

};


/**
 * Stringifies MathMap into JSON object.
 * @return {string} The stringified version of the mapping.
 */
cvox.MathMap.prototype.stringify = function() {
  return JSON.stringify(this);
};


/**
 *
 * @return {cvox.MathSymbol} Array for symbol mappings in JSON format.
 */
cvox.MathMap.prototype.symbols = function() {
  return this.symbols_;
};


/**
 *
 * @return {cvox.MathFunction} Array for function mappings in JSON format.
 */
cvox.MathMap.prototype.functions = function() {
 return this.functions_;
};


/**
 * Path to dir containing ChromeVox JSON definitions for math speak.
 * @type {string}
 * @const
 * @private
 */
cvox.MathMap.MATHMAP_PATH_ = 'chromevox/background/mathmaps/';


/**
 * Subpath to dir containing ChromeVox JSON definitions for symbols.
 * @type {string}
 * @const
 * @private
 */
cvox.MathMap.SYMBOLS_PATH_ = cvox.MathMap.MATHMAP_PATH_ + 'symbols/';


/**
 * Subpath to dir containing ChromeVox JSON definitions for functions.
 * @type {string}
 * @const
 * @private
 */
cvox.MathMap.FUNCTIONS_PATH_ = cvox.MathMap.MATHMAP_PATH_ + 'functions/';


/**
 * Array of JSON filenames containing symbol definitions for math speak.
 * @type {Array.<string>}
 * @const
 * @private
 */
cvox.MathMap.SYMBOLS_FILES_ = [
  // Greek
  'greek-capital.json', 'greek-small.json', 'greek-scripts.json',
  'greek-mathfonts.json',

  // Latin
  'latin-lower-double-accent.json', 'latin-lower-normal.json',
  'latin-lower-phonetic.json', 'latin-lower-single-accent.json',
  'latin-rest.json', 'latin-upper-double-accent.json',
  'latin-upper-normal.json', 'latin-upper-single-accent.json',
  'latin-mathfonts.json',

  // Math Symbols
  'math_angles.json', 'math_arrows.json', 'math_characters.json',
  'math_delimiters.json', 'math_digits.json', 'math_geometry.json',
  'math_harpoons.json', 'math_symbols.json', 'math_whitespace.json',
  'other_stars.json'
];


/**
 * Array of JSON filenames containing symbol definitions for math speak.
 * @type {Array.<string>}
 * @const
 * @private
 */
cvox.MathMap.FUNCTIONS_FILES_ = ['elementary.json', 'trigonometry.json'];


/**
 * Loads JSON for a given file name.
 * @param {string} file A valid filename.
 * @return {string} A string representing JSON array.
 */
cvox.MathMap.loadFile = function(file) {
  try {
    return cvox.MathMap.readJSON_(file);
  } catch (x) {
    console.log('Unable to load file: ' + file + ', error: ' + x);
  }
};


/**
 * Loads a list of JSON files.
 * @param {Array.<string>} files An array of valid filenames.
 * @return {Array.<string>} A string representing JSON array.
 */
cvox.MathMap.loadFiles = function(files) {
  return files.map(cvox.MathMap.loadFile);
};


/**
 * Creates an array of JSON objects from a list of files.
 * @param {Array.<string>} files An array of filenames.
 * @return {Array.<Object>} Array of JSON objects.
 */
cvox.MathMap.fromJSON = function(files) {
  var strs = cvox.MathMap.loadFiles(files);

  return [].concat.apply([], strs.map(
      // Note: As JSON.parse does not expect the value index as the second
      // parameter, we wrap it.
      function(value) { return JSON.parse(value); }));
};


/**
 * Takes path to a JSON file and returns a JSON object.
 * @param {string} path Contains the path to a JSON file.
 * @return {string} JSON.
 * @private
 */
cvox.MathMap.readJSON_ = function(path) {
  var url = chrome.extension.getURL(path);
  if (!url) {
    throw 'Invalid path: ' + path;
    }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send();
  return xhr.responseText;
};
