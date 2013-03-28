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
goog.require('cvox.MathNodeRules');
goog.require('cvox.MathUtil');


/**
 * Create a unicode mapping.
 * @param {Array.<Object>} atoms Array of symbol mappings.
 * @constructor
 */
cvox.MathNode = function(atoms) {

  /**
   * Domain mapping from preconditions to rule keys.
   * @type {Array.<[{node: string,
   *           constraints: Array.<string|null>}, string]>}
   * @private
   */
  this.nodeDomain_ = [];

  /**
   * Codomain mapping from rule keys to atoms.
   * @type {Object}
   * @private
   */
  this.nodeCodomain_ = {};

  /**
   * List of domain names.
   * @type {Array.<string>}
   */
  this.domains = [];

  /**
   * List of rule names.
   * @type {Array.<string>}
   */
  this.rules = [];

  this.initNodeMap_(atoms);
};
goog.addSingletonGetter(cvox.MathNode);


/**
 * Initializes the surjective mapping for the mathematical nodes.
 * @param {Array.<Object>} atoms Array of initial mappings for
 * some elementary nodes.
 * @private
 */
cvox.MathNode.prototype.initNodeMap_ = function(atoms) {
  var domains = [];
  var rules = [];
  for (var i = 0, func; func = atoms[i]; i++) {
    var funcObject = cvox.MathAtom.make(func.key, func.category, func.mappings);
    this.nodeCodomain_[func.key] = funcObject;
    domains = cvox.MathUtil.union(domains, funcObject.allDomains());
    rules = cvox.MathUtil.union(rules, funcObject.allRules());
    for (var j = 0, key; key = func['names'][j]; j++) {
      if (typeof(key) === 'string') {
        this.nodeDomain_.push([{'node': key, 'constraints': []}, func.key]);
      } else {
        this.nodeDomain_.push([key, func.key]);
      }
    }
  }
  this.domains = domains;
  this.rules = rules;
};


/**
 * Gets the rule postcondition for a given precondition.
 * @param {[{node: string,
 *           constraints: Array.<string|null>}, string]} prec The Precondition.
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
 * @return {{node: string,
 *           constraints: Array.<string|null>}} prec The precondition.
 * @private
 */
cvox.MathNode.testPrecondition_ = function(node, prec) {
  return cvox.MathUtil.applyFunction(node, prec.node) === node &&
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


/**
 * Retrieves a rule for the given node if one exists.
 * @param {Node} node A node.
 * @return {cvox.MathAtom} The Atom if it exists.
 */
cvox.MathNode.prototype.getRuleForNode = function(node) {
  if (node && node.nodeType == Node.ELEMENT_NODE) {
    var appAtoms = this.nodeDomain_.filter(function(x) {
      return cvox.MathNode.testPrecondition_(node, x[0]);
    });
    // In case of multiple applicable rules we currently take the most
    // constraint rule. In case of a tie the initial rule order will decide.
    return (appAtoms.length > 0) ? this.pickMostConstraint_(appAtoms) : null;
  }
  return null;
};


/**
 * Initializes the Node mappings from a hardcoded list of objects.
 * @return {cvox.MathNode} The newly initialized Math node object.
 */
cvox.MathNode.create = function() {
  return new cvox.MathNode(cvox.MathNodeRules.DEFAULT_SPEECH_RULES);
};
