import React, { Component } from 'react';

/**
 * Component for toggle switch of sound ON/OFF setting
 */
class SoundSwitch extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { soundSetting } = this.props;
    return (
      <div id="sound-setting">
        <span id="switch-label">Sound </span>
        <label className="switch">
          {soundSetting ? <input type="checkbox" checked /> : <input type="checkbox" />}
          <span className="slider round" onClick={this.props.onClick} />
        </label>
      </div>
    );
  }
}

export default SoundSwitch;
