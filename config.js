const config = {}

config.discordToken = 'YOUR_DISCORD_TOKEN'
config.prefix = '!'
config.apiCooldown = 10 // In minutes

config.dailyNotifyFile = 'dailyNotify.json'
config.dailyNotifiedFile = 'dailyNotified.json'

config.apiURL = 'https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData'

config.healthCareDistricts = ['HUS','Lappi','Länsi-Pohja','Pohjois-Pohjanmaa','Kainuu','Keski-Pohjanmaa','Pohjois-Savo','Pohjois-Karjala','Vaasa','Keski-Suomi','Etelä-Pohjanmaa','Satakunta','Pirkanmaa','Etelä-Savo','Itä-Savo','Etelä-Karjala','Päijät-Häme','Kanta-Häme','Kymenlaakso','Varsinais-Suomi','Ahvenanmaa']

module.exports = config