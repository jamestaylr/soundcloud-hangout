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

}

function setupWidget() {
	var frame = document.getElementsByTagName("iframe")[0];
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
var tracks = [];

stateChanged = function(event) {

	var changed = getRecentObject(gapi.hangout.data.getStateMetadata());
	var key = changed.key;

	if (key == 'state') {
		var state = JSON.parse(changed.value);

		widget.isPaused(function(data) {
			var playing = !data;
			if (!(playing == state)) {
				if (playing) {
					widget.pause();
				} else {
					widget.play();
				}
			}
		});

	} else if (key == 'add-track') {
		var parsedTrack = JSON.parse(changed.value);

		if (widget == undefined) {
			SC.oEmbed(parsedTrack.uri, {
				auto_play : true
			}, function(oembed) {
				document.getElementById('target').innerHTML = oembed.html
						.replace('visual=true&', '').replace('height=\"400\"',
								'height=\"144\"');
				setupWidget();
			});

		} else {
			tracks.push(parsedTrack);
		}

	} else if (key == 'seek') {

		var state = JSON.parse(changed.value);

		if (state.relativePosition == 1) {
			if (tracks.length > 0) {
				loadTrack(tracks.shift());
			}
			return;
		}

		widget
				.getPosition(function(data) {
					if (Math.abs(parseInt(data)
							- parseInt(state.currentPosition)) > 1000) {
						widget.seekTo(state.currentPosition);
					}
				});

	}

}

function getRecentObject(data) {

	var recent;

	for ( var key in data) {
		var object = data[key];

		try {
			if (parseInt(object.timestamp) > parseInt(recent.timestamp)) {
				recent = object;
			}
		} catch (TypeError) {
			recent = object;
		}
	}

	return recent;
}

function loadTrack(track) {
	var query = track.uri + "?client_id=" + client_id + "&amp;auto_play=true";
	widget.load(query);
}

playerPlay = function() {
	gapi.hangout.data.setValue('state', JSON.stringify(true));
}

playerPause = function() {
	gapi.hangout.data.setValue('state', JSON.stringify(false));
}

playerSeek = function(data) {
	gapi.hangout.data.setValue('seek', JSON.stringify(data));
}

playerFinish = function(data) {
	gapi.hangout.data.setValue('seek', JSON.stringify(data));

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