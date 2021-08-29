import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import i18n from 'i18next';

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
const BREAK = 'break';
const SESSION = 'session';
const LONG_BREAK = 'long_break';

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
    // sessionLength is stored in the parent component "App"
    this.state = {
      timerLabel: SESSION,
      timeLeft: 1500,
      breakLength: 5,
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
      sessionCycle: parseInt(localStorage.sessionCycle, 10) || defaultValues.sessionCycle,
      longBreakLength: parseInt(localStorage.longBreakLength, 10) || defaultValues.longBreakLength,
      soundSetting: parseBool(localStorage.soundSetting, defaultValues.soundSetting),
      notifySetting: parseBool(localStorage.notifySetting, defaultValues.notifySetting)
    });
    const sessionLength = parseInt(localStorage.sessionLength, 10) || defaultValues.sessionLength;
    this.props.onSessionLengthChange(sessionLength);

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
      timeLeft: this.props.sessionLength * MINUTE,
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
      completedCount: 0,
      sessionCycle: parseInt(localStorage.sessionCycle, 10) || defaultValues.sessionCycle,
      longBreakLength: parseInt(localStorage.longBreakLength, 10) || defaultValues.longBreakLength,
      isRunning: false,
    });
    const sessionLength = parseInt(localStorage.sessionLength, 10) || defaultValues.sessionLength;
    this.props.onSessionLengthChange(sessionLength);
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
    this.props.onSessionLengthChange(defaultValues.sessionLength);
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
    let valueToUse = 0;
    if (parsedValue >= 0 && parsedValue <= 120) {
      valueToUse = parsedValue;
    } else if (parsedValue > 120) {
      valueToUse = 120;
    } else {
      valueToUse = 0;
    }
    if (inputName === "sessionLength") {
      // sessionLength is stored in the parent component "App"
      this.props.onSessionLengthChange(valueToUse);
    } else {
      this.setState({[inputName]: valueToUse});
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
      Calendar.createEvent(this.props.sessionLength, this.props.eventName, this.props.eventDetail, this.props.calendarId);

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
          `${i18n.t('session_complete')} ${this.state.completedCount}/${this.state.sessionCycle}`,
          `${i18n.t('take_short_break')}`,
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
          `${this.state.sessionCycle} ${i18n.t('sessions_complete')}`,
          `${i18n.t('take_long_break')}`,
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
        timeLeft: this.props.sessionLength * MINUTE,
      });
      // Change the background color
      document.getElementById('body').style.backgroundColor = 'var(--main-red)';
      // Change the sound to be played
      this.beep = this.SOUND_SESSION;
      // Send a session start (= break end) notification
      this.notify(this.state.notifySetting,
        `${i18n.t('start_working')} ${this.state.completedCount}/${this.state.sessionCycle}`,
        '',
        (this.props.sessionLength * MINUTE * 1000 - 5000));
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
        timeLeft: this.props.sessionLength * MINUTE,
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
        this.notify(true, `${i18n.t('notification_enabled')}`);
      }, () => { // onDenied
        alert(`${i18n.t('request_permission')}`);
      });
    } else if (event.target.checked && Push.Permission.has()) {
      this.notify(true, `${i18n.t('notification_enabled')}`);
    }
  }

  /**
   * Saves timer settings
   */
  saveTimer() {
    if (window.confirm(`${i18n.t('save_timer_desc')}`)) {
      // Save current settings to localStorage
      localStorage.breakLength = this.state.breakLength;
      localStorage.sessionLength = this.props.sessionLength;
      localStorage.sessionCycle = this.state.sessionCycle;
      localStorage.longBreakLength = this.state.longBreakLength;
      alert(`${i18n.t('timer_saved')}`);
    }
  }

  /**
   * Saves current settings
   */
  saveSettings() {
    if (window.confirm(`${i18n.t('save_settings_desc')}`)) {
      // Save current settings to localStorage
      localStorage.soundSetting = this.state.soundSetting;
      localStorage.notifySetting = this.state.notifySetting;

      alert(`${i18n.t('settings_saved')}`);
    }
  }

  /**
   * Render the pomodoro timer
   */
  render() {
    const {t} = this.props;
    return (
      <div id="pomodoro-clock-inside">
        <div className="btn-set timer">
          <div>
            <div id="timer-label" className="label">{t(this.state.timerLabel)}</div>
              <
                TimeLeft
                timeLeft={this.state.timeLeft}
                timerLabel={t(this.state.timerLabel) /* Display translated time label */ }
                sessionCycle={this.state.sessionCycle}
                completedCount={this.state.completedCount}
              />
            <div>
              {t('completed_sessions')}:
              {' '}
              {this.state.completedCount}
              /
              {this.state.sessionCycle}
            </div>
          </div>

          <div>
            <button id="start_stop" className="btn btn-light" onClick={this.startStop}>{t('start_pause')}</button>
            <button id="reset" className="btn btn-light" onClick={this.restart}>{t('restart')}</button>
          </div>
        </div>

        <div className="btn-set reset-btns">
          <div>
            <button id="reset" className="btn btn-light btn-sm" onClick={this.saveTimer}>{t('save_timer')}</button>
            <button id="reset" className="btn btn-light btn-sm" onClick={this.loadTimer}>{t('load_time')}</button>
            <button id="reset" className="btn btn-light btn-sm" onClick={this.reset}>{t('reset_to_default')}</button>
          </div>
        </div>

        <div className="btn-set space-between session-length">
          <div id="session-label" className="label">{t('session_length')}</div>
          <div>
            <input className="form-control text-center" type="text" name="sessionLength" value={this.props.sessionLength} onChange={this.handleInputChange} onBlur={this.handleInputBlur} onKeyDown={this.handleInputEnter} />
            <div>{t('minutes')}</div>
          </div>

        </div>

        <div className="btn-set space-between break-length">
          <div id="break-label" className="label">{t('break_length')}</div>
          <div>
            <input className="form-control text-center" type="text" name="breakLength" value={this.state.breakLength} onChange={this.handleInputChange} onBlur={this.handleInputBlur} onKeyDown={this.handleInputEnter} />
            <div>{t('minutes')}</div>
          </div>

        </div>

        <div className="btn-set space-between long-break-length">
          <div id="long-break-label" className="label">{t('long_break_length')}</div>
          <div>
            <input className="form-control text-center" type="text" name="longBreakLength" value={this.state.longBreakLength} onChange={this.handleInputChange} onBlur={this.handleInputBlur} onKeyDown={this.handleInputEnter} />
            <div>{t('minutes')}</div>
          </div>

        </div>

        <div className="btn-set space-between cycle-count">
          <div id="cycle-label" className="label">{t('long_break_after')}</div>
          <div id="cycle-count" className="">
            <input className="form-control text-center" type="text" name="sessionCycle" value={this.state.sessionCycle} onChange={this.handleInputChange} onBlur={this.handleInputBlur} onKeyDown={this.handleInputEnter} />
            <div>{t('sessions')}</div>
          </div>
        </div>

        <div id="settings-group" className="group">
          <div id="sound-setting">
            <label>
              {t('sound')}&nbsp;
              <input type="checkbox" name="soundSetting" checked={this.state.soundSetting} onChange={this.handleCheckboxChange} />
            </label>
          </div>

          <div id="notify-setting">
            <label>
              {t('notification')}&nbsp;
              <input type="checkbox" name="notifySetting" checked={this.state.notifySetting} onChange={this.handleNotifySettingChange} />
            </label>
          </div>

          <div id="save-settings">
            <button className="btn btn-light" onClick={this.saveSettings}>{t('save_settings')}</button>
          </div>

          <div id="settings-note">
              <small>{t('notification_notice')}</small>
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(PomodoroClock);
