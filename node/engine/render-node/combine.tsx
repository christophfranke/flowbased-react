import React from 'react'
import { observer } from 'mobx-react'

import { Input, RenderProps } from '@engine/types'
import { renderInputs } from '@engine/render'

export default observer((props: RenderProps) =>
  <React.Fragment>{renderInputs(props.inputs)}</React.Fragment>)