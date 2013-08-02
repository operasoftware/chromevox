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
 * @fileoverview Mappings for math syntax tree nodes.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathNode');

goog.require('cvox.DomUtil');
goog.require('cvox.MathAtom');
goog.require('cvox.MathUtil');
goog.require('cvox.SpeechRule');
goog.require('cvox.SpeechRuleStore');
goog.require('cvox.TraverseMath');


/**
 * Create a unicode mapping.
 * @constructor
 * @implements {cvox.SpeechRuleStore}
 */
cvox.MathNode = function() {

  // TODO (sorge) Make this into a proper type!
  /**
   * Domain mapping from preconditions to rule keys.
   * @type {Array.<cvox.SpeechRule.Precondition, string>}
   * @private
   */
  this.nodeDomain_ = [];

  /**
   * Codomain mapping from rule keys to atoms.
   * @type {Object.<string, cvox.MathAtom>}
   * @private
   */
  this.nodeCodomain_ = {};

};
goog.addSingletonGetter(cvox.MathNode);



/**
 * Gets the rule postcondition for a given precondition.
 * @param {[cvox.SpeechRule.precondition, string]} prec The Precondition.
 * @return {cvox.MathAtom} The postcondition.
 * @private
 */
cvox.MathNode.prototype.mapPreToPostCondition_ = function(prec) {
  var key = prec[1];
  return this.nodeCodomain_[key];
};


/**
 * Test the precondition of a speech rule.
 * @param {Node} node on which to test applicability of the rule.
 * @param {cvox.SpeechRule.Precondition} prec The precondition.
 * @return {boolean} True if the preconditions apply to the node.
 * @private
 */
cvox.MathNode.testPrecondition_ = function(node, prec) {
  return cvox.MathUtil.applyFunction(node, prec.query) === node &&
      prec.constraints.every(
          function(cstr) {
            return cvox.MathUtil.applyConstraint(node, cstr);});
};


/**
 * Picks the result of the most constraint rule.
 * @param {Array} rules An array of rules.
 * @return {cvox.MathAtom} The postcondition.
 * @private
 */
cvox.MathNode.prototype.pickMostConstraint_ = function(rules) {
  var sortedRules = rules.sort(function(r1, r2) {
    return r2[0].constraints.length - r1[0].constraints.length;});
  return this.mapPreToPostCondition_(sortedRules[0]);
};


// TODO (sorge) Add logic to append mappings to an existing rule or overwrite
// existing rules.
/**
 * Adds a new speech rule from given components.
 * @param {string} key Unique rule key.
 * @param {string} category Rule category.
 * @param {cvox.SpeechRule.Precondition} prec Precondition of the rule.
 * @param {Object.<string, Object.<string, cvox.SpeechRule.Rule>>} rules
 *     The actual speech rules.
 */
cvox.MathNode.prototype.addRule = function(key, category, prec, rules) {
  var atom = this.nodeCodomain_[key];
  if (atom) {
    atom.addMappings(rules);
  } else {
    atom = new cvox.MathAtom(key, category, rules);
    this.nodeCodomain_[key] = atom;
  }
  cvox.TraverseMath.getInstance().addDomainsAndStyles(
      atom.allDomains(), atom.allStyles());
  this.nodeDomain_.push([prec, key]);
};


/**
 * Adds a new speech rule from given components.
 * @param {string} key Unique rule key.
 * @param {cvox.SpeechRule.Precondition} prec Precondition of the rule.
 */
cvox.MathNode.prototype.addAlias = function(key, prec) {
  if (!this.nodeCodomain_[key]) {
    console.log('Rule Error ', key, ': Invalid rules. No alias defined.');
    return;
  }
  this.nodeDomain_.push([prec, key]);
};


// API for defining rules.
/**
 * @override
 */
cvox.MathNode.prototype.defineRule =
    function(key, category, domain, rule, prec, constr) {
  var domainPair = domain.split('.');
  if (!domainPair[0] || !domainPair[1]) {
    console.log('Rule Error ', key, ': Invalid domain assignment.');
    return;
  }
  var mappingOuter = {};
  var mappingInnter = {};
  try {
    mappingInnter[domainPair[1]] = cvox.SpeechRule.Rule.fromString(rule);
    mappingOuter[domainPair[0]] = mappingInnter;
  } catch (err) {
    if (err.name == 'RuleError') {
      console.log('Rule Error ', key, ':', err.message);
    }
    else {
      throw err;
    }
  }
  var constrList = Array.prototype.slice.call(arguments, 5);
  var fullPrec = new cvox.SpeechRule.Precondition(prec, constrList);
  cvox.MathNode.getInstance().addRule(key, category, fullPrec, mappingOuter);
};


