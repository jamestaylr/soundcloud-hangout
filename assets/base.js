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

	var value = gapi.hangout.data.getValue("current");

	var a = new SoundObject(value);
	document.getElementById('playing').innerHTML = a.getInfo();
}

function createEmbededSound(event) {
	
	var uri = encodeURI(event.target.value);
	
	var so = new SoundObject(uri);
	document.getElementById('playing').innerHTML = so.getInfo();

	gapi.hangout.data.setValue("current", uri);

}

function encodeURI(uri) {
	return encodeURIComponent(uri).replace(/'/g, "%27").replace(/"/g, "%22");
}

// Wait for gadget to load.
gadgets.util.registerOnLoadHandler(init);

//-------------------------------------------------------------------------

function SoundObject(uri) {
	this.uri = uri;

	this.getInfo = function() {
		return '<iframe scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url='
				+ encodeURI(this.uri)
				+ '&amp;auto_play=false&amp;show_artwork=true&amp;color=0066cc"></iframe>';
	};
}