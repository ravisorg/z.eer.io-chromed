/**
 * Generic code used throughout the z.eer.io extension (eg: for both chrome popup and enhancing web
 * clients.
 */
var _DATACACHE = {};

function zGet(name,callback) {
	console.log('zGet',name);
	if (_DATACACHE[name]) {
		callback(_DATACACHE[name]);
		return;
	}
	chrome.storage.sync.get(name,function(items) {
		if (chrome.runtime.lastError) {
			console.log('Error while fetching data from chrome storage!',chrome.runtime.lastError);
			return;
		}
		console.log('got data from storage',items);
		for (i in items) {
			_DATACACHE[i] = items[i];
		}
		callback(_DATACACHE[name]);
	});
}

function zSet(values,callback) {
	console.log('zSet',values);
	chrome.storage.sync.set(values,function() {
		if (chrome.runtime.lastError) {
			console.log('Error while fetching data from chrome storage!',chrome.runtime.lastError);
			callback(false);
		}
		console.log('saved data to storage',values);
		for (i in values) {
			_DATACACHE[i] = values[i];
		}
		callback(true);
	});
	return;
}

var _WINDOWID = null;
function zWin(url,callback) {
	if (_WINDOWID) {
		console.log('window id exists, getting info');
		chrome.windows.get(_WINDOWID,null,function(win) {
			console.log('got back window info',win);
			_WINDOWID = win.id;
			callback(win);
		});
	}
	else {
		console.log('window id does not exist, creating window');
		chrome.windows.create({
			url: url,
			type: "panel",
			focused: true,
			width: 640,
			height: 480
		},function(win) {
			console.log('created window',win);
			_WINDOWID = win.id;
			callback(win);
		});
	}
}

function zWinClose(callback) {
	if (_WINDOWID) {
		chrome.windows.remove(_WINDOWID,callback);
	}
}

// are we logged in? this function requires a callback because it may take a moment to determine if
// we're logged in or not. Specifically if it looks like we're logged in (we have a user token) but
// we haven't talked to the ADN API in awhile, we'll do a quick check to make sure. If it turns out
// we're logged in, callback(true), else callback(false).
function isAuthenticated(callback) {
	console.log('isAuthenticated()');
	zGet('user_token',function(user_token) {
		console.log('got token:',user_token);
		if (!user_token) {
			callback(false);
			return;
		}
		// if we've never verified the login, or the verification was more than 12 hours ago, then
		// reauthenticate to make sure we're still logged in
		zGet('last_verified',function(last_verified) {
			if (last_verified && (new Date) - last_verified<(60*60*12*1000)) {
				callback(true);
				return;
			}
			reauthenticate(callback);
			return;
		});
		return;
	});
}

// attempts to reauthenticate our user token with the ADN API. If successful, calls callback(true),
// else calls callback(false).
function reauthenticate(callback) {
	console.log('reauthenticate()');
	zGet('user_token',function(user_token) {
		if (!user_token) {
			console.log('Unable to retrieve user token from chrome storage');
			callback(false);
			return;
		}

		// try to pull in the logged in user's data using our user_token
		// this accomplishes two goals:
		// 1) It verifies that our token is still valid
		// 2) It updates (or sets) our user data so we know who's logged in
		$.appnet.authorize(user_token);
		var promise = $.appnet.user.get('me');
		promise.then(function (response) {
			// if no user was returned, our token is probably expired or revoked. in this case we
			// want to clear our what we think we know about the user, because it's not valid
			// anymore.
			if (!response.data) {
				var data = {'user':null,'last_verified':null,'user_token':null};
				zSet(data,function(success) {
					callback(false);
					return;
				});
				return;
			}

			// if we did get something useful back, store it so we don't have to hit the ADN API
			// every time the button is clicked.
			var data = {'user':response.data,'last_verified':(new Date).getTime()};
			console.log('saving data',data);
			zSet(data,function(success) {
				callback(success);
				return;
			});
		}, 

		// error
		function (response) {
			// On failure, response is the jQuery response object.
			// See: http://api.jquery.com/Types/#jqXHR
			console.log('Error!',response);
		});



		// $.appnet.authorize(items.user_token);
		// var user = $.appnet.user.get();
		// console.log('user data retrieved from app.net',user);
		// if (false) {
		// 	chrome.storage.sync.set({'last_verified':(new Date),'user':user},function() {
		// 		callback(true);
		// 		return;
		// 	});
		// }
	});
}

function saveUserToken(token,callback) {
	console.log('setting user token to ',token);
	chrome.storage.sync.set({'user_token':token},function(success) {
		if (chrome.runtime.lastError) {
			console.log('Error while saving user data to chrome storage!',chrome.runtime.lastError);
			return;
		}
		reauthenticate(callback);
		return;
	});
}

// sends the user to the app.net login / permissions page and saves the resulting user token
function authenticate(callback) {
	console.log('authenticate()');
	$.appnet.authorize("MY_USER_TOKEN");
	var promise = $.appnet.post.getGlobal({ include_annotations: 1 });
	promise.then(function (response) {
	  // On success, response is the json object returned by the app.net server.
	  // See: http://developers.app.net/docs/basics/responses/#response-envelope
	  console.dir(response.data);
	  console.dir(response.meta);
	  return $.appnet.post.getThread('1000', { count: 10 });
	}).then(function (response) {
	  console.dir(response);
	}, function (response) {
	  // On failure, response is the jQuery response object.
	  // See: http://api.jquery.com/Types/#jqXHR
	  console.log('Error!');
	});
}

function deauthenticate(callback) {
	console.log('deauthenticating');

}

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
			loadPopupUrl('auth.html');
			return;
		});
	}
});






function shareCurrentPage() {
	console.log('getting window url and title and selected text...');
	chrome.tabs.executeScript( null, {
		file: "inject.js",
		allFrames: true,
	}, function(pageDatas) {
		console.log('pageDatas',pageDatas);
		var pageData = pageDatas[0];
		for (var i=0; i<pageDatas.length; i++) {
			if (!pageData.selected && pageDatas[i].selected) {
				pageData.selected = pageDatas[i].selected;
			}
		}
		console.log('results',pageData);
		var zeerioUrl = 
			'http://z.eer.io/?extension=true'+
			'&url='+encodeURIComponent(pageData.url)+
			'&title='+encodeURIComponent(pageData.title)+
			'&text='+encodeURIComponent(pageData.selected);
		console.log('loading zeerio url',zeerioUrl);
		loadPopupUrl(zeerioUrl);
	});
}

function loadPopupUrl(url) {
	top.$('#popupframe').attr('src',url);
}
