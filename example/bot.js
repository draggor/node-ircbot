var bot = require('../')
  , repl = require('repl')
  ;

process.on('uncaughtException', function(err) {
	console.log('Uncaught Exception: ' + err);
});

b = new bot('irc.freenode.net', 'nodeboy1184-2', {
	userName: 'nodeboy',
	realName: 'nodeboy',
//	debug: true,
	secure: false,
	channels: ['#dracolair']
});

b.loadPlugin('admin');
//b.loadPlugin('dice');

var r = repl.start();
r.context.b = b;
