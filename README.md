# COVID19-Bot
>COVID19 Bot a.k.a Corona-chan made with JavaScript powered by Node.JS

>Verified by Discord

[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

Live testit ja tuki: [https://discord.gg/pGbbcgV](https://discord.gg/pGbbcgV)

![COVID19-BOT](https://files.tatu.moe/covidbot-github.png)

---



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

---



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


---

## Data

Data tulee HS:n rajapinnasta avoimena datana. ks. [https://github.com/HS-Datadesk/koronavirus-avoindata](https://github.com/HS-Datadesk/koronavirus-avoindata)

---

## Lisenssi
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
- Copyright 2020 © Tatatofly.
