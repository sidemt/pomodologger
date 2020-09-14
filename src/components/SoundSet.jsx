import React, { Component } from 'react';

class SoundSet extends Component {
  constructor(props) {
    super(props);
  }

  // Audio elements on the html file
  SOUND_SESSION = document.getElementById('sound-session');
  SOUND_BREAK = document.getElementById('sound-break');
  SOUND_LONG_BREAK = document.getElementById('sound-long-break');

  /**
   * Checks the sound setting and plays the sound currently set in variable `beep`
   * @param {Boolean} soundSetting
   */
  playSound(soundSetting) {
    // Play the sound if sound settings is ON (true)
    if (soundSetting) {
      beep.play();
    }
  }

  render() {
    return (
      <>
        {/* audio elements */}
        <audio
          id="sound-session"
          ref={(el) => (this._audio = el)}
          preload="auto"
        >
          <source src="assets/small-bell01.mp3" />
        </audio>
        <audio id="sound-break" preload="auto">
          <source src="assets/one35.mp3" />
        </audio>
        <audio id="sound-long-break" preload="auto">
          <source src="assets/one30.mp3" />
        </audio>
      </>
    );
  }
}

export default SoundSet;
