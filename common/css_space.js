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
 * @fileoverview An object that represents the CSS vector space.
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.CssSpace');

goog.require('cvox.CssDimension');
goog.require('cvox.DomUtil');

/**
 * CSS declarations of relevance.
 * Each additional declaration adds a new dimension to our space.
 * @type {Array.<cvox.CssDimension>}
 */
cvox.CssSpace.dimensions = [
    {name:'font-size', threshold: 2}
                            ];

/**
 * A collection of groups derived from the partitioning of points in CSS space.
 * @type {Array}
 */
cvox.CssSpace.groups = [];

/**
 * Called to set-up our CSS vector space.
 */
cvox.CssSpace.initializeSpace = function() {
  // Preprocessing stage: Flatten the DOM into an array excluding non-content
  // nodes.
  var flat = [];
  cvox.CssSpace.getFlattenedSubtree(document.body, flat);

  // Metrics and grouping stage: calculate distances and group.
  // There is implicitly a flat.length by flat.length matrix that gets populated
  // with distances between the node at (i, j).
  // Only visit the upper triangular entries of the matrix as the matrix is
  // symmetric.
  for (var i = 0; i < flat.length; ++i) {
    for (var j = i + 1; j < flat.length; ++j) {
      var start = flat[i];
      var end = flat[j];

      // Nodes that exceed threshold on some dimension get skipped.
      if (cvox.CssSpace.getDistance(start, end) == -1)
        continue;

      if (start['cvox-group'] && start['cvox-group'].indexOf(end) == -1) {
        // |Start| has been previously grouped, add |end| to the preexisting
        // group.
        start['cvox-group'].push(end);
        end['cvox-group'] = start['cvox-group'];
      } else if (end['cvox-group'] && end['cvox-group'].indexOf(start) == -1) {
        // |end| has been previously grouped, add |start| to the preexisting
        // group.
        end['cvox-group'].push(start);
        start['cvox-group'] = end['cvox-group'];
      } else if (!start['cvox-group'] && !end['cvox-group']) {
        // If neither node has been grouped, add them to one.
        var group = [];
        group.push(start);
        group.push(end);

        // Also, add back references.
        start['cvox-group'] = group;
        end['cvox-group'] = group;

        cvox.CssSpace.groups.push(group);
      }
    }
  }
};

/**
 * Flattens a tree structure.
 * TODO(dtseng): Probably belongs in dom_util.js.
 * @param {Element} startingNode The root of the tree to flatten.
 * @param {Array} collection The receiver of the flattened tree.
 */
cvox.CssSpace.getFlattenedSubtree = function(startingNode, collection) {
  if (cvox.DomUtil.hasContent(startingNode)) {
    collection.push(startingNode);
  }

  for (var i = 0; i < startingNode.children.length; ++i) {
    cvox.CssSpace.getFlattenedSubtree(startingNode.children[i], collection);
  }
};

/**
 * Calculates Euclidean distance based on the CSS location of the input nodes.
 * @param {Element} startingNode A start position.
 * @param {Element} endingNode An end position.
 * @return {number} The distance between startingNode and endingNode; -1
 * if  any dimension does not fall within its dimensional threshold.
 */
cvox.CssSpace.getDistance = function(startingNode, endingNode) {
  var startStyle = cvox.CssSpace.getCachedComputedStyle(startingNode);
  var endStyle = cvox.CssSpace.getCachedComputedStyle(endingNode);

  // The difference between the start and end vectors in our
  // cvox.CssSpace.dimensions.length space.
  var differenceTuple = [];
  for (var dim = 0; dim < cvox.CssSpace.dimensions.length; ++dim) {
    var current = cvox.CssSpace.dimensions[dim];

    var startSize = startStyle.getPropertyValue(current.name);
    var endSize = endStyle.getPropertyValue(current.name);

    // The property does not exist.
    if (startSize == null || endSize == null)
      return -1;

    // TODO(dtseng): This needs to go into its own class "Metrics" that
    // understands CSS declarations and units. Start this off with a hard coded
    // calculation of font-size which seems always to be returned in "%dpx"
    // format/unit
    var measure = startSize.slice(0, -2) -
        endSize.slice(0, -2);
    measure = Math.abs(measure);

    // Return -1 if we are not within our threshold for this dimension.
    if (measure > current.threshold)
      return -1;

    differenceTuple.push(measure);
  }

  // Calculate the magnitude squared of differenceTuple.
  var magnitude = 0;
  for (var component = 0; component < differenceTuple.length; ++component)
    magnitude += differenceTuple[component] * differenceTuple[component];

  return magnitude;
};

/**
 * Uninitialize this space.
 */
cvox.CssSpace.uninitializeSpace = function() {
  cvox.CssSpace.groups = [];
};

/**
 * Gets a cached style object.
 * @param {?Element} node The node to retrieve  style.
 * @return {CSSStyleDeclaration} |node|'s final style.
 */
cvox.CssSpace.getCachedComputedStyle = function(node) {
  if (!node['cvox-cache-style'])
    node['cvox-cached-style'] = window.getComputedStyle(node, '');

  return node['cvox-cached-style'];
};
