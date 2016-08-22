# StyleScript

StyleScript aims to provide a way to write stylesheets with the power of JavaScript.

The basic idea behind this package is to export object-represented stylesheet which can be parsed with [PostCSS JS](https://github.com/postcss/postcss-js) and, hence, it can be easily used together with [PostCSS plugins](https://github.com/postcss/postcss#plugins) such as [autoprefixer](https://github.com/postcss/autoprefixer) and [cssnano](http://cssnano.co).


## Installation

```bash
$ npm install --save-dev style-script
```


## Examples

### Basic Rule

```javascript
import { StyleSheet } from 'style-script'

const styles = StyleSheet()
  .addRule('html', {
    fontSize: 16,
    lineHeight: 1.5,
  })

console.log(styles.export())
```

```json
{
  "html": {
    "fontSize": 16,
    "lineHeight": 1.5
  }
}
```

### Rule with Multiple Selectors

```javascript
import { StyleSheet } from 'style-script'

const styles = StyleSheet()
  .addRule(['html', 'body'], {
    margin: 0,
  })

console.log(styles.export())
```

```json
{
  "html,body": {
    "margin": 0
  }
}
```

### Nested Rule

```javascript
import { StyleSheet, Decl } from 'style-script'

const styles = StyleSheet()
  .addRule('.wrapper',
    Decl({})
      .nest(_ => [`${_}:hover`, `${_}:focus`], {})
      .nest([_ => `${_}::before`, _ => `${_}::after`], {})
      .nest(_ => `${_} > .child`, {})
      .nest('> .another-child', {})
      .nest('.descendant', {})
  )

console.log(styles.export())
```

```json
{
  ".wrapper": {},
  ".wrapper:hover,.wrapper:focus": {},
  ".wrapper::before,.wrapper::after": {},
  ".wrapper > .child": {},
  ".wrapper > .another-child": {},
  ".wrapper .descendant": {}
}
```

### Predefined Selector Functions

```javascript
import { StyleSheet, Decl, $ } from 'style-script'

const styles = StyleSheet()
  .addRule('.wrapper',
    Decl()
      .nest($._.empty, {})
      .nest($._.child('.child'), {})
      .nest($._.not($.firstChild), {})
      .nest([$._, $._.before, $._.after], {})
  )

console.log(styles.export())
```

```json
{
  ".wrapper:empty": {},
  ".wrapper>.child": {},
  ".wrapper:not(:first-child)": {},
  ".wrapper,.wrapper::before,.wrapper::after": {}
}
```

### Mixin

```javascript
import { StyleSheet, Decl } from 'style-script'

const size = (width, height) => ({ width, height })

const styles = StyleSheet()
  .addRule('.box',
    Decl({
      display: 'block',
    })
      .mixin(size(400, 500))
  )

console.log(styles.export())
```

```json
{
  ".box": {
    "width": 400,
    "height": 500,
    "display": "block"
  }
}
```

### Media Query

```javascript
import { StyleSheet, Decl } from 'style-script'

const styles = StyleSheet()
  .addRule('html',
    Decl({
      fontSize: 12,
    })
      .atMedia('screen and (min-width: 480px)', {
        fontSize: 14,
      })
      .atMedia('screen and (min-width: 640px)', {
        fontSize: 16,
      })
  )

console.log(styles.export())
```

```json
{
  "html": {
    "fontSize": 12
  },

  "@media screen and (min-width: 480px)": {
    "html": {
      "fontSize": 14
    }
  },

  "@media screen and (min-width: 640px)": {
    "html": {
      "fontSize": 16
    }
  }
}
```

### Media Object

```javascript
import { StyleSheet, Decl, Media } from 'style-script'

const largeScreen = Media({
  modifier: 'only',
  type: 'screen',
  features: { minWidth: '800px' }
})

const styles = StyleSheet()
  .addRule('html',
    Decl({
      fontSize: 12,
    })
      .atMedia(largeScreen, {
        fontSize: 14,
      })
  )

console.log(styles.export())
```

```json
{
  "html": {
    "fontSize": 12
  },

  "@media only screen and (min-width: 800px)": {
    "html": {
      "fontSize": 14
    }
  }
}
```


## Integration with PostCSS JS

To transform styles constructed with StyleScript into CSS, just pass the result of `styles.export()` to the `postcss-js` parser:

```javascript
import postcss from 'postcss'
import postcssJs from 'postcss-js'

import { StyleSheet } from 'style-script'

const styles = StyleSheet()
  .addRule('html', {
    fontSize: 16,
    lineHeight: 1.5,
  })

postcss()
  .process(styles.export(), { parser: postcssJs })
  .then(result => {
    console.log(result.css)
  })
```

```css
html {
  font-size: 16px;
  line-height: 1.5;
}
```

### Webpack & PostCSS JS Loader

If you're using [Webpack](http://webpack.github.io), you can use [PostCSS JS Loader](https://github.com/jason2506/postcss-js-loader) to load stylesheets transformed by `postcss-js` parser and PostCSS plugins.

Here's example Webpack config:

```javascript
// webpack.config.babel.js

export default {
  module: {
    loaders: [
      {
        test: /\.css\.js$/,
        loader: 'style!css!postcss-js!babel',
      },
    ],
  },
}
```

Then, you just need to export the stylesheet object

```javascript
// styles.css.js

import { StyleSheet } from 'style-script'

const styles = StyleSheet()
  .addRule('html', {
    fontSize: 16,
    lineHeight: 1.5,
  })

export default styles.export()
```

and import this module directly

```javascript
import './path/to/styles.css'
// style-loader will inject resulting CSS code into the DOM
```


## Limitations

### Rules with the Same Selector

Due to the fact that stylesheet is exported as a JavaScript object, which does not allow duplicate keys, you cannot define more than one rule with the same selector in a single stylesheet object.

For example,

```javascript
styles.addRule('.foo', { /* ... */ })
styles.addRule('.bar', { /* ... */ })
styles.addRule('.foo', { /* ... */ })
```

if you are trying to export the stylesheet with `styles.export()`, you will get an error:

```
Error: Rule alread defined: ".foo"
```

StyleScript does not merge these rules automatically, since it cannot ensure that the order of declarations is consistent with the order of `styles.addRule()`.

### Unresolvable Mixin Application

For similar reasons, StyleScript must ensure that the relative orders of rules in mixins are retained after merging them into a single stylesheet.

Thus,

```javascript
const m1 = Decl()
  .nest('.a', { /* ... */ })
  .nest('.c', { /* ... */ })
  .nest('.e', { /* ... */ })

const m2 = Decl()
  .nest('.b', { /* ... */ })
  .nest('.c', { /* ... */ })
  .nest('.d', { /* ... */ })

const decl = Decl()
  .nest('.a', { /* ... */ })
  .nest('.b', { /* ... */ })
  .nest('.e', { /* ... */ })

styles.addRule('.wrapper', decl.mixin(m1).mixin(m2))
```

these ordered lists of rules will be resolved into

```javascript
{
  '.wrapper .a': { /* ... */ },
  '.wrapper .b': { /* ... */ },
  '.wrapper .c': { /* ... */ },
  '.wrapper .d': { /* ... */ },
  '.wrapper .e': { /* ... */ }
}
```

In contrast,

```javascript
const m = Decl()
  .nest('.x', { /* ... */ })
  .nest('.y', { /* ... */ })

const decl = Decl()
  .nest('.y', { /* ... */ })
  .nest('.x', { /* ... */ })

styles.addRule('.wrapper', decl.mixin(m))
```

the stylesheet above is unresolvable and you will get an error while trying to export it with `styles.export()`:

```
Error: There is no solution for the merge operation
```
