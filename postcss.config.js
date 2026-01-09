export default {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'not ie 11'
      ],
      grid: 'autoplace',
      flexbox: 'no-2009'
    },
    cssnano: {
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true
          },
          normalizeWhitespace: true,
          colormin: true,
          minifyFontValues: true,
          minifySelectors: true,
          reduceIdents: false,
          zindex: false,
          mergeLonghand: true,
          mergeRules: true,
          cssDeclarationSorter: {
            order: 'smacss'
          },
          calc: {
            precision: 5
          },
          convertValues: {
            length: true,
            precision: 5
          },
          normalizeUrl: true,
          discardUnused: {
            fontFace: false,
            keyframes: false
          },
          minifyGradients: true,
          svgo: {
            plugins: [
              {
                name: 'removeViewBox',
                active: false
              },
              {
                name: 'cleanupIDs',
                active: true
              }
            ]
          }
        }
      ]
    }
  }
};