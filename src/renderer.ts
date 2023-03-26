import { DOMSerializer, Node } from 'prosemirror-model'
import type { Schema } from 'prosemirror-model'
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

/**
 * RendererOptions
 * @param schema - The schema to use for rendering
 * @param transformers - An array of transformers to apply to the schema
 */
interface RendererOptions {
  schema: Schema
  transformers?: SchemaTransformer[]
}

export class Renderer {
  schema: Schema
  transformers: SchemaTransformer[]
  serializer: DOMSerializer

  /**
   * Renderer
   * @param options - RendererOptions
   * @param options.schema - The schema to use for rendering
   * @param options.transformers - An array of transformers to apply to the schema
   * @example
   * const renderer = new Renderer({
   *  schema,
   * transformers: [ new AddBreaksToEmptyTextblocks()]
   * })
   *
   * const html = renderer.render(doc)
   * */
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

  /**
   * Render a document to HTML string
   * @param docJSON - The document to render
   * @returns The rendered HTML string of the document using the (transformed) schema
   */

  render(docJSON: JSONContent): string {
    const doc = Node.fromJSON(this.schema, docJSON)
    const document = this.serializer.serializeFragment(doc.content, {
      document: createHTMLDocument() as unknown as Document,
    }) as unknown as VHTMLDocument

    return document.render()
  }
}
