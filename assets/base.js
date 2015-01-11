var widget;
var client_id = "";
var tracks = [];

// Wait for gadget to load.
gadgets.util.registerOnLoadHandler(init);

function init() {
	// When API is ready...
	gapi.hangout.onApiReady.add(applicationReady);

	SC.initialize({
		client_id : client_id,
	});

	setupWidget();

}

function setupWidget() {
	var frame = document.getElementById('player');
	widget = SC.Widget(frame);

	widget.bind(SC.Widget.Events.PLAY, playerPlay);
	widget.bind(SC.Widget.Events.FINISH, playerFinish);
	widget.bind(SC.Widget.Events.PAUSE, playerPause);
}

applicationReady = function(event) {
	if (event.isApiReady) {
		gapi.hangout.onParticipantsChanged.add(participantsChanged);
		gapi.hangout.data.onStateChanged.add(stateChanged);
	}
}

participantsChanged = function(event) {

}

// -------------------------------------------------------------------------
var playingTrack;
var isPlaying;

stateChanged = function(event) {

	var parsedTrack = JSON.parse(gapi.hangout.data.getValue('add-track'));
	var parsedState = JSON.parse(gapi.hangout.data.getValue('state'));

	if (!(isPlaying == parsedState)) {
		if (isPlaying) {
			pauseTrack();
		} else {
			playTrack();
		}

		isPlaying = !isPlaying;
	}

	loadTrack(track);

}

function loadTrack(track) {
	var query = track.uri + "?client_id=" + client_id + "&amp;auto_play=true";
	widget.load(query);
	isPlaying = true;

}

function playTrack() {
	widget.play();
}

function pauseTrack() {
	widget.pause();
}

playerPlay = function() {
	isPlaying = true;
	gapi.hangout.data.setValue('state', JSON.stringify(state));
}

playerPause = function() {
	isPlaying = false;
	gapi.hangout.data.setValue('state', JSON.stringify(state));
}

playerFinish = function() {

}

// -------------------------------------------------------------------------

function createEmbededSound(event) {

	var permalink_url = encodeURI(event.target.value);

	SC.get('https://api.soundcloud.com/resolve.json?url=' + permalink_url
			+ '/tracks&client_id=' + client_id, function(result) {
		gapi.hangout.data.setValue('add-track', JSON.stringify(result));
	});

}

function encodeURI(uri) {
	return encodeURIComponent(uri).replace(/'/g, "%27").replace(/"/g, "%22");
}