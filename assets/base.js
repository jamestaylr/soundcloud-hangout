function init() {
	// When API is ready...
	gapi.hangout.onApiReady.add(applicationReady);
}

applicationReady = function(event) {
	if (event.isApiReady) {
		document.getElementById('playing').style.visibility = 'visible';
		gapi.hangout.onParticipantsChanged.add(participantsChanged);
		gapi.hangout.data.onStateChanged.add(stateChanged);
	}
}

participantsChanged = function(event) {
	
}

stateChanged = function(event) {
	
}

function createEmbededSound() {
	var pane = document.getElementById('playing');
	
}

// Wait for gadget to load.
gadgets.util.registerOnLoadHandler(init);