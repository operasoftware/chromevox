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
goog.require('cvox.ChromeVox');
goog.require('cvox.MathAtom');
goog.require('cvox.MathNode');
goog.require('cvox.MathNodeRules');
goog.require('cvox.MathUtil');
goog.require('cvox.NavMathDescription');
goog.require('cvox.SpeechRuleEvaluator');
goog.require('cvox.TraverseMath');


/**
 * Create a math speech object.
 * @constructor
 * @param {{domain : (undefined|string)}=} kwargs Optional parameter to define
 * the mathematical domain and possibly some other arguments in the future.
 * Defaults to 'default'.
 * @implements {cvox.SpeechRuleEvaluator}
 */
cvox.MathSpeak = function(kwargs) {
  kwargs = kwargs || {domain: 'default', rule: 'short'};

  /**
   * Current domain.
   * @type {string}
   */
  this.domain = kwargs['domain'];

  /**
   * Current rule.
   * @type {string}
   */
  this.rule = kwargs['rule'];

  /**
   * A node mapping object.
   * @type {cvox.MathNode}
   * @private
   */
  this.nodes_ = cvox.MathNode.getInstance();
  cvox.MathNodeRules.getInstance();

  /**
   * Indicated if math mappings for Android devices exist.
   * @type {boolean}
   * @private
   */
  this.hasAndroidMap_ = cvox.ChromeVox.host['mathMap'] != undefined;

  // TODO (sorge) Here we should also add customisations.

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
      // Break up string even further wrt. symbols vs alphanum substrings.
      var rest = s;
      var count = 0;
      while (rest) {
        // TODO (sorge) Write tests for this expression when math speak is
        // refactored.
        var num = rest.match(/^\d+((\.|,)\d+)*|((\.|,)\d+)+/);
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
 * @return {cvox.NavDescription} Navigation description for the
 *     math expression.
 */
cvox.MathSpeak.prototype.speak = function(text, action, alt) {
  if (this.hasAndroidMap_) {
    return cvox.ChromeVox.host['mathMap'].speak(
        text, action, alt, this.rule, this.domain);
  }
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
 * @return {cvox.NavDescription} Navigation description for the math
 *     expression.
 */
cvox.MathSpeak.prototype.speakFunction = function(func) {
  return this.speak(func, cvox.MathAtom.Types.FUNCTION, func);
};


/**
 * Creates Navigation Description for a single character.
 * @param {string} code A string of length exactly one.
 * @return {cvox.NavDescription} Navigation description for the math
 *     expression.
 */
cvox.MathSpeak.prototype.speakCharacter = function(code) {
  if (code.length == 1) {
    return this.speak(code, cvox.MathAtom.Types.SYMBOL, code);
  }
};


/**
 * Creates Navigation Description for a character composed of two surrogate
 * halves.
 * @param {string} code A string of length exactly one.
 * @return {cvox.NavDescription} Navigation description for the math
 *     expression.
 */
cvox.MathSpeak.prototype.speakSurrogate = function(code) {
  return this.speak(code, cvox.MathAtom.Types.SURROGATE, code);
};


/**
 * Creates Navigation Description for unidentified character sequence.
 * @param {string} code A string of length exactly one.
 * @return {cvox.NavDescription} Navigation description for the math
 *     expression.
 */
cvox.MathSpeak.prototype.speakMsg = function(code) {
  return this.speak(code, cvox.MathAtom.Types.REST, code);
};


/**
 * Recursively speaks a tree.
 * @param {Node} tree The root node of the tree.
 * @return {!Array.<cvox.NavDescription>} A list of navigation descriptions for
 *    that tree.
 */
cvox.MathSpeak.prototype.speakTree = function(tree) {
  var rule = this.nodes_.lookupRule(tree);
  if (rule) {
    return this.evaluateRule(rule, tree);
  }
  return this.speakString(tree.textContent || '');
};


/**
 * Speaks a node according to a given rule.
 * @param {cvox.SpeechRule.Rule} rule A speech rule.
 * @param {Node} node to apply the speech rule to.
 * @return {!Array.<cvox.NavDescription>} A list of Navigation descriptions.
 */
cvox.MathSpeak.prototype.evaluateRule = function(rule, node) {
  var components = rule.components;
  var result = [];
  for (var i = 0, component; component = components[i]; i++) {
    var navs = [];
    var content = component['content'] || '';
    switch (component.type) {
      case cvox.SpeechRule.Type.NODE:
        var selected = cvox.MathUtil.applyFunction(node, content);
        if (selected) {
          navs = this.speakTree(selected);
        }
        break;
      case cvox.SpeechRule.Type.MULTI:
        selected = cvox.MathUtil.applySelector(node, content);
        if (selected) {

          navs = this.speakNodeList(
              selected,
              cvox.MathUtil.constructString(node, component['separator']),
              component['ctxtfunc'],
              cvox.MathUtil.constructString(node, component['context']));
        }
        break;
      case cvox.SpeechRule.Type.TEXT:
        selected = cvox.MathUtil.constructString(node, content);
        if (selected) {
          navs = [new cvox.NavDescription({text: selected})];
        }
        break;
      case cvox.SpeechRule.Type.PERSONALITY:
      default:
        navs = [new cvox.NavDescription({text: content})];
    }
    // Adding overall context if it exists.
    if (navs[0] && component['context'] &&
        component.type != cvox.SpeechRule.Type.MULTI) {
      navs[0]['context'] =
          cvox.MathUtil.constructString(node, component['context']) +
              (navs[0]['context'] || '');
    }
    // Adding personality to the nav descriptions.
    result = result.concat(cvox.MathSpeak.addPersonality(navs, component));
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
  if (nodes == []) {
    return [];
  }
  if (mapp) {
    var mappFunc = cvox.MathUtil.CONTEXT_FUNCTIONS[mapp](nodes, context);
  }
  if (separator) {
    var sepDescr = new cvox.NavDescription({text: '', context: separator});
  }
  var result = [];
  for (var i = 0, node; node = nodes[i]; i++) {
    var navs = this.speakTree(node);
    if (mappFunc) {
      navs[0]['context'] = mappFunc() + (navs[0]['context'] || '');
    }
    result = result.concat(navs);
    if (sepDescr && i < nodes.length - 1) {
      result.push(sepDescr);
    }
  }
  return result;
};


/**
 * Initializes math speak for the given node and translates it.
 * @param {!Node} node The given node.
 * @return {!Array.<cvox.NavDescription>} A list of Navigation descriptions.
 */
cvox.MathSpeak.getDescriptionForNode = function(node) {
  var mathSpeak = new cvox.MathSpeak();
  cvox.TraverseMath.getInstance().initialize(node);
  var ret = mathSpeak.speakTree(cvox.TraverseMath.getInstance().activeNode);
  if (ret == []) {
    return [new cvox.NavDescription({'text': 'empty math'})];
  }
  if (cvox.ChromeVox.verbosity == cvox.VERBOSITY_VERBOSE) {
    ret[ret.length - 1].annotation = 'math';
  }
  ret[0].pushEarcon(cvox.AbstractEarcons.SPECIAL_CONTENT);
  return ret;
};


/**
 * Maps properties in speech rules to personality properties.
 * @type {{pitch : string,
 *         rate: string,
 *         volume: string,
 *         pause: string}}
 * @const
 */
cvox.MathSpeak.propMap = {'pitch': cvox.AbstractTts.RELATIVE_PITCH,
                           'rate': cvox.AbstractTts.RELATIVE_RATE,
                           'volume': cvox.AbstractTts.RELATIVE_VOLUME,
                           'pause': cvox.AbstractTts.PAUSE
                          };


/**
 * List of default personality properties Math resets.
 * @type {Array.<string>}
 * @const
 */
cvox.MathSpeak.defaultPropList = [cvox.AbstractTts.PITCH,
                                  cvox.AbstractTts.RATE];


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
  for (var key in cvox.MathSpeak.propMap) {
    var value = parseFloat(props[key]);
    if (!isNaN(value)) {
      personality[cvox.MathSpeak.propMap[key]] = value;
    }
  }
  navs.forEach(
      function(nav) {
        cvox.DescriptionUtil.addPersonality(nav, personality);
        cvox.MathSpeak.defaultPropList.forEach(
            function(prop) {
              nav.personality[prop] =
                  cvox.ChromeVox.tts.getDefaultProperty(prop);
              });
        });
  return navs;
};


/**
 * Removes all empty strings from an array of strings.
 * @param {Array.<string>} strs An array of strings.
 * @return {Array.<string>} The cleaned array.
 */
cvox.MathSpeak.removeEmpty = function(strs) {
  return strs.filter(function(x) {return x;});
};
