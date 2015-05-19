chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
	console.log('incoming message');
	console.log('request',request);
	console.log('sender',sender);
	console.log('sendResponse',sendResponse);
	if (!sender.url.match(/^https:\/\/z.eer.io\//)) {
		console.log('denied!');
		return;  // don't allow this web page access
	}
	if (request.logout) {
		console.log('requested logout');
		var data = {'user':null,'last_verified':null,'user_token':null};
		zSet(data,function(success) {
			loadPopupUrl('https://z.eer.io/');
			return;
		});
	}
	if (request.user_token) {
		console.log('got user_token from website');
		zGet('user_token',function(old_user_token) {
			if (old_user_token!=request.user_token) {
				saveUserToken(request.user_token,function() {
					console.log('Auto logged in via data from z.eer.io');
				});
			}
		});
	}
});

