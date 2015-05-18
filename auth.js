
$(document).ready(function() {

	// check if the user is returning with a token, and if so save it
	console.log(location);
	console.log(location.hash);
	if (location.hash && location.hash.match(/^\#access_token=/)) {
		var token = location.hash.substr(14);
		console.log(token);
		saveUserToken(token,function(success) {
			console.log('back from saving token!',success);
			// close the popup window
			shareCurrentPage();
		});
	}

	// else show the "click to login" part of the page
	else {
		$('#loginMessage').show();
		$('.adn-button').each(function() {
			var url = $(this).attr('href').replace(/urn:ietf:wg:oauth:2.0:oob/,escape(chrome.extension.getURL('auth.html')));
			$(this).attr('href',url);
		});
	}

})
