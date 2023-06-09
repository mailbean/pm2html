import type { DOMOutputSpec, NodeType, Node } from 'prosemirror-model'

export type TransformFunction = ({
  oldToDOM,
  node,
}: {
  oldToDOM: (node: Node) => DOMOutputSpec
  node: NodeType
}) => (node: Node) => DOMOutputSpec

export type ConditionFunction = (node: NodeType) => boolean

/**
 * Every object that implements this interface can be used as a transformer.
 * The `transform` function is used to modify the toDOM function of a node. Therefore changing how the node gets serialized to HTML.
 * The `condition` function is used to determine if the transformer should be applied to a NodeType.
 */
export interface SchemaTransformer {
  transform: TransformFunction
  condition: ConditionFunction
}

export class AddBreaksToEmptyTextblocks implements SchemaTransformer {
  transform: TransformFunction = ({ oldToDOM }) => {
    return (node: Node) => {
      const dom = oldToDOM(node)
      if (node.content.size === 0 && Array.isArray(dom)) {
        const holeIndex = dom.findIndex((item) => item === 0)
        if (holeIndex !== -1) {
          dom[holeIndex] = ['br', {}]
        }
      }
      return dom
    }
  }

  condition: ConditionFunction = (node) => node.isTextblock
}

export class AddIdToHeadings implements SchemaTransformer {
  createId: (node: Node) => string

  constructor(createId: (node: Node) => string) {
    this.createId = createId
  }

  transform: TransformFunction = ({ oldToDOM }) => {
    return (node: Node) => {
      const dom = oldToDOM(node)
      if (node.content.size === 0) return dom
      if (Array.isArray(dom)) {
        const attrs = dom[1] || {}

        if (!attrs.id) {
          attrs.id = this.createId(node)
        }
      }
      return dom
    }
  }

  condition: ConditionFunction = (node) => node.name === 'heading'
}
