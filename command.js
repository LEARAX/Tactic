const Discord = require('discord.js');
const bot = new Discord.Client();

var config = require('config.json')('./secrets.json');
const token = config.token;

const games = ['Frozen Syncord', 'Tic-Tac-Toe'];

bot.on('ready', () => {
  console.log('╦═╗┌─┐┌─┐┌┬┐┬ ┬┬\n╠╦╝├┤ ├─┤ ││└┬┘│\n╩╚═└─┘┴ ┴─┴┘ ┴ o');
});

bot.on('message', message => {
  if (message.author.bot == false) {
    console.log('Message detected.');
    console.log('Time: ' + Date());
    console.log('From: ' + message.author.username);
    console.log('Message: ' + message.content);
    console.log('Length: ' + message.content.length);
    if (launchSettingsInput != true) {
      if (message.content.charAt(0) + message.content.charAt(1) == '*$') {
        console.log('Command detected.');
        var command = '';

        for(i = 2; i < message.content.length; i++) {
          var command = command + message.content.charAt(i);
        };

        console.log('Command: ' + command);
        var dividedCommand = command.split(' ');
        console.log('Divided Command: ' + dividedCommand);

        if (command == 'ls') {
          console.log('\'ls\' command detected.');
          var gameList = '';
          for(i = 0; i < games.length; i++) {
            var gameList = gameList + '[' + i + ']  ' + games[i] + '\n';
          }
          console.log('Game List: ' + gameList);
          message.channel.send(gameList,{code: true, split: true});
        }else if (dividedCommand[0] == 'run') {
          console.log('\'run\' command detected.');
          var gameID = parseInt(dividedCommand[1]);
          console.log('Game ID: ' + gameID)
          if (games[gameID] == 'Frozen Syncord') {
            console.log('Frozen Syncord Initiated.');
            var Player1 = message.author.username;
            console.log('Player 1: ' + Player1);
            message.channel.send('**WELCOME TO:**');
            message.channel.send(' _____                        _____                       _ \n|   __|___ ___ ___ ___ ___   |   __|_ _ ___ ___ ___ ___ _| |\n|   __|  _| . |- _| -_|   |  |__   | | |   |  _| . |  _| . |\n|__|  |_| |___|___|___|_|_|  |_____|_  |_|_|___|___|_| |___|\n                                   |___|                    ',{code: true});
            message.channel.send('ENTER LAUNCH SETTINGS');
            var launchSettingsInput = true;
          }
          var launchSettings = message.content;
          console.log('Raw launch settings: ' + launchSettings);
          if (launchSettings.charAt(0) + launchSettings.charAt(launchSettings.length - 1) != '{}') {
            message.reply('Launch settings invalid!');
            console.log('Aborting...')
            var launchSettingsInput = false
          } else {
            var launchSettings = JSON.parse(launchSettings);
            console.log('Parsed launch settings: ' + launchSettings);
            message.reply('Starting game setup...');
          }


          //message.channel.send('Player 1 -- Player 2 \n.............................................................\n.............................................................\n.............................................................\n.............................................................\n.............................................................\n.............................................................\n.............................................................\n.............................................................\n.............................................................\n.............................................................\n',{code: true,split: true})
        }else if (games[gameID] == 'Tic-Tac-Toe') {
          console.log('Tic-Tac-Toe Initiated.');
          var Player1 = message.author.username;
          console.log('Player 1: ' + Player1);
          var Tiles = [' ', ' ',' ',' ',' ',' ',' ',' ',' '];
          message.channel.send('Tic-Tac-Toe Initiated!');
          message.reply('Who is player 2?');
          message.channel.startTyping();
          console.log(message)
          message.channel.stopTyping();
          console.log('Player 2: ' + user)
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

bot.login(token);
