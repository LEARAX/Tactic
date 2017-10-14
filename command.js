const Discord = require('discord.js'),
  bot = new Discord.Client(),
  fs = require('fs')

const config = require('config.json')('./secrets.json'),
  token = config.token

bot.on('disconnect', event => {
  console.log('!Disconnected: ' + event.reason + ' (' + event.code + ')!')
})

bot.on('ready', () => {
  console.log('╦═╗┌─┐┌─┐┌┬┐┬ ┬┬\n╠╦╝├┤ ├─┤ ││└┬┘│\n╩╚═└─┘┴ ┴─┴┘ ┴ o')

  // Cleans master state
  masterStateStore({ 'nextGameID': 0, 'channelsAwaitingPlayerCount': {} })

  // Removes any game state files
  fs.readdir('./', function (err, files) {
    if (err) throw err

    for (i = 0; i < files.length - 1; i++) {
      if (files[i].slice(0, 2) == 'GS') {
        fs.unlink(files[i], err => {
          if (err) throw err
        })
      }
    }

  })
})

bot.on('message', message => {
  if (!message.author.bot) {
    console.log('\n\nMessage detected.');
    console.log('Time: ' + Date());
    console.log(message.author.username + ': ' + message.content);
    console.log('Length: ' + message.content.length)

    var masterState = masterStateParse()

    if (masterState.hasOwnProperty(message.author.id)) {
      console.log('Player found in Master State...')

      var gameID = masterState[message.author.id],
        gameState = gameStateParse(gameID)

      if (message.content == 1 || message.content == 2) {
        if (gameState.awaitingPlayerCount && message.author.id == gameState.Player1.id) {
          message.delete()

          switch (message.content) {

            case '1':
              console.log('1 player mode selected.');
              gameState.awaitingPlayerCount = false
              gameState.playerCount = 1
              gameState.inGame = true

              let nameList = JSON.parse(fs.readFileSync('names.json', 'utf8')).names,
                nameID = randInt(0, nameList.length - 1)
              gameState.Player2 = { 'id': null, 'name': nameList[nameID] }

              gameState.turn = 1
              gameState.lastMove = null

              randInt(1, 2);
              let playerTurn = randInt(1, 2)
              gameState.playerTurn = playerTurn
              console.log('Player ' + playerTurn + ' goes first.')

              let gameBoard = []
              for (i = 0; i < 9; i++) gameBoard.push('-');
              gameState.gameBoard = gameBoard;
              console.log('Empty game board generated.')

              if (playerTurn == 2) {	// AI goes first

                let playerMove = botMove(gameState.gameBoard)
                gameState.gameBoard[playerMove] = 'o'
                gameState.turn++
                gameState.playerTurn = 1
                gameState.lastMove = playerMove

              } else messagePurge(gameState.toBeDeleted)

              gameStateStore(gameID, gameState);
              sendTicTacToeBoard(gameID, message.channel, gameState, masterState)
              break;

            case '2':
              console.log('2 player mode selected.');
              messagePurge(gameState.toBeDeleted);
              gameState.awaitingPlayerCount = false
              gameState.playerCount = 2
              gameState.awaitingPlayer2 = true

              masterState.channelsAwaitingPlayerCount[message.channel.id] = gameID
              masterStateStore(masterState)

              gameStateStore(gameID, gameState);
              message.channel.send('Player 2, please say "READY".').then( msg => {
                markForPurge(gameID, msg)
              })
              break;

            default:
              message.channel.send({embed: {
                color: 0xff0000,
                author: {
                  name: bot.user.username,
                  icon_url: 'https://getadblock.com/images/adblock_logo_stripe_test.png'
                },
                title: 'Error Handler',
                url: 'https://github.com/LEARAX/Tactic',
                fields: [{
                  name: 'INVALID NUMBER OF PLAYER',
                  value: 'Unrecognized value "' + commandInput + '". Please enter "1" or "2".'
                }],
              }
              })
          }
        }
      }


      if (message.content == 'READY') {

        if (masterState.channelsAwaitingPlayerCount.hasOwnProperty(message.channel.id)) {
          var gameState = gameStateParse(masterState.channelsAwaitingPlayerCount[message.channel.id])
        }

        if (gameState.awaitingPlayer2) {
          delete masterState.channelsAwaitingPlayerCount[message.channel.id]
          masterStateStore(masterState)

          console.log('Player 2: ' + message.author.username);
          message.delete();			// Delete it
          messagePurge(gameState.toBeDeleted);	// Get rid of the prompt
          let channelMembers = message.channel.members
          message.channel.send('Player 1 identified as ' + channelMembers.get(gameState.Player1.id).toString());
          message.channel.send('Player 2 identified as ' + message.author.toString())


          gameState.awaitingPlayer2 = false
          gameState.Player2 = { 'id': message.author.id, 'name': message.author.username }
          gameState.inGame = true

          gameState.turn = 1
          gameState.lastMove = null

          randInt(1, 2)
          let playerTurn = randInt(1, 2)
          gameState.playerTurn = playerTurn
          console.log('Player ' + playerTurn + ' goes first.')

          let gameBoard = []
          for (i = 0; i < 9; i++) gameBoard.push('-');
          gameState.gameBoard = gameBoard
          console.log('Empty game board generated.')

          gameStateStore(gameID, gameState);
          sendTicTacToeBoard(gameID, message.channel, gameState, masterState)
        }
      }

      if (message.content.slice(0, 2) == '*$') {
        message.delete()

        console.log('Command detected.');
        const commandInput = message.content.slice(2),
          commandInputSplit = commandInput.split(' ')
        console.log('Command: ' + commandInput)

        console.log('Parsing initial game state...');
        var gameState = gameStateParse(gameID)

        if (gameState.inGame && gameState.gameType == 1) {
          if (gameState.playerCount == 2) {
            console.log('We\'re ingame, with 2 players. Begin parsing move.')

            switch (gameState.playerTurn) {
              case 1:
                if (message.author.id == gameState.Player1.id) {
                  try {var playerMove = parseInt(commandInput) - 1} catch (err) {console.log('Error encountered parsing move: ') + err}
                  if (gameState.gameBoard[playerMove] == '-') {
                    gameState.gameBoard[playerMove] = 'x'
                    gameState.turn++
                    gameState.playerTurn = 2
                    gameState.lastMove = playerMove
                    gameStateStore(gameID, gameState);
                    sendTicTacToeBoard(gameID, message.channel, gameState, masterState)
                  } else {
                    if (playerMove == 'NaN') {
                      message.channel.send('Invalid move: ' + (playerMove + 1))
                    } else {
                      message.channel.send('Invalid move: ' + commandInput)
                    }
                  }
                }
                break;

              case 2:
                if (message.author.id == gameState.Player2.id) {
                  try {var playerMove = parseInt(commandInput) - 1} catch (err) {console.log('Error encountered parsing move: ') + err};
                  if (gameState.gameBoard[playerMove] == '-') {
                    gameState.gameBoard[playerMove] = 'o'
                    gameState.turn++
                    gameState.playerTurn = 1
                    gameState.lastMove = playerMove
                    gameStateStore(gameID, gameState);
                    sendTicTacToeBoard(gameID, message.channel, gameState, masterState)
                  } else {
                    if (playerMove == 'NaN') {
                      message.channel.send('Invalid move: ' + (playerMove + 1))
                    } else {
                      message.channel.send('Invalid move: ' + commandInput)
                    }
                  }
                }
                break;
            };
          } else if (gameState.playerCount == 1) {
            console.log('We\'re ingame, with 1 player. Begin parsing move.');
            if (gameState.playerTurn == 1) {
              if (message.author.id == gameState.Player1.id) {
                try {var playerMove = parseInt(commandInput) - 1} catch (err) {console.log('Error encountered parsing move: ') + err}

                if (gameState.gameBoard[playerMove] == '-') {
                  gameState.gameBoard[playerMove] = 'x'
                  gameState.turn++
                  gameState.playerTurn = 2
                  gameState.lastMove = playerMove

                  console.log('Win status: ' + checkWin(gameState.lastMove, gameState.gameBoard));
                  if (checkWin(gameState.lastMove, gameState.gameBoard)) {
                    sendTicTacToeBoard(gameID, message.channel, gameState, masterState);
                    var gameOver = true
                  } else if (gameState.gameBoard.indexOf('-') == -1) {
                    sendTicTacToeBoard(gameID, message.channel, gameState, masterState);
                    var gameOver = true
                  }

                  if (!gameOver) {
                    console.log('Game not ended, starting AI procedure...')

                    // Begin AI response
                    playerMove = botMove(gameState.gameBoard)

                    gameState.gameBoard[playerMove] = 'o'
                    gameState.turn++
                    gameState.playerTurn = 1
                    gameState.lastMove = playerMove
                    console.log('II Win status: ' + checkWin(gameState.lastMove, gameState.gameBoard));
                    gameStateStore(gameID, gameState);
                    sendTicTacToeBoard(gameID, message.channel, gameState, masterState)
                  }
                } else {
                  if (playerMove == 'NaN') {
                    message.channel.send('Invalid move: ' + (playerMove + 1))
                  } else {
                    message.channel.send('Invalid move: ' + commandInput)
                  }
                }
              }
            }
          }
        }
      }
    } else if (message.content.slice(0, 2) == '*$') {
      message.delete()

      console.log('Command detected.');
      const commandInput = message.content.slice(2),
        commandInputSplit = commandInput.split(' ')
      console.log('Command: ' + commandInput)

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
            url: 'https://github.com/LEARAX/Tactic',
            fields: [

              {
                name: '```[0]: Tic-Tac-Toe```',
                value: 'X\'s & O\'s'
              }
            ],
          }
          })
          break;

        case 'run':
          switch (commandInputSplit[1]) {

            case '0':
              console.log('Player ' + message.author.username + ' has selected Tic-Tac-Toe...')

              masterState[message.author.id] = masterState.nextGameID
              masterState.nextGameID++
              masterStateStore(masterState)

              let gameState = {
                'gameType': 1,
                'Player1': { 'id': message.author.id, 'name': message.author.username },
                'awaitingPlayerCount': true
              }

              gameStateStore(masterState[message.author.id], gameState)

              message.reply('1 or 2 players?').then( msg => markForPurge(masterState[message.author.id], msg))
              break;

            default:
              message.channel.send({embed: {
                color: 0xff0000,
                author: {
                  name: bot.user.username,
                  icon_url: 'https://getadblock.com/images/adblock_logo_stripe_test.png'
                },
                title: 'Error Handler',
                url: 'https://github.com/LEARAX/Tactic',
                fields: [{
                  name: 'UNRECOGNIZED PROGRAM',
                  value: 'Program ID "' + commandInputSplit[1] + '" was unrecognized.'
                }],
              }
              });
          }
          break;

        case '':
          message.channel.send({embed: {
            color: 0xff0000,
            author: {
              name: bot.user.username,
              icon_url: 'https://getadblock.com/images/adblock_logo_stripe_test.png'
            },
            title: 'Error Handler',
            url: 'https://github.com/LEARAX/Tactic',
            fields: [{
              name: 'COMMAND INVALID',
              value: 'Please enter a command!'
            }],
          }
          })
          break;

        default:
          message.channel.send({embed: {
            color: 0xff0000,
            author: {
              name: bot.user.username,
              icon_url: 'https://getadblock.com/images/adblock_logo_stripe_test.png'
            },
            title: 'Error Handler',
            url: 'https://github.com/LEARAX/Tactic',
            fields: [{
              name: 'COMMAND INVALID',
              value: 'Your command "' + commandInputSplit[0] + '" was unrecognized.'
            }],
          }
          })
      }
    }
  }
})

