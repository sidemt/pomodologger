import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import './App.css';

import LangSelection from './components/LangSelection';
import PomodoroClock from './components/PomClock';
import EventForm from './components/EventForm';
import * as Calendar from './features/calendar/Calendar';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sessionLength: 25,
      eventName: 'Pomodoro',
      eventDetail: '',
      calendarId: ''
    };
    this.changeLanguage = this.changeLanguage.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSessionLengthChange = this.handleSessionLengthChange.bind(this);
    this.handleCreateClick = this.handleCreateClick.bind(this);
  }

  componentDidMount() {
    Calendar.handleClientLoad();
  }

  changeLanguage(lang) {
    const {i18n} = this.props;
    switch (lang) {
      case 'ja':
        i18n.changeLanguage('ja');
        break;
      default: // 'en'
        i18n.changeLanguage('en');
    }
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSessionLengthChange(value) {
    this.setState({ sessionLength: value });
  }

  handleCreateClick(event) {
    Calendar.createEvent(this.state.sessionLength,
      this.state.eventName,
      this.state.eventDetail,
      this.state.calendarId);
  }

  render(){
    const {t, i18n} = this.props;
    const displayNone = {
      display: 'none',
    };

    return (
      <>
        <div className="container">
          <LangSelection lang={i18n.language} changeLanguage={this.changeLanguage} />

          <h1>Pomodologger</h1>
          <p>{t('pomodologger_desc')}</p>

          <PomodoroClock
            sessionLength={this.state.sessionLength}
            onSessionLengthChange={this.handleSessionLengthChange}
            eventName={this.state.eventName}
            eventDetail={this.state.eventDetail}
            calendarId={this.state.calendarId}
          />

          <div className="group logs">
            <p><strong>{t('logs')}</strong></p>
            <p id="no-logs">{t('no_logs')}</p>

            <ol id="event-list" className="number-list" />
          </div>

          <div className="group descriptions">
            <div className="section">
              <p id="authorize_desc" style={displayNone}>
                {t('sigin_in_desc')}
              </p>
              <p id="authorize_failed" style={displayNone}>
                {t('failed_to_connect_to_google')}
              </p>
              {/* Add buttons to initiate auth sequence and sign out */}
              <button id="authorize_button" className="btn btn-light" style={displayNone}>{t('sign_in')}</button>
              <button id="signout_button" className="btn btn-secondary" style={displayNone}>{t('sign_out')}</button>
            </div>

            <div className="section">
              <p id="authorize_success" style={displayNone}>
                {t('log_desc')}
              </p>
            </div>

            <div id="signed-in-only" style={displayNone}>
              <div className="section">
                <p><strong>{t('select_calendar')}</strong></p>
                <select id="calendar-select" className="custom-select" name="calendarId" value={this.state.calendarId} onChange={this.handleInputChange} />
              </div>

              <div className="section">
                <p><strong>{t('what_are_you_working_on')}</strong></p>
                <EventForm
                  eventName={this.state.eventName}
                  eventDetail={this.state.eventDetail}
                  handleInputChange={this.handleInputChange}
                />
              </div>

              <div className="section">
                <p>
                  {t('try_adding_a_log')}
                </p>
                <button id="create_button" className="btn btn-light" onClick={this.handleCreateClick}>{t('add_a_log')}</button>
              </div>
            </div>
          </div>

          <div className="section">
            <small>
              {t('sounds_from')}:
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

export default withTranslation()(App);
