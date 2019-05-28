const request = require('request-promise')
const Telegraf = require('telegraf')
const fs = require('fs')
const moment = require('moment')

const programEndpoint = 'http://116.203.29.2:3000/listProgramm'
const botToken = '164576224:AAHwKeGaHhDCoMrC7cUpTeoXtJmNIHeOrZ0'
const fileExport = './export'

if (!fs.existsSync(fileExport)) {
  fs.mkdirSync(fileExport);
}

function treffpunkt(res) {
  if(res.treffpunkt === "" && res.treffpunkt === "") return '';
  else if(res.treffpunkt !== "") return `(${res.treffpunkt})`;
  else if(res.ort !== "") return `(${res.ort})`;
}

function addZeroAndStuff(x) {
  if(x.toString().length === 2) return x
  else if(x.toString().length === 1) return `0${x}`
  else if(x.toString().length === 0) return `00`
}

function requestFiles() {
  return request({uri: programEndpoint})
  .then(res => JSON.parse(res))
  .then(res => [
    res.filter(res => res.day === 1),
    res.filter(res => res.day === 2),
    res.filter(res => res.day === 3),
    res.filter(res => res.day === 4)
  ])
  .then((res) => {
    return res.map((value) => {
      return value.reduce((prev, cur) => {
        if(cur.progr_liste === 0) return prev;
        
        prev += `${addZeroAndStuff(cur.von_hh)}:${addZeroAndStuff(cur.von_mm)} - ${addZeroAndStuff(cur.bis_hh)}:${addZeroAndStuff(cur.bis_mm)}\t`
  
        if(cur.progr_liste === 2) prev += 'X';
        prev += `\t${cur.programmname} ${treffpunkt(cur)}\n`
        return prev
      }, '')
    })
  })
  .then(res => {
    let files = []
    res.forEach((day, i) => {
      let fileName = `${fileExport}/day${i+1}.txt`
      fs.writeFileSync(fileName, day)
      files.push(fileName)
    });
    return files
  })
}




const bot = new Telegraf(botToken)
bot.start((ctx) => ctx.reply('Wilkommen! 👋\n/program für das program'))
bot.help((ctx) => ctx.reply('/program für das program 💾'))
bot.command('/program', async (ctx) => {
  console.log(`/program von ${ctx.from.username}`)
  requestFiles()
  .then(files => {
    return ctx.replyWithDocument({source: files[0]})
    .then(()=>ctx.replyWithDocument({source: files[1]}))
    .then(()=>ctx.replyWithDocument({source: files[2]}))
    .then(()=>ctx.replyWithDocument({source: files[3]}))
    .then(()=>ctx.reply(`Stand: ${moment().format('DD.MM.YY HH:mm')}`))
  })
  .catch(err => {
    console.log(err)
    ctx.reply('😞 Es ist etwas schief gelaufen!\nVersuche es noch ein paar mal. @swiatek´s Endpunkt ist nicht die Beste!\nWenn es nach mindestens 3 Anfragen nicht funktionieren sollte frag @supermomme mal.')
  })
  
})

bot.launch()
