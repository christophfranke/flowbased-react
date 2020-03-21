import Combine from '@engine/nodes/combine'
import H1 from '@engine/nodes/h1'
import Text from '@engine/nodes/text'

export default () => {
  const Root = new Combine()
  const Headline = new H1()
  const Hello = new Text('Hello World')
  const Lorem = new Text('Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.')

  Root.inputs.push({ node: Headline })
  Headline.inputs.push({ node: Hello })
  Root.inputs.push({ node: Lorem })

  return <div>
    {Root.output()()}
    Rendering is ok
    }
  </div>
}