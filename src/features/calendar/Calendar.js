// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

/* global gapi */

/**
 *  On load, called to load the auth2 library and API client library.
 */
export function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
export function initClient() {
  const authorizeButton = document.getElementById('authorize_button');
  const signoutButton = document.getElementById('signout_button');
  const createButton = document.getElementById('create_button');

  gapi.client.init({
    apiKey: process.env.REACT_APP_API_KEY,
    clientId: process.env.REACT_APP_CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES,
  }).then(() => {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
    createButton.onclick = handleCreateClick;
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
export function updateSigninStatus(isSignedIn) {
  const authorizeDesc = document.getElementById('authorize_desc');
  const authorizeButton = document.getElementById('authorize_button');
  const signoutButton = document.getElementById('signout_button');
  const signedInOnly = document.getElementById('signed-in-only');

  if (isSignedIn) {
    authorizeDesc.style.display = 'none';
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'inline';
    signedInOnly.style.display = 'block';
    // Get calendar list
    clearOption();
    getCalendarList();
  } else {
    authorizeDesc.style.display = 'block';
    authorizeButton.style.display = 'inline';
    signoutButton.style.display = 'none';
    signedInOnly.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
export function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
export function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

export function handleCreateClick(event) {
  const duration = parseInt(document.getElementById('session-length').innerText, 10);
  const name = document.getElementById('current-event-name').innerText;
  const desc = document.getElementById('current-event-desc').innerText;
  const calendarId = document.getElementById('calendar-select').value;
  createEvent(duration, name, desc, calendarId);
}

/**
 * Append a li element into the ol element
 * Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in li element.
 */
export function appendOl(message) {
  const noLogs = document.getElementById('no-logs');

  // Hide "No logs" message
  if (noLogs.style.display != 'none') {
    noLogs.style.display = 'none';
  }

  // Append new item to the ordered list
  const ol = document.getElementById('event-list');
  const newItem = `<li>${message}</li>`;
  ol.insertAdjacentHTML('beforeEnd', newItem);
}

/**
 * Append an option element into the select element
 *
 * @param {string} value Calendar ID
 * @param {string} summary Calendar name
 * @param {boolean} primary If the calendar is primary
 */
export function appendOption(value, summary, primary) {
  const select = document.getElementById('calendar-select');
  if (primary) {
    // Show the primary calendar as pre-selected
    var newItem = `<option value="${value}" selected>${summary}</option>`;
  } else {
    var newItem = `<option value="${value}">${summary}</option>`;
  }
  select.insertAdjacentHTML('beforeEnd', newItem);
}

/**
 * Clear option elements in the select element
 */
export function clearOption() {
  const select = document.getElementById('calendar-select');
  select.innerHTML = '';
}


/**
 * Convert JavaScript Date object into RFC 3339 format
 */
export function rfc3339(d) {
  function pad(n) {
    return n < 10 ? `0${n}` : n;
  }

  function timezoneOffset(offset) {
    let sign;
    if (offset === 0) {
      return 'Z';
    }
    sign = (offset > 0) ? '-' : '+';
    offset = Math.abs(offset);
    return `${sign + pad(Math.floor(offset / 60))}:${pad(offset % 60)}`;
  }

  return `${d.getFullYear()}-${
    pad(d.getMonth() + 1)}-${
    pad(d.getDate())}T${
    pad(d.getHours())}:${
    pad(d.getMinutes())}:${
    pad(d.getSeconds())
  }${timezoneOffset(d.getTimezoneOffset())}`;
}

/**
 * Add and event to the calendar when create button is clicked
 */
export function createEvent(duration, eventName = 'Pomodoro', eventDetail = '', calendarId = 'primary') {
  try{
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      let startTime = new Date();
      let endTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - duration);
      // Convert date to RFC3339 format
      startTime = rfc3339(startTime);
      endTime = rfc3339(endTime);

      const event = {
        summary: eventName,
        start: {
          dateTime: startTime,
        },
        end: {
          dateTime: endTime,
        },
        description: eventDetail,
      };

      const request = gapi.client.calendar.events.insert({
        calendarId,
        resource: event,
      });

      request.execute((event) => {
        console.log(event);
        const newText = `Pomodoro Done: ${event.summary} <a href=\"${event.htmlLink}\" target=\"_blank\">[View in Calendar]</a>`;
        appendOl(newText);
      });
    } else {
      console.log('Not signed in');
      const newText = 'Pomodoro Done: Not Signed In';
      appendOl(newText);
    }
  } catch (error) {
    console.error(error);
    const newText = 'Pomodoro Done: Failed to create a log on Calendar.';
    appendOl(newText);
  }
}

/**
 * Get the list of calendars
 */
export function getCalendarList() {
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    const request = gapi.client.calendar.calendarList.list({
      minAccessRole: 'writer',
    });

    request.execute((calendarList) => {
      calendarList.items.forEach((item) => {
        appendOption(item.id, item.summary, item.primary);
      });
    });
  } else {
    console.log('Could not get calendar list');
    appendOption('primary', 'Primary', true);
  }
}
