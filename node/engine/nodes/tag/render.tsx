import React from 'react'
import { observer } from 'mobx-react'

import { Node, RenderProps } from '@engine/types'

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
  const classes = props.properties.classList || []
  const tagProps = {
    ...(props.properties.props || {}),
    style: props.properties.style,
    className: classes.join(' ')
  }

  if (isValid(Tag)) {
    return React.Children.count(props.children) > 0
      ? <Tag {...tagProps}>{props.children}</Tag>
      : <Tag {...tagProps} />
  }

  return <>{props.children}</>
})