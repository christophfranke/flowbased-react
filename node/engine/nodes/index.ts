import RenderTag from '@engine/nodes/tag/render'
import RenderValue from '@engine/nodes/value/render'
import RenderPreview from '@engine/nodes/preview/render'
import RawValue from '@engine/nodes/value/value'

const NoValue = () => null

export default {
  Value: {
    render: RenderValue,
    value: RawValue
  },
  Tag: {
    render: RenderTag,
    value: NoValue
  },
  Preview: {
    render: RenderPreview,
    value: NoValue
  }
}
