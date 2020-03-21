import { Input, Node, RenderProps } from '@engine/types'
import { renderInputs } from '@engine/render'

export default (props: RenderProps) =>
  <h1>{renderInputs(props.inputs)}</h1>
