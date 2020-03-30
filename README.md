# COVID19-Bot
>COVID19 Bot a.k.a Corona-chan made with JavaScript powered by Node.JS

[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![HitCount](http://hits.dwyl.io/Tatatofly/COVID19-Bot.svg)](http://hits.dwyl.io/Tatatofly/COVID19-Bot)

COVID19 Bot a.k.a Corona-chan made with JavaScript powered by Node.JS

Live testit ja tuki: [https://discord.gg/pGbbcgV](https://discord.gg/pGbbcgV)

![COVID19-BOT](https://files.tatu.moe/covidbot-github.png)

#### Komennot
###### Tiedot
- !help : Näyttää tämän viestin
- !nyt : Koko Suomen nykytilanne jaettuna sairaanhoitopiirien mukaan
###### Data
- !s : Sairastuneet sairaanhoitopiirien mukaan
- !k : Kuolleet sairaanhoitopiirien mukaan
- !p : Parantuneet sairaanhoitopiirien mukaan
###### Rajattu data - korvaa *tuntia* numerolla
- !s *tuntia* : Rajattuna tunneilla nykyhetkestä
- !k *tuntia* : Rajattuna tunneilla nykyhetkestä
- !p *tuntia* : Rajattuna tunneilla nykyhetkestä
###### Koosteet
- !kooste : Tilaa kanavalle 24h muutokset päivittäisessä koosteessa
- !pkooste : Peruuttaa kanavan koosteen tilauksen

#### config.js
```
config.discordToken = 'OMA DISCORD BOT TOKEN'
config.prefix = '!' // Komentojen etuliite 
config.apiCooldown = 10 // Aika minuuteissa minkä välein kutsutaan APIa ja tarkistetaan tilatut kanavat
```

#### Asenna paketit
```
npm install
```

#### Käynnistä botti
```
npm start
```

## Tuki

Reach out to me at one of the following places!

- Nettisivut <a href="https://tatu.moe" target="_blank">`Tatu.Moe`</a>
- Twitter <a href="https://twitter.com/TatuFin" target="_blank">`@TatuFin`</a>
- Instagram <a href="https://www.instagram.com/tatu.moe/" target="_blank">`@Tatu.Moe`</a>
- LinkedIn <a href="https://www.linkedin.com/in/tatatofly/" target="_blank">`Tatatofly`</a>

---

## Lisenssi
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
- Copyright 2020 © <a href="https://tatu.moe" target="_blank">Tatu Toikkanen</a>.