import React, { Component } from 'react';
import './App.css';

import PomodoroClock from './components/PomClock';

import EventForm from './components/EventForm';

import * as Calendar from './features/calendar/Calendar';

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    Calendar.handleClientLoad();
  }

  render(){
    const displayNone = {
      display: 'none',
    };

    return (
      <>
        <div className="container">
          <div className="lang-selection">
            English |
            {' '}
            <a href="ja/index.html">Japanese</a>
          </div>
          <h1>Pomodologger</h1>
          <p>Pomodoro timer with Google Calendar log</p>

          <PomodoroClock />

          <div className="group logs">
            <p><strong>Logs</strong></p>
            <p id="no-logs">No Pomodoro done yet</p>

            <ol id="event-list" className="number-list" />
          </div>

          <div className="group descriptions">
            <div className="section">
              <p id="authorize_desc" style={displayNone}>
                Sign in with Google to log your work on Google Calendar
              </p>
              <p id="authorize_failed" style={displayNone}>
                Failed to connect to Google Calendar.
              </p>
              {/* Add buttons to initiate auth sequence and sign out */}
              <button id="authorize_button" className="btn btn-light" style={displayNone}>Sign In</button>
              <button id="signout_button" className="btn btn-secondary" style={displayNone}>Sign Out</button>
            </div>

            <div className="section">
              <p id="authorize_success" style={displayNone}>
                A log will be automatically added to your calendar when you complete a session.
              </p>
            </div>

            <div id="signed-in-only" style={displayNone}>
              <div className="section">
                <p><strong>Select a calendar.</strong></p>
                <select id="calendar-select" className="custom-select" />
              </div>

              <div className="section">
                <p><strong>What are you working on?</strong></p>
                <EventForm />
              </div>

              <div className="section">
                <p>
                  You can manually add a log by clicking the button below.
                </p>
                <button id="create_button" className="btn btn-light">Add a Log Now</button>
              </div>
            </div>
          </div>

          <div className="section">
            <small>
              Sounds by:
              {' '}
              <a href="http://www.kurage-kosho.info" title="フリー効果音素材 くらげ工匠" target="_blank">フリー効果音素材 くらげ工匠</a>
            </small>
          </div>

          <footer className="footer">
            <ul className="justify-content-center">
              <li className="">
                <a className="" href="https://tools.charonworks.com/">Tools I Want</a>
              </li>
            </ul>

            <small>
              (c) 2018-2021
              {' '}
              <a href="https://www.charonworks.com" target="_blank">Charonworks</a>
            </small>
          </footer>

        </div>
      </>
    );
  }
}

export default App;
