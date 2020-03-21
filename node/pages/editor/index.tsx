import React from 'react'

import Editor from '@components/editor'
import Renderer from '@components/renderer'

interface Props {

}


export default (props: Props) => {
  return <div>
    <h1>Editor</h1>
    <div className="grid grid-cols-2 border border-black padding-3">
      <Editor />
      <Renderer />
    </div>
  </div>
}