function caniuse_embed(feat,container = false,past = 3,future = 2,show_browsers = false,hide_browsers = false) {
	var obj = this;
	if (past > 45) past = 45;
	if (future > 3) future = 3;

	this.get_json = function() {
		var urls = [
			'https://raw.githubusercontent.com/Fyrd/caniuse/master/data.json',
			'https://raw.githubusercontent.com/crstauf/caniuse-embed/master/caniuse-data.json'
		];
		var success = false;
		for (var k in urls) {
			if (true === success) break;
			var request = new XMLHttpRequest();
			request.open('GET', urls[k], true);
	
			request.onload = function() {
				if (request.status >= 200 && request.status < 400) {
					obj.json = JSON.parse(request.responseText);
					success = true;
					obj.parse_json();
				}
			};
		}

		request.send();
	};

	this.parse_json = function() {
		obj.feat = obj.json.data[feat];
		obj.browsers = {};

		for (var agent in obj.json.agents) {
			if (false !== show_browsers && -1 === show_browsers.indexOf(agent))
				continue;

			if (false !== hide_browsers && -1 !== hide_browsers.indexOf(agent))
				continue;

			if ('undefined' === typeof obj.browsers[agent])
				obj.browsers[agent] = [];

			obj.browsers[agent].past = obj.browsers[agent].future = 0;

			if ('' !== agent)
				for (var a = (46 - past); a <= (46 + future); a++) {
					if (null === obj.json.agents[agent].versions[a] || 'undefined' === typeof obj.json.agents[agent].versions[a])
						continue;

					if (a < 46) obj.browsers[agent].past++;
					else if (a > 46) obj.browsers[agent].future++;

					var version = obj.json.agents[agent].versions[a],
						length = obj.browsers[agent].length,
						orig_version = version;

					if (-1 !== version.indexOf('-')) {
						version = version.split('-');
						version = version[1];
					}

					if ('undefined' === typeof obj.browsers[agent][length])
						obj.browsers[agent][length] = [];

					obj.browsers[agent][length]['version'] = version;

					if ('undefined' !== typeof obj.feat.stats[agent][orig_version]) {
						obj.browsers[agent][length]['era'] = 'current';

						if (a < 46)
							obj.browsers[agent][length]['era'] = 'past';
						else if (a > 46)
							obj.browsers[agent][length]['era'] = 'future';

						obj.browsers[agent][length]['supported'] = obj.feat.stats[agent][orig_version];
					}
				}
		}
		this.output();
	};

	this.output = function() {
		var output = '';
		if (!document.querySelector('#caniuse-embed-css'))
			output += '<link id="caniuse-embed-css" rel="stylesheet" href="https://cdn.rawgit.com/crstauf/caniuse-embed/a823bcb8ee00b830ba10de9ef50b29916697610b/caniuse-embed.css" />';

		var time = new Date();
		output += '<aside id="caniuse-embed-' + feat + '-' + time.getTime() + '" class="caniuse-embed feature-' + feat + '" style="visibility: hidden;">';
		output += '<h1 class="feature-name">' + obj.feat.title + '</h1>';

		output += '<span class="table-container"><ul class="table">';

		for (var id in obj.browsers) {
			output += '<li class="browser browser-' + id + '"><span class="browser-name">' + obj.json.agents[id].browser + '</span><ul class="browser-versions">';

			if (past - obj.browsers[id].past > 0)
				for (var a = 0; a < (past - obj.browsers[id].past); a++)
					output += '<li class="browser-version-placeholder">&nbsp;</li>';

			for (var key in obj.browsers[id]) {
				if ('future' === key || 'past' === key || !obj.browsers[id][key].era) continue;
				var notes = obj.browsers[id][key]['supported'].replace(/#/g,'note-');
				var era = obj.browsers[id][key].era;
				output += '<li class="browser-version ' + notes + ' ' + era + '">' + obj.browsers[id][key]['version'] + '</li>';
			}

			if (future - obj.browsers[id].future > 0)
				for (var a = 0; a < (future - obj.browsers[id].future); a++)
					output += '<li class="browser-version-placeholder">&nbsp;</li>';

			output += '</ul></li>';
		}
		
		output += '</ul></span>';
		output += '<ul class="legend">' + 
			'<li class="y">Full support</li>' + 
			'<li class="a">Partial support</li>' + 
			'<li class="n">No support</li>' + 
		'</ul>';
		output += '<p class="linkback">Source: <a href="http://caniuse.com/#feat=' + feat + '" target="_blank">caniuse.com#feat=' + feat + '</a>.</p>';
		output += '</aside>';

		document.querySelector('#' + container).innerHTML = output;
	};

	this.get_json();

}