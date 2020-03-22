import React from 'react'
import { observer } from 'mobx-react'

import { Input, Node, RenderProps } from '@engine/types'
import { renderInputs } from '@engine/render'

const allowedFirst = 'abcdefghijklmnopqrstuvwxyz'.split('')
const allowed = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('')
const sanitize = tag => {
  let firstLetterFound = false
  return tag.split('')
    .filter(letter => {
      const test = firstLetterFound ? allowedFirst : allowed
      const result = test.includes(letter)
      firstLetterFound = result || firstLetterFound
      return result
    }).join('')
}
const isValid = tag => !!tag

export default observer((props: RenderProps) => {
  const Tag = sanitize(props.params['tag'])
  const tagProps = props.params['props']

  if (isValid(Tag)) {
    return props.inputs.length > 0
      ? <Tag {...tagProps}>{renderInputs(props.inputs)}</Tag>
      : <Tag {...tagProps} />
  }

  return <>{renderInputs(props.inputs)}</>
})