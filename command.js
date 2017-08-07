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

      var gameState = JSON.parse(fs.readFileSync('Game State.json', 'utf8'));
      console.log('Gamestate parsed.');
      console.log('Gamestate: ' + JSON.stringify(gameState));

      if (gameState.awaitingPlayerCount )
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
              value: 'Welcome to Markov Geist'
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
        var Player1 = message.author.id;
        var gameState = {'Player1': Player1, 'gameID': commandInputSplit[1], 'awaitingPlayerCount': true, 'inGame' : false};
        message.reply('1 or 2 players?');
        fs.writeFileSync('Game State.json', JSON.stringify(gameState), 'utf8');
        console.log('Game state stored.');
        break;


        /*  switch (m.content) {
        case '1':
        console.log('Single-player mode selected');
        break;

        case '2':
        console.log('2 player mode selected');
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
      value: 'Unrecognized value "' + m.content + '". Please enter "1" or "2".'
    }],
  }
});
}
var gameState = {
'Player1': Player1,
'Mode': }
);*/


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
};
};
});

function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function gameStateAppend(name, value) {
  let gameState = JSON.parse(fs.readFileSync('Game State.json', 'utf8'));  // Read it
  console.log('Gamestate parsed.');
  console.log('Gamestate: ' + JSON.stringify(gameState));

  gameState.push({name: value});  // Append the value
  
  fs.writeFileSync('Game State.json', JSON.stringify(gameState), 'utf8');  // Write it back
  console.log('Game state stored.');
}

bot.login(token);
