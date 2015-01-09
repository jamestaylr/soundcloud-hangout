function init() {
    // When API is ready... 
    gapi.hangout.onApiReady.add(
        function(eventObj) {
            if (eventObj.isApiReady) {
                document.getElementById('playing')
                    .style.visibility = 'visible';
            }
        });
}

// Wait for gadget to load.                                                       
gadgets.util.registerOnLoadHandler(init);