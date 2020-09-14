import React, { Component } from 'react';

/**
 * Component to show the remaining time
 */
class TimeLeft extends Component {
  constructor(props) {
    super(props);

    this.mmss = this.mmss.bind(this);
    this.calcTimeLeft = this.calcTimeLeft.bind(this);
  }

  /**
   * Returns given minutes and seconds in "dd:dd" format
   * @param {Number} m
   * @param {Number} s
   */
  mmss(m, s) {
    const m0 = (`00${m}`).slice(-2);
    const s0 = (`00${s}`).slice(-2);
    return `${m0}:${s0}`;
  }

  /**
   * Returns given seconds in "dd:dd" format
   * @param {Number} timeLeft
   */
  calcTimeLeft(timeLeft) {
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
    const seconds = Math.floor(timeLeft % (60));

    return this.mmss(minutes, seconds);
  }


  render() {
    const { timeLeft } = this.props;
    return (
      <div id="time-left" className="time">{this.calcTimeLeft(timeLeft)}</div>
    );
  }
}

export default TimeLeft;
