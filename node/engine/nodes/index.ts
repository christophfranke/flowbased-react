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
import TextRender from '@engine/nodes/text/render'
import TextValue from '@engine/nodes/text/value'
import PairRender from '@engine/nodes/pair/render'
import PairValue from '@engine/nodes/pair/value'
import TagRender from '@engine/nodes/tag/render'
import TagValue from '@engine/nodes/tag/value'
import BlankRender from '@engine/nodes/blank/render'
import BlankValue from '@engine/nodes/blank/value'
import ObjectValue from '@engine/nodes/object/value'
export default {
  Text: {
    render: TextRender,
    value: TextValue
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
  }
}
