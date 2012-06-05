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

This plugin provides an interface for dealing with the bot via irc.  It provides the following commands: `load`, `unload`, `prefix`, `permissions`, `summon`, `banish`.  Commands by default are prefixed with `!`, though this is something you can change.

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

If you want to load a plugin with a different prefix, do:

	!load dice cmdprefix:@

For the dice plugin only, commands that require a prefix will use `@` instead of `!`.

Lastly, some plugins may allow you to pass in other options.  You do this in the same format as specified above.  For example:

	!load dice cap:50

### unload

This simply takes a single argument, the name of the plugin to unload:

	!unload dice

### prefix

Use this to change the prefix character to trigger commands that require it:

	!prefix admin ;

Going forward, if you wanted to load a plugin:

	;load dice

If dice had any prefixed commands, those would still default to `!` unless specified.

### permissions

This will chance the chan and nick based restrictions similar to `load`, only it won't reload the plugin, so any state you have will be maintained.

	!permissions admin nick:joe

This will make the admin plugin only respond to someone named joe from now on.  It removes all other permissions and replaces it with what you put here.

### summon

This takes a list of channels you wish to have the bot join:

	!summon #chan1 #chan2 #chan3

### banish

This takes a list of channels you wish the bot to leave:

	!banish #chan1 #chan2 #chan3

dice
----

This plugin provides a die roller, and also a limited calculator along with it.  It will parse each line for dice expressions, evaluate them all, then return the results.  By default it will have a cap of 100 dice.

For example:

	Joe: I attack at [1d20+8] and deal [2d6+3] damage!
	Bot: Joe: [1d20+8] => 13,8 => 21, [2d6+3] => 3,6,3 => 12

Some games need exploding dice, which is a feature that when the maximum value of the die is rolled you get to reroll it and total the results.  The `e` and `E` operators will do this for you:

	Joe: Come on luck roll! [2e6]
	Bot: Joe: [2e6] => 5,6,3 => 14

The exploding rolls will always follow after the die that triggered it.

### Option: cap

This sets the maximum number of dice tat will be rolled before taking into account exploding dice.  The default is 100.  With the default, `[101d100]` will cause an error to be displayed.  Any chaining dice that has a result in over the cap will trigger the error, ie: `[50d50d6]` is rather likely to be well over the 100 cap.  The option argument to pass in is in the form of `cap:100`, or:

	!load dice cap:100

farkle
------

This plugin will allow one game of farkle per channel.  When loaded, you should use the `!pm` option to block out PM use of this plugin (this is likely to be fixed in a future version).

use `!help` to learn more about this plugin.
