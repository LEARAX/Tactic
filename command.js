const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');

const config = require('config.json')('./secrets.json');
const token = config.token;


bot.on('disconnect', event => {
	console.log('!Disconnected: ' + event.reason + ' (' + event.code + ')!');
});

bot.on('ready', () => {
	console.log('╦═╗┌─┐┌─┐┌┬┐┬ ┬┬\n╠╦╝├┤ ├─┤ ││└┬┘│\n╩╚═└─┘┴ ┴─┴┘ ┴ o');
	var gameState = { 'Player1': null, 'Player2': null, 'gameID': null, 'awaitingPlayerCount': false, 'inGame': false, 'playerCount': null };
	gameStateStore(gameState);
});

bot.on('message', message => {
	if (!message.author.bot) {
		console.log('Message detected.');
		console.log('Time: ' + Date());
		console.log('From: ' + message.author.username);
		console.log('Message: ' + message.content);
		console.log('Length: ' + message.content.length);


		if (message.content.slice(0,2) == '*$') {

			console.log('Command detected.');
			const commandInput = message.content.slice(2);
			const commandInputSplit = commandInput.split(' ');
			console.log('Command: ' + commandInput);

			console.log('Parsing initial game state...');
			var gameState = gameStateParse();

			if (!gameState.awaitingPlayerCount) {
				switch (commandInputSplit[0]) {
					case 'ls':
					case 'list':
						message.channel.send({embed: {
							color: 0x0000ff,
							author: {
								name: bot.user.username,
								icon_url: bot.user.avatarURL
							},
							title: 'File System Wizard',
							url: 'https://github.com/The-Complex/Tactic',
							fields: [

								{
									name: '```[0]: Frozen Syncord```',
									value: 'Welcome to Markov Geist!'
								},

								{
									name: '```[1]: Tic-Tac-Toe```',
									value: 'X\'s & O\'s'
								}
							],
						}
						});
						break;

					case 'run':
						switch (commandInputSplit[1]) {
							case '0':
								// TODO
								break;

							case '1':
								console.log('Player ' + message.author.username + ' has selected Tic-Tac-Toe...');

								gameStateAppend('Player1', message.author.id);
								gameStateAppend('awaitingPlayerCount', true);
								message.reply('1 or 2 players?');
								break;

							default:
								message.channel.send({embed: {
									color: 0xff0000,
									author: {
										name: bot.user.username,
										icon_url: 'https://getadblock.com/images/adblock_logo_stripe_test.png'
									},
									title: 'Error Handler',
									url: 'https://github.com/The-Complex/Tactic',
									fields: [{
										name: 'UNRECOGNIZED PROGRAM',
										value: 'Program ID "' + commandInputSplit[1] + '" was unrecognized.'
									}],
								}
								});
						};
						break;

					case '':
						message.channel.send({embed: {
							color: 0xff0000,
							author: {
								name: bot.user.username,
								icon_url: 'https://getadblock.com/images/adblock_logo_stripe_test.png'
							},
							title: 'Error Handler',
							url: 'https://github.com/The-Complex/Tactic',
							fields: [{
								name: 'COMMAND INVALID',
								value: 'Please enter a command!'
							}],
						}
						});
						break;

					default:
						message.channel.send({embed: {
							color: 0xff0000,
							author: {
								name: bot.user.username,
								icon_url: 'https://getadblock.com/images/adblock_logo_stripe_test.png'
							},
							title: 'Error Handler',
							url: 'https://github.com/The-Complex/Tactic',
							fields: [{
								name: 'COMMAND INVALID',
								value: 'Your command "' + commandInputSplit[0] + '" was unrecognized.'
							}],
						}
						});
				};
				message.delete();
			} else if (gameState.awaitingPlayerCount) {
				if (message.author.id == gameState.Player1) {

					switch (commandInput) {
						case '1':
							console.log('Single-player mode selected');
							gameStateAppend('awaitingPlayerCount', false);
							gameStateAppend('playerCount', 1);
							gameStateAppend('inGame', true);
							break;

						case '2':
							console.log('2 player mode selected');
							gameStateAppend('awaitingPlayerCount', false);
							gameStateAppend('playerCount', 2);
							gameStateAppend('inGame', true);

							var TicTacBoard = []
							for (i = 0; i != 9; i ++) TicTacBoard.push(0);	// Generate the board
							gameStateAppend('TicTacBoard', TicTacBoard);
							message.channel.send({embed: {
								color: 0xffff00,
								author: {
									name: bot.user.username
								},
								title: 'Tic-Tac-Toe',
								url: 'https://github.com/The-Complex/Tactic',
								fields: [{
									name: '',
									value: 'Unrecognized value "' + commandInput + '". Please enter "1" or "2".'
								},
									{
										name: 'Player 1 turn.'
									}],
							}
							});
							break;

						default:
							message.channel.send({embed: {
								color: 0xff0000,
								author: {
									name: bot.user.username,
									icon_url: 'https://getadblock.com/images/adblock_logo_stripe_test.png'
								},
								title: 'Error Handler',
								url: 'https://github.com/The-Complex/Tactic',
								fields: [{
									name: 'INVALID NUMBER OF PLAYER',
									value: 'Unrecognized value "' + commandInput + '". Please enter "1" or "2".'
								}],
							}
							});
					}
				}
			};
		};
	};
});

function randInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

function gameStateParse() {
	let gameState = JSON.parse(fs.readFileSync('Game State.json', 'utf8'));
	console.log('Gamestate parsed.');
	console.log('Gamestate: ' + JSON.stringify(gameState));
	return gameState;
}

function gameStateStore(gameState) {
	fs.writeFileSync('Game State.json', JSON.stringify(gameState), 'utf8');  // Write it back
	console.log('Game state stored.');
}

function gameStateAppend(name, value) {
	let gameState = gameStateParse();  // Read it out

	gameState[name] = value;  // Append the value

	gameStateStore(gameState);  // Write it back

	console.log('Value ' + value + ' for item ' + name + ' stored.');
}

bot.login(token);
