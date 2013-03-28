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


/**
 * Speech rules for Math nodes.
 * @type {Array.<{category: string,
 *                mappings: Object,
 *                key: string,
 *                names: Array.<string|Object>}>}
 * @const
 * Format:
 * category -- Category of trees the rules belong to (e.g. MathML).
 * key -- Unique name for the mapping.
 * names -- Names of nodes mapping to the given rules. (E.g., we can
 *          have two different node types map to the same rule.
 * mappings -- Mappings to speech rules by domain.
 */
cvox.MathNodeRules.DEFAULT_SPEECH_RULES = [
  // Token elements.
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': 'text()'}]
     }
   },
   'key': 'mtext',
   'names': ['self::mathml:mtext']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': 'text()',
                    'volume': '0.2'}],
       'short': [{'function': 'text()'}]
     }
   },
   'key': 'mi',
   'names': ['self::mathml:mi',
            {'node': 'self::span[@class="mi"]',
             'constraints': ['./text()']}]
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': 'text()',
                   'pitch': '-1'}],
       'short': [{'function': 'text()'}]
     }
   },
   'key': 'mo',
   'names': ['self::mathml:mo',
             {'node': 'self::span[@class="mo"]',
              'constraints': ['./text()']}]
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': 'text()'}]
     }
   },
   'key': 'mn',
   'names': ['self::mathml:mn',
             {'node': 'self::span[@class="mn"]',
              'constraints': ['./text()']}]
  },
  {'category': 'Mathml',
   'mappings': {'default': {'default': []}},
   'key': 'mspace',
   'names': ['self::mathml:mspace']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': 'text()'}]
     }
   },
   'key': 'ms',
   'names': ['self::mathml:ms']
  },

  // Script elements.
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]'},
                   'super',
                   {'function': './*[2]',
                    'pitch': '0.2'}
                  ]
     }
   },
   'key': 'msup',
   'names': ['self::mathml:msup']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]'},
                   'sub',
                   {'function': './*[2]',
                    'pitch': '-0.1'},
                   'super',
                   {'function': './*[3]',
                    'pitch': '0.1'}
                  ]
     }
   },
   'key': 'msubsup',
   'names': ['self::mathml:msubsup']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]'},
                   'sub',
                   {'function': './*[2]',
                    'pitch': '-0.1'}
                  ]
     }
   },
   'key': 'msub',
   'names': ['self::mathml:msub']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': './*[2]'},
                   'over',
                   {'function': './*[1]'}
                  ]
     }
   },
   'key': 'mover',
   'names': ['self::mathml:mover']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': './*[2]'},
                   'under',
                   {'function': './*[1]'}
                  ]
     }
   },
   'key': 'munder',
   'names': ['self::mathml:munder']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': './*[2]',
                   'pitch': '0.1'},
                   'under and',
                   {'function': './*[3]',
                    'pitch': '-0.1'},
                   'over',
                   {'function': './*[1]'}
                  ],
       'short': [{'function': './*[1]'},
                   'from',
                 {'function': './*[2]',
                  'pitch': '0.1'},
                   'to',
                 {'function': './*[3]',
                    'pitch': '-0.1'}
                  ]
     }
   },
   'key': 'munderover',
   'names': ['self::mathml:munderover']
  },

  // Layout elements.
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'selector': './*',
                    'separator': 'next'
                   }],
       'alternative': [{'selector': './*',
                        'cont-function': 'nodeCounter',
                        'cont-string': 'element',
                        'separator': 'next',
                        'volume': '0.5'
                       }],
       'short': [{'selector': './*'}]
     }

   },
   'key': 'mrow',
   'names': ['self::mathml:mrow', 'self::span[@class="mrow"]']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': ['Square root of',
                   {'function': './*[1]'}
                  ]
     }
   },
   'key': 'msqrt',
   'names': ['self::mathml:msqrt']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': ['root of order',
                   {'function': './*[2]'},
                   'of',
                   {'function': './*[1]'}
                  ]
     }
   },
   'key': 'mroot',
   'names': ['self::mathml:mroot']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]'},
                   'over',
                   {'function': './*[2]',
                   'pitch': '0.1'}
                  ]
     }
   },
   'key': 'mfrac',
   'names': ['self::mathml:mfrac']
  },
  // Empty layout elements
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]'}]
     }
   },
   'key': 'mstyle',
   'names': ['self::mathml:mstyle', 'self::span[@class="mstyle"]']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]'}]
     }
   },
   'key': 'mpadded',
   'names': ['self::mathml:mpadded', 'self::span[@class="mpadded"]']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]'}]
     }
   },
   'key': 'merror',
   'names': ['self::mathml:merror', 'self::span[@class="merror"]']
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]'}]
     }
   },
   'key': 'mphantom',
   'names': ['self::mathml:mphantom', 'self::span[@class="mphantom"]']
  },

// MathJax Rules
  {'category': 'Mathjax',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]/*[1]/*[1]'},
                   'over',
                   {'function': './*[1]/*[2]/*[1]',
                   'pitch': '0.1'}
                  ]
     }
   },
   'key': 'mj-mfrac',
   'names': ['self::span[@class="mfrac"]']
  },
  {'category': 'Mathjax',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]/text()',
                   'pitch': '-1'}],
       'short': [{'function': './*[1]/text()'}]
     }
   },
   'key': 'mj-mo',
   'names': [{'node': 'self::span[@class="mo"]',
              'constraints': ['./*[1]/text()']}]
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]/text()',
                    'volume': '0.2'}],
       'short': [{'function': './*[1]/text()'}]
     }
   },
   'key': 'mj-mi',
   'names': [{'node': 'self::span[@class="mi"]',
              'constraints': ['./*[1]/text()']}]
  },
  {'category': 'Mathml',
   'mappings': {
     'default': {
       'default': [{'function': 'text()'}]
     }
   },
   'key': 'mj-mn',
   'names': [{'node': 'self::span[@class="mn"]',
              'constraints': ['./*[1]/text()']}]
  },
  {'category': 'Mathjax',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]/*[1]/*[1]'},
                   'sub',
                   {'function': './*[1]/*[3]/*[1]',
                    'pitch': '0.1'},
                   'super',
                   {'function': './*[1]/*[2]/*[1]',
                    'pitch': '-0.1'}
                  ]
     }
   },
   'key': 'mj-msubsup',
   'names': ['self::span[@class="msubsup"]']
  },
  {'category': 'Mathjax',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]/*[1]/*[1]'},
                   'sub',
                   {'function': './*[1]/*[2]/*[1]',
                    'pitch': '0.1'}
                  ]
     }
   },
   'key': 'mj-msub',
   'names': ['self::span[@class="msub"]',
             // The following rule fixes a bug in MathJax's LaTeX translation.
             {'node': 'self::span[@class="msubsup"]',
              'constraints': ['not(self::span[@class="msubsup"]/*[1]/*[3])',
                              'substring(substring-before(substring-after(./' +
                              '*[1]/*[1]/@style, "top: "), ";"), 0, ' +
                              'string-length(substring-before(' +
                              'substring-after(./*[1]/*[1]/@style, ' +
                              '"top: "), ";"))-1)' +
                              ' <= ' +
                              'substring(substring-before(substring-after(' +
                              './*[1]/*[2]/@style, "top: "), ";"), 0, ' +
                              'string-length(substring-before(' +
                              'substring-after(./*[1]/*[2]/@style, ' +
                              '"top: "), ";"))-1)']}
            ]
  },
  {'category': 'Mathjax',
   'mappings': {
     'default': {
       'default': [{'function': './*[1]/*[1]/*[1]'},
                   'super',
                   {'function': './*[1]/*[2]/*[1]',
                    'pitch': '-0.1'}
                  ]
     }
   },
   'key': 'mj-msup',
   'names': ['self::span[@class="msup"]',
             // The following rule fixes a bug in MathJax's LaTeX translation.
             {'node': 'self::span[@class="msubsup"]',
              'constraints': ['not(self::span[@class="msubsup"]/*[1]/*[3])',
                              'substring(substring-before(substring-after(./' +
                              '*[1]/*[1]/@style, "top: "), ";"), 0, ' +
                              'string-length(substring-before(' +
                              'substring-after(./*[1]/*[1]/@style, ' +
                              '"top: "), ";"))-1)' +
                              ' > ' +
                              'substring(substring-before(substring-after(' +
                              './*[1]/*[2]/@style, "top: "), ";"), 0, ' +
                              'string-length(substring-before(' +
                              'substring-after(./*[1]/*[2]/@style, ' +
                              '"top: "), ";"))-1)']}
            ]
  }
];
