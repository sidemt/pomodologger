import React, { Component } from 'react';

/**
 * Component to show the remaining time
 */
class TimeLeft extends Component {
  constructor(props) {
    super(props);

    this.hhmmss = this.hhmmss.bind(this);
    this.calcTimeLeft = this.calcTimeLeft.bind(this);
    this.displayTimeInTitle = this.displayTimeInTitle.bind(this);
  }

  componentDidMount() {
    const { timeLeft, timerLabel, sessionCycle, completedCount } = this.props;
    this.displayTimeInTitle(timeLeft, timerLabel, sessionCycle, completedCount);
  }

  componentDidUpdate() {
    const { timeLeft, timerLabel, sessionCycle, completedCount } = this.props;
    this.displayTimeInTitle(timeLeft, timerLabel, sessionCycle, completedCount);
  }

  /**
   * Returns given minutes and seconds in "hh:mm:ss" format
   * @param {Number} h
   * @param {Number} m
   * @param {Number} s
   */
  hhmmss(h, m, s) {
    let hh = '';
    if (h > 0) {
      hh = `${h}:`;
    }
    const m0 = (`00${m}`).slice(-2);
    const s0 = (`00${s}`).slice(-2);
    return `${hh}${m0}:${s0}`;
  }

  /**
   * Returns given seconds in "dd:dd" format
   * @param {Number} timeLeft
   */
  calcTimeLeft(timeLeft) {
    const hours = Math.floor((timeLeft / (60 * 60)));
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
    const seconds = Math.floor(timeLeft % (60));

    return this.hhmmss(hours, minutes, seconds);
  }

  /**
   * Update page title with given time and label
   * @param {Number} timeLeft
   * @param {String} timerLabel
   */
  displayTimeInTitle(timeLeft, timerLabel, sessionCycle, completedCount) {
    let progress = `${completedCount}/${sessionCycle}`;
    document.title = `${this.calcTimeLeft(timeLeft)}[${timerLabel}]${progress} | Pomodologger`;
  }

  render() {
    const { timeLeft } = this.props;
    return (
      <div id="time-left" className="time">{this.calcTimeLeft(timeLeft)}</div>
    );
  }
}

export default TimeLeft;
