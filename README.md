# postcss-scope 🔭

A small plugin create to scope your css with a custom selector

## Installation
```bash
# pnpm
pnpm add postcss-scope --save-dev

# npm
npm install postcss-scope --save-dev

# yarn
yarn add postcss-scope --dev
```

## Setup

### Basic
```javascript
// postcss.config.js

export default {
    plugins: {
        "postcss-scope": ".foot",
    },
};
```

### With Tailwind
```javascript
// postcss.config.js

export default {
    plugins: {
        "postcss-import": {},
        tailwindcss: {},
        autoprefixer: {},
        "postcss-scope": ".foo",
    },
};
```

## Usage

```css
.foo html {
    font-size: 12px;
}

.foo body {
    font-size: 12px;
}
```

### Ignore rules

Add a comment to specify particular rules that should not be scoped

```css
.foo html {
    font-size: 12px;
}

/* postcss-scope:ignore */
body {
    font-size: 12px;
}
```

### Ignore files

Add a comment to specify files that the plugin should ignore

```css
/* postcss-scope:ignore-file */

html {
    font-size: 12px;
}

body {
    font-size: 12px;
}
```


### Override global selector

Add a comment to override the selector for a particular file

```css
/* postcss-scope:.bar */

.bar html {
    font-size: 12px;
}

.bar body {
    font-size: 12px;
}
```
