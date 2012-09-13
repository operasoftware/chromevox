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
 * @fileoverview Keeps track of live regions on the page and speaks updates
 * when they change.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.LiveRegions');

goog.require('cvox.AriaUtil');
goog.require('cvox.ChromeVox');
goog.require('cvox.DescriptionUtil');
goog.require('cvox.DomUtil');
goog.require('cvox.NavDescription');

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
 * The exception is alerts, they're announced when a page is loaded.
 * @type {number}
 * @const
 */
cvox.LiveRegions.INITIAL_SILENCE_MS = 2000;

/**
 * @param {Date} pageLoadTime The time the page was loaded. Live region
 *     updates within the first INITIAL_SILENCE_MS milliseconds are ignored.
 * @param {number} queueMode Interrupt or flush.  Polite live region
 *   changes always queue.
 * @param {boolean} disableSpeak true if change announcement should be disabled.
 * @return {boolean} true if any regions announced.
 */
cvox.LiveRegions.init = function(pageLoadTime, queueMode, disableSpeak) {
  if (queueMode == undefined) {
    queueMode = cvox.AbstractTts.QUEUE_MODE_FLUSH;
  }

  cvox.LiveRegions.pageLoadTime = pageLoadTime;

  var anyRegionsAnnounced = false;
  var regions = cvox.AriaUtil.getLiveRegions(document.body);
  for (var i = 0; i < regions.length; i++) {
    if (cvox.LiveRegions.updateLiveRegion(regions[i], queueMode,
                                          disableSpeak)) {
      anyRegionsAnnounced = true;
      queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
    }
  }

  return anyRegionsAnnounced;
};

/**
 * Speak relevant changes to a live region.
 *
 * @param {Node} region The live region node that changed.
 * @param {number} queueMode Interrupt or queue. Polite live region
 *   changes always queue.
 * @param {boolean} disableSpeak true if change announcement should be disabled.
 * @return {boolean} true if the region announced a change.
 */
cvox.LiveRegions.updateLiveRegion = function(region, queueMode, disableSpeak) {
  if (cvox.AriaUtil.getAriaBusy(region)) {
    return false;
  }

  // Make sure it's visible.
  if (!cvox.DomUtil.isVisible(region)) {
    return false;
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

  // If the page just loaded and this is any region type other than 'alert',
  // keep track of the new value but don't announce anything. Alerts are
  // the exception, they're announced on page load.
  var deltaTime = new Date() - cvox.LiveRegions.pageLoadTime;
  if (cvox.AriaUtil.getRoleAttribute(region) != 'alert' &&
      deltaTime < cvox.LiveRegions.INITIAL_SILENCE_MS) {
    cvox.LiveRegions.previousRegionValue[regionIndex] = currentValue;
    return false;
  }

  // Create maps of values in the live region for fast hash lookup.
  var previousValueMap = {};
  for (var i = 0; i < previousValue.length; i++) {
    previousValueMap[previousValue[i].toString()] = true;
  }
  var currentValueMap = {};
  for (i = 0; i < currentValue.length; i++) {
    currentValueMap[currentValue[i].toString()] = true;
  }

  // Figure out the additions and removals.
  var additions = [];
  if (cvox.AriaUtil.getAriaRelevant(region, 'additions')) {
    for (i = 0; i < currentValue.length; i++) {
      if (!previousValueMap[currentValue[i].toString()]) {
        additions.push(currentValue[i]);
      }
    }
  }
  var removals = [];
  if (cvox.AriaUtil.getAriaRelevant(region, 'removals')) {
    for (i = 0; i < previousValue.length; i++) {
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
    messages = [new cvox.NavDescription({
      context: cvox.ChromeVox.msgs.getMsg('live_regions_removed')
    })].concat(removals);
  } else {
    messages = additions;
  }

  // Store the new value of the live region.
  cvox.LiveRegions.previousRegionValue[regionIndex] = currentValue;

  // Return if speak is disabled or there's nothing to announce.
  if (disableSpeak || messages.length == 0) {
    return false;
  }

  // Announce the changes with the appropriate politeness level.
  var live = cvox.AriaUtil.getAriaLive(region);
  if (live == 'polite') {
    queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
  }
  for (i = 0; i < messages.length; i++) {
    messages[i].speak(queueMode);
    queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
  }

  return true;
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
    var description = cvox.DescriptionUtil.getDescriptionFromAncestors(
        [node], true, cvox.ChromeVox.verbosity);
    if (!description.isEmpty()) {
      return [description];
    } else {
      return [];
    }
  }

  var result = [];

  // Start with the description of this node.
  var description = cvox.DescriptionUtil.getDescriptionFromAncestors(
      [node], false, cvox.ChromeVox.verbosity);
  if (!description.isEmpty()) {
    result.push(description);
  }

  // Recursively add descriptions of child nodes.
  for (var i = 0; i < node.childNodes.length; i++) {
    var child = node.childNodes[i];
    if (cvox.DomUtil.isVisible(child, {checkAncestors: false}) &&
        !cvox.AriaUtil.isHidden(child)) {
      var recursiveArray = cvox.LiveRegions.buildCurrentLiveRegionValue(child);
      result = result.concat(recursiveArray);
    }
  }
  return result;
};
