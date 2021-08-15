import React, { Component } from 'react';

import TimeLeft from './TimeLeft';

import './PomClock.css';

import sessionSound from '../assets/audio/small-bell01.mp3';
import breakSound from '../assets/audio/one35.mp3';
import longBreakSound from '../assets/audio/one30.mp3';

import * as Calendar from '../features/calendar/Calendar';

import Push from 'push.js'

import { parseBool } from '../features/helper/helper';

// Variable to store the intervalID of setInterval
// Used to stop the setInterval function by clearInterval
let intervalId;

// Break/Session labels
const BREAK = 'Break';
const SESSION = 'Session';
const LONG_BREAK = 'Long Break';

const MINUTE = 60;

const defaultValues = {
  timerLabel: SESSION,
  timeLeft: 1500,
  breakLength: 5,
  sessionLength: 25,
  completedCount: 0,
  sessionCycle: 4,
  longBreakLength: 15,
  isRunning: false,
  soundSetting: true,
  notifySetting: false
}

class PomodoroClock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timerLabel: SESSION,
      timeLeft: 1500,
      breakLength: 5,
      sessionLength: 25,
      completedCount: 0,
      sessionCycle: 4,
      longBreakLength: 15,
      isRunning: false,
      soundSetting: true,
      notifySetting: false
    };
    this.playSound = this.playSound.bind(this);
    this.notify = this.notify.bind(this);
    this.restart = this.restart.bind(this);
    this.loadTimer = this.loadTimer.bind(this);
    this.reset = this.reset.bind(this);
    this.resetTimerState = this.resetTimerState.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputEnter = this.handleInputEnter.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.countDown = this.countDown.bind(this);
    this.toggleTimer = this.toggleTimer.bind(this);
    this.startStop = this.startStop.bind(this);
    this.updateTimeLeft = this.updateTimeLeft.bind(this);
    this.saveTimer = this.saveTimer.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleNotifySettingChange = this.handleNotifySettingChange.bind(this);
  }

  sessionSound = new Audio(sessionSound);
  breakSound = new Audio(breakSound);
  longBreakSound = new Audio(longBreakSound);

  componentDidMount() {
    console.log("componentDidMount");
    // Get saved settings from localStorage
    this.setState({
      timeLeft: parseInt(localStorage.sessionLength, 10) * MINUTE || defaultValues.timeLeft,
      breakLength: parseInt(localStorage.breakLength, 10) || defaultValues.breakLength,
      sessionLength: parseInt(localStorage.sessionLength, 10) || defaultValues.sessionLength,
      sessionCycle: parseInt(localStorage.sessionCycle, 10) || defaultValues.sessionCycle,
      longBreakLength: parseInt(localStorage.longBreakLength, 10) || defaultValues.longBreakLength,
      soundSetting: parseBool(localStorage.soundSetting, defaultValues.soundSetting),
      notifySetting: parseBool(localStorage.notifySetting, defaultValues.notifySetting)
    });

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
   * Checks the notification setting and send a notification
   * Note: Make sure to close the notification automatically before the next one is sent.
   * Otherwise the next notification will not go off. This can be done by setting timeout value.
   * @param {Boolean} notifySetting
   * @param {String} message
   * @param {String} body
   * @param {Integer} timeout in milliseconds
   */
  notify(notifySetting, message, body = '', timeout = 50000) {
    console.log("notify");
    // Send a notification if notify settings is ON (true)
    if (notifySetting) {
      Push.create(message, {
        link: "/pomodologger", // This should match the relative path of the app
        body: body,
        requireInteraction: true, // Make user close a notification manually
        timeout: timeout, // Close automatically even if user did not interact
        onClick: function () {
            this.close();
        }
      })
      .then(() => {
        console.log('notify success');
      })
      .catch(err => {
        console.error('notify error:', err);
      })
      .finally(() => {
        console.log('notify finally');
      })
    }
  }

  /**
   * Restart the timer with current value
   */
  restart() {
    // Reset timer
    this.setState({
      timerLabel: SESSION,
      timeLeft: this.state.sessionLength * MINUTE,
      completedCount: 0,
      isRunning: false,
    });
    this.resetTimerState();
  }

  /**
   * Resets the timer to saved state
   */
  loadTimer() {
    // Reset timer
    this.setState({
      timerLabel: SESSION,
      timeLeft: parseInt(localStorage.sessionLength, 10) * MINUTE || defaultValues.timeLeft,
      breakLength: parseInt(localStorage.breakLength, 10) || defaultValues.breakLength,
      sessionLength: parseInt(localStorage.sessionLength, 10) || defaultValues.sessionLength,
      completedCount: 0,
      sessionCycle: parseInt(localStorage.sessionCycle, 10) || defaultValues.sessionCycle,
      longBreakLength: parseInt(localStorage.longBreakLength, 10) || defaultValues.longBreakLength,
      isRunning: false,
    });
    this.resetTimerState();
  }

  /**
   * Resets the timer to default state
   */
  reset() {
    // Reset timer
    this.setState({
      timerLabel: SESSION,
      timeLeft: defaultValues.timeLeft,
      breakLength: defaultValues.breakLength,
      sessionLength: defaultValues.sessionLength,
      completedCount: 0,
      sessionCycle: defaultValues.sessionCycle,
      longBreakLength: defaultValues.longBreakLength,
      isRunning: false,
    });
    this.resetTimerState();
  }

  /**
   * Stops timer count, resets sound and background color
   */
  resetTimerState() {
    clearInterval(intervalId);
    // Reset sound
    this.beep.pause();
    this.beep.currentTime = 0;
    this.beep = this.SOUND_SESSION;
    // Reset background color
    document.getElementById('body').style.backgroundColor = 'var(--main-red)';
  }



  /**
   * Update state according to user input
   */
  handleInputChange(event) {
    const inputValue = event.target.value;
    const inputName = event.target.name;
    const parsedValue =  parseInt(inputValue, 10);
    if (parsedValue >= 0 && parsedValue <= 120) {
      this.setState({[inputName]: parsedValue});
    } else if (parsedValue < 0) {
      this.setState({[inputName]: 0});
    } else if (parsedValue > 120) {
      this.setState({[inputName]: 120});
    } else {
      this.setState({[inputName]: 0});
    }
  }

  /**
   * Update current timer when focus is moved out of a input field
   */
  handleInputBlur(event) {
    // Update timer
    switch(event.target.name) {
      case "sessionLength":
        this.updateTimeLeft(SESSION);
        break;
      case "breakLength":
        this.updateTimeLeft(BREAK);
        break;
      case "longBreakLength":
        this.updateTimeLeft(LONG_BREAK);
      default:
        // No need to update timer
    }
  }

  /**
   * Move focus out of a input field by Enter key
   */
  handleInputEnter(event) {
    if (event.keyCode === 13) {
      event.target.blur();
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
    if (this.state.timerLabel === SESSION) {
      // When a session ends
      // Insert an event to the calendar
      const name = document.getElementById('current-event-name').innerText;
      const desc = document.getElementById('current-event-desc').innerText;
      const calendarId = document.getElementById('calendar-select').value;

      // Log event
      Calendar.createEvent(this.state.sessionLength, this.props.eventName, this.props.eventDetail, calendarId);

      // Increase sessions count
      this.setState((state) => ({
        completedCount: state.completedCount + 1,
      }));

      // Check which break to start
      if (this.state.completedCount < this.state.sessionCycle) {
        // Start a short break
        this.setState({
          timerLabel: BREAK,
          timeLeft: this.state.breakLength * MINUTE,
        });
        // Change the background color
        document.getElementById('body').style.backgroundColor = 'var(--main-green)';
        // Change the sound to be played
        this.beep = this.SOUND_BREAK;
        // Send a short break start (= session end) notification
        this.notify(this.state.notifySetting,
          `Session Complete! ${this.state.completedCount}/${this.state.sessionCycle}`,
          'Take a short break.',
          (this.state.breakLength * MINUTE * 1000 - 5000));
      } else {
        // Start a long break
        this.setState({
          timerLabel: LONG_BREAK,
          timeLeft: this.state.longBreakLength * MINUTE,
        });
        // Change the background color
        document.getElementById('body').style.backgroundColor = 'var(--main-blue)';
        // Change the sound to be played
        this.beep = this.SOUND_LONG_BREAK;
        // Send a long break start (= session end) notification
        this.notify(this.state.notifySetting,
          `${this.state.sessionCycle} Sessions Complete! Good Work!`,
          'Take a long break.',
          (this.state.longBreakLength * MINUTE * 1000 - 5000));
      }
      // Play a break start (= session end) sound
      this.playSound(this.state.soundSetting);
    } else {
      // When a break or long break ends
      // Start a session
      if (this.state.completedCount >= this.state.sessionCycle) {
        // Start a new cycle
        this.setState((state) => ({
          completedCount: 0,
        }));
      }
      this.setState({
        timerLabel: SESSION,
        timeLeft: this.state.sessionLength * MINUTE,
      });
      // Change the background color
      document.getElementById('body').style.backgroundColor = 'var(--main-red)';
      // Change the sound to be played
      this.beep = this.SOUND_SESSION;
      // Send a session start (= break end) notification
      this.notify(this.state.notifySetting,
        `Start working! ${this.state.completedCount}/${this.state.sessionCycle}`,
        '',
        (this.state.sessionLength * MINUTE * 1000 - 5000));
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
    if (label === SESSION && this.state.timerLabel === SESSION) {
      this.setState((state) => ({
        timeLeft: state.sessionLength * MINUTE,
      }));
    } else if (label === BREAK && this.state.timerLabel === BREAK) {
      this.setState((state) => ({
        timeLeft: state.breakLength * MINUTE,
      }));
    } else if (label === LONG_BREAK && this.state.timerLabel === LONG_BREAK) {
      this.setState((state) => ({
        timeLeft: state.longBreakLength * MINUTE,
      }));
    }
  }

  /**
   * Toggles ON/OFF of the state according to checkbox
   */
  handleCheckboxChange(event) {
    this.setState({
      [event.target.name]: event.target.checked,
    });
  }

  handleNotifySettingChange(event) {
    this.handleCheckboxChange(event);
    console.log(Push.Permission.has());
    if (event.target.checked && !Push.Permission.has()) {
      console.log("Request permission");
      Push.Permission.request(() => { // onGranted
        this.notify(true, "You will receive a notification when a session/break is completed.");
      }, () => { // onDenied
        alert("Please allow notifications in browser settings.");
      });
    } else if (event.target.checked && Push.Permission.has()) {
      this.notify(true, "You will receive a notification when a session/break is completed.");
    }
  }

  /**
   * Saves timer settings
   */
  saveTimer() {
    if (window.confirm("Current timer settings will be saved in your browser's local storage.")) {
      // Save current settings to localStorage
      localStorage.breakLength = this.state.breakLength;
      localStorage.sessionLength = this.state.sessionLength;
      localStorage.sessionCycle = this.state.sessionCycle;
      localStorage.longBreakLength = this.state.longBreakLength;
      alert("Timer settings were saved.");
    }
  }

  /**
   * Saves current settings
   */
  saveSettings() {
    if (window.confirm("Current Sound & notification settings will be saved in your browser's local storage.")) {
      // Save current settings to localStorage
      localStorage.soundSetting = this.state.soundSetting;
      localStorage.notifySetting = this.state.notifySetting;

      alert("Sound & notification settings were saved.");
    }
  }

  /**
   * Render the pomodoro timer
   */
  render() {
    return (
      <div id="pomodoro-clock-inside">
        <div className="btn-set timer">
          <div>
            <div id="timer-label" className="label">{this.state.timerLabel}</div>
              <
                TimeLeft
                timeLeft={this.state.timeLeft}
                timerLabel={this.state.timerLabel}
                sessionCycle={this.state.sessionCycle}
                completedCount={this.state.completedCount}
              />
            <div>
              Completed Sessions:
              {' '}
              {this.state.completedCount}
              /
              {this.state.sessionCycle}
            </div>
          </div>

          <div>
            <button id="start_stop" className="btn btn-light" onClick={this.startStop}>Start/Pause</button>
            <button id="reset" className="btn btn-light" onClick={this.restart}>Restart</button>
          </div>
        </div>

        <div className="btn-set reset-btns">
          <div>
            <button id="reset" className="btn btn-light btn-sm" onClick={this.saveTimer}>Save Timer</button>
            <button id="reset" className="btn btn-light btn-sm" onClick={this.loadTimer}>Load Timer</button>
            <button id="reset" className="btn btn-light btn-sm" onClick={this.reset}>Reset To Default</button>
          </div>
        </div>

        <div className="btn-set space-between session-length">
          <div id="session-label" className="label">Session Length</div>
          <div>
            <input className="form-control text-center" type="text" name="sessionLength" value={this.state.sessionLength} onChange={this.handleInputChange} onBlur={this.handleInputBlur} onKeyDown={this.handleInputEnter} />
            <div>minutes</div>
          </div>

        </div>

        <div className="btn-set space-between break-length">
          <div id="break-label" className="label">Break Length</div>
          <div>
            <input className="form-control text-center" type="text" name="breakLength" value={this.state.breakLength} onChange={this.handleInputChange} onBlur={this.handleInputBlur} onKeyDown={this.handleInputEnter} />
            <div>minutes</div>
          </div>

        </div>

        <div className="btn-set space-between long-break-length">
          <div id="long-break-label" className="label">Long Break Length</div>
          <div>
            <input className="form-control text-center" type="text" name="longBreakLength" value={this.state.longBreakLength} onChange={this.handleInputChange} onBlur={this.handleInputBlur} onKeyDown={this.handleInputEnter} />
            <div>minutes</div>
          </div>

        </div>

        <div className="btn-set space-between cycle-count">
          <div id="cycle-label" className="label">Long break after</div>
          <div id="cycle-count" className="">
            <input className="form-control text-center" type="text" name="sessionCycle" value={this.state.sessionCycle} onChange={this.handleInputChange} onBlur={this.handleInputBlur} onKeyDown={this.handleInputEnter} />
            <div>sessions</div>
          </div>
        </div>

        <div id="settings-group" className="group">
          <div id="sound-setting">
            <label>
              Sound&nbsp;
              <input type="checkbox" name="soundSetting" checked={this.state.soundSetting} onChange={this.handleCheckboxChange} />
            </label>
          </div>

          <div id="notify-setting">
            <label>
              Notification&nbsp;
              <input type="checkbox" name="notifySetting" checked={this.state.notifySetting} onChange={this.handleNotifySettingChange} />
            </label>
          </div>

          <div id="save-settings">
            <button className="btn btn-light" onClick={this.saveSettings}>Save Settings</button>
          </div>

          <div id="settings-note">
              <small>*Notifications will not work on iOS</small>
          </div>
        </div>
      </div>
    );
  }
}

export default PomodoroClock;
