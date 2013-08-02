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
 * @fileoverview Utility functions for the MathJax bridge. It contains
 * functionality that changes the normal behaviour of MathJax contributed by
 * Davide Cervone (dpvc@union.edu) and adapted by Volker Sorge
 * (sorge@google.com).
 * This is the only file that should contain actual MathJax code!
 *
 * @author sorge@google.com (Volker Sorge)
 */

if (typeof(goog) != 'undefined' && goog.provide) {
  goog.provide('cvox.MathJaxExternalUtil');
}


if (!window['cvox']) {
   window['cvox'] = {};
}

/**
 * @constructor
 */
cvox.MathJaxExternalUtil = function() {
};


/**
 * Returns a string with Mathml attributes for a MathJax object.  This serves as
 * intermediate store for the original function when we temporarily change
 * MathJax's output behaviour.
 * @return {string}
 */
cvox.MathJaxExternalUtil.mmlAttr = function() {
  return '';
};


/**
 * Rewrites an mfenced expression internally in MathJax to a corresponding mrow.
 * @param {?string} space The separator expression.
 * @return {string} The new mrow expression as a string.
 * @this {MathJax.RootElement}
 */
cvox.MathJaxExternalUtil.mfenced = function(space) {
    if (space == null) {
      space = '';
    }
    var mml = [space + '<mrow mfenced="true"' +
        this.toMathMLattributes() + '>'];
    var mspace = space + '  ';
    if (this.data.open) {
      mml.push(this.data.open.toMathML(mspace));
    }
    if (this.data[0] != null) {
      mml.push(this.data[0].toMathML(mspace));
    }
    for (var i = 1, m = this.data.length; i < m; i++) {
      if (this.data[i]) {
        if (this.data['sep' + i]) {
          mml.push(this.data['sep' + i].toMathML(mspace));
        }
        mml.push(this.data[i].toMathML(mspace));
      }
    }
  if (this.data.close) {
    mml.push(this.data.close.toMathML(mspace));
  }
  mml.push(space + '</mrow>');
  return mml.join('\n');
};


/**
 * Compute the MathML representation of a MathJax element.
 * @param {MathJax.Jax} jax MathJax object.
 * @param {function(string)} callback Callback function.
 * @return {Function} Callback function for restart.
 * @this {cvox.MathJaxExternalUtil}
 */
cvox.MathJaxExternalUtil.getMathml = function(jax, callback) {
  var mbaseProt = MathJax.ElementJax.mml.mbase.prototype;
  var mfencedProt = MathJax.ElementJax.mml.mfenced.prototype;
  this.mmlAttr = mbaseProt.toMathMLattributes;
  var mfenced = mfencedProt.toMathML;
  try {
      mbaseProt.toMathMLattributes = cvox.MathJaxExternalUtil.mbase;
      mfencedProt.toMathML = cvox.MathJaxExternalUtil.mfenced;
      var mml = jax.root.toMathML('');
      mbaseProt.toMathMLattributes = this.mmlAttr;
      mfencedProt.toMathML = mfenced;
      MathJax.Callback(callback)(mml);
  } catch (err) {
    mbaseProt.toMathMLattributes = this.mmlAttr;
    mfencedProt.toMathML = mfenced;
    if (!err['restart']) {
      throw err;
    }
    return MathJax.Callback.After(
        [cvox.MathJaxExternalUtil.getMathml, jax, callback], err['restart']);
  }
};


/**
 * Compute the special span ID attribute.
 * @return {string} The MathJax spanID attribute string.
 * @this {MathJax.RootElement}
 */
cvox.MathJaxExternalUtil.mbase = function() {
  var attr = cvox.MathJaxExternalUtil.mmlAttr.call(this);
  if (this.spanID != null) {
    var id = (this.id || 'MathJax-Span-' + this.spanID) +
        MathJax.OutputJax['HTML-CSS']['idPostfix'];
    attr += ' spanID="' + id + '"';
  }
  if (this.texClass != null) {
    attr += ' texClass="' + this.texClass + '"';
  }
  return attr;
};


/**
 * Test that ensures that all important parts of MathJax have been initialized
 * at startup.
 * @return {boolean} True if MathJax is sufficiently initialised.
 */
