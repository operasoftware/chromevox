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
 * @fileoverview Extension for Chromevox to speak mathematical content.
 * MathSpeak communicates directly with the background page to get translations
 * for symbols in math expressions and to send them to the TTS.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathSpeak');

goog.require('cvox.AbstractTts');
goog.require('cvox.ApiImplementation');
goog.require('cvox.CursorSelection');
goog.require('cvox.DomUtil');
goog.require('cvox.MathAtom');
goog.require('cvox.MathFunction');
goog.require('cvox.MathNode');
goog.require('cvox.MathSymbol');
goog.require('cvox.MathUtil');
goog.require('cvox.NavMathDescription');


/**
 * Create a math speech object.
 * @constructor
 * @param {{domain : (undefined|string)}=} kwargs Optional parameter to define
 * the mathematical domain and possibly some other arguments in the future.
 * Defaults to 'default'.
 */
cvox.MathSpeak = function(kwargs) {
  kwargs = kwargs || {domain: 'default'};

  // TODO (sorge) Currently set manually. These should be removed and
  // values obtained from mappings in the background page via callback.
  this.allDomains = ['default'];
  this.allRules = ['short', 'default', 'alternative'];

  this.setDomain(kwargs.domain);
  this.rule = 'short';

  /**
   * A node mapping object.
   * @type {cvox.MathNode}
   * @private
   */
  this.nodes_ = cvox.MathNode.create();

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


//TODO (sorge) Refactor to use the background page mapping.
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
 * Speaks an array for strings.
 * @param {Array.<string>} seq A list of strings.
 * @return {!Array.<cvox.NavMathDescription>} Messages for the math expression.
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
 * @return {!Array.<cvox.NavMathDescription>} Messages for the math expression.
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
      // Break up string even further wrt. symbols vs alphanum substrings.
      var rest = s;
      var count = 0;
      while (rest) {
        var num = rest.match(/^\d+/);
        var alpha = rest.match(/^[a-zA-Z]+/);
        if (num) {
          descs.push(this.speakMsg(num[0]));
          rest = rest.substring(num[0].length);
        } else if (alpha) {
          descs.push(this.speakFunction(alpha[0]));
          rest = rest.substring(alpha[0].length);
        } else {
          // Dealing with surrogate pairs.
          var chr = rest[0];
          var code = chr.charCodeAt(0);
          if (0xD800 <= code && code <= 0xDBFF &&
              rest.length > 1 && !isNaN(rest.charCodeAt(1))) {
            descs.push(this.speakSurrogate(rest.slice(0, 2)));
            rest = rest.substring(2);
          } else {
            descs.push(this.speakCharacter(rest[0]));
            rest = rest.substring(1);
            }
        }
      }
    }
  }
  return descs;
};


/**
 * Creates a new Navigation Description for a math expression that be used by
 * the background tts.
 * @param {string} text to be translated.
 * @param {string} action that specifies the translation type.
 * @param {string} alt text that is spoken if translation fails.
 * @return {cvox.NavMathDescription} Navigation description for the
 *     math expression.
 */
cvox.MathSpeak.prototype.speak = function(text, action, alt) {
  return new cvox.NavMathDescription({'type': action,
                                      'text': text,
                                      'rule': this.rule,
                                      'domain': this.domain,
                                      'alternative': alt
                                     });
};


/**
 * Creates Navigation Description for a math function. We assume that the
 * incoming string consists only of alpha characters. No whitespaces etc.
 * @param {string} func A string of alpha characters.
 * @return {cvox.NavMathDescription} Navigation description for the math
 *     expression.
 */
cvox.MathSpeak.prototype.speakFunction = function(func) {
  return this.speak(func, cvox.MathSpeak.Types.FUNCTION, func);
};


/**
 * Creates Navigation Description for a single character.
 * @param {string} code A string of length exactly one.
 * @return {cvox.NavMathDescription} Navigation description for the math
 *     expression.
 */
cvox.MathSpeak.prototype.speakCharacter = function(code) {
  if (code.length == 1) {
    return this.speak(code, cvox.MathSpeak.Types.SYMBOL, code);
  }
};


/**
 * Creates Navigation Description for a character composed of two surrogate
 * halves.
 * @param {string} code A string of length exactly one.
 * @return {cvox.NavMathDescription} Navigation description for the math
 *     expression.
 */
cvox.MathSpeak.prototype.speakSurrogate = function(code) {
  return this.speak(code, cvox.MathSpeak.Types.SURROGATE, code);
};


/**
 * Creates Navigation Description for unidentified character sequence.
 * @param {string} code A string of length exactly one.
 * @return {cvox.NavMathDescription} Navigation description for the math
 *     expression.
 */
