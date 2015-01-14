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
		gapi.hangout.onParticipantsEnabled.add(participantsEnabled);
		gapi.hangout.data.onStateChanged.add(stateChanged);

		var data = gapi.hangout.data.getStateMetadata();

		if ('applicationState' in data) {
			var state = JSON.parse(data.applicationState.value);
			embedWidget(state[1]);

			for (var i = 0; i < state[0].length; i++) {
				queueTrack(state[0][i]);
			}

		}
	}
}

participantsEnabled = function(event) {
	var state = [];
	state.push(tracks);
	state.push(current);

	gapi.hangout.data.setValue('applicationState', JSON.stringify(state));

}

// -------------------------------------------------------------------------
var current;
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
			embedWidget(parsedTrack);
			current = parsedTrack;

		} else {

			if (current == undefined) {
				loadTrack(parsedTrack);
			} else {
				tracks.push(parsedTrack);
				queueTrack(parsedTrack);
			}

		}

	} else if (key == 'remove-track') {
		var id = JSON.parse(changed.value);

		var i = 0;

		for (; i < tracks.length; i++) {
			if (tracks[i].id == id) {
				break;
			}
		}

		tracks.splice(i, 1);
		document.getElementById('queue').deleteRow(i);

	} else if (key == 'seek') {
		var state = JSON.parse(changed.value);

		if (state.relativePosition > 0.995) {

			current = undefined;

			if (tracks.length > 0) {
				loadTrack(tracks.shift());
				document.getElementById('queue').deleteRow(0);
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

function embedWidget(initialTrack) {
	SC.oEmbed(initialTrack.uri, {
		auto_play : true
	},
			function(oembed) {
				document.getElementById('target').innerHTML = oembed.html
						.replace('visual=true&', '').replace('height=\"400\"',
								'height=\"144\"');

				setupWidget();
			});
}

function loadTrack(track) {
	current = track;
	var query = track.uri + "?client_id=" + client_id + "&amp;auto_play=true";
	widget.load(query);
}

function queueTrack(track) {
	var j = document.getElementById('queue');

	var seconds = Math.trunc(track.duration / 1000);
	var minutes = Math.trunc(seconds / 60);
	var artwork = track.artwork_url;

	j.innerHTML += '<tr id=\"'
			+ track.id
			+ '\"><td>'
			+ '<img src=\"'
			+ artwork
			+ '\" \\>'
			+ '</td><td class=\"title\">'
			+ track.title
			+ ' by '
			+ '<a href=\"'
			+ track.user.uri
			+ '\">'
			+ track.user.username
			+ '</a>'
			+ '</td><td class=\"time\">'
			+ minutes
			+ ':'
			+ (((seconds % 60) / 100).toFixed(2).toString()).replace('0.', '')
			+ '</td><td class=\"likes\">'
			+ track.favoritings_count.toString().replace(
					/\B(?=(\d{3})+(?!\d))/g, ",")
			+ '</td><td class=\"plays\">'
			+ track.playback_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g,
					",") + '</td><td class=\"close\">X' + '</td></tr>';
}

document.body.onclick = function(e) {
	e = window.event ? event.srcElement : e.target;
	if (e.className && e.className.indexOf('close') != -1) {
		var id = e.parentNode.id;
		gapi.hangout.data.setValue('remove-track', JSON.stringify(id));
	}
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