var widget;
var client_id = "";

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
	widget.bind(SC.Widget.Events.SEEK, playerSeek);
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
var isPlaying;
var tracks = [];

stateChanged = function(event) {

	var changed = getRecentObject(gapi.hangout.data.getStateMetadata());
	var key = changed.key;

	if (key == 'state') {
		var parsedState = JSON.parse(changed.value);

		if (!(isPlaying == parsedState)) {
			if (isPlaying) {
				pauseTrack();
			} else {
				playTrack();
			}

			isPlaying = !isPlaying;
		}

	} else if (key == 'add-track') {
		var parsedTrack = JSON.parse(changed.value);

		loadTrack(parsedTrack);

	} else if (key == 'seek') {
		var position = JSON.parse(changed.value);

		widget.getPosition(function(data) {
			if (Math.abs(parseInt(data) - parseInt(position)) > 1000) {
				widget.seekTo(position);
			}
		});

	}

}

function getRecentObject(data) {

	var recent;
	var list = [];

	for ( var key in data) {
		var object = data[key];
		list.push(object);
	}

	recent = list[0];

	for (var i = 1; i < list.length; i++) {
		if (parseInt(list[i].timestamp) > parseInt(recent.timestamp)) {
			recent = list[i];
		}
	}

	return recent;
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
	gapi.hangout.data.setValue('state', JSON.stringify(isPlaying));
}

playerPause = function() {
	isPlaying = false;
	gapi.hangout.data.setValue('state', JSON.stringify(isPlaying));
}

playerSeek = function(data) {
	gapi.hangout.data.setValue('seek', JSON.stringify(data.currentPosition));
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