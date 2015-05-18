var pageData = {
	url:document.location.href,
	title:document.title,
	selected:null
};

if (window.getSelection) {
	pageData.selected = window.getSelection().toString();
	// console.log('selected text in inject.js from getSelection',selected);
}
else {
	pageData.selected = document.selection.createRange().text;
	// console.log('selected text in inject.js from createRange',selected);
}

pageData
