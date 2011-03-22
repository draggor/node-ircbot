var irc = require('irc')
  , plugin = require('./plugin')
  , repl = require('repl')
  ;

function bot(server, nick, options) {
	this.server = server;
	this.nick = nick;
	this.options = options;
	this.plugins = {};
	this.client = new irc.Client(server, nick, options);
}

function sanitize(str) {
	return str.replace(/\.\.\//g, '');
}

bot.prototype.modifyListeners = function(plugin, func) {
	var mod = func + 'Listener';
	for(var i in plugin.listeners) {
		if(typeof plugin.listeners[i] === 'function') {
			this.modifyListener(i, plugin.listeners[i], mod);
		} else {
			for(var j in plugin.listeners[i]) {
				this.modifyListener(i, plugin.listeners[i][j], mod);
			}
		}
	}
};

bot.prototype.modifyListener = function(name, func, mod) {
	switch(name) {
		case '*':
			this.client[mod]('message', func);
			break;
	}
};

bot.prototype.loadPlugin = function(name) {
	var cleanName = sanitize(name)
	  , pl = plugin('./plugins/' + cleanName);

	if(this.plugins[cleanName]) {
		this.removePlugin(cleanName);
	}
	
	this.plugins[cleanName] = pl;
	this.modifyListeners(pl, 'add');
};

bot.prototype.removePlugin = function(name) {
	var pl = this.plugins[name];

	this.modifyListeners(pl, 'remove');
};

module.exports = bot;
