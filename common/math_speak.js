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
 * @fileoverview Extension for Chromevox to speak mathematical content.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathSpeak');

goog.require('cvox.ApiImplementation');
goog.require('cvox.CursorSelection');
goog.require('cvox.MathAtom');
goog.require('cvox.MathFunction');
goog.require('cvox.MathSymbol');
goog.require('cvox.MathUtil');
goog.require('cvox.NavDescription');


/**
 * Create a math speech object.
 * @constructor
 * @param {{domain : (undefined|string)}=} kwargs Optional parameter to define
 * the mathematical domain and possibly some other arguments in the future.
 * Defaults to 'default'.
 */
cvox.MathSpeak = function(kwargs) {
  kwargs = kwargs || {domain: 'default'};

  this.functions = new cvox.MathFunction();
  this.symbols = new cvox.MathSymbol();
  this.allDomains = cvox.MathUtil.union(this.functions.domains,
                                        this.symbols.domains);
  this.allRules = cvox.MathUtil.union(this.functions.rules,
                                      this.symbols.rules);
  this.setDomain(kwargs.domain);
  this.rule = 'short';

  // TODO (sorge) Here we should also add customisations.

};



/**
 *  Sets the domain for the MathSpeak object.
 * @param {string} domain Name of the domain.
 */
cvox.MathSpeak.prototype.setDomain = function(domain) {
  if (this.allDomains.indexOf(domain) != -1) {
    this.domain = domain;
  } else {
    console.log('Domain ' + domain + ' does not exist!');
    this.domain = 'default';
  }
};


/**
 * Sets the domain for the MathSpeak object to the next one in the list
 * restarting from the first, if necessary.
 * @return {string} The name of the newly set domain.
 */
cvox.MathSpeak.prototype.cycleDomain = function() {

  var index = this.allDomains.indexOf(this.domain);
  ++index;

  if (index == this.allDomains.length) {
    this.domain = this.allDomains[0];
    } else {
      this.domain = this.allDomains[index];
    }
  return this.domain;
};


/**
 * Speaks elements of a given cursor selection.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {!Array.<cvox.NavDescription>} Messages for the math expression.
 */
cvox.MathSpeak.prototype.speakSelection = function(sel) {
  // TODO (sorge) need to traverse the selection if it is more complex
  // than what we have so far.
  var descs = new Array();
  return descs.concat(this.speakString(sel.getText()));
};


/**
 * Speaks an array for strings.
 * @param {Array.<string>} seq A list of strings.
 * @return {!Array.<cvox.NavDescription>} Messages for the math expression.
 */
cvox.MathSpeak.prototype.speakSequence = function(seq) {

  var descs = new Array();
  var seq = cvox.MathSpeak.removeEmpty(seq);
  for (var i = 0, symbol; symbol = seq[i]; i++) {
    descs = descs.concat(this.speakString(symbol));
    }
  return descs;
};


/**
 * Speaks a single string from  a math expressions. The method first
 * decides what are single characters, function names or words,
 * possibly splitting up the string if necessary. It then calls the appropriate
 * functions to have things spoken.
 * @param {string} str A string.
 * @return {!Array.<cvox.NavDescription>} Messages for the math expression.
 */
cvox.MathSpeak.prototype.speakString = function(str) {

  var descs = new Array();
  if (str.match(/^\s+$/)) {
    // Nothing but whitespace: Ignore
    return descs;
  }
  var split = cvox.MathSpeak.removeEmpty(str.replace(/\s/g, ' ').split(' '));
  for (var i = 0, s; s = split[i]; i++) {
    if (s.length == 1) {
      descs.push(this.speakCharacter(s));
    } else if (s.match(/^[a-zA-Z]+$/)) {
      descs.push(this.speakFunction(s));
    } else {
      // break up string even further wrt. symbols vs alphanum substrings.
      var rest = s;
      var count = 0;
      while (rest) {
        var anum = rest.match(/^\w+/);
        if (anum) {
          descs.push(this.speakMsg(anum[0]));
          rest = rest.substring(anum[0].length);
        } else
        {
          descs.push(this.speakCharacter(rest[0]));
          rest = rest.substring(1);
        }
      }
    }
  }
  return descs;
};


/**
 *  Speaks a function string. We assume that the incoming string consists only
 * of alpha characters. No whitespaces etc.
 * @param {string} func A string of alpha characters.
 * @return {cvox.NavDescription} Message for the math expression.
 */
cvox.MathSpeak.prototype.speakFunction = function(func) {
  var atom = this.functions.getFunctionByName(func);
  return atom ?
      this.speakMsg(atom.map(this.domain, this.rule)) : this.speakMsg(func);
};


/**
 *  Speaks the name of a single character.
 * @param {string} code A string of length exactly one.
 * @return {cvox.NavDescription} Message for the math expression.
 */
cvox.MathSpeak.prototype.speakCharacter = function(code) {
  if (code.length == 1) {
    var atom = this.symbols.getSymbolByCode(code.charCodeAt(0));
    return atom ?
        this.speakMsg(atom.map(this.domain, this.rule)) : this.speakMsg(code);
  }
};


/**
 * Speaks a string, but downcases it first!
 * @param {string} str A string that is wrapped into a navigation description.
 * @return {cvox.NavDescription} Message for the math expression.
 */
cvox.MathSpeak.prototype.speakMsg = function(str) {
  return new cvox.NavDescription({text: str});
  // TODO (sorge) here we can add domain specific annotations if
  // there are any in the speak objects.
};


/**
 * Removes all empty strings from an array of strings.
 * @param {Array.<string>} strs An array of strings.
 * @return {Array.<string>} The cleaned array.
 */
cvox.MathSpeak.removeEmpty = function(strs) {
  return strs.filter(function(x) {return x;});
};