/**
 * Retrieves a Math Atom from the rule store for the given node.
 * @param {!Node} node A node.
 * @return {cvox.MathAtom} The atom if it exists.
 */
cvox.MathNode.prototype.retrieveAtom = function(node) {
  var appAtoms = this.nodeDomain_.filter(function(x) {
    return cvox.MathNode.testPrecondition_(node, x[0]);
  });
  // In case of multiple applicable rules we currently take the most
  // constraint rule. In case of a tie the initial rule order will decide.
  return (appAtoms.length > 0) ? this.pickMostConstraint_(appAtoms) : null;
};

/**
 * @override
 */
cvox.MathNode.prototype.lookupRule = function(node) {
  if (node && node.nodeType == Node.ELEMENT_NODE) {
    var rule = this.retrieveAtom(node);
    if (rule) {
      cvox.MathNode.outputDebug('Applying rule', rule.key, 'to node', node);
    }
    return rule ?
        rule.mappingRule(cvox.TraverseMath.getInstance().domain,
                         cvox.TraverseMath.getInstance().style) :
                             null;
  }
  return null;
};


/**
 * Adds a new MathML speech rule.
 * @param {string} key Unique rule key.
 * @param {string} domain Domain annotation of the rule.
 * @param {string} rule String version of the speech rule.
 */
cvox.MathNode.prototype.defineMathmlRule = function(key, domain, rule) {
  this.defineRule(key, 'Mathml', domain, rule, 'self::mathml:' + key);
};


/**
 * Adds a new MathML speech rule for the default.default domain.
 * @param {string} key Unique rule key.
 * @param {string} rule String version of the speech rule.
 */
cvox.MathNode.prototype.defineDefaultMathmlRule = function(key,  rule) {
  this.defineRule(key, 'Mathml', 'default.default',
                  rule, 'self::mathml:' + key);
};

/**
 * Adds an alias for an existing rule.
 * @param {string} key Unique rule key.
 * @param {string} prec Precondition of the rule.
 * @param {...string} constr Additional constraints.
 */
cvox.MathNode.prototype.defineRuleAlias = function(key, prec, constr) {
  var constrList = Array.prototype.slice.call(arguments, 2);
  var fullPrec = new cvox.SpeechRule.Precondition(prec, constrList);
  this.addAlias(key, fullPrec);
};


// Debugging machinery
/**
 * Turns the list of all current rules in ChromeVox into legible output.
 * @return {Array.<string>} List of rule strings.
 */
cvox.MathNode.prototype.printAllRules = function() {
  var result = [];
  for (var key in this.nodeCodomain_) {
    result.push(this.nodeCodomain_[key].toString());
  }
  return result;
};


/**
 * Flag for the debug mode of Math speech rules.
 * @type {boolean}
 */
cvox.MathNode.DEBUG_MODE = false;


/**
 * Give debug output.
 * @param {...*} output Rest elements of debug output.
 */
cvox.MathNode.outputDebug = function(output) {
  if (cvox.MathNode.DEBUG_MODE) {
    var outputList = Array.prototype.slice.call(arguments, 0);
    console.log.apply(console, ['Math Node Debugger:'].concat(outputList));
  }
};


/**
 * Prints the list of all current rules in ChromeVox to the console.
 */
cvox.MathNode.printRules = function() {
   cvox.MathNode.getInstance().printAllRules().forEach(
       function(x) {cvox.MathNode.outputDebug(x);});
};


/**
 * Test the precondition of a speech rule in debugging mode.
 * @param {string} name Rule to debug.
 * @param {Node} node DOM node to test applicability of the rule.
 */
cvox.MathNode.debugSpeechRule = function(name, node) {
  /** @type {Array.<cvox.SpeechRule.Precondition>} */
  var precs = cvox.MathNode.getInstance().nodeDomain_.filter(function(x) {
    return x[1] == name;
  }).map(function(x) {return x[0];});

  for (var i = 0, prec; prec = precs[i]; i++) {
    cvox.MathNode.outputDebug('Rule', name, 'number', i);
    cvox.MathNode.outputDebug(prec.query,
                              cvox.MathUtil.applyFunction(node, prec.query));
    prec.constraints.forEach(
        function(cstr) {
          cvox.MathNode.outputDebug(
              cstr, cvox.MathUtil.applyConstraint(node, cstr));});
  }
};