function botMove(gameBoard) {
  var availableMoves = []
  for (i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] == '-') {
      availableMoves.push(i)
    }
  }

  console.log('Available moves for AI: ' + availableMoves)

  var testBoard = []

  for (a = 0; a < availableMoves.length; a++) {
    testBoard = gameBoard.slice(0)
    testBoard[availableMoves[a]] = 'o'
    console.log('Possible board configuration: ' + testBoard);
    if (checkWin(availableMoves[a], testBoard)) {
      console.log('Winning move found: ' + availableMoves[a]);
      return availableMoves[a]
    }
  }

  // No easy win :(

  for (a = 0; a < availableMoves.length; a++) {
    testBoard = gameBoard.slice(0)
    testBoard[availableMoves[a]] = 'x'
    console.log('Possible board configuration: ' + testBoard);
    if (checkWin(availableMoves[a], testBoard)) {
      console.log('Winning move found for player: ' + availableMoves[a]);
      console.log('Inhibiting move...');
      return availableMoves[a]
    }
  }

  // Random AI fallback
  return availableMoves[randInt(0, availableMoves.length - 1)]
}

function checkWin(lastMove, gameBoard) {
  /*
   * let matrixgameboard = [
   *  [ gameboard[0], gameboard[1], gameboard[2] ],
   *  [ gameboard[3], gameboard[4], gameboard[5] ],
   *  [ gameboard[6], gameboard[7], gameboard[8] ]
   * ]
   */
  var solution = ''

  for (i = 0; i < 3; i++) {
    solution += gameBoard[lastMove]
  }

  console.log('Solution for comparison: ' + solution)

  // Start cracking

  switch (lastMove) {
    case 0:
      if (gameBoard[0] + gameBoard[1] + gameBoard[2] == solution) return true
      if (gameBoard[0] + gameBoard[3] + gameBoard[6] == solution) return true
      if (gameBoard[0] + gameBoard[4] + gameBoard[8] == solution) return true
      break;

    case 1:
      if (gameBoard[1] + gameBoard[0] + gameBoard[2] == solution) return true
      if (gameBoard[1] + gameBoard[4] + gameBoard[7] == solution) return true
      break;

    case 2:
      if (gameBoard[2] + gameBoard[0] + gameBoard[1] == solution) return true
      if (gameBoard[2] + gameBoard[4] + gameBoard[6] == solution) return true
      if (gameBoard[2] + gameBoard[5] + gameBoard[8] == solution) return true
      break;

    case 3:
      if (gameBoard[3] + gameBoard[0] + gameBoard[6] == solution) return true
      if (gameBoard[3] + gameBoard[4] + gameBoard[5] == solution) return true
      break;

    case 4:
      if (gameBoard[4] + gameBoard[0] + gameBoard[8] == solution) return true
      if (gameBoard[4] + gameBoard[1] + gameBoard[7] == solution) return true
      if (gameBoard[4] + gameBoard[2] + gameBoard[6] == solution) return true
      if (gameBoard[4] + gameBoard[3] + gameBoard[5] == solution) return true
      break;

    case 5:
      if (gameBoard[5] + gameBoard[2] + gameBoard[8] == solution) return true
      if (gameBoard[5] + gameBoard[3] + gameBoard[4] == solution) return true
      break;

    case 6:
      if (gameBoard[6] + gameBoard[0] + gameBoard[3] == solution) return true
      if (gameBoard[6] + gameBoard[2] + gameBoard[4] == solution) return true
      if (gameBoard[6] + gameBoard[7] + gameBoard[8] == solution) return true
      break;

    case 7:
      if (gameBoard[7] + gameBoard[1] + gameBoard[4] == solution) return true
      if (gameBoard[7] + gameBoard[6] + gameBoard[8] == solution) return true
      break;

    case 8:
      if (gameBoard[8] + gameBoard[0] + gameBoard[4] == solution) return true
      if (gameBoard[8] + gameBoard[2] + gameBoard[5] == solution) return true
      if (gameBoard[8] + gameBoard[6] + gameBoard[7] == solution) return true
      break;
  }
  return false
}

