import React from 'react'
import { observer } from 'mobx-react'

interface Props {
  params: Object
}

@observer
class EditParameters extends React.Component<Props> {
  renderTextField(key: string, value: string) {
    const changeHandler = (e) => {
      this.props.params[key] = e.target.value
    }

    return <div>
      <label className="mr-2">{key}</label>
      <input className="p-1 border-b-2" type="text" value={value} onChange={changeHandler} />
    </div>
  }

  render() {
    return <div>
      {Object.entries(this.props.params)
        .filter(([,value]) => typeof value === 'string')
        .map(([key, value]) => this.renderTextField(key, value))}
    </div>
  }
}

export default EditParameters