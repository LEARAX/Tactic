const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const ce = require('embed-creator');

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
        message.channel.send(ce(
          '#0000ff',
          null, //{'name': 'Tactic', 'icon_url': null, 'url': 'https://github.com/The-Complex/Tactic'}, // Author
          'File System Explorer',  // Title
          '2 Files Found',  // Description
          [{'name': 'Frozen Syncord', 'value': 'A real-time tactics game'},  // Field 1
          {'name': 'Tic-Tac-Toe', 'value': 'A simple classic'}],  // Field 2
          null,  // Footer
          null,  // Image object
          false  // !Timestamps
        ));
        break;
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
