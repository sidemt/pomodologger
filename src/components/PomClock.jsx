import React, { Component } from 'react';

import SoundSwitch from './SoundSwitch';
import TimeLeft from './TimeLeft';

import './PomClock.css';

import sessionSound from '../assets/audio/small-bell01.mp3';
import breakSound from '../assets/audio/one35.mp3';
import longBreakSound from '../assets/audio/one30.mp3';

// Variable to store the intervalID of setInterval
// Used to stop the setInterval function by clearInterval
let intervalId;

// Break/Session labels
const BREAK = 'Break';
const SESSION = 'Session';
const LONG_BREAK = 'Long Break';

class PomodoroClock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timerLabel: SESSION,
      timeLeft: 1500,
      breakLength: 5,
      sessionLength: 25,
      currentCount: 1,
      sessionCycle: 4,
      longBreakLength: 15,
      isRunning: false,
      soundSetting: true
    };
    this.playSound = this.playSound.bind(this);
    this.reset = this.reset.bind(this);
    this.decrementBreak = this.decrementBreak.bind(this);
    this.incrementBreak = this.incrementBreak.bind(this);
    this.decrementSession = this.decrementSession.bind(this);
    this.incrementSession = this.incrementSession.bind(this);
    this.decrementCycle = this.decrementCycle.bind(this);
    this.incrementCycle = this.incrementCycle.bind(this);
    this.decrementLongBreak = this.decrementLongBreak.bind(this);
    this.incrementLongBreak = this.incrementLongBreak.bind(this);
    this.countDown = this.countDown.bind(this);
    this.toggleTimer = this.toggleTimer.bind(this);
    this.startStop = this.startStop.bind(this);
    this.updateTimeLeft = this.updateTimeLeft.bind(this);
    this.toggleSoundSetting = this.toggleSoundSetting.bind(this);
  }

  sessionSound = new Audio(sessionSound);
  breakSound = new Audio(breakSound);
  longBreakSound = new Audio(longBreakSound);

  componentDidMount() {
    console.log("componetDidMount");
    // Connection to audio elements

    // Audio elements
    this.SOUND_SESSION = this.sessionSound;
    this.SOUND_BREAK = this.breakSound;
    this.SOUND_LONG_BREAK = this.longBreakSound;
    // // Which sound to play
    this.beep = this.SOUND_SESSION;
  }



  /**
   * Checks the sound setting and plays the sound currently set in variable `beep`
   * @param {Boolean} soundSetting
   */
  playSound(soundSetting) {
    // Play the sound if sound settings is ON (true)
    if (soundSetting) {
      console.log("play");
      console.log(this.beep);
      this.beep.play()
      .then(() => {
        console.log('play success');
      })
      .catch(err => {
        console.error('play error:', err);
      })
      .finally(() => {
        console.log('finally');
      })
    }
  }

  /**
   * Resets the timer to default state
   */
  reset() {
    // Reset timer
    this.setState({
      timerLabel: SESSION,
      timeLeft: 1500,
      breakLength: 5,
      sessionLength: 25,
      currentCount: 1,
      sessionCycle: 4,
      longBreakLength: 15,
      isRunning: false,
    });
    clearInterval(intervalId);
    // Reset sound
    this.beep.pause();
    this.beep.currentTime = 0;
    this.beep = this.SOUND_SESSION;
    // Reset background color
    document.getElementById('body').style.backgroundColor = 'var(--main-red)';
  }

  /**
   * Decrements Break length by 1 min
   */
  decrementBreak() {
    if (this.state.breakLength > 1) {
      this.setState((state) => ({
        breakLength: state.breakLength - 1,
      }));
      this.updateTimeLeft(BREAK);
    }
  }

  /**
   * Increments Break length by 1 min
   */
  incrementBreak() {
    if (this.state.breakLength < 120) {
      this.setState((state) => ({
        breakLength: state.breakLength + 1,
      }));
      this.updateTimeLeft(BREAK);
    }
  }

  /**
   * Decrements Session length by 1 min
   */
  decrementSession() {
    if (this.state.sessionLength > 1) {
      this.setState((state) => ({
        sessionLength: state.sessionLength - 1,
      }));
      this.updateTimeLeft(SESSION);
    }
  }

  /**
   * Increments Session length by 1 min
   */
  incrementSession() {
    if (this.state.sessionLength < 120) {
      this.setState((state) => ({
        sessionLength: state.sessionLength + 1,
      }));
      this.updateTimeLeft(SESSION);
    }
  }

  /**
   * Decrements sessionCycle count by 1
   */
  decrementCycle() {
    if (this.state.sessionCycle > 1) {
      this.setState((state) => ({
        sessionCycle: state.sessionCycle - 1,
      }));
    }
  }

  /**
   * Increments sessionCycle count by 1
   */
  incrementCycle() {
    if (this.state.sessionCycle < 99) {
      this.setState((state) => ({
        sessionCycle: state.sessionCycle + 1,
      }));
    }
  }

  /**
   * Decrements long break length by 1 min
   */
  decrementLongBreak() {
    if (this.state.longBreakLength > 1) {
      this.setState((state) => ({
        longBreakLength: state.longBreakLength - 1,
      }));
      this.updateTimeLeft(LONG_BREAK);
    }
  }

  /**
   * Increments long break length by 1 min
   */
  incrementLongBreak() {
    if (this.state.longBreakLength < 120) {
      this.setState((state) => ({
        longBreakLength: state.longBreakLength + 1,
      }));
      this.updateTimeLeft(LONG_BREAK);
    }
  }

  /**
   * Counts down the time
   * If the time reaches 0, toggle session/break and play the timer sound
   */
  countDown() {
    if (this.state.timeLeft > 1) {
      this.setState((state) => ({
        timeLeft: state.timeLeft - 1,
      }));
    } else {
      // When the time reaches 0
      this.toggleTimer();
    }
  }

  /**
     * Toggle session/break
     */
  toggleTimer() {
    if (this.state.timerLabel == SESSION) {
      // When a session ends
      // Insert an event to the calendar
      const name = document.getElementById('current-event-name').innerText;
      const desc = document.getElementById('current-event-desc').innerText;
      const calendarId = document.getElementById('calendar-select').value;

      // TODO: Log event
      // createEvent(this.state.sessionLength, name, desc, calendarId);

      // Check which break to start
      if (this.state.currentCount < this.state.sessionCycle) {
        // Start a short break
        this.setState({
          timerLabel: BREAK,
          timeLeft: this.state.breakLength * 60,
        });
        // Change the background color
        document.getElementById('body').style.backgroundColor = 'var(--main-green)';
        // Change the sound to be played
        this.beep = this.SOUND_BREAK;
        // Increase sessions count
        this.setState((state) => ({
          currentCount: state.currentCount + 1,
        }));
      } else {
        // Start a long break
        this.setState({
          timerLabel: LONG_BREAK,
          timeLeft: this.state.longBreakLength * 60,
        });
        // Change the background color
        document.getElementById('body').style.backgroundColor = 'var(--main-blue)';
        // Change the sound to be played
        this.beep = this.SOUND_LONG_BREAK;
        // Reset sessions count
        this.setState((state) => ({
          currentCount: 1,
        }));
      }
      // Play the start sound
      this.playSound(this.state.soundSetting);
    } else {
      // When a break or long break ends
      // Start a session
      this.setState({
        timerLabel: SESSION,
        timeLeft: this.state.sessionLength * 60,
      });
      // Change the background color
      document.getElementById('body').style.backgroundColor = 'var(--main-red)';
      // Change the sound to be played
      this.beep = this.SOUND_SESSION;
      // Play the sound
      this.playSound(this.state.soundSetting);
    }
  }

  /**
   * Starts/stops the timer according to the current state
   */
  startStop() {
    if (!this.state.isRunning) {
      // Start the timer
      this.setState({
        isRunning: true,
      });
      intervalId = setInterval(this.countDown, 1000);
      // Play the sound
      this.playSound(this.state.soundSetting);
    } else {
      // Stop the timer
      this.setState({
        isRunning: false,
      });
      clearInterval(intervalId);
      // Stop the sound
      this.beep.pause();
      this.beep.currentTime = 0;
    }
  }

  /**
   * Update timeLeft value according to the current sessionLength
   * @param {String} label
   */
  updateTimeLeft(label) {
    if (label == SESSION && this.state.timerLabel == SESSION) {
      this.setState((state) => ({
        timeLeft: state.sessionLength * 60,
      }));
    } else if (label == BREAK && this.state.timerLabel == BREAK) {
      this.setState((state) => ({
        timeLeft: state.breakLength * 60,
      }));
    } else if (label == LONG_BREAK && this.state.timerLabel == LONG_BREAK) {
      this.setState((state) => ({
        timeLeft: state.longBreakLength * 60,
      }));
    } else {

    }
  }

  /**
   * Toggles ON/OFF of the sound setting
   */
  toggleSoundSetting() {
    this.setState((state) => ({
      soundSetting: !state.soundSetting,
    }));
  }

  /**
   * Render the pomodoro timer
   */
  render() {
    // document.title = `${calcTimeLeft(this.state.timeLeft)} [${this.state.timerLabel}] - Pom-Cal`;
    return (
      <div id="pomodoro-clock-inside">
        <div className="btn-set timer">
          <div>
            <div id="timer-label" className="label">{this.state.timerLabel}</div>
            <TimeLeft timeLeft={this.state.timeLeft} />
            <div>
              Completed Sessions:
              {' '}
              {this.state.currentCount - 1}
              /
              {this.state.sessionCycle}
            </div>
          </div>

          <div>
            <button id="start_stop" className="btn btn-light" onClick={this.startStop}>Start/Pause</button>
            <button id="reset" className="btn btn-light" onClick={this.reset}>Reset</button>
          </div>
        </div>

        <div className="btn-set session-length">
          <div id="session-label" className="label">Session Length</div>
          <div id="session-length" className="time">{this.state.sessionLength}</div>
          <div>
            <button id="session-decrement" className="btn btn-light fixed-width" onClick={this.decrementSession}>-</button>
            <button id="session-increment" className="btn btn-light fixed-width" onClick={this.incrementSession}>+</button>
          </div>
        </div>

        <div className="btn-set break-length">
          <div id="break-label" className="label">Break Length</div>
          <div id="break-length" className="time">{this.state.breakLength}</div>
          <div>
            <button id="break-decrement" className="btn btn-light fixed-width" onClick={this.decrementBreak}>-</button>
            <button id="break-increment" className="btn btn-light fixed-width" onClick={this.incrementBreak}>+</button>
          </div>
        </div>

        <div className="btn-set long-break-length">
          <div id="long-break-label" className="label">Long Break Length</div>
          <div id="long-break-length" className="time">{this.state.longBreakLength}</div>
          <div>
            <button id="long-break-decrement" className="btn btn-light fixed-width" onClick={this.decrementLongBreak}>-</button>
            <button id="long-break-increment" className="btn btn-light fixed-width" onClick={this.incrementLongBreak}>+</button>
          </div>
        </div>

        <div className="btn-set cycle-count">
          <div id="cycle-label" className="label">Long break after</div>
          <div id="cycle-count" className="time">
            {this.state.sessionCycle}
            {' '}
            sessions
          </div>
          <div>
            <button id="cycle-decrement" className="btn btn-light fixed-width" onClick={this.decrementCycle}>-</button>
            <button id="cycle-increment" className="btn btn-light fixed-width" onClick={this.incrementCycle}>+</button>
          </div>
        </div>

        <SoundSwitch soundSetting={this.state.soundSetting} onClick={this.toggleSoundSetting} />

        {/* audio elements
        <audio
          id="sound-session"
          ref={(el) => (this.sound_session = el)}
          preload="auto"
          src={sessionSound}
          controls
        />
        <audio
          id="sound-break"
          ref={(el) => (this.sound_break = el)}
          preload="auto"
          controls
        >
          <source src={one35} />
        </audio>
        <audio
          id="sound-long-break"
          ref={(el) => (this.sound_long_break = el)}
          preload="auto"
          controls
        >
          <source src={one30} />
        </audio>
        */}
      </div>
    );
  }
}

export default PomodoroClock;
