import React, { Component } from 'react';

/**
 * Component to display the input form to specify event name and description
 */
class EventForm extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="form-area">
        <div className="form-group row">
          <label htmlFor="event-name" className="col-sm-2 col-form-label text-left">Task </label>
          <input id="event-name" className="form-control col-sm-10" type="text" name="eventName" value={this.props.eventName} onChange={this.props.handleInputChange} placeholder="Event title" />
          <br />
        </div>
        <div className="form-group row">
          <label htmlFor="event-detail" className="col-sm-2 col-form-label text-left">Description </label>
          <input id="event-detail" className="form-control col-sm-10" type="text" name="eventDetail" value={this.props.eventDetail} onChange={this.props.handleInputChange} placeholder="Event description" />
          <br />
        </div>
      </div>
    );
  }
}

export default EventForm;
