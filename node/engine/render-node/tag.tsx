import React from 'react'
import { observer } from 'mobx-react'

import { Input, Node, RenderProps } from '@engine/types'
import { renderInputs } from '@engine/render'

export default observer((props: RenderProps) => {
  const Tag = props.params['tag']
  const tagProps = props.params['props']

  return props.inputs.length > 0
    ? <Tag {...tagProps}>{renderInputs(props.inputs)}</Tag>
    : <Tag {...tagProps} />
})