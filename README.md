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


## Integration with PostCSS JS

StyleScript is designed for integrating with [PostCSS JS](https://github.com/postcss/postcss-js).

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

If you're using Webpack, you can use [PostCSS JS Loader](https://github.com/jason2506/postcss-js-loader) to load stylesheets transformed by `postcss-js` parser and PostCSS plugins.

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

export styles.export()
```

and import this module directly

```javascript
import './path/to/styles.css'
// style-loader will inject resulting CSS code into the DOM
```
