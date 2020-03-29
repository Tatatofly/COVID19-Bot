const Discord = require('discord.js')
const fetch = require('node-fetch')
const fs = require('fs')
const config = require('./config')

// Globals

let apiData = {}
let notifyData = {}
let notified = {}
let lastAPIUpdate = new Date()

// Start Discord client & Login
const client = new Discord.Client();
client.login(config.discordToken);

client.on('ready', () => {
  init()
  console.log(`Logged in as ${client.user.tag}!`)
  client.user.setActivity(`COVID-19 - ${config.prefix}help`, { type: 'WATCHING' })
});

client.on('message', msg => {
  if (msg.content === `${config.prefix}help` || msg.content === `${config.prefix}info`) {
    msg.channel.send(createHelpMessage())
  } else if (msg.content === `${config.prefix}s`) {
    msg.channel.send(createDataMessage('confirmed', 'Sairastuneet'))
  } else if (msg.content === `${config.prefix}k`) {
    msg.channel.send(createDataMessage('deaths', 'Kuolleet'))
  } else if (msg.content === `${config.prefix}p`) {
    msg.channel.send(createDataMessage('recovered', 'Parantuneet'))
  } else if (msg.content === `${config.prefix}kooste`) {
    msg.channel.send('Lähetän tälle kanavalle koosteen päivittäin')
    addToNotify(msg.channel.id, msg.author.tag)
  } else if (msg.content === `${config.prefix}pkooste`) {
    msg.channel.send('Kanava poistettu koostelistalta')
    delFromNotify(msg.channel.id)
  } else if (msg.content === `${config.prefix}debugscan`) {
    scanNotifies()
  }
});


// Functions

async function init() {
  await loadNotifyFile()
  await getAPIData()
}

async function getAPIData() {
  try {
    const response = await fetch(config.apiURL);
    apiData = await response.json();
    lastAPIUpdate = new Date()
  } catch (error) {
    console.log(error);
  }
}

function notifyChannel(channelID) {
  try {
    const notify = createNotifyMessage()
    const channel = client.channels.cache.get(channelID)
    channel.send(notify)
    notifiedToday(channelID)
  } catch(error) {
    console.log(error)
  }
}

function scanNotifies() {
  for(let i = 0; i < notifyData.channels.length; i++) {
    let isNotified = false
    for(let j = 0; j < notified.notifiedChans.length; j++) {
      if(notified.notifiedChans[j].channelId === notifyData.channels[i].channelId) {
        isNotified = true
      }
    }
    if(!isNotified) {
      notifyChannel(notifyData.channels[i].channelId)
    }
  }
}

async function loadNotifyFile() {
  return new Promise(resolve => {
    fs.readFile(config.dailyNotifyFile, 'utf8', function readFileCallback(error, data){
      if (error && error.code === 'ENOENT'){
          try {
            fs.writeFileSync(config.dailyNotifyFile, '{"channels":[]}')
            notifyData = JSON.parse('{"channels":[]}')
          } catch(error) {
            console.log(`Cannot create new ${config.dailyNotifyFile} file.`)
          }
      } else {
        notifyData = JSON.parse(data)
      }
    })
    fs.readFile(config.dailyNotifiedFile, 'utf8', function readFileCallback(error, data){
      if (error && error.code === 'ENOENT'){
          try {
            fs.writeFileSync(config.dailyNotifiedFile, '{"notifiedChans":[]}')
            notified = JSON.parse('{"notifiedChans":[]}')
          } catch(error) {
            console.log(`Cannot create new ${config.dailyNotifiedFile} file.`)
          }
      } else {
        notified = JSON.parse(data)
      }
    })
    resolve('Done')
  })
}

function notifiedToday(id) {
  const notifiedObj = {
    "channelId": id
  }
  notified.notifiedChans.push(notifiedObj)
  saveNotify(JSON.stringify(notified),config.dailyNotifiedFile)
}

function addToNotify(id, user) {
  const notifyObj = {
    "channelId": id,
    "user": user
  }
  let alreadyContains = false
  for(let i = 0; i < notifyData.channels.length; i++) {
    if(notifyData.channels[i].channelId === id) {
      alreadyContains = true
    }
  }
  if(!alreadyContains) {
    notifyData.channels.push(notifyObj)
    saveNotify(JSON.stringify(notifyData),config.dailyNotifyFile)
  }
}

function delFromNotify(id) {
  const notifyObj = notifyData.channels.filter(function(channel) {
    return channel.channelId !== id
  })
  notifyData.channels = notifyObj
  saveNotify(JSON.stringify(notifyData),config.dailyNotifyFile)
}

async function saveNotify(json, file) {
  try {
    fs.writeFile(file, json, function(error) {
      if(error) console.log('error: ', error)
    })
  } catch(error) {
    console.log(error)
  }
}

function createDataMessage(dataName, dataTitle) {
  const dataMessage = {
    "embed": {
      "title": `${dataTitle} Suomessa`,
      "description": `Yhteensä: ${apiData[dataName].length}`,
      "color": 16254760,
      "footer": {
        "icon_url": "https://cdn.discordapp.com/app-icons/693855966734712942/4cb8be178f68f0b9476d16b5765cbcda.png?size=256",
        "text": "Data haettu"
      },
      "timestamp": lastAPIUpdate,
      "fields": [
        config.healthCareDistricts.map(dist => {
          return { "name": dist, "value": apiData[dataName].filter(i => i.healthCareDistrict === dist).length, "inline": true}
        }), {
          "name": "Tuntematon",
          "value": apiData[dataName].filter(i => i.healthCareDistrict == null).length
        }
      ]
    }
  }

  return dataMessage
}

function createNotifyMessage() {
  const dataMessage = {
    "embed": {
      "title": 'Nykyhetki Suomessa',
      "description": `Sairastuneet: ${apiData.confirmed.length} - Kuolleet: ${apiData.deaths.length} - Parantuneet: ${apiData.recovered.length}`,
      "color": 16254760,
      "footer": {
        "icon_url": "https://cdn.discordapp.com/app-icons/693855966734712942/4cb8be178f68f0b9476d16b5765cbcda.png?size=256",
        "text": "Data haettu"
      },
      "timestamp": lastAPIUpdate
    }
  }

  return dataMessage
}

function createHelpMessage() {
  const helpMessage = {
    "embed": {
      "title": "COVID19 Bot a.k.a Corona-chan",
      "description": "Lista komennoista: ",
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
          "value": "Näyttää tämän viestin"
        },
        {
          "name": `${config.prefix}s`,
          "value": "Sairastuneet sairaanhoitopiirien mukaan",
          "inline": true
        },
        {
          "name": `${config.prefix}k`,
          "value": "Kuolleet sairaanhoitopiirien mukaan",
          "inline": true
        },
        {
          "name": `${config.prefix}p`,
          "value": "Parantuneet sairaanhoitopiirien mukaan",
          "inline": true
        }
      ]
    }
  }

  return helpMessage
}