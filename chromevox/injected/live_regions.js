// Copyright 2011 Google Inc.
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
 * @fileoverview Keeps track of live regions on the page and speaks updates
 * when they change.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

cvoxgoog.provide('cvox.LiveRegions');

cvoxgoog.require('cvox.AriaUtil');
cvoxgoog.require('cvox.ChromeVox');
cvoxgoog.require('cvox.DomUtil');
cvoxgoog.require('cvox.NavDescription');

/**
 * @constructor
 */
cvox.LiveRegions = function() {
};

/**
 * An array of all of the elements on the page that are live regions.
 * @type {Array.<Element>}
 */
cvox.LiveRegions.trackedRegions = [];

/**
 * A parallel array to trackedRegions that stores the previous value of
 * each live region, represented as an array of NavDescriptions.
 * @type {Array.<Array.<cvox.NavDescription> >}
 */
cvox.LiveRegions.previousRegionValue = [];

/**
 * @type {Date}
 */
cvox.LiveRegions.pageLoadTime = null;

/**
 * Time in milliseconds after initial page load to ignore live region
 * updates, to avoid announcing regions as they're initially created.
 * @type {number}
 * @const
 */
cvox.LiveRegions.INITIAL_SILENCE_MS = 2000;

/**
 * @param {Date=} pageLoadTime The time the page was loaded. Live region
 *     updates within the first INITIAL_SILENCE_MS milliseconds are ignored.
 */
cvox.LiveRegions.init = function(pageLoadTime) {
  if (pageLoadTime) {
    cvox.LiveRegions.pageLoadTime = pageLoadTime;
  } else {
    cvox.LiveRegions.pageLoadTime = new Date();
  }

  var regions = cvox.AriaUtil.getLiveRegions(document.body);
  for (var i = 0; i < regions.length; i++) {
    cvox.LiveRegions.updateLiveRegion(regions[i]);
  }
};

/**
 * Speak relevant changes to a live region.
 *
 * @param {Node} region The live region node that changed.
 */
cvox.LiveRegions.updateLiveRegion = function(region) {
  if (cvox.AriaUtil.getAriaBusy(region)) {
    return;
  }

  // Retrieve the previous value of this region if we've tracked it
  // before, otherwise start tracking it.
  var regionIndex = cvox.LiveRegions.trackedRegions.indexOf(region);
  var previousValue;
  if (regionIndex >= 0) {
    previousValue = cvox.LiveRegions.previousRegionValue[regionIndex];
  } else {
    regionIndex = cvox.LiveRegions.trackedRegions.length;
    previousValue = [];
    cvox.LiveRegions.trackedRegions.push(region);
    cvox.LiveRegions.previousRegionValue.push([]);
  }

  // Get the new value.
  var currentValue = cvox.LiveRegions.buildCurrentLiveRegionValue(region);

  // If the page just loaded, keep track of the new value but don't
  // announce anything.
  if (Date() - cvox.LiveRegions.pageLoadTime <
      cvox.LiveRegions.INITIAL_SILENCE_MS) {
    cvox.LiveRegions.previousRegionValue[regionIndex] = currentValue;
    return;
  }

  // Create maps of values in the live region for fast hash lookup.
  var previousValueMap = {};
  for (var i = 0; i < previousValue.length; i++) {
    previousValueMap[previousValue[i].toString()] = true;
  }
  var currentValueMap = {};
  for (var i = 0; i < currentValue.length; i++) {
    currentValueMap[currentValue[i].toString()] = true;
  }

  // Figure out the additions and removals.
  var additions = [];
  if (cvox.AriaUtil.getAriaRelevant(region, 'additions')) {
    for (var i = 0; i < currentValue.length; i++) {
      if (!previousValueMap[currentValue[i].toString()]) {
        additions.push(currentValue[i]);
      }
    }
  }
  var removals = [];
  if (cvox.AriaUtil.getAriaRelevant(region, 'removals')) {
    for (var i = 0; i < previousValue.length; i++) {
      if (!currentValueMap[previousValue[i].toString()]) {
        removals.push(previousValue[i]);
      }
    }
  }

  // Only speak removals if they're the only change. Otherwise, when one or
  // more removals and additions happen concurrently, treat it as a change
  // and just speak any additions (which includes changed nodes).
  var messages = [];
  if (additions.length == 0 && removals.length > 0) {
    messages = [new cvox.NavDescription('removed:', '', '', '')].concat(
        removals);
  } else {
    messages = additions;
  }

  // Store the new value of the live region.
  cvox.LiveRegions.previousRegionValue[regionIndex] = currentValue;

  // Return if there's nothing to announce.
  if (messages.length == 0) {
    return;
  }

  // Announce the changes with the appropriate politeness level.
  var live = cvox.AriaUtil.getAriaLive(region);
  var queueMode = (live == 'assertive' ? 0 : 1);
  for (var i = 0; i < messages.length; i++) {
    messages[i].speak(queueMode);
    queueMode = 1;
  }
};

/**
 * Recursively build up the value of a live region and return it as
 * an array of NavDescriptions. Each atomic portion of the region gets a
 * single string, otherwise each leaf node gets its own string. When a region
 * changes, the sets of strings before and after are searched to determine
 * which have changed.
 *
 * @param {Node} node The root node.
 * @return {Array.<cvox.NavDescription>} An array of NavDescriptions
 *     describing atomic nodes or leaf nodes in the subtree rooted
 *     at this node.
 */
cvox.LiveRegions.buildCurrentLiveRegionValue = function(node) {
  if (cvox.AriaUtil.getAriaAtomic(node) ||
      cvox.DomUtil.isLeafNode(node)) {
    var description = cvox.DomUtil.getDescriptionFromAncestors([node], true);
    if (!description.isEmpty()) {
      return [description];
    } else {
      return [];
    }
  }

  var result = [];

  // Start with the description of this node.
  var description = cvox.DomUtil.getDescriptionFromAncestors([node], false);
  if (!description.isEmpty()) {
    result.push(description);
  }

  // Recursively add descriptions of child nodes.
  for (var i = 0; i < node.childNodes.length; i++) {
    var child = node.childNodes[i];
    var childStyle = window.getComputedStyle(child, null);
    if (!cvox.DomUtil.isInvisibleStyle(childStyle) &&
        !cvox.AriaUtil.isHidden(child)) {
      var recursiveArray = cvox.LiveRegions.buildCurrentLiveRegionValue(child);
      result = result.concat(recursiveArray);
    }
  }
  return result;
};