cvox.MathSpeak.prototype.speakMsg = function(code) {
  return this.speak(code, cvox.MathSpeak.Types.REST, code);
};



/**
 * Recursively speaks a tree.
 * @param {Node|string} tree The root node of the tree.
 * @return {!Array.<cvox.NavDescription>} A list of navigation descriptions for
 *    that tree.
 */
cvox.MathSpeak.prototype.speakTree = function(tree) {
  if (typeof(tree) === 'string') {
    return this.speakString(tree);
  }
  var rule = this.nodes_.getRuleForNode(tree);
  if (rule) {
    return this.speakNode(rule.mappingRule(this.domain, this.rule), tree);
  }
  return this.speakString(tree.textContent);
};


/**
 * Speaks a node according to a given rule.
 * @param {Array.<string|Object|null>} rule An array representing a speech rule.
 * @param {Node} node to apply the speech rule to.
 * @return {!Array.<cvox.NavDescription>} A list of Navigation descriptions.
 */
cvox.MathSpeak.prototype.speakNode = function(rule, node) {
  var result = [];
  for (var i = 0, elem; elem = rule[i]; i++) {
    if (typeof(elem) === 'string') {
      result.push(new cvox.NavDescription({text: elem}));
    } else {
      var navs = [];
      if (elem['function']) {
        navs = this.speakTree(
            cvox.MathUtil.applyFunction(node, elem['function']));
        if (elem['context']) {
          navs[0]['context'] = elem['context'];
        }
      } else if (elem['selector']) {
        navs = this.speakNodeList(
            cvox.MathUtil.applySelector(node, elem['selector']),
            elem['separator'], elem['cont-function'], elem['cont-string']);
      }
      result = result.concat(
        cvox.MathSpeak.addPersonality(navs, elem));
    }
  }
  return result;
};


/**
 * Translates a list of nodes into a list of navigation descriptions.
 * @param {Array.<Node>} nodes Array of nodes.
 * @param {string} separator A string to be interspersed between each element
 *     of the list.
 * @param {string} mapp Name of a function applied to the nodes rest list in
 *     each iteration.
 * @param {string} context Additional context string that is given to the mapp
 *     function.
 * @return {Array.<cvox.NavDescription>} A list of Navigation descriptions.
 */
cvox.MathSpeak.prototype.speakNodeList = function(nodes, separator,
                                                 mapp, context) {
  if (mapp) {
    var mappFunc = eval('cvox.MathUtil.' + mapp).call(
        undefined, nodes, context);
  }
  if (separator) {
    var sepDescr = new cvox.NavDescription({text: separator});
  }
  var result = [];
  for (var i = 0, node; node = nodes[i]; i++) {
    var navs = this.speakTree(node);
    if (mappFunc) {
      navs[0]['context'] = mappFunc.call();
    }
    result = result.concat(navs);
    if (sepDescr && i < nodes.length - 1) {
      result.push(sepDescr);
    }
  }
  return result;
};


/**
 * Maps properties in speech rules to personality properties.
 * @type {{pitch : string,
 *         rate: string,
 *         volume: string}}
 * @const
 */
cvox.MathSpeak.propList = {'pitch': cvox.AbstractTts.RELATIVE_PITCH,
                           'rate': cvox.AbstractTts.RELATIVE_RATE,
                           'volume': cvox.AbstractTts.RELATIVE_VOLUME};


/**
 * Adds personality to every Navigation Descriptions in input list.
 * @param {Array.<cvox.NavDescription>} navs A list of Navigation descriptions.
 * @param {Object} props Property dictionary.
 * TODO (sorge) Fully specify, when we have finalised the speech rule
 * format.
 * @return {Array.<cvox.NavDescription>} The modified array.
 */
cvox.MathSpeak.addPersonality = function(navs, props) {
  var personality = {};
  for (var key in cvox.MathSpeak.propList) {
    var value = parseFloat(props[key]);
    if (!isNaN(value)) {
      personality[cvox.MathSpeak.propList[key]] = value;
    }
  }
  return navs.map(function(nav)
                  {return cvox.DescriptionUtil.addPersonality(nav,
                                                              personality);});
};


/**
 * Removes all empty strings from an array of strings.
 * @param {Array.<string>} strs An array of strings.
 * @return {Array.<string>} The cleaned array.
 */
cvox.MathSpeak.removeEmpty = function(strs) {
  return strs.filter(function(x) {return x;});
};


/**
 * Types for the MathSpeak object.
 * @enum {string}
 */
cvox.MathSpeak.Types = {
  SURROGATE: 'surrogate',
  SYMBOL: 'symbol',
  FUNCTION: 'function',
  REST: 'rest'
};
