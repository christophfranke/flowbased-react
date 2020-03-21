import fetch from 'isomorphic-fetch'
import React from 'react'

interface Props {
  data: Data
}

interface Data {
  hello: string  
}

export default class Home extends React.Component<Props, {}> {
  static async getInitialProps(req) {
    const result = await fetch('http://localhost:3000/api')
    const data = await result.json()

    return {
      data
    }
  }

  render() {
    return <h1>Hello {this.props.data.hello}</h1>
  }
}