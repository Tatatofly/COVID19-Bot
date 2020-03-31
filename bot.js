const Discord = require('discord.js')
const fetch = require('node-fetch')
const schedule = require('node-schedule')
const fs = require('fs')
const config = require('./config')

// Globals

let apiData = {}
let notifyData = {}
let notified = {}
let lastAPIUpdate = new Date()

// Start Discord client & Login
const client = new Discord.Client()
client.login(config.discordToken)

client.on('ready', () => {
  init()
  schedule.scheduleJob(`*/${config.apiCooldown} * * * *`, function(){
    getAPIData()
    scanNotifies()
  })
  schedule.scheduleJob('50 11 * * *', function(){
    removeNotified()
  })
  console.log(`Logged in as ${client.user.tag}!`)
  client.user.setActivity(`COVID-19 - ${config.prefix}help`, { type: 'WATCHING' })
})

client.on('message', msg => {
  if(msg.content.startsWith(config.prefix)) {
    switch(msg.content) {
      case `${config.prefix}help`:
        msg.channel.send(createHelpMessage())
        break
      case `${config.prefix}nyt`:
        msg.channel.send(createAllDataMessage())
        break
      case `${config.prefix}s`:
        msg.channel.send(createDataMessage('confirmed', 'Sairastuneet'))
        break
      case `${config.prefix}k`:
        msg.channel.send(createDataMessage('deaths', 'Kuolleet'))
        break
      case `${config.prefix}p`:
        msg.channel.send(createDataMessage('recovered', 'Parantuneet'))
        break
      case `${config.prefix}kooste`:
        msg.channel.send('Lähetän tälle kanavalle koosteen päivittäin')
        addToNotify(msg.channel.id, msg.author.tag)
        break
      case `${config.prefix}pkooste`:
        msg.channel.send('Kanava poistettu koostelistalta')
        delFromNotify(msg.channel.id)
        break
      default:
        if (msg.content.startsWith(`${config.prefix}s `)) {
          const hourArray = msg.content.split(" ", 2)
          const hours = hourArray[1]
          msg.channel.send(createDataMessage('confirmed', 'Sairastuneet', hours))
        } else if (msg.content.startsWith(`${config.prefix}k `)) {
          const hourArray = msg.content.split(" ", 2)
          const hours = hourArray[1]
          msg.channel.send(createDataMessage('deaths', 'Kuolleet', hours))
        } else if (msg.content.startsWith(`${config.prefix}p `)) {
          const hourArray = msg.content.split(" ", 2)
          const hours = hourArray[1]
          msg.channel.send(createDataMessage('recovered', 'Parantuneet', hours))
        }
        break
    }
  }
})


// Functions

async function init() {
  await loadNotifyFile()
  await getAPIData()
}

async function getAPIData() {
  try {
    const response = await fetch(config.apiURL)
    apiData = await response.json()
    lastAPIUpdate = new Date()
  } catch (error) {
    console.log(error)
  }
}

