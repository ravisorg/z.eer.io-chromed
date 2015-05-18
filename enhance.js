/**
 * Generic code for enhancing App.net web clients (like alpha.app.net) in order to make use if
 * z.eer.io. This will be combined with site/client specific code in other files (like alpha.js).
 */

var previousContent = '';

function compareContent() {
	$('.zeerio-input').each(function() {
		var newContent = $(this).val();
		if (newContent!=previousContent) {
			updatePreview();
			previousContent = newContent;
		}
	});
}

setInterval(compareContent,500);

function updatePreview() {
	// if there are no links whatsoever in the content, don't bother talking to z.eer.io
	console.log('updating preview (content has changed)');
}

