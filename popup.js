/**
 * This code runs whenever you hit the z.eer.io button in Chrome.
 */

console.log('extension id is',chrome.runtime.id);

// check if we're logged in or not
// if we are, show the share page
// otherwise show the "you need to login" page
isAuthenticated(function(authed) {
	console.log('isAuthenticated returned ',authed);
	if (authed) {
		shareCurrentPage();
	}
	else {
		loadPopupUrl('auth.html');
	}
});

