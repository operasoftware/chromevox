/**
 * @fileoverview A collection of JavaScript utilities used to simplify working
 * with xpaths.
 * @author clchen@google.com (Charles L. Chen)
 */


goog.provide('cvox.XpathUtil');


/**
 * Utilities for simplifying working with xpaths
 * @constructor
 */
cvox.XpathUtil = function() {
 };


/**
 * Given an XPath expression and rootNode, it returns an array of children nodes
 * that match. The code for this function was taken from Mihai Parparita's GMail
 * Macros Greasemonkey Script.
 * http://gmail-greasemonkey.googlecode.com/svn/trunk/scripts/gmail-new-macros.user.js
 * @param {string} expression The XPath expression to evaluate.
 * @param {Node} rootNode The HTML node to start evaluating the XPath from.
 * @return {Array} The array of children nodes that match.
 */
cvox.XpathUtil.evalXPath = function(expression, rootNode) {
  try {
    var xpathIterator = rootNode.ownerDocument.evaluate(
      expression,
      rootNode,
      null, // no namespace resolver
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null); // no existing results
  } catch (err) {
    return [];
  }
  var results = [];
  // Convert result to JS array
  for (var xpathNode = xpathIterator.iterateNext();
       xpathNode;
       xpathNode = xpathIterator.iterateNext()) {
    results.push(xpathNode);
  }
  return results;
};

/**
 * Given a rootNode, it returns an array of all its leaf nodes.
 * @param {Node} rootNode The node to get the leaf nodes from.
 * @return {Array} The array of leaf nodes for the given rootNode.
 */
cvox.XpathUtil.getLeafNodes = function(rootNode) {
  try {
    var xpathIterator = rootNode.ownerDocument.evaluate(
      './/*[count(*)=0]',
      rootNode,
      null, // no namespace resolver
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null); // no existing results
  } catch (err) {
    return [];
  }
  var results = [];
  // Convert result to JS array
  for (var xpathNode = xpathIterator.iterateNext();
       xpathNode;
       xpathNode = xpathIterator.iterateNext()) {
    results.push(xpathNode);
  }
  return results;
};

