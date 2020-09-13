import React, { Component } from "react";

/**
 * Component to display the input form to specify event name and description
 */
class EventForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventName: 'Pomodoro',
      eventDetail: '',
      editState: false
    }
    this.setDetails = this.setDetails.bind(this);
    this.editDetails = this.editDetails.bind(this);
    this.cancel = this.cancel.bind(this);
  };

  /**
   * Store user input to this.state and close input fields
   */
  setDetails() {
    this.setState({
      eventName: document.getElementById("event-name").value,
      eventDetail: document.getElementById("event-detail").value,
      editState: false
    })
  }

  /**
   * Show input fields
   */
  editDetails() {
    this.setState({
      editState: true
    })
  }

  /**
   * Close input fields without saving
   */
  cancel() {
    this.setState({
      editState: false
    })
  }

  render(){
    return (
      <div className="form-area">
        <div className="current-value text-left">
          <strong>Task: </strong><span id="current-event-name">{this.state.eventName}</span><br />
          <strong>Description: </strong><span id="current-event-desc">{this.state.eventDetail}</span><br />
        </div>

        {this.state.editState ? <EditForm onSubmit={this.setDetails} onCancel={this.cancel} /> : <button className="btn btn-light" onClick={this.editDetails}>Edit Task</button>}
      </div>

    );
  }
}

/**
 * Input fields to be displayed when this.state.editState is true
 */
class EditForm extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return(
      <div>
        <p><strong>Edit Task</strong></p>
        <div className="form-group row">
          <label for="event-name" class="col-sm-2 col-form-label text-left">Task </label>
          <input id="event-name" className="form-control col-sm-10" type="text" placeholder="Event title" /><br />
        </div>
        <div className="form-group row">
          <label for="event-detail" class="col-sm-2 col-form-label text-left">Description </label>
          <input id="event-detail" className="form-control col-sm-10" type="text" placeholder="Event description" /><br />
        </div>

        <button id="submit" className="btn btn-light"  onClick={this.props.onSubmit}>Set Task</button>
        <button id="cancel" className="btn btn-secondary"  onClick={this.props.onCancel}>Cancel</button>
      </div>

    )
  }
}

// ReactDOM.render(<EventForm />, document.getElementById('event-form'));
export default EventForm;
