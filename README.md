NodeJS IRC bot with plugin support
==================================

How to get it
-------------

	npm install ircbot

Or you can clone this repo.

How to use it
-------------

Check out `example/bot.js` for creating an instance of the bot.

Plugins
=======

admin
-----

This plugin provides an interface for dealing with the bot via irc.  It provides the following commands: `load`, `unload`, `prefix`, `permissions`, `summon`, `banish`.

### load

If you wanted to run the dice plugin on #chan1 and #chan2, and not reply to PMs, do:

	!load dice chan:#chan1,#chan2 !pm

If you wanted to have the admin plugin only work for user Joe, do:

	!load admin nick:joe

If you wanted the dice plugin to only respond to PMs, do:

	!load dice !chan

If you wanted to ban Joe and Schmoe from the dice plugin, do:

	!load dice !nick:Joe,Schmoe

If you want to block all PMs and block Joe from using the dice plugin in a chan, do:

	!load dice !nick:Joe !pm

If `chan` and `!chan`, or `nick` and `!nick` are found, the allow versions override the deny versions.  If no allow/deny parameters are specified, it will respond to all channel messages and all PMs.

dice
----

This plugin provides a die roller, and also a limited calculator along with it.  It will parse each line for dice expressions, evaluate them all, then return the results.

For example:

	Joe: I attack at [1d20+8] and deal [2d6+3] damage!
	Bot: Joe: [1d20+8] => 13,8 => 21, [2d6+3] => 3,6,3 => 12

farkle
------

This plugin will allow one game of farkle per channel.  When loaded, you should use the `!pm` option to block out PM use of this plugin (this is likely to be fixed in a future version).

use `!help` to learn more about this plugin.
