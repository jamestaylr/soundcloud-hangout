var widget;
var client_id = "";
var tracks = [];

// Wait for gadget to load.
gadgets.util.registerOnLoadHandler(init);

function init() {
	// When API is ready...
	gapi.hangout.onApiReady.add(applicationReady);
}

SC.initialize({
	client_id : client_id,
});

applicationReady = function(event) {
	if (event.isApiReady) {
		gapi.hangout.onParticipantsChanged.add(participantsChanged);
		gapi.hangout.data.onStateChanged.add(stateChanged);
	}
}

participantsChanged = function(event) {

}

// -------------------------------------------------------------------------

stateChanged = function(event) {

	var value = gapi.hangout.data.getValue("current");
	var track = JSON.parse(value);
	tracks.push(track);

	
}

playerReady = function() {

	// add event listerners
	widget.bind(SC.Widget.Events.PLAY, playerPlay);
	widget.bind(SC.Widget.Events.FINISH, playerFinish);

}

playerPlay = function() {

}

playerFinish = function() {

}

// -------------------------------------------------------------------------

function createEmbededSound(event) {

	var permalink_url = encodeURI(event.target.value);

	SC.get('https://api.soundcloud.com/resolve.json?url=' + permalink_url
			+ '/tracks&client_id=' + client_id,
			function(result) {
				gapi.hangout.data.setValue("current", JSON.stringify(result));
			});

}

function encodeURI(uri) {
	return encodeURIComponent(uri).replace(/'/g, "%27").replace(/"/g, "%22");
}