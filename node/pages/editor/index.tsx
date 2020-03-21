import React from 'react'

import Editor from '@components/editor'
import Renderer from '@components/renderer'


type Value = () => React.ReactElement | string

interface Input {
  node: Node
  name?: string
}

interface Node {
  inputs: Input[]
  output: (name?: string) => Value
}


class StringValue {
  static create(s: string) {
    return () => s
  }
}

class TextNode implements Node {
  inputs: Input[] = []
  defaultValue = StringValue.create('Lorem Ipsum sit doloret')

  constructor(s?: string) {
    if (s) {
      this.defaultValue = StringValue.create(s)
    }
  }

  output() {
    return () => this.inputs.length > 0
      ? <React.Fragment>
          {this.inputs.map(({ node, name }) => node.output(name)())}
        </React.Fragment>
      : this.defaultValue()
  }
}

class H1Node implements Node {
  inputs: Input[] = []

  output() {
    return () => <h1>
      {this.inputs.map(({ node, name }) => node.output(name)())}
    </h1>
  }
}

class RootNode implements Node {
  inputs: Input[] = []

  output() {
    return () => <React.Fragment>
      {this.inputs.map(({ node, name }) => node.output(name)())}
    </React.Fragment>
  }
}

interface Props {

}


export default (props: Props) => {
  const Root = new RootNode()
  const H1 = new H1Node()
  const Hello = new TextNode('Hello World')
  const Lorem = new TextNode('Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.')

  Root.inputs.push({ node: H1 })
  H1.inputs.push({ node: Hello })
  Root.inputs.push({ node: Lorem })

  return <div>
    <h1>Editor</h1>
    <div className="grid grid-cols-2 border border-black padding-3">
      <Editor />
      <div>
        {Root.output()()}
      </div>
    </div>
  </div>
}