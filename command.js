const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');

const config = require('config.json')('./secrets.json');
const token = config.token;

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
        url: 'https://github.com/The-Complex/Tactic',
        fields: [{
          name: 'COMMAND INVALID',
          value: 'Your command "' + commandInputSplit[0] + '" was unrecognized.'
        }],
      }
    })
  };
};
};
});

function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

bot.login(token);
