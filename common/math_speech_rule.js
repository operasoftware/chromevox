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
 * @fileoverview Speech rules for mathematical expressions.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathSpeechRule');


/**
 * Mapping for types of speech rule components.
 * @enum {string}
 */
cvox.MathSpeechRule.type = {
  NODE: 'node',
  MULTI: 'multi',
  TEXT: 'text',
  STRING: 'string',
  PERSONALITY: 'personality'
};


/**
 * Atomic component describing how to aurally render text.
 * @typedef {{type: cvox.MathSpeechRule.type,
 *            content: (string|undefined),
 *            context: (string|undefined),
 *            ctxtfunc: (string|undefined),
 *            separator: (string|undefined),
 *            pitch: (string|undefined),
 *            pause: (string|undefined),
 *            rate: (string|undefined),
 *            volume: (string|undefined)}}
 */
cvox.MathSpeechRule.component;


/**
 * Set of rendering components that apply to a specific partial tree.
 * @typedef {Array.<cvox.MathSpeechRule.component>}
 */
cvox.MathSpeechRule.rule;


/**
 * Application condition for speech rules.
 * @typedef {{node: string, constraints: Array.<string>}}
 */
cvox.MathSpeechRule.precondition;


// TODO (sorge) Separatation of xpath expressions and custom functions.
// Also test validity of xpath expressions.
/**
 * Constructs a valid precondition for a speech rule.
 * @param {string} selector A node selector function or xpath expression.
 * @param {Array.<string>=} constrs A list of constraint functions.
 * @return {cvox.MathSpeechRule.precondition} The precondition.
 */
cvox.MathSpeechRule.makePrecondition = function(selector, constrs) {
  constrs = constrs || [];
  return {'node': selector, 'constraints': constrs};
};


// Rule parsing. A global error function takes care of giving feedback
// that is important for developers customizing rules.
/**
 * Error object for signaling parsing errors.
 * @param {string} msg The error message.
 * @constructor
 * @extends {Error}
 * @private
 */
cvox.MathSpeechRule.outputError_ = function(msg) {
  this.name = 'RuleError';
  this.message = msg || '';
};
goog.inherits(cvox.MathSpeechRule.outputError_, Error);


// Parsing rule strings to JSON object representation.
/**
 * Mapping for strings to type of speech rule components.
 * @type {Object.<string, cvox.MathSpeechRule.type>}
 * @private
 */
cvox.MathSpeechRule.parseType_ = {
  '[n]': cvox.MathSpeechRule.type.NODE,
  '[m]': cvox.MathSpeechRule.type.MULTI,
  '[t]': cvox.MathSpeechRule.type.TEXT,
  '[s]': cvox.MathSpeechRule.type.STRING,
  '[p]': cvox.MathSpeechRule.type.PERSONALITY
};


/**
 * Translates a rule string into an array of component objects.
 * @param {string} str The input rule.
 * @return {cvox.MathSpeechRule.rule} The JSON representation of the rule.
 */
cvox.MathSpeechRule.parseRule = function(str) {
  var comps = str.split(';').
      filter(function(x) {return x.match(/\S/);}).
          map(function(x) {return x.trim();});
  var newComps = [];
  for (var i = 0; i < comps.length; i++) {
    var comp = cvox.MathSpeechRule.parseComp(comps[i]);
    if (comp) {
      newComps.push(comp);
    }
  }
  return newComps;
};


/**
 * Adds a single attribute to the component.
 * @param {string} attr String representation of an attribute.
 * @param {cvox.MathSpeechRule.component} comp The augmented component.
 */
cvox.MathSpeechRule.parseAttribute = function(attr, comp) {
  var colon = attr.indexOf(':');
  if (colon == -1) {
    comp[attr.trim()] = 'true';
  } else {
    comp[attr.substring(0, colon).trim()] = attr.slice(colon + 1).trim();
  }
};


/**
 * Adds a list of attributes to the component.
 * @param {string} attrs String representation of attribute list.
 * @param {cvox.MathSpeechRule.component} comp The augmented component.
 */