function delay(milliseconds) {
  var start = new Date().getTime();
  for (i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}

function footerDetermineText(playerTurn, Player1, Player2) {
  switch (playerTurn) {
    case 1:
      return Player1 + '\'s turn'
      break;
    case 2:
      return Player2 + '\'s turn'
      break;
  };
}

function gameOverResponse(gameID, channel, gameState, masterState) {
  switch (gameState.gameBoard[gameState.lastMove]) {
    case 'x':
      channel.send('Game over. ' + gameState.Player1.name + ' won.')
      break;

    case 'o':
      channel.send('Game over. ' + gameState.Player2.name + ' won.')
      break;

    case '-':
      channel.send('It\'s a draw!')
      break;
  }

  delete masterState[gameState.Player1.id]

  if (gameState.Player2.id != null) {
    delete masterState[gameState.Player2.id]
  }

  masterStateStore(masterState)

  fs.unlink('GS' + gameID + '.json', err => {
    if (err) throw err
  })
}

function gameStateParse(file) {
  console.log(file)
  let gameState = JSON.parse(fs.readFileSync('GS' + file + '.json', 'utf8'))
  console.log('Gamestate parsed.');
  console.log('Gamestate: ' + JSON.stringify(gameState));
  return gameState
}

function gameStateStore(file, gameState) {
  fs.writeFileSync('GS' + file + '.json', JSON.stringify(gameState), 'utf8');  // Write it back
  console.log('Game state stored.')
}

function gameStateAppend(file, name, value) {
  let gameState = gameStateParse(file);  // Read it out

  gameState[name] = value  // Append the value

  gameStateStore(file, gameState)  // Write it back

  console.log('Value ' + value + ' for item ' + name + ' stored to game state ' + file +'.')
}

function lastMoveDetermineName(lastMove, sign) {
  if (lastMove === null) {
    return 'No prior moves'	// Set at game start
  } else {
    return 'Tile ' + (lastMove + 1) + ' captured by ' + sign.toUpperCase() + '.'	// Once lastMove is declared
  }
}

function lastMoveDetermineValue(lastMove, sign) {
  let lastBoard = []
  for (i = 0; i < 9; i++) lastBoard.push('-');
  if (lastMove != null) lastBoard[lastMove] = sign;
  return visualBoardGen(lastBoard)
}

function markForPurge(file, msg) {
  gameStateAppend(file, 'toBeDeleted', { 'id': msg.id, 'channel': msg.channel.id, 'guild': msg.guild.id })
}

function masterStateParse() {
  let masterState = JSON.parse(fs.readFileSync('Master State.json', 'utf8'))
  console.log('Master state parsed.');
  console.log('Master state: ' + JSON.stringify(masterState));
  return masterState
}

function masterStateStore(masterState) {
  fs.writeFileSync('Master State.json', JSON.stringify(masterState), 'utf8');  // Write it back
  console.log('Master state stored.')
}

function masterStateAppend(name, value) {
  let masterState = masterStateParse()  // Read it out

  masterState[name] = value  // Append the value

  masterStateStore(masterState)  // Write it back

  console.log('Value ' + value + ' for item ' + name + ' stored.')
}

function messagePurge(marked) {
  let messageToBeDeletedGuild = bot.guilds.get(marked.guild);
  console.log('Marked message guild: ' + messageToBeDeletedGuild.name);
  let messageToBeDeletedChannel = messageToBeDeletedGuild.channels.get(marked.channel);
  console.log('Marked message channel: ' + messageToBeDeletedChannel.name);
  let messageToBeDeleted = messageToBeDeletedChannel.messages.get(marked.id);
  console.log('Isolated message to be removed.');
  console.log('Message to be deleted: ' + messageToBeDeleted.content);
  messageToBeDeleted.delete();
}


function randInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sendTicTacToeBoard(gameID, channel, gameState, masterState) {
  if (gameState.lastMove != null) {
    messagePurge(gameState.toBeDeleted);
    console.log('Cleaned old board.')
  }

  channel.send({'embed': {
    'title': 'Tic-Tac-Toe',
    'color': 0xffff00,
    'footer': {
      'text': footerDetermineText(gameState.playerTurn, gameState.Player1.name, gameState.Player2.name)
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
  }).then( msg => {
    markForPurge(gameID, msg)
  })

  if (checkWin(gameState.lastMove, gameState.gameBoard)) {
    gameOverResponse(gameID, channel, gameState, masterState)
  } else if (gameState.gameBoard.indexOf('-') == -1) {
    gameOverResponse(gameID, channel, gameState, masterState)
  }
}

function visualBoardGen(boardMachine) {
  var boardVisual = '```      2'	// Declare the board with a prefix
  for (i = 0; i < 3; i++) {
    boardVisual += '\n' + (3 * i + 1) + ' ' + boardMachine[3 * i] + ' | ' + boardMachine[3 * i + 1] + ' | ' + boardMachine[3 * i + 2] + ' ' + (3 * i + 3) + '\n'//      Generate a row
    if (i < 2) boardVisual += '  --|---|--'	// Add 2 dividers
  }

  return boardVisual + '      8```'	// Return the board, with the suffix
}


bot.login(token);
