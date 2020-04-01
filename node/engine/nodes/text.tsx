import React from 'react'
import { observer } from 'mobx-react'
import { RenderProps } from '@engine/types'

export default observer((props: RenderProps) => <>
  {props.params.text}
</>)