cvox.MathSpeechRule.parseAttributes = function(attrs, comp) {
  if (attrs[0] != '(' || attrs.slice(-1) != ')') {
    throw new cvox.MathSpeechRule.outputError_('Invalid attribute expression.');
  }
  var attribs = attrs.slice(1, -1).split(',');
  for (var i = 0; i < attribs.length; i++) {
    cvox.MathSpeechRule.parseAttribute(attribs[i], comp);
  }
};


/**
 * Translates a component string into a JSON representation.
 * @param {string} str The input component.
 * @return {cvox.MathSpeechRule.component} JSON representation.
 */
cvox.MathSpeechRule.parseComp = function(str) {
  var comp = /** @type {cvox.MathSpeechRule.component} */ ({});
  var type = cvox.MathSpeechRule.parseType_[str.substring(0, 3)];
  if (!type) {
    throw new cvox.MathSpeechRule.outputError_('Invalid type.');
  }
  comp['type'] = type;
  var rest = str.slice(3).trimLeft();
  if (!rest) {
    throw new cvox.MathSpeechRule.outputError_('Missing content.');
  }
  switch (type) {
    case cvox.MathSpeechRule.type.STRING:
      var quot = rest.indexOf('"', 1);
      if (rest[0] != '"' || quot == -1) {
        throw new cvox.MathSpeechRule.outputError_('Invalid string syntax.');
      }
      comp['content'] = rest.substring(1, quot).trim();
      rest = rest.slice(quot + 1).trimLeft();
    break;
    case cvox.MathSpeechRule.type.NODE:
    case cvox.MathSpeechRule.type.MULTI:
    case cvox.MathSpeechRule.type.TEXT:
      var bracket = rest.indexOf(' (');
      if (bracket == -1) {
        comp['content'] = rest.trim();
        return comp;
      }
      comp['content'] = rest.substring(0, bracket).trim();
      rest = rest.slice(bracket).trimLeft();
    break;
  }
  if (rest) {
    cvox.MathSpeechRule.parseAttributes(rest, comp);
  }
  return comp;
};


// Stringify Rules given as JSON objects.
/**
 * Mapping for types of speech rule components.
 * @type {Object.<cvox.MathSpeechRule.type, string>}
 * @private
 */
cvox.MathSpeechRule.stringifyType_ =
  function() {
    var obj = {};
    for (var key in cvox.MathSpeechRule.parseType_) {
      obj[cvox.MathSpeechRule.parseType_[key]] = key;
      }
    return obj;
  }();


/**
 * Transforms the attributes of an object into a list of strings.
 * @param {!cvox.MathSpeechRule.component} comp The rule component.
 * @return {Array.<string>} List of translated attribute:value strings.
 */
cvox.MathSpeechRule.stringifyAttrib = function(comp) {
  var attribs = [];
  for (var key in comp) {
    if (key != 'content' && key != 'type') {
      attribs.push(key + ':' + comp[key]);
    }
  }
  return attribs;
};


/**
 * Transforms a component of a speech rule to a string.
 * @param {!cvox.MathSpeechRule.component} comp An component from a speech rule.
 * @return {string} The translated component.
 */
cvox.MathSpeechRule.stringifyComp = function(comp) {
  var strs = '';
  strs += cvox.MathSpeechRule.stringifyType_[comp['type']];
  var qt = comp['type'] === cvox.MathSpeechRule.type.STRING ? '"' : '';
  strs += comp['content'] ? ' ' + qt + comp['content'] + qt : '';
  var attribs = cvox.MathSpeechRule.stringifyAttrib(comp);
  if (attribs.length > 0) {
    strs += ' (' + attribs.join(', ') + ')';
  }
  return strs;
};


/**
 * Transform speech rule objects to strings.
 * @param {!cvox.MathSpeechRule.rule} rule A list of components
 *    comprising a rule.
 * @return {string} The rewritten rule.
 */
cvox.MathSpeechRule.stringifyRule = function(rule) {
  var comps = rule.map(cvox.MathSpeechRule.stringifyComp);
  return comps.join('; ');
};
