/**
 * This file contains code specific to enhancing alpha.app.net (and references more generic code in
 * zeerio.js and enhance.js)
 */

var logo = $('<div>',{
	'id':'zeerio-logo',
	'html':'with <a href="https://z.eer.io/">z.eer.io</a>!'
});
logo.click(function(e) {
	e.preventDefault();
	location.href='https://z.eer.io/';
});
$('.nav.header .logo').after(logo);

$('div.text-area textarea[name="post"]').each(function() {

	var $input = $(this);
	$input.addClass('zeerio-input');

});
