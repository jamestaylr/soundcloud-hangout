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
	var so = new SoundObject('https://soundcloud.com/fuckmylive/the-reward-is-cheese-x-daft');
	pane.innerHTML = so.getInfo();
	
}

function encodeURI(uri)
{
	return encodeURIComponent(uri).replace(/'/g,"%27").replace(/"/g,"%22");
}

// Wait for gadget to load.
gadgets.util.registerOnLoadHandler(init);

// ----------------------------------------

function SoundObject (uri) {
    this.uri = uri;

    this.getInfo = function() {
        return '<iframe scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=' +
        encodeURI(this.uri) + '&amp;auto_play=false&amp;show_artwork=true&amp;color=0066cc"></iframe>';
    };
}