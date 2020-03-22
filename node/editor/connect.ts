import tree from '@store/tree'
import { EditorNode, EditorConnection } from '@editor/types'

export default (src: EditorNode, target: EditorNode) => {
  const connection: EditorConnection = {
    src,
    target
  }

  tree.editor.establishedConnections.push(connection)
}