import React from 'react'
import { observer } from 'mobx-react'
import { RenderProps } from '@engine/types'
import { value } from '@engine/render'

export default observer((props: RenderProps) => {
  return <React.Fragment>
  {props.params.value}
</React.Fragment>})
