var cardValues = [ 2,3,4,5,6,7,8,9,'T','J','Q','K','A' ];
var cardSuits = [ 'D', 'C', 'H', 'S' ];
var cardSuitSymbols = {
	'D': '&diams;'
,	'C': '&clubs;'
,	'H': '&hearts;'
,	'S': '&spades;'
,	'R': 'R'
,	'B': 'B'
};
var d54 = [ '\u000304JR\u000f', 'JB' ];
var d52 = [];
for(var val in cardValues) {
	for(var suit in cardSuits) {
		if(cardSuits[suit] === 'D' || cardSuits[suit] == 'H') {
			var card = '\u000304' + cardValues[val] + cardSuits[suit] + '\u000f';
			d54.push(card);
			d52.push(card);
		} else {
			var card = cardValues[val] + cardSuits[suit];
			d54.push(card);
			d52.push(card);
		}
	}
}

function buildBaseDeck(deck, types, n) {
	for(var type in types) {
		for(var i = 0; i < n; i++) {
			deck.push(types[type]);
		}
	}
	return deck;
}

var types7 = ['Air', 'Stone', 'Water', 'Darkness', 'Electricity', 'Fire', 'Light'];
var types3 = ['Anima', 'Aether'];
var dBalance = [];

buildBaseDeck(dBalance, types7, 7);
buildBaseDeck(dBalance, types3, 3);

module.exports = {
	54: d54
,	52: d52
,	balance: dBalance
};
