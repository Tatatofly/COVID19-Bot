const Discord = require('discord.js')
const config = require('./config')

// Start Discord client & Login
const client = new Discord.Client();
client.login(config.discordToken);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  client.user.setActivity(`COVID-19 - ${config.prefix}help`, { type: 'WATCHING' })
});

client.on('message', msg => {
  if (msg.content === `${config.prefix}help`) {
    msg.channel.send(createHelpMessage())
  }
});


// Functions

function createHelpMessage() {
  const helpMessage = {
    "embed": {
      "title": "COVID19 Bot a.k.a Corona-chan",
      "description": "List of available commands: ",
      "url": "https://github.com/Tatatofly/COVID19-Bot",
      "color": 16254760,
      "thumbnail": {
        "url": "https://cdn.discordapp.com/app-icons/693855966734712942/4cb8be178f68f0b9476d16b5765cbcda.png?size=256"
      },
      "author": {
        "name": "Tatatofly#0854",
        "url": "https://tatu.moe",
        "icon_url": "http://files.tatu.moe/toplel.jpg"
      },
      "footer": {
        "icon_url": "https://cdn.discordapp.com/app-icons/693855966734712942/4cb8be178f68f0b9476d16b5765cbcda.png?size=256",
        "text": "Source in Github"
      },
      "timestamp": new Date(),
      "fields": [
        {
          "name": `${config.prefix}help`,
          "value": "Displays this message"
        }
      ]
    }
  }

  return helpMessage
}