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
 * @fileoverview Speech rules for math nodes.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathNodeRules');

goog.require('cvox.MathNode');


/**
 * Rule initialization.
 * @constructor
 */
cvox.MathNodeRules = function() {

  cvox.MathNodeRules.initDefaultRules();
  cvox.MathNodeRules.initAliases(); // MathJax Aliases
  cvox.MathNodeRules.initSpecializationRules(); // Square, cube, etc.
};
goog.addSingletonGetter(cvox.MathNodeRules);


/**
 * Initialize the default mathrules.
 */
cvox.MathNodeRules.initDefaultRules = function() {

  // Space elements
  cvox.MathNode.defineMathmlRule('mspace',
                                 'default.default', '[p] (pause:250)');
  cvox.MathNode.defineMathmlRule('mstyle',
                                 'default.default', '[n] ./*[1]');

  cvox.MathNode.defineMathmlRule('mpadded',
                                 'default.default', '[n] ./*[1]');

  cvox.MathNode.defineMathmlRule('merror',
                                 'default.default', '[n] ./*[1]');

  cvox.MathNode.defineMathmlRule('mphantom',
                                 'default.default', '[n] ./*[1]');

  // Token elements.
  cvox.MathNode.defineMathmlRule('mtext', 'default.default',
                                 '[t] text(); [p] (pause:200)');

  cvox.MathNode.defineMathmlRule('mi',
                                 'default.default', '[n] text()');

  cvox.MathNode.defineMathmlRule('mo',
                                 'default.default', '[n] text() (rate:-0.1)');

  cvox.MathNode.defineMathmlRule('mn',
                                 'default.default', '[n] text()');

  // TODO (sorge) Needs separate rule for Mathjax to stop pronouncing quotes,
  //     once we have Xpath expressions for string_type.
  //     substring(text(),1,string-length(text())-1)
  cvox.MathNode.defineMathmlRule(
      'ms', 'default.default',
      '[s] "string" (pitch:0.5, rate:0.5); [t] text()');

  // Script elements.
  cvox.MathNode.defineMathmlRule(
      'msup',
      'default.default',
      '[n] ./*[1]; [s] "super";' +
          '[n] ./*[2] (pitch:0.35); [p] (pause:300)');
  cvox.MathNode.defineMathmlRule(
      'msubsup', 'default.default',
      '[n] ./*[1]; [s] "sub"; [n] ./*[2] (pitch:-0.35);' +
          '[p] (pause:200);' +
              '[s] "super"; [n] ./*[3] (pitch:0.35); [p] (pause:300)'
      );
  cvox.MathNode.defineMathmlRule(
      'msub', 'default.default',
      '[n] ./*[1]; [s] "sub"; [n] ./*[2] (pitch:-0.35); [p] (pause:300)');
  cvox.MathNode.defineMathmlRule(
      'mover',
      'default.default', '[n] ./*[2] (pitch:0.35); [p] (pause:200);' +
          ' [s] "over"; [n] ./*[1]; [p] (pause:400)');
  cvox.MathNode.defineMathmlRule(
      'munder', 'default.default',
      '[n] ./*[2] (pitch:-0.35); [s] "under"; [n] ./*[1]; [p] (pause:400)');
  cvox.MathNode.defineMathmlRule(
      'munderover', 'default.default',
      '[n] ./*[2] (pitch:-0.35); [s] "under and"; [n] ./*[3] (pitch:0.35);' +
          ' [s] "over"; [n] ./*[1]; [p] (pause:400)');

  // Layout elements.
  cvox.MathNode.defineMathmlRule('mrow',
                                 'default.default', '[m] ./*');
  cvox.MathNode.defineMathmlRule(
      'msqrt', 'default.default',
      '[s] "Square root of"; [n] ./*[1] (rate:0.2); [p] (pause:400)');
  cvox.MathNode.defineMathmlRule(
      'mroot', 'default.default',
      '[s] "root of order"; [n] ./*[2]; [s] "of";' +
          '[n] ./*[1] (rate:0.2); [p] (pause:400)');
  cvox.MathNode.defineMathmlRule(
      'mfrac', 'default.default',
      '[p] (pause:250); [n] ./*[1] (rate:0.2); [p] (pause:250);' +
          ' [s] "divided by"; [n] ./*[2] (rate:0.2); [p] (pause:400)');

  // MathJax Rules
  cvox.MathNode.defineRule(
      'mj-mfrac', 'Mathjax', 'default.default',
      '[p] (pause:250); [n] ./*[1]/*[1]/*[1] (rate:0.2); [p] (pause:250);' +
          ' [s] "divided by"; [n] ./*[1]/*[2]/*[1] (rate:0.2);' +
              '[p] (pause:400)',
      'self::span[@class="mfrac"]');
  cvox.MathNode.defineRule(
      'mj-mo', 'Mathjax', 'default.default',
      '[n] ./*[1]/text() (rate:-0.1)',
      'self::span[@class="mo"]', './*[1]/text()');
  cvox.MathNode.defineRule(
      'mj-mi', 'Mathjax', 'default.default',
      '[n] ./*[1]/text()', 'self::span[@class="mi"]', './*[1]/text()');
  cvox.MathNode.defineRule(
      'mj-mn', 'Mathjax', 'default.default',
      '[n] text()', 'self::span[@class="mn"]', './*[1]/text()');
  cvox.MathNode.defineRule(
      'mj-msubsup', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [s] "sub"; [n] ./*[1]/*[3]/*[1] (pitch:-0.35);' +
      '[p] (pause:200); [s] "super"; [n] ./*[1]/*[2]/*[1] (pitch:0.35);' +
      '[p] (pause:300)',
      'self::span[@class="msubsup"]');

  cvox.MathNode.defineRule(
      'mj-msub', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [s] "sub";' +
          '[n] ./*[1]/*[2]/*[1] (pitch:-0.35); [p] (pause:300)',
      'self::span[@class="msub"]');
  // The following rule fixes a bug in MathJax's LaTeX translation.

  cvox.MathNode.defineRule(
      'mj-msup', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [s] "super";' +
          '[n] ./*[1]/*[2]/*[1] (pitch:0.35); [p] (pause:300)',
      'self::span[@class="msup"]');
  // The following rule fixes a bug in MathJax's LaTeX translation.

  cvox.MathNode.defineRule(
      'mj-msqrt', 'Mathjax', 'default.default',
      '[s] "Square root of";' +
          '[n] ./*[1]/*[1]/*[1] (rate:0.2); [p] (pause:400)',
      'self::span[@class="msqrt"]');
  cvox.MathNode.defineRule(
      'mj-munderover', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[2]/*[1] (pitch:0.35); [s] "under and";' +
          '[n] ./*[1]/*[3]/*[1] (pitch:-0.35); [s] "over";' +
              '[n] ./*[1]/*[1]/*[1]; [p] (pause:400)',
      'self::span[@class="munderover"]');
  cvox.MathNode.defineRule(
      'mj-munder', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[2]/*[1] (pitch:0.35); [s] "under";' +
          '[n] ./*[1]/*[1]/*[1]; [p] (pause:400)',
      'self::span[@class="munder"]');
  // The following rule fixes a bug in MathJax's LaTeX translation.

  cvox.MathNode.defineRule(
      'mj-mover', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[2]/*[1] (pitch:0.35); [s] "over";' +
          '[n] ./*[1]/*[1]/*[1]; [p] (pause:400)',
      'self::span[@class="mover"]');
  // The following rule fixes a bug in MathJax's LaTeX translation.

  cvox.MathNode.defineRule(
      'mj-mo-ext', 'Mathjax', 'default.default',
      '[n] extender', 'self::span[@class="mo"]',
      './*[1]/*[1]/text()', './*[1]/*[2]/text()');
  cvox.MathNode.defineRule(
      'mj-texatom', 'Mathjax', 'default.default',
      '[n] ./*[1]', 'self::span[@class="texatom"]');

  // TODO (sorge) Sort out mfenced case with extender fences.
  cvox.MathNode.defineRule(
      'mj-mfenced', 'Mathjax', 'default.default',
      '[s] "open"; [n] ./*[1]; [m] ./*[position()>1 and position()<last()];' +
          ' [s] "closing"; [n] ./*[last()]',
      'self::span[@class="mfenced"]');
};


/**
 * Initialize mathJax Aliases
 */
cvox.MathNodeRules.initAliases = function() {

  // Space elements

  cvox.MathNode.defineRuleAlias('mspace',
                                'self::span[@class="mspace"]');

  cvox.MathNode.defineRuleAlias('mstyle',    // MathJax mstyle
                                'self::span[@class="mstyle"]');

  cvox.MathNode.defineRuleAlias('mpadded',    // MathJax mpadded
                                'self::span[@class="mpadded"]');

  cvox.MathNode.defineRuleAlias('merror',    // MathJax merror
                                'self::span[@class="merror"]');

  cvox.MathNode.defineRuleAlias('mphantom',    // MathJax mphantom
                                'self::span[@class="mphantom"]');

  // Token elements.

  cvox.MathNode.defineRuleAlias('mtext',     // MathJax mtext
                                'self::span[@class="mtext"]');

  cvox.MathNode.defineRuleAlias('mi',    // MathJax mi
                                'self::span[@class="mi"]', './text()');

  cvox.MathNode.defineRuleAlias('mo',    // MathJax mo
                                'self::span[@class="mo"]', './text()');

  cvox.MathNode.defineRuleAlias('mn',    // MathJax mn
                                'self::span[@class="mn"]', './text()');

  cvox.MathNode.defineRuleAlias('ms',    // Mathjax ms
                                'self::span[@class="ms"]');

  // Layout elements.

  cvox.MathNode.defineRuleAlias('mrow',     // MathJax mrow
                                'self::span[@class="mrow"]');

  // The following rule fixes a bug in MathJax's LaTeX translation.
  cvox.MathNode.defineRuleAlias(
      'mj-msub', 'self::span[@class="msubsup"]', 'mathmlmsub');

  // The following rule fixes a bug in MathJax's LaTeX translation.
  cvox.MathNode.defineRuleAlias(
      'mj-msup', 'self::span[@class="msubsup"]', 'mathmlmsup');

  // The following rule fixes a bug in MathJax's LaTeX translation.
  cvox.MathNode.defineRuleAlias(
      'mj-munder', 'self::span[@class="munderover"]', 'mathmlmunder');

  // The following rule fixes a bug in MathJax's LaTeX translation.
  cvox.MathNode.defineRuleAlias(
      'mj-mover', 'self::span[@class="munderover"]', 'mathmlmover');

  // TODO (sorge) Sort out mfenced case with extender fences.

};



/**
 * Initialize specializations wrt. content of nodes.
 */
cvox.MathNodeRules.initSpecializationRules = function() {

  // Some special nodes for square and cube.
  // MathML
  cvox.MathNode.defineRule(
      'square', 'MathML', 'default.default',
      '[n] ./*[1]; [s] "square" (pitch:0.35); [p] (pause:300)',
      'self::mathml:msup', './*[2][text()=2]');
  cvox.MathNode.defineRuleAlias(
      'square', 'self::mathml:msup',
      './mathml:mrow=./*[2]', 'count(./*[2]/*)=1', './*[2]/*[1][text()=2]');

  cvox.MathNode.defineRule(
      'cube', 'MathML', 'default.default',
      '[n] ./*[1]; [s] "cube" (pitch:0.35); [p] (pause:300)',
      'self::mathml:msup', './*[2][text()=3]');
  cvox.MathNode.defineRuleAlias(
      'cube', 'self::mathml:msup',
      './mathml:mrow=./*[2]', 'count(./*[2]/*)=1', './*[2]/*[1][text()=3]');

  cvox.MathNode.defineRule(
      'square-sub', 'MathML', 'default.default',
      '[n] ./*[1]; [s] "sub"; [n] ./*[2] (pitch:-0.35);' +
          '[p] (pause:300); [s] "square" (pitch:0.35); [p] (pause:400)',
      'self::mathml:msubsup', './*[3][text()=2]');
  cvox.MathNode.defineRuleAlias(
      'square-sub', 'self::mathml:msubsup',
      './mathml:mrow=./*[3]', 'count(./*[3]/*)=1', './*[3]/*[1][text()=2]');

  cvox.MathNode.defineRule(
      'cube-sub', 'MathML', 'default.default',
      '[n] ./*[1]; [s] "sub"; [n] ./*[2] (pitch:-0.35);' +
          '[p] (pause:300); [s] "cube" (pitch:0.35); [p] (pause:400)',
      'self::mathml:msubsup', './*[3][text()=3]');
  cvox.MathNode.defineRuleAlias(
      'cube-sub', 'self::mathml:msubsup',
      './mathml:mrow=./*[3]', 'count(./*[3]/*)=1', './*[3]/*[1][text()=3]');

  // MathJax
  cvox.MathNode.defineRule(
      'mj-square', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [s] "square" (pitch:0.35); [p] (pause:300)',
      'self::span[@class="msup"]', './*[1]/*[2]/*[1][text()=2]');
  cvox.MathNode.defineRuleAlias(
      'mj-square', 'self::span[@class="msup"]',
      './*[1]/*[2]/*[1]=./*[1]/*[2]/span[@class="mrow"]',
      'count(./*[1]/*[2]/*[1]/*)=1', './*[1]/*[2]/*[1]/*[1][text()=2]');
  cvox.MathNode.defineRuleAlias(
      'mj-square', 'self::span[@class="msubsup"]', 'mathmlmsup',
      './*[1]/*[2]/*[1][text()=2]');
  cvox.MathNode.defineRuleAlias(
      'mj-square', 'self::span[@class="msubsup"]', 'mathmlmsup',
      './*[1]/*[2]/*[1]=./*[1]/*[2]/span[@class="mrow"]',
      'count(./*[1]/*[2]/*[1]/*)=1', './*[1]/*[2]/*[1]/*[1][text()=2]');

  cvox.MathNode.defineRule(
      'mj-cube', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [s] "cube" (pitch:0.35); [p] (pause:300)',
      'self::span[@class="msup"]', './*[1]/*[2]/*[1][text()=3]');
  cvox.MathNode.defineRuleAlias(
      'mj-cube', 'self::span[@class="msup"]',
      './*[1]/*[2]/*[1]=./*[1]/*[2]/span[@class="mrow"]',
      'count(./*[1]/*[2]/*[1]/*)=1', './*[1]/*[2]/*[1]/*[1][text()=3]');
  cvox.MathNode.defineRuleAlias(
      'mj-cube', 'self::span[@class="msubsup"]', 'mathmlmsup',
      './*[1]/*[2]/*[1][text()=3]');
  cvox.MathNode.defineRuleAlias(
      'mj-cube', 'self::span[@class="msubsup"]', 'mathmlmsup',
      './*[1]/*[2]/*[1]=./*[1]/*[2]/span[@class="mrow"]',
      'count(./*[1]/*[2]/*[1]/*)=1', './*[1]/*[2]/*[1]/*[1][text()=3]');

  cvox.MathNode.defineRule(
      'mj-square-sub', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [s] "sub"; [n] ./*[1]/*[3]/*[1] (pitch:-0.35); ' +
          '[p] (pause:300); [s] "square" (pitch:0.35); [p] (pause:400)',
      'self::span[@class="msubsup"]', './*[1]/*[2]/*[1][text()=2]');
  cvox.MathNode.defineRuleAlias(
      'mj-square-sub', 'self::span[@class="msubsup"]',
      './*[1]/*[2]/*[1]=./*[1]/*[2]/span[@class="mrow"]',
      'count(./*[1]/*[2]/*[1]/*)=1', './*[1]/*[2]/*[1]/*[1][text()=2]');

  cvox.MathNode.defineRule(
      'mj-cube-sub', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [s] "sub"; [n] ./*[1]/*[3]/*[1] (pitch:-0.35); ' +
          '[p] (pause:300); [s] "cube" (pitch:0.35); [p] (pause:400)',
      'self::span[@class="msubsup"]', './*[1]/*[2]/*[1][text()=3]');
  cvox.MathNode.defineRuleAlias(
      'mj-cube-sub', 'self::span[@class="msubsup"]',
      './*[1]/*[2]/*[1]=./*[1]/*[2]/span[@class="mrow"]',
      'count(./*[1]/*[2]/*[1]/*)=1', './*[1]/*[2]/*[1]/*[1][text()=3]');
};
