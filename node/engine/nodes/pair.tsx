import React from 'react'
import { observer } from 'mobx-react'
import { RenderProps } from '@engine/types'

export default observer((props: RenderProps) => <>
  <pre>({props.params.key}: {props.params.value})</pre>
</>)