cvox.MathJaxExternalUtil.isActive = function() {
  return typeof(MathJax) != 'undefined' &&
      typeof(MathJax.Hub) != 'undefined' &&
      typeof(MathJax.ElementJax) != 'undefined' &&
      typeof(MathJax.InputJax) != 'undefined';
};


/**
 * Constructs a callback for a MathJax object with the purpose of returning the
 * MathML representation of a particular jax given by its node id. The callback
 * can be used by functions passing it to MathJax functions and is invoked by
 * MathJax.
 * @param {function(string, string)} callback A function taking a MathML
 * expression and an id string.
 * @param {MathJax.Jax} jax The MathJax object.
 * @private
 */
cvox.MathJaxExternalUtil.getMathjaxCallback_ = function(callback, jax) {
  cvox.MathJaxExternalUtil.getMathml(
      jax,
      function(mml) {
        if (jax.root.inputID) {
          callback(mml, jax.root.inputID);
        }
      });
};


/**
 * Registers a callback for a particular Mathjax signal.
 * @param {function(string, string)} callback A function taking an MathML
 * expression and an id string.
 * @param {string} signal The Mathjax signal on which to fire the callback.
 */
cvox.MathJaxExternalUtil.registerSignal = function(callback, signal) {
  MathJax.Hub.Register.MessageHook(
      signal,
      function(signalAndIdPair) {
        var jax = MathJax.Hub.getJaxFor(signalAndIdPair[1]);
        cvox.MathJaxExternalUtil.getMathjaxCallback_(callback, jax);
      });
};


/**
 * Compute the MathML representation for all currently available MathJax
 * nodes.
 * @param {function(string, string)} callback A function taking a MathML
 * expression and an id string.
 */
cvox.MathJaxExternalUtil.getAllJax = function(callback) {
  var jaxs = MathJax.Hub.getAllJax();
  if (jaxs) {
    jaxs.forEach(function(jax) {
      if (jax.root.spanID) {
        cvox.MathJaxExternalUtil.getMathjaxCallback_(callback, jax);
      }
    });
  }
};


// Functionality for direct translation from LaTeX to MathML without rendering.
// TODO (sorge): Get specialised config script of Wikipedia as it uses some
//      macros that are not handled by MathJax by default.
/**
 * Injects a MathJax config script into the page.
 * This script is picked up by MathJax at load time. It only runs in the page,
 * thus in case it causes an exception it will not crash ChromeVox. The worst
 * thing that can happen is that we do not get a MathML object for some
 * LaTeX alternative text, i.e., we default to the usual behaviour of simply
 * reading out the alt text directly.
 */
cvox.MathJaxExternalUtil.injectConfigScript = function() {
  var script = document.createElement('script');
  script.setAttribute('type', 'text/x-mathjax-config');
  script.textContent =
      'MathJax.Hub.Config({\n' +
          // No output needed.
      '  jax: ["input/AsciiMath", "input/TeX"],\n' +
          // Load functionality for MathML translation.
      '  extensions: ["toMathML.js"],\n' +
          // Do not change any rendering in the page.
      '  skipStartupTypeset: true,\n' +
          // Do not display any MathJax status message.
      '  messageStyle: "none"\n' +
      '});\n' +
      'MathJax.Hub.Queue(\n' +
          // Force InputJax to load.
      '  function() {MathJax.Hub.inputJax["math/asciimath"].Process();\n' +
      '  MathJax.Hub.inputJax["math/tex"].Process()}\n' +
      ');\n' +
      '//\n' +
      '// Prevent these from being loaded\n' +
      '//\n' +
          // Make sure that no pop up menu is created for the jax.
      'if (!MathJax.Extension.MathMenu) {MathJax.Extension.MathMenu = {}};\n' +
          // Make sure that jax is created unzoomed.
      'if (!MathJax.Extension.MathZoom) {MathJax.Extension.MathZoom = {}};';
  document.activeElement.appendChild(script);
};


/**
 * Injects a MathJax load script into the page. This should only be injected
 * after the config script. While the config script can adapted for different
 * pages, the load script is generic.
 *
 */
