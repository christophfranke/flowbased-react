// const directories = {
//   Pair: 'pair',
//   Blank: 'blank',
//   Tag: 'tag',
//   Text: 'text',
//   Preview: 'blank'
// }

// const Nodes = Object.entries(directories).map(([key, name]) => ({
//   key,
//   directory: `./${name}`
// })).reduce((obj, { key, directory }: any) => ({
//   [key]: {
//     render: import(/* webpackMode: "eager" */ `${directory}/render`).then(result => result.default),
//     value: import(/* webpackMode: "eager" */ `${directory}/value`).then(result => result.default),
//   }
// }), {})

// export default Nodes
import StringRender from '@engine/nodes/string/render'
import StringValue from '@engine/nodes/string/value'
import PairRender from '@engine/nodes/pair/render'
import PairValue from '@engine/nodes/pair/value'
import TagRender from '@engine/nodes/tag/render'
import TagValue from '@engine/nodes/tag/value'
import BlankRender from '@engine/nodes/blank/render'
import BlankValue from '@engine/nodes/blank/value'
import ObjectValue from '@engine/nodes/object/value'
import ListDebug from '@engine/nodes/list/debug'
import ListValue from '@engine/nodes/list/value'
export default {
  String: {
    render: StringRender,
    value: StringValue
  },
  Pair: {
    render: PairRender,
    value: PairValue
  },
  Tag: {
    render: TagRender,
    value: TagValue
  },
  Blank: {
    render: BlankRender,
    value: BlankValue
  },
  Preview: {
    render: BlankRender,
    value: BlankValue
  },
  Object: {
    render: BlankRender,
    value: ObjectValue
  },
  List: {
    render: BlankRender,
    value: ListValue
  }
}
