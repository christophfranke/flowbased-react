import { Input, Node } from '@engine/types'

export default class H1 implements Node {
  inputs: Input[] = []

  output() {
    return () => <h1>
      {this.inputs.map(({ node, name }) => node.output(name)())}
    </h1>
  }
}