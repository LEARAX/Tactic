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
  gameStateStore({ 'awaitingPlayerCount': false, 'awaitingPlayer2': false, 'inGame': false });
});

bot.on('message', message => {
  if (!message.author.bot) {
    console.log('Message detected.');
    console.log('Time: ' + Date());
    console.log('From: ' + message.author.username);
    console.log('Message: ' + message.content);
    console.log('Length: ' + message.content.length);

    if (message.content == 'READY') {
      var gameState = gameStateParse();

      if (gameState.awaitingPlayer2) {
        console.log('Player 2: ' + message.author.username);
        message.delete();
        message.reply('Player 2 identified as ' + message.author.username);

        gameStateAppend('awaitingPlayer2', false);
        gameStateAppend('Player2', message.author.id);
        gameStateAppend('inGame', true);

        gameStateAppend('turn', 1);
        gameStateAppend('lastMove', null);

        randInt(1,2);
        let playerTurn = randInt(1,2);
        gameStateAppend('playerTurn', playerTurn);
        console.log('Player ' + playerTurn + ' goes first.');

        let gameBoard = [];
        for (i = 0; i < 9; i++) gameBoard.push('-');
        gameStateAppend('gameBoard', gameBoard);
        console.log('Empty game board generated.');
        sendTicTacToeBoard(message.channel, gameStateParse());
      };
    };

    if (message.content.slice(0,2) == '*$') {
      message.delete();

      console.log('Command detected.');
      const commandInput = message.content.slice(2);
      const commandInputSplit = commandInput.split(' ');
      console.log('Command: ' + commandInput);

      console.log('Parsing initial game state...');
      var gameState = gameStateParse();

      if (gameState.inGame && gameState.gameID == 1) {
        console.log('We\'re ingame.');
        switch (gameState.playerTurn) {
          case 1:
            if (message.author.id == gameState.Player1) {
              try {var playerMove = parseInt(commandInput) - 1} catch (err) {console.log('Error encountered parsing move: ') + err};
              if (gameState.gameBoard[playerMove] == '-') {
                gameState.gameBoard[playerMove] = 'x';
                gameState.turn ++
                gameState.playerTurn = 2
                gameState.lastMove = playerMove
                sendTicTacToeBoard(message.channel, gameState);
                gameStateStore(gameState);
              };
            }
            break;
          case 2:
            if (message.author.id == gameState.Player2) {
              try {var playerMove = parseInt(commandInput) - 1} catch (err) {console.log('Error encountered parsing move: ') + err};
              if (gameState.gameBoard[playerMove] == '-') {
                gameState.gameBoard[playerMove] = 'o';
                gameState.turn++;
                gameState.playerTurn = 1;
                gameState.lastMove = playerMove;
                sendTicTacToeBoard(message.channel, gameState);
                gameStateStore(gameState);
              };
            }
            break;
        };

      } else if (!gameState.awaitingPlayerCount) {
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

                gameStateAppend('gameID', 1);
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
              gameStateAppend('awaitingPlayer2', true);

              message.channel.send('Player 2, please say "READY".');
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
          };
        };
      };
    };
  };
});

function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function sendTicTacToeBoard(channel, gameState) {
  channel.send({'embed': {
    'title': 'Tic-Tac-Toe',
    'color': 0xffff00,
    'footer': {
      'text': 'Player ' + gameState.playerTurn + '\'s turn'
    },
    'author': {
      'name': bot.user.username,
      'icon_url': bot.user.avatarURL
    },
    'fields': [
      {
        'name': lastMoveDetermineName(gameState.lastMove, gameState.gameBoard[gameState.lastMove]),
        'value': lastMoveDetermineValue(gameState.lastMove, gameState.gameBoard[gameState.lastMove]),
        'inline': true
      },
      {
        'name': 'Turn ' + gameState.turn,
        'value': visualBoardGen(gameState.gameBoard),
        'inline': true
      }
    ]
  }
  });
}

function lastMoveDetermineName(lastMove, sign) {
  if (lastMove === null) {
    return 'No prior moves';	// Set at game start
  } else {
    return 'Last move: ' + (lastMove + 1) + ' [ ' + sign + ' ]';	// Once lastMove is declared
  };
}

function lastMoveDetermineValue(lastMove, sign) {
  let lastBoard = [];
  for (i = 0; i < 9; i++) lastBoard.push('-');
  if (lastMove != null) lastBoard[lastMove] = sign;
  return visualBoardGen(lastBoard);
}

function visualBoardGen(boardMachine) {
  var boardVisual = '```';	// Declare the board with a prefix
  for (i = 0; i < 3; i++) {
    boardVisual += '  ' + boardMachine[3 * i] + ' | ' + boardMachine[3 * i + 1] + ' | ' + boardMachine[3 * i + 2];	// Generate a row
    if (i < 2) boardVisual += '\n  --|---|--\n';	// Add 2 dividers
  };

  return boardVisual + '```';	// Return the board, with the suffix
}

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
