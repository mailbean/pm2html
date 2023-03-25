> :warning: **This is a work in progress**: The API might change at any time. Please open an issue if you have any suggestions to improve the API.

> :mag: **Help Wanted**: If you have suggestions to improve the API, please open an issue or a pull request.

> :handshake: **Sharing is caring**: If you have any Transformer that you think might be useful to others, please open a pull request to add it to the included transformers.

# pm2html

<!-- npm -->

[![npm](https://img.shields.io/npm/v/pm2html.svg)](https://www.npmjs.com/package/pm2html)
[![npm](https://img.shields.io/npm/dt/pm2html.svg)](https://www.npmjs.com/package/pm2html)
[![npm](https://img.shields.io/npm/l/pm2html.svg)](https://www.npmjs.com/package/pm2html)

This codebase contains the Renderer class and a SchemaTransformer interface, which are used to modify and render ProseMirror nodes/documents to HTML in Node.js

## Installation

```bash
npm install pm2html
```

## Getting Started

```javascript
import { Renderer } from 'pm2html'

const schema = /_ your ProseMirror schema _/
const renderer = new Renderer({ schema })

const doc = /_ your ProseMirror node _/

const html = renderer.render(doc)
```

If you want to get the `<br>` back, that ProseMirror removes from empty Textblocks when exporting to HTML, you can use the `AddBreaksToEmptyTextblocks` transformer to create your own DOMSerializer. This transformer will add `<br>` to empty textblocks

```javascript
import { Renderer, AddBreaksToEmptyTextblocks } from 'pm2html'

const schema = /_ your ProseMirror schema _/
const renderer = new Renderer({ schema, transformers: [new AddBreaksToEmptyTextblocks()] })
```

Or another example, if you want to add a class to all headings, you can use the `AddIdToHeadings` transformer.

```javascript
import { Renderer, AddIdToHeadings } from 'pm2html'

const schema = /_ your ProseMirror schema _/
const renderer = new Renderer({
  schema,
  transformers: [new AddIdToHeadings(/* your id generator */)],
})
```

## With TipTap

```javascript
import { Renderer, AddBreaksToEmptyTextblocks } from 'pm2html'
import { getSchema } from '@tiptap/core'

const schema = getSchema([/_ your TipTap extensions _/])

const renderer = new Renderer({ schema, transformers: [new AddBreaksToEmptyTextblocks()] })

const doc = TipTapEditor.toJSON()

const html = renderer.render(doc)
```

## Custom Transformers

You can create your own transformers by implementing the `SchemaTransformer` interface. See the [SchemaTransformer](#schematransformer) section for more information.

```javascript
import { Renderer, SchemaTransformer } from 'pm2html'

class AddClassToHeading implements SchemaTransformer {
  transform = ({ oldToDOM }) => {
    return (node) => {
      const dom = oldToDOM(node)
      if (Array.isArray(dom)) {
        const attrs = dom[1] || {}

        if (attrs.class) {
          attrs.class += ' my-heading'
        } else {
          attrs.class = 'my-heading'
        }

        dom[1] = attrs
      }
      return dom
    }
  }

  condition = (node) => node.name === 'heading'
}

const schema = /_ your ProseMirror schema _/
const renderer = new Renderer({ schema, transformers: [new AddClassToHeading()] })
```

## Renderer

The Renderer class takes in a ProseMirror schema and an optional array of SchemaTransformers. It then modifies the toDOM functions of the schema nodes based on the conditions specified in the transformers. Finally, it provides a render function that takes in a JSON object representing a ProseMirror node (Prosemirror document) and returns an HTML string.

## SchemaTransformer

Create a class implementing the SchemaTransformer interface. Said class provides a way to modify the toDOM function of a ProseMirror node based on a condition. It takes in a transform function and a condition function. The transform function gets in the original toDOM function and the NodeType being transformed, and returns a new toDOM function. The condition function takes in a node and returns true if the transformer should be applied to the node.
