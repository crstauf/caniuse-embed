function caniuse_embed(feat) {
	var obj = this;
	
	this.get_json = function() {
		var request = new XMLHttpRequest();
		request.open('GET', 'https://raw.githubusercontent.com/Fyrd/caniuse/master/data.json', true);
		
		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				obj.json = JSON.parse(request.responseText);
				obj.parse_json();
			} else {
				console.log('reached error');
			}
		};
		
		request.onerror = function() {
			console.log('connection error');
		};
		
		request.send();
	};
	
	this.parse_json = function() {
		obj.feat = obj.json.data[feat];
		obj.browsers = {};
		for (var agent in obj.json.agents) {
			if ('null' !== typeof agent && '' !== agent)
				for (var a = 44; a < 48; a++) {
					if ('undefined' === typeof obj.browsers[agent])
						obj.browsers[agent] = {};
					if ('undefined' !== typeof obj.feat.stats[agent][obj.json.agents[agent].versions[a]])
						obj.browsers[agent][obj.json.agents[agent].versions[a]] = 
							obj.feat.stats[agent][obj.json.agents[agent].versions[a]];
				}
		}
		this.output();
	};
	
	this.output = function() {
		var output = [];
	};

	this.get_json();

}