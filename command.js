const Discord = require('discord.js');
const bot = new Discord.Client();

const config = require('config.json')('./secrets.json');
const token = config.token;

const games = ['Frozen Syncord', 'Tic-Tac-Toe'];

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

    if (message.content.slice(0,1) == '*$') {
      console.log('Command detected.');
      const commandInput == message.content.slice(2);
      console.log('Command: ' + commandInput);
    }
  }
});

function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

bot.login(token);
