import React from 'react'
import { Source } from '@engine/types'
import StringValue from '@engine/values/string'

export default class Text implements Source {
  defaultValue = StringValue.create('Lorem Ipsum sit doloret')

  constructor(s?: string) {
    if (s) {
      this.defaultValue = StringValue.create(s)
    }
  }

  output() {
    return this.defaultValue
  }
}