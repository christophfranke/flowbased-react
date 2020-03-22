import React from 'react'

import { Input, RenderProps } from '@engine/types'
import { renderInputs } from '@engine/render'


export default (props: RenderProps) =>
  <React.Fragment>{renderInputs(props.inputs)}</React.Fragment>