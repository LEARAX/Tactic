# Tactic

Tactic is a bot which can play Tic-Tac-Toe in Discord Guild chats. It can run multiple matches side-by-side, but not within the same text channel. It also has a simple, non-perfect AI, for single-player matches.

Chess is currently WIP.


## Installation
First, execute ```npm install``` in Tactic's directory. Then, create a file called secrets.json and put a valid token inside.

Your secrets.json should look like:
```
{
  "token": "YOURTOKENHERE"
}
```
Change YOURTOKENHERE to a token from the [Discord developer site](https://discordapp.com/developers).

## Execution
To run Tactic, execute ```nodemon``` in its directory.
