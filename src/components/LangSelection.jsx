import React, { Component } from 'react';

/**
 * Component to show the remaining time
 */
class LangSelection extends Component {
  constructor(props) {
    super(props);

    this.langLink = this.langLink.bind(this);
  }

  langLink(lang) {
    switch (lang) {
      case 'ja':
        return (
          <div className="lang-selection">
            <a href="#" onClick={() => {this.props.changeLanguage('en')}}>English</a> | 日本語
          </div>
        );
        break;
      default: // 'en'
        return (
          <div className="lang-selection">
            English | <a href="#" onClick={() => {this.props.changeLanguage('ja')}}>日本語</a>
          </div>
        );
    }
  }

  render() {
    return(
      <>
        {this.langLink(this.props.lang)}
      </>
    );
  }
}

export default LangSelection;
