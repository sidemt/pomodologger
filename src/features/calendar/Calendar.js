// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar";

var authorizeDesc = document.getElementById('authorize_desc');
var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');
var createButton = document.getElementById('create_button');
var signedInOnly = document.getElementById('signed-in-only');
var noLogs = document.getElementById('no-logs');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
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
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeDesc.style.display = 'none';
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'inline';
    signedInOnly.style.display = 'block';
    // Get calendar list
    clearOption()
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
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function handleCreateClick(event) {
  let duration = parseInt(document.getElementById('session-length').innerText, 10);
  let name = document.getElementById('current-event-name').innerText;
  let desc = document.getElementById('current-event-desc').innerText;
  let calendarId = document.getElementById('calendar-select').value;
  createEvent(duration, name, desc, calendarId);
}

/**
 * Append a li element into the ol element
 * Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in li element.
 */
function appendOl(message) {
  // Hide "No logs" message
  if (noLogs.style.display != 'none') {
    noLogs.style.display = 'none';
  }

  // Append new item to the ordered list
  var ol = document.getElementById('event-list');
  var newItem = "<li>" + message + "</li>";
  ol.insertAdjacentHTML("beforeEnd", newItem);
}

/**
 * Append an option element into the select element
 *
 * @param {string} value Calendar ID
 * @param {string} summary Calendar name
 * @param {boolean} primary If the calendar is primary
 */
function appendOption(value, summary, primary) {
  var select = document.getElementById('calendar-select');
  if (primary) {
    // Show the primary calendar as pre-selected
    var newItem = "<option value=\"" + value + "\" selected>" + summary + "</option>";
  } else {
    var newItem = "<option value=\"" + value + "\">" + summary + "</option>";
  }
  select.insertAdjacentHTML("beforeEnd", newItem);
}

/**
 * Clear option elements in the select element
 */
function clearOption() {
  var select = document.getElementById('calendar-select');
  select.innerHTML = "";
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  }).then(function(response) {
    var events = response.result.items;
    appendPre('Upcoming events:');

    if (events.length > 0) {
      for (i = 0; i < events.length; i++) {
        var event = events[i];
        var when = event.start.dateTime;
        if (!when) {
          when = event.start.date;
        }
        appendPre(event.summary + ' (' + when + ')')
      }
    } else {
      appendPre('No upcoming events found.');
    }
  });
}

/**
 * Convert JavaScript Date object into RFC 3339 format
 */
function rfc3339(d) {
  
  function pad(n) {
      return n < 10 ? "0" + n : n;
  }

  function timezoneOffset(offset) {
      var sign;
      if (offset === 0) {
          return "Z";
      }
      sign = (offset > 0) ? "-" : "+";
      offset = Math.abs(offset);
      return sign + pad(Math.floor(offset / 60)) + ":" + pad(offset % 60);
  }

  return d.getFullYear() + "-" +
      pad(d.getMonth() + 1) + "-" +
      pad(d.getDate()) + "T" +
      pad(d.getHours()) + ":" +
      pad(d.getMinutes()) + ":" +
      pad(d.getSeconds()) + 
      timezoneOffset(d.getTimezoneOffset());
}

/**
 * Add and event to the calendar when create button is clicked
 */
function createEvent(duration, eventName = "Pomodoro", eventDetail = "", calendarId = "primary") {
  if (gapi.auth2.getAuthInstance().isSignedIn.get()){
    var startTime = new Date();
    var endTime = new Date();
    startTime.setMinutes(startTime.getMinutes() - duration);
    // Convert date to RFC3339 format
    startTime = rfc3339(startTime);
    endTime = rfc3339(endTime);
  
    var event = {
      'summary': eventName,
      'start': {
        'dateTime': startTime
      },
      'end': {
        'dateTime': endTime
      },
      'description': eventDetail
    };
  
    var request = gapi.client.calendar.events.insert({
      'calendarId': calendarId,
      'resource': event
    });
  
    request.execute(function(event) {
      console.log(event);
      var newText = 'Pomodoro Done: ' + event.summary + ' <a href=\"' + event.htmlLink + '\" target=\"_blank\">[View in Calendar]</a>';
      appendOl(newText);
    });  
  } else {
    console.log("Not signed in");
    var newText = 'Pomodoro Done: Not Signed In';
    appendOl(newText);
  }
}

/**
 * Get the list of calendars
 */
function getCalendarList() {
  if (gapi.auth2.getAuthInstance().isSignedIn.get()){

    var request = gapi.client.calendar.calendarList.list({
      'minAccessRole': 'writer'
    });
  
    request.execute(function(calendarList) {

      calendarList.items.forEach(function(item) {
        appendOption(item.id, item.summary, item.primary);
      });
    });  
  } else {
    console.log("Could not get calendar list");
    appendOption('primary', 'Primary', true);
  }
}
