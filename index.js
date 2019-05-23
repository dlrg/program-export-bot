const request = require('request-promise')
const fs = require('fs')

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

console.log(addZeroAndStuff('3'))

request('http://116.203.29.2:3000/listProgramm')
  .then(res => JSON.parse(res))
  .then(res => [
    res.filter(res => res.day === 0),
    res.filter(res => res.day === 1),
    res.filter(res => res.day === 2),
    res.filter(res => res.day === 3),
    res.filter(res => res.day === 4)
  ])
  .then((res) => {
    return res.map((value, index, array) => {
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
    fs.writeFileSync('export/day0.txt', res[0])
    fs.writeFileSync('export/day1.txt', res[1])
    fs.writeFileSync('export/day2.txt', res[2])
    fs.writeFileSync('export/day3.txt', res[3])
    fs.writeFileSync('export/day4.txt', res[4])
    return;
  })
  .then(res => console.log(res))
  .catch((err) => {
    throw err;
  });