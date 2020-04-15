import React from 'react'
import { observer } from 'mobx-react'

import { Node } from '@engine/types'
import { RenderProps } from './types'

const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']

const allowedFirst = 'abcdefghijklmnopqrstuvwxyz'.split('')
const allowed = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('')
const sanitize = tag => {
  let firstLetterFound = false
  return tag.split('')
    .filter(letter => {
      const test = firstLetterFound ? allowed : allowedFirst
      const result = test.includes(letter)
      firstLetterFound = result || firstLetterFound
      return result
    }).join('')
}
const isValid = tag => !!tag

@observer
class Tag extends React.Component<RenderProps> {
  render() {
    const props = this.props
    const TagName = sanitize(props.params['tag'])
    const tagProps = {
      ...(props.properties.props || {}),
      style: props.properties.style,
    }
    if (props.properties.classList) {
      tagProps.className = props.properties.classList.join(' ')
    }

    if (isValid(TagName)) {
      return React.Children.count(props.children) > 0 && !voidElements.includes(TagName)
        ? <TagName {...tagProps}>{props.children}</TagName>
        : <TagName {...tagProps} />
    }

    return <>{props.children}</>
  }
}

export default Tag