cvox.MathJaxExternalUtil.injectLoadScript = function() {
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute(
      'src', 'http://cdn.mathjax.org/mathjax/latest/MathJax.js?');
  document.activeElement.appendChild(script);
};


// TODO (sorge) Merge the following two functions, ideally with MathJax making
//     the decision if we have LaTeX or AsciiMath.
/**
 * Converts a LaTeX expression into MathML string.
 * @param {string} math Expression latex.
 * @param {boolean} display If true translation in display mode. Otherwise text
 * mode.
 * @param {function(string)} callback Callback function called with the MathML
 * string after it is produced.
 * @return {Function} If a restart occurs, the callback for it is
 * returned, so this can be used in MathJax.Hub.Queue() calls reliably.
 */
cvox.MathJaxExternalUtil.texToMml = function(math, display, callback) {
  //  Make a fake script and pass it to the pre-filters.
  var script = MathJax.HTML.Element(
      'script', {type: 'math/tex' + (display ? ';mode=display' : '')}, [math]);
  var data = {math: math, display: display, script: script};
  MathJax.InputJax.TeX.prefilterHooks.Execute(data);

  //  Attempt to parse the TeX code, processing any errors.
  var mml;
  try {
    mml = MathJax.InputJax.TeX.Parse(data.math).mml();
  } catch (err) {
    if (err.texError) {
      // Put TeX errors into <merror> tags.
      mml = MathJax.ElementJax.mml.merror(err.message.replace(/\n.*/, ''));
    } else if (err['restart']) {
      //  Wait for file to load, then do this routine again.
      return MathJax.Callback.After(
          [cvox.MathJaxExternalUtil.texToMml, math, display, callback],
          err['restart']);
    } else {
      //  It's an actual error, so pass it on.
      throw err;
    }
  }

  //  Make an ElementJax from the tree, call the post-filters, and get the
  //  MathML.
  if (mml.inferred) {
    mml = MathJax.ElementJax.mml.apply(MathJax.ElementJax, mml.data);
  } else {
    mml = MathJax.ElementJax.mml(mml);
  }
  if (display) {
    mml.root.display = 'block';
  }
  data.math = mml;
  // This is necessary to make this function work even if MathJax is already
  // properly injected into the page, as this object is used in MathJax's
  // AMSmath.js file.
  data.script['MathJax'] = {};
  MathJax.InputJax.TeX.postfilterHooks.Execute(data);
  return cvox.MathJaxExternalUtil.getMathml(data.math, callback);
};


/**
 * Converts an AsciiMath expression into MathML string.
 * @param {string} math Expression in AsciiMath.
 * @param {boolean} display If true translation in display mode. Otherwise text
 * mode.
 * @param {function(string)} callback Callback function called with the MathML
 * string after it is produced.
 * @return {Function} If a restart occurs, the callback for it is
 * returned, so this can be used in MathJax.Hub.Queue() calls reliably.
 */
cvox.MathJaxExternalUtil.asciiMathToMml = function(math, display, callback) {
  //  Make a fake script and pass it to the pre-filters.
  var script = MathJax.HTML.Element(
      'script',
      {type: 'math/asciimath' + (display ? ';mode=display' : '')}, [math]);
  var data = {math: math, display: display, script: script};
  MathJax.InputJax.AsciiMath.prefilterHooks.Execute(data);

  //  Attempt to parse the Asciimath code, processing any errors.
  var mml;
  try {
    mml = MathJax.InputJax.AsciiMath.AM.parseMath(data.math).toMathML();
  } catch (err) {
    if (err['restart']) {
      //  Wait for file to load, then do this routine again.
      return MathJax.Callback.After(
          [cvox.MathJaxExternalUtil.asciiMathToMml, math, display, callback],
          err['restart']);
    } else {
      //  It's an actual error, so pass it on.
      throw err;
    }
  }

  data.math = mml;
  // This is necessary to make this function work even if MathJax is already
  // properly injected into the page, as this object is used in MathJax's
  // AMSmath.js file.
  data.script['MathJax'] = {};
  MathJax.InputJax.AsciiMath.postfilterHooks.Execute(data);
  callback(mml);
};
