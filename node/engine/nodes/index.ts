import React from 'react'
import { Node, RenderProps } from '@engine/types'
import RenderTag from '@engine/nodes/tag/render'
import RenderPreview from '@engine/nodes/preview/render'
import PrimitiveValue from '@engine/nodes/primitive/value'
import ListValue from '@engine/nodes/list/value'

export interface ValueResolver {
  resolve: (node: Node) => any
  type: 'Value'
}

type ReactComponent = React.Component<RenderProps>
type ReactFunction = (props: RenderProps) => React.ReactElement

interface ReactComponentResolver {
  resolve: ReactComponent | ReactFunction
  type: 'React.Component'
}

interface Nodes {
  [key: string]: ValueResolver | ReactComponentResolver
}
const Nodes: Nodes = {
  Primitive: {
    resolve: PrimitiveValue,
    type: 'Value'
  },
  List: {
    resolve: ListValue,
    type: 'Value'
  },
  Tag: {
    resolve: RenderTag,
    type: 'React.Component'
  },
  Preview: {
    resolve: RenderPreview,
    type: 'React.Component'
  }
}

export default Nodes