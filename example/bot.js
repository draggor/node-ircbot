var bot = require('../')
  , repl = require('repl')
  ;

process.on('uncaughtException', function(err) {
	console.log('Uncaught Exception: ' + err);
});

b = new bot('irc.freenode.net', 'nodeboy1184', {
	port: 6667,
	userName: 'nodeboy',
	realName: 'nodeboy',
	autorejoin: true,
	pluginsPath: '../plugins/',
	debug: true,
	secure: false,
	channels: ['#farkle', '#dracolair']
});

b.loadPlugin('admin', {nick: ['draggor'], cmdprefix:';'});
//b.loadPlugin('dice');

var r = repl.start();
r.context.b = b;
