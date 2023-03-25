import { DOMSerializer, Node, Schema } from 'prosemirror-model'
import { VHTMLDocument, createHTMLDocument } from 'zeed-dom'
import type { SchemaTransformer } from './transformers'

export type JSONContent = {
  [key: string]: any
  type?: string
  attrs?: Record<string, any>
  content?: JSONContent[]
  marks?: {
    [key: string]: any
    type: string
    attrs?: Record<string, any>
  }[]
  text?: string
}

interface RendererOptions {
  schema: Schema
  transformers?: SchemaTransformer[]
}

export class Renderer {
  schema: Schema
  transformers: SchemaTransformer[]
  serializer: DOMSerializer

  constructor(options: RendererOptions) {
    this.schema = options.schema
    this.transformers = options.transformers || []

    for (const name in this.schema.nodes) {
      const node = this.schema.nodes[name]

      if (!node) continue

      if (!node.spec.toDOM) {
        continue
      }

      for (const transformer of this.transformers) {
        if (transformer.condition(node)) {
          const oldToDOM = node.spec.toDOM
          node.spec.toDOM = transformer.transform({ oldToDOM, node })
        }
      }
    }

    this.serializer = DOMSerializer.fromSchema(this.schema)
  }

  render(docJSON: JSONContent): string {
    const doc = Node.fromJSON(this.schema, docJSON)
    const document = this.serializer.serializeFragment(doc.content, {
      document: createHTMLDocument() as unknown as Document,
    }) as unknown as VHTMLDocument

    return document.render()
  }
}
