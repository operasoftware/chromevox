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
 * @fileoverview Decorates a walker with filtering abilities.
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.WalkerDecorator');

goog.require('cvox.AbstractWalker');
goog.require('cvox.ChromeVoxJSON');

/**
 * @constructor
 */
cvox.WalkerDecorator = function() {
  // TODO(dtseng): Plumb local storage calls to background script's context.
  if (!window.localStorage.getItem('chromeVox.WalkerDecorator')) {
    this.filters = [];
  } else {
    this.filters = cvox.ChromeVoxJSON.parse(
        window.localStorage.getItem('chromeVox.WalkerDecorator').toString());
  }
  this.isInclusive = false;
};

/**
 * Whether these filters are inclusive or exclusive.
 * Inclusive filtering continues walking until a filter is matched.
 * Exclusive filtering keeps walking until no filters are matched.
 * @return {boolean} true if inclusive filtering.
 */
cvox.WalkerDecorator.prototype.getIsInclusive = function() {
  return this.isInclusive;
};

/**
 * Decorates the walker with filtering previous and next.
 * @param {cvox.AbstractWalker} walker The walker to decorate.
 */
cvox.WalkerDecorator.prototype.decorate = function(walker) {
  walker['next'] = this.filteredMove(walker, walker.next);
  walker['previous'] = this.filteredMove(walker, walker.previous);
};

/**
 * Decorates the walker's movement with filtering.
 * @param {cvox.AbstractWalker} walker The walker owning movement.
 * @param {function(): Node} original The walker's original method.
 * @return {function(): Node} Filter enhanced method.
 */
cvox.WalkerDecorator.prototype.filteredMove = function(walker, original) {
  var context = this;
  var newFunction = function() {
    var newNode = original.call(walker);
    while (newNode &&
        context.matchesFilter(walker.currentNode) != context.getIsInclusive()) {
      newNode = original.call(walker);
    }
    return newNode;
  };
  return newFunction;
};

/**
 * Adds a query selector to filter when walking.
 * @param {string} filter The selector to add.
 */
cvox.WalkerDecorator.prototype.addFilter = function(filter) {
  if (this.filters.indexOf(filter) == -1) {
    this.filters.push(filter);
    // TODO(dtseng): Plumb local storage calls to background script's context.
    window.localStorage.setItem('chromeVox.WalkerDecorator',
                                cvox.ChromeVoxJSON.stringify(this.filters));
  }
};


/**
 * Removes a query selector to filter when walking.
 * @param {string} filter The selector to remove.
 */
cvox.WalkerDecorator.prototype.removeFilter = function(filter) {
  for (var i = 0; i < this.filters.length; ++i) {
    if (filter == this.filters[i])
      delete this.filters[i];
  }
  // TODO(dtseng): Plumb local storage calls to background script's context.
  window.localStorage.setItem('chromeVox.WalkerDecorator',
                              JSON.stringify(this.filters));
};

/**
 * Matches a node against our collection of filters.
 * @param {Node} node The node to match.
 * @return {boolean} Whether the node matches any filters.
 */
cvox.WalkerDecorator.prototype.matchesFilter = function(node) {
  if (!node)
    return false;

  while (!node.tagName)
    node = node.parentNode;

  for (var i = 0; i < this.filters.length; ++i) {
    if (node.webkitMatchesSelector(this.filters[i]))
      return true;
  }
  return false;
};

/**
 * Checks for existence of a filter.
 * @param {string} filter The node to retrieve a filter for.
 * @return {boolean} Whether the selector is filtered.
 */
cvox.WalkerDecorator.prototype.hasFilter = function(filter) {
  for (var i = 0; i < this.filters.length; ++i) {
    if (filter == this.filters[i])
      return true;
  }
  return false;
};

/**
 * Calculates the selector corresponding to a node.
 * @param {Node} node The node to retrieve a filter for.
 * @return {?string} The filter for the node.
 */
cvox.WalkerDecorator.filterForNode = function(node) {
  if (!node.tagName)
    return null;

  var selector = node.tagName;

  // Progressively add constraints to identify this node.
  if (node.id) {
    var tempId = selector + '#' + node.id.trim();
    try {
      if (node.webkitMatchesSelector(tempId))
        selector = tempId;
    } catch (error) {
      // webkitMatchesSelector throws syntax error exceptions.
    }
  }
  if (node.className) {
    var tempClass = selector + '.' + node.className.trim();
    try {
      if (node.webkitMatchesSelector(tempClass))
        selector = tempClass;
    } catch (error) {
      // webkitMatchesSelector throws syntax error exceptions.
    }
  }

  return selector;
};
