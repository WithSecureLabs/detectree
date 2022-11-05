export function colorToHex(color: string): string {
	let rgb = undefined;

	if (color == 'default') {
		rgb = '#828C91';
	} else if (color == 'spawn') {
		rgb = '#828C91';
	} else if (color == 'info') {
		rgb = '#38b2ac';
	} else if (color == 'low') {
		rgb = '#3246B4';
	} else if (color == 'medium') {
		rgb = '#FFB950';
	} else if (color == 'high') {
		rgb = '#FF7070';
	} else if (color == 'critical') {
		rgb = '#9F77E0';
	} else if (color == 'network') {
		rgb = '#C8DCFF';
	} else if (color == 'file') {
		rgb = '#C8DCFF';
	} else if (color == 'registry') {
		rgb = '#C8DCFF';
	} else if (color == 'entity') {
		rgb = '#C8DCFF';
	} else if (color == 'injection') {
		rgb = '#FF7070';
	} else if (color == 'green') {
		rgb = '#05ff1a';
	} else if (color == 'red') {
		rgb = '#e90202';
	} else if (color == 'background') {
		rgb = '#101020';
	} else if (color == 'black') {
		rgb = '#000000';
	} else {
		rgb = '#ffffff';
	}
	return rgb;
}

export function escapeHtml(string: string): string {
	// https://github.com/janl/mustache.js/blob/master/mustache.js#L73
	const entityMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'/': '&#x2F;',
		'`': '&#x60;',
		'=': '&#x3D;'
	};
	return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
		return entityMap[s];
	});
}