async function removeNotified() {
  try {
    fs.unlink(config.dailyNotifiedFile, function (error) {
      if (error) throw error
    })
  } catch(error) {
    console.log(error)
  }
  await loadNotifyFile()
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

function createDataMessage(dataName, dataTitle, hours) {
  if(typeof hours !== 'undefined' && hours && !isNaN(hours)) {
    const dataMessage = {
      "embed": {
        "title": `${dataTitle} Suomessa ${hours}h sisällä`,
        "description": `Yhteensä: ${apiData[dataName].filter(i => new Date(i.date) > new Date(new Date().getTime() - (hours * 60 * 60 * 1000))).length}`,
        "color": 16254760,
        "footer": {
          "icon_url": "https://cdn.discordapp.com/app-icons/693855966734712942/4cb8be178f68f0b9476d16b5765cbcda.png?size=256",
          "text": "Data haettu"
        },
        "timestamp": lastAPIUpdate,
        "fields": [
          config.healthCareDistricts.map(dist => {
            return { "name": dist, "value": apiData[dataName].filter(i => i.healthCareDistrict === dist).filter(i => new Date(i.date) > new Date(new Date().getTime() - (hours * 60 * 60 * 1000))).length, "inline": true}
          }), {
            "name": "Tuntematon",
            "value": apiData[dataName].filter(i => i.healthCareDistrict == null).filter(i => new Date(i.date) > new Date(new Date().getTime() - (hours * 60 * 60 * 1000))).length
          }
        ]
      }
    }
    return dataMessage
  }

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

function createAllDataMessage() {
  const dataMessage = {
    "embed": {
      "title": 'Tilanne Suomessa',
      "description": `Sairastunut: ${apiData.confirmed.length} - Kuollut: ${apiData.deaths.length} - Parantunut: ${apiData.recovered.length}`,
      "color": 16254760,
      "footer": {
        "icon_url": "https://cdn.discordapp.com/app-icons/693855966734712942/4cb8be178f68f0b9476d16b5765cbcda.png?size=256",
        "text": "Data haettu"
      },
      "timestamp": lastAPIUpdate,
      "fields": [
        config.healthCareDistricts.map(dist => {
          return { "name": dist, "value": `
          S: ${apiData.confirmed.filter(i => i.healthCareDistrict === dist).length}
          K: ${apiData.deaths.filter(i => i.healthCareDistrict === dist).length}
          P: ${apiData.recovered.filter(i => i.healthCareDistrict === dist).length}`, "inline": true}
        }), {
          "name": "Tuntematon",
          "value": `
          S: ${apiData.confirmed.filter(i => i.healthCareDistrict === null).length}
          K: ${apiData.deaths.filter(i => i.healthCareDistrict === null).length}
          P: ${apiData.recovered.filter(i => i.healthCareDistrict === null).length}`
        }
      ]
    }
  }

  return dataMessage
}

function createNotifyMessage() {
  const dataMessage = {
    "embed": {
      "title": 'Suomen 24h muutos',
      "description": `Sairastunut: ${apiData.confirmed.filter(i => new Date(i.date) > new Date(new Date().getTime() - (24 * 60 * 60 * 1000))).length} - Kuollut: ${apiData.deaths.filter(i => new Date(i.date) > new Date(new Date().getTime() - (24 * 60 * 60 * 1000))).length} - Parantunut: ${apiData.recovered.filter(i => new Date(i.date) > new Date(new Date().getTime() - (24 * 60 * 60 * 1000))).length}`,
      "color": 16254760,
      "footer": {
        "icon_url": "https://cdn.discordapp.com/app-icons/693855966734712942/4cb8be178f68f0b9476d16b5765cbcda.png?size=256",
        "text": "Data haettu"
      },
      "timestamp": lastAPIUpdate,
      "fields": [
        config.healthCareDistricts.map(dist => {
          return { "name": dist, "value": `
          S: ${apiData.confirmed.filter(i => i.healthCareDistrict === dist).filter(i => new Date(i.date) > new Date(new Date().getTime() - (24 * 60 * 60 * 1000))).length}
          K: ${apiData.deaths.filter(i => i.healthCareDistrict === dist).filter(i => new Date(i.date) > new Date(new Date().getTime() - (24 * 60 * 60 * 1000))).length}
          P: ${apiData.recovered.filter(i => i.healthCareDistrict === dist).filter(i => new Date(i.date) > new Date(new Date().getTime() - (24 * 60 * 60 * 1000))).length}`, "inline": true}
        }), {
          "name": "Tuntematon",
          "value": `
          S: ${apiData.confirmed.filter(i => i.healthCareDistrict === null).filter(i => new Date(i.date) > new Date(new Date().getTime() - (24 * 60 * 60 * 1000))).length}
          K: ${apiData.deaths.filter(i => i.healthCareDistrict === null).filter(i => new Date(i.date) > new Date(new Date().getTime() - (24 * 60 * 60 * 1000))).length}
          P: ${apiData.recovered.filter(i => i.healthCareDistrict === null).filter(i => new Date(i.date) > new Date(new Date().getTime() - (24 * 60 * 60 * 1000))).length}`
        }
      ]
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
          "name": `${config.prefix}nyt`,
          "value": "Koko Suomen nykytilanne jaettuna sairaanhoitopiirien mukaan",
          "inline": false
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
        },
        {
          "name": `${config.prefix}s *tuntia*`,
          "value": "Rajattuna tunneilla nykyhetkestä",
          "inline": true
        },
        {
          "name": `${config.prefix}k *tuntia*`,
          "value": "Rajattuna tunneilla nykyhetkestä",
          "inline": true
        },
        {
          "name": `${config.prefix}p *tuntia*`,
          "value": "Rajattuna tunneilla nykyhetkestä",
          "inline": true
        },
        {
          "name": `${config.prefix}kooste`,
          "value": "Tilaa kanavalle 24h muutokset päivittäisessä koosteessa",
          "inline": true
        },
        {
          "name": `${config.prefix}pkooste`,
          "value": "Peruuttaa kanavan koosteen tilauksen",
          "inline": true
        }
      ]
    }
  }

  return helpMessage
}