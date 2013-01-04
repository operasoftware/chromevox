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

goog.require('cvox.ActiveIndicator');
goog.require('cvox.ChromeVox');
goog.require('cvox.CssDimension');
goog.require('cvox.DescriptionUtil');
goog.require('cvox.DomUtil');
goog.require('cvox.GroupUtil');
goog.require('cvox.SpokenMessages');

/**
 * The group being explored.
 * @type {number}
 * @private
 */
cvox.CssSpace.currentGroup_ = 0;

/**
 * The item within the current group.
 * @type {number}
 *   @private
 */
cvox.CssSpace.currentGroupItem_ = 0;

/**
 * A collection of groups derived from the partitioning of points in CSS space.
 * @type {Array}
 */
cvox.CssSpace.groups = [];

/**
 * A regular rxpression pattern for rgb and rgba strings obtained from
 * style.getPropertyValue for background-color.
 * @type {RegExp}
 */
cvox.CssSpace.rgbPattern = /^rgb[a]?\((\d+),\s*(\d+),\s*(\d+),?\s?(\d+)?/;

/**
 * @const
*/
cvox.CssSpace.HEADER_TAG_LIST =
    ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

/**
 * Called to set-up our CSS vector space.
 * @param {Array.<cvox.CssDimension>} opt_dimensions Optional dimensions to
 * override defaults.
 */
cvox.CssSpace.initializeSpace = function(opt_dimensions) {
  // No need to initialize.
  if (cvox.CssSpace.groups.length > 0)
    return;

  /**
   * Default cSS declarations of relevance.
   * Each additional declaration adds a new dimension to our space.
   * @type {Array.<cvox.CssDimension>}
   */
  cvox.CssSpace.dimensions = opt_dimensions ||
      [
        /** A measure of horizontal distance between two client rectangles. */
        {name: 'deltaX', threshold: 50, distance: cvox.CssSpace.getDeltaX},

        /** A measure of vertical distance between two client rectangles. */
        {name: 'deltaY', threshold: 10, distance: cvox.CssSpace.getDeltaY},

        /** A measure of common ancestry between two nodes. The threshold is the
         * percentage of levels to search (from one node to the root).
         */
        {name: 'commonAncestry',
         threshold: .5,
         distance: cvox.CssSpace.getCommonAncestry},

        /** A boolean measure of breaking tags. */
        {name: 'breakingTags',
         threshold: 1,
         distance: cvox.CssSpace.getBreakingTags}
       ];

  // Preprocessing stage: Flatten the DOM into an array excluding non-content
  // nodes.
  var flat = [];
  cvox.CssSpace.getFlattenedSubtree(document.body, flat);

  // Metrics and grouping stage: calculate distances and group.
  for (var i = 0; i < flat.length; ++i) {
    flat[i]['cvox-runtime-id'] = i;

    var start = flat[i];
    var end = flat[i + 1];

    if (!end) {
      end = start;
      start = flat[i - 1];
    }

    // Nodes that exceed threshold on some dimension get skipped.
    if (cvox.CssSpace.getDistance(start, end, true) == -1) {
      if (!start['cvox-group']) {
        var newGroup = [start];
        start['cvox-group'] = newGroup;
        cvox.CssSpace.groups.push(newGroup);
      }
      if (!end['cvox-group']) {
        var newGroup = [end];
        end['cvox-group'] = newGroup;
        cvox.CssSpace.groups.push(newGroup);
      }
      continue;
    }

    // Assuming we get nodes in document order, we should not encounter this
    // case.
    if (start['cvox-group'] && end['cvox-group'])
      continue;

    if (start['cvox-group']) {
      // |Start| has been previously grouped, add |end| to the preexisting
      // group.
      start['cvox-group'].push(end);
      end['cvox-group'] = start['cvox-group'];
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

  // Don't try regrouping for small number of groups.
  if (cvox.CssSpace.groups.length <= 10)
    return;

  // If there are lots of small groups, relax thresholds and re-initialize.
  var sizeList = [];
  for (var g = 0; g < cvox.CssSpace.groups.length; ++g) {
    sizeList.push(cvox.CssSpace.groups[g].length);
  }
  sizeList.sort(function(n1, n2) {
    return n1 - n2;
  });

  var len = sizeList.length;
  var medianIndex = Math.floor(len / 2);
  if (cvox.CssSpace.groups.length == 0 || sizeList[medianIndex] <= 1) {
    cvox.CssSpace.uninitializeSpace();

    // Zoom out by increasing our thresholds.
    for (var dim = 0; dim < 2; ++dim) {
      cvox.CssSpace.dimensions[dim].threshold +=
        4 * cvox.CssSpace.dimensions[dim].threshold;
    }

    cvox.CssSpace.initializeSpace(cvox.CssSpace.dimensions);
  }
};

/**
 * Uninitialize this space.
 */
cvox.CssSpace.uninitializeSpace = function() {
  for (var g = 0; g < cvox.CssSpace.groups.length; ++g) {
    for (var i = 0; i < cvox.CssSpace.groups[g].length; ++i)
      delete cvox.CssSpace.groups[g][i]['cvox-group'];
  }

  cvox.CssSpace.groups = [];
  cvox.CssSpace.currentGroup_ = 0;
  cvox.CssSpace.currentGroupItem_ = 0;
};

/**
 * Flattens a tree structure.
 * TODO(dtseng): Probably belongs in dom_util.js.
 * @param {Element} node The root of the tree to flatten.
 * @param {Array} collection The receiver of the flattened tree.
 */
cvox.CssSpace.getFlattenedSubtree = function(node, collection) {
  if (node.getBoundingClientRect().left < 0 ||
      node.getBoundingClientRect().top < 0) {
    return;
  }

  // Always add these nodes and skip their descendants. The idea is to gather
  // nodes that have a good bounding box; leverage existing smart groups for
  // this.
  if ((node.tagName == 'P' || cvox.GroupUtil.isLeafNode(node)) &&
      cvox.DomUtil.hasContent(node)) {
    collection.push(node);
    return;
  }

  // Exclude container nodes.
  if (node.childElementCount == 0 &&
      cvox.DomUtil.hasContent(node)) {
    collection.push(node);
    return;
  }

  for (var i = 0; i < node.children.length; ++i) {
    cvox.CssSpace.getFlattenedSubtree(node.children[i], collection);
  }
};

/**
 * Calculates Euclidean distance based on the CSS location of the input nodes.
 * @param {Element} node1 A start position.
 * @param {Element} node2 An end position.
 * @param {boolean} opt_strict Returns -1 when not meeting threshold.
 * @return {number} The distance between startingNode and endingNode; -1
 * if  any dimension does not fall within its dimensional threshold.
 */
cvox.CssSpace.getDistance = function(node1, node2, opt_strict) {
  // The difference between the start and end vectors in our
  // cvox.CssSpace.dimensions.length space.
  var differenceTuple = [];
  for (var dim = 0; dim < cvox.CssSpace.dimensions.length; ++dim) {
    var current = cvox.CssSpace.dimensions[dim];
    var measure = current.distance(node1, node2);

    // Return -1 if we are not within our threshold for this dimension.
    if ((measure > current.threshold || measure < 0) && opt_strict)
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
 * Provides the horizontal distance between two rectangles.
 * @param {!Node} node1 A node whose rectangle to use.
 * @param {!Node} node2 Another node whose rectangle to use.
 * @return {number} The horizontal distance.
 */
cvox.CssSpace.getDeltaX = function(node1, node2) {
  var rect1 = node1.getBoundingClientRect();
  var rect2 = node2.getBoundingClientRect();

  var measure1 = Math.abs(rect1.right - rect2.left);
  var measure2 = Math.abs(rect2.right - rect1.left);
  var measure3 = Math.abs(rect1.left - rect2.left);
  var measure4 = Math.abs(rect1.right - rect2.right);
  return Math.min(measure1, measure2, measure3, measure4);
};

/**
 * Provides the vertical distance between two rectangles.
 * @param {!Node} node1 A node whose rectangle to use.
 * @param {!Node} node2 Another node whose rectangle to use.
 * @return {number} The vertical distance.
 */
cvox.CssSpace.getDeltaY = function(node1, node2) {
  var rect1 = node1.getBoundingClientRect();
  var rect2 = node2.getBoundingClientRect();

  var measure1 = Math.abs(rect1.bottom - rect2.top);
  var measure2 = Math.abs(rect2.bottom - rect1.top);
  var measure3 = Math.abs(rect1.top - rect2.top);
  var measure4 = Math.abs(rect1.bottom - rect2.bottom);

  // Give headings an advantage when grouping.
  if (cvox.CssSpace.HEADER_TAG_LIST.indexOf(node1.tagName) != -1) {
    measure1 /= 5;
    measure2 /= 5;
    measure3 /= 5;
    measure4 /= 5;
  }

  return Math.min(measure1, measure2, measure3, measure4);
};

/**
 * The minimum levels of parentage for which two nodes have a common parent.
 * @param {!Node} node1 A node whose parentage to use.
 * @param {!Node} node2 Another node whose parentage to use.
 * @return {number} The distance.
 */
cvox.CssSpace.getCommonAncestry = function(node1, node2) {
  // Mark the parent chain.
  var walker1 = node1;
  var totalDepth = 0;
  while (walker1 != document.documentElement) {
    walker1['cvox-mark'] = true;
    ++totalDepth;
    walker1 = walker1.parentNode;
  }

  // Now, find the common ancestor.
  var walker2 = node2;
  var depth = 0;
  var maxCommonAncestor = -1;

  while (walker2 != document.documentElement && depth <= totalDepth) {
    if (walker2['cvox-mark']) {
      maxCommonAncestor = depth;
      break;
    }

    ++depth;
    walker2 = walker2.parentNode;
  }

  // Unmark previous parent chain.
  while (walker1) {
    walker1['cvox-mark'] = false;
    walker1 = walker1.parentNode;
  }

  return maxCommonAncestor / totalDepth;
};

/**
 * The difference in rgb value between two nodes.
 * @param {Node} node1 A node whose background color to use.
 * @param {Node} node2 A node whose background color to use.
 * @return {number} The distance.
 */
cvox.CssSpace.getBackgroundColorDelta = function(node1, node2) {
  var size1 = null, size2 = null;
  var pattern = cvox.CssSpace.rgbPattern;

  // Unfortunately, transparent backgrounds are useless so we have to go
  // up the parent chain. Use the alpha component to detect this case.
  var alpha = 0;
  while (node1) {
    var style1 = cvox.CssSpace.getCachedComputedStyle(node1);
    if (!style1)
      break;

    size1 = pattern.exec(style1.getPropertyValue('background-color'));
    alpha = size1.length == 5 ? size1[4] : -1;
    if (alpha != 0)
      break;

    node1 = node1.parentNode;
  }

  while (node2) {
    var style2 = cvox.CssSpace.getCachedComputedStyle(node2);
    if (!style2)
      break;

    size2 = pattern.exec(style2.getPropertyValue('background-color'));
    alpha = size2.length == 5 ? size2[4] : -1;
    if (alpha != 0)
      break;

    node2 = node2.parentNode;
  }

  if (size1 && size2 && size1.length >= 4 && size2.length >= 4) {
    var r = 0, g = 0, b = 0;
    r = Math.abs(parseInt(size1[1], 10) - parseInt(size2[1], 10));
    g = Math.abs(parseInt(size1[2], 10) - parseInt(size2[2], 10));
    b = Math.abs(parseInt(size1[3], 10) - parseInt(size2[3], 10));
    return r + g + b;
  }
  return -1;
};

/**
 * A boolean measure of if two elements are close based on tagName.
 * @param {Node} start A node earlier in doc order.
 * @param {Node} end A node later in doc order.
 * @return {number} The distance (-1 or 0).
 */
cvox.CssSpace.getBreakingTags = function(start, end) {
  // End is the target of the break.
  return cvox.CssSpace.isBreakingTag(end) &&
      !cvox.CssSpace.isBreakingTag(start) ? -1 : 0;
};

/**
 * Given a linearization of the DOM, these node tags signify the start of a new
 * grouping.
 * @param {Node} node The node to check.
 * @return {boolean} Whether the node is a breaking tag.
 */
cvox.CssSpace.isBreakingTag = function(node) {
  if (cvox.CssSpace.HEADER_TAG_LIST.indexOf(node.tagName) != -1 ||
      node.tagName == 'TR') {
    return true;
  }

  return false;
};

/**
 * Difference in font-size between two nodes.
 * @param {!Node} node1 A node whose font size to use.
 * @param {!Node} node2 A node whose font size to use.
 * @return {number} The distance.
 */
cvox.CssSpace.getFontSizeDelta = function(node1, node2) {
  var startStyle = cvox.CssSpace.getCachedComputedStyle(node1);
  var endStyle = cvox.CssSpace.getCachedComputedStyle(node2);

  var startSize = startStyle.getPropertyValue('font-size');
  var endSize = endStyle.getPropertyValue('font-size');

  if (startSize != null && endSize != null) {
    return Math.abs(startSize.slice(0, -2) - endSize.slice(0, -2));
  }
  return -1;
};

/**
 * Gets a cached style object.
 * @param {!Node} node The node to retrieve  style.
 * @return {CSSStyleDeclaration} |node|'s final style.
 */
cvox.CssSpace.getCachedComputedStyle = function(node) {
  if (!node['cvox-cache-style']) {
    node = /** @type {!Element} */ (node);
    node['cvox-cached-style'] = window.getComputedStyle(node, '');
  }

  return node['cvox-cached-style'];
};

/**
 * Post processing to cluster orphaned nodes into groups.
 * @param {Array.<Element>} flat The entire flattened DOM obtained from
 * getFlattenedSubtree.
 */
cvox.CssSpace.postProcessOrphans = function(flat) {
  // Cluster orphans by document order.
  var currentGroup = 0;
  for (var k = 0; k < flat.length; ++k) {
    if (!flat[k]['cvox-group']) {
      // Move forward (if possible) on breaking tags.
      if (cvox.CssSpace.isBreakingTag(flat[k])) {
        currentGroup =
            currentGroup < cvox.CssSpace.groups.length - 1 ?
                currentGroup + 1 : currentGroup;
      }

      // Pick either the current or the next group.
      var nextGroup = currentGroup < cvox.CssSpace.groups.length - 1 ?
          currentGroup + 1 : currentGroup;
      var sample1 = cvox.CssSpace.groups[currentGroup][0];
      var sample2 = cvox.CssSpace.groups[nextGroup][0];
      if (cvox.CssSpace.getDistance(flat[k], sample1, false) >
          cvox.CssSpace.getDistance(flat[k], sample2, false)) {
        currentGroup = nextGroup;
      }

      cvox.CssSpace.groups[currentGroup].push(flat[k]);
      flat[k]['cvox-group'] = cvox.CssSpace.groups[currentGroup];
    } else {
      currentGroup = cvox.CssSpace.groups.indexOf(flat[k]['cvox-group']);
    }
  }
};

/**
 * Post processing to flatten container elements.
 */
cvox.CssSpace.postProcessUnpackGroups = function() {
  for (var g = 0; g < cvox.CssSpace.groups.length; ++g) {
    cvox.CssSpace.unpackGroup_(cvox.CssSpace.groups[g]);
  }
};

/**
 * Unpacks a group by replacing its container elements with leaf children.
 *
 * @param {Array.<!Element>} group The group to unpack.
 * @private
 */
cvox.CssSpace.unpackGroup_ = function(group) {
  for (var item = 0; item < group.length; ++item) {
    var unpacked = [];
    cvox.CssSpace.unpack_(group[item], unpacked);
    if (unpacked.length > 0) {
      Array.prototype.splice.apply(group, [item, 1].concat(unpacked));
    }
  }
};

/**
 * Unpacks a container node by replacing it with it's children.
 *
 * @param {!Element} item The item to unpack.
 * @param {Array.<!Element>} unpacked The collection of items that have been
 * unpacked.
 * @private
 */
cvox.CssSpace.unpack_ = function(item, unpacked) {
  if (cvox.DomUtil.isLeafNode(item) ||
      item.tagName == 'TH' ||
      item.tagName == 'TR' ||
      item.tagName == 'LI' ||
      item.tagName == 'A' ||
      item.tagName == 'P') {
    unpacked.push(item);
    return;
  }

  for (var i = 0; i < item.children.length; ++i) {
    cvox.CssSpace.unpack_(item.children[i], unpacked);
  }
};

/**
 * Enters group exploration.
 */
cvox.CssSpace.enterExploration = function() {
  cvox.$m('enter_group_exploration').speakFlush();
  window.addEventListener(
      'keydown', cvox.CssSpace.handleGroupExploration, true);
};

/**
 * Exits group exploration.
 */
cvox.CssSpace.exitExploration = function() {
  window.removeEventListener(
      'keydown', cvox.CssSpace.handleGroupExploration, true);
};

/**
 * Handles keyboard events while group exploration is enabled.
 * @param {Event} evt The event.
 * @return {boolean} Whether or not the event was handled.
 */
cvox.CssSpace.handleGroupExploration = function(evt) {
  var speakGroup = false;
  var speakItem = false;
  var groups = cvox.CssSpace.groups;

  if (groups.length == 0)
    return true;

  switch (evt.keyCode) {
    case 38: // up
      speakGroup = true;
      cvox.CssSpace.currentGroupItem_ = 0;
      cvox.CssSpace.currentGroup_ =
          cvox.CssSpace.currentGroup_ > 0 ? cvox.CssSpace.currentGroup_ - 1 : 0;
      break;
    case 37: // left
      speakItem = true;
      cvox.CssSpace.currentGroupItem_ = cvox.CssSpace.currentGroupItem_ ?
          cvox.CssSpace.currentGroupItem_ - 1 : 0;
      speakGroup = false;
      break;
    case 40: // down
      speakGroup = true;
      cvox.CssSpace.currentGroupItem_ = 0;
      cvox.CssSpace.currentGroup_ =
          cvox.CssSpace.currentGroup_ < groups.length - 1 ?
              cvox.CssSpace.currentGroup_ + 1 : groups.length - 1;
      break;
    case 39: // right
      speakItem = true;
      cvox.CssSpace.currentGroupItem_ =
          cvox.CssSpace.currentGroupItem_ ==
              groups[cvox.CssSpace.currentGroup_].length - 1 ?
                  cvox.CssSpace.currentGroupItem_ :
                      cvox.CssSpace.currentGroupItem_ + 1;
      speakGroup = false;
      break;
    default:
      cvox.CssSpace.exitExploration();
      return true;
  }

  cvox.ChromeVox.syncToNode(
      groups[cvox.CssSpace.currentGroup_][cvox.CssSpace.currentGroupItem_],
      false);

  if (speakGroup) {
    cvox.ChromeVox.tts.stop();
    var MAX_SPOKEN_NODES = 20;
    var indicateNodes = [];
    for (var i = 0;
         i < groups[cvox.CssSpace.currentGroup_].length && i < MAX_SPOKEN_NODES;
         ++i) {
      indicateNodes.push(groups[cvox.CssSpace.currentGroup_][i]);

      if (groups[cvox.CssSpace.currentGroup_][i]) {
        cvox.DescriptionUtil.getControlDescription(
            groups[cvox.CssSpace.currentGroup_][i])
            .speak(cvox.AbstractTts.QUEUE_MODE_QUEUE);
      }
    }

    cvox.ChromeVox.navigationManager.activeIndicator.syncToNodes(
        groups[cvox.CssSpace.currentGroup_]);

    cvox.SpokenMessages
        .andIndexTotal(cvox.CssSpace.currentGroup_ + 1,
                       cvox.CssSpace.groups.length)
        .speakQueued();

    evt.preventDefault();
    evt.stopPropagation();
  } else if (speakItem) {
    var currentItem =
        groups[cvox.CssSpace.currentGroup_][cvox.CssSpace.currentGroupItem_];

    cvox.ChromeVox.tts.stop();
    cvox.DescriptionUtil.getControlDescription(currentItem)
    .speak(cvox.AbstractTts.QUEUE_MODE_FLUSH);
  }

  return false;
};
