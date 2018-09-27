import objectUtil from './object.util'

const formatNumber = (n) => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatTime = (date) => {
  return formatDate(date) + ' ' + [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ].map(formatNumber).join(':')
}

const formatDate = (date) => {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  ].map(formatNumber).join('-')
}

const $init = (page) => {
  page.$data = objectUtil.$copy(page.data, true)
}

const $digest = (page) => {
  let data = page.data
  let $data = page.$data
  let ready2set = {}

  for (let k in data) {
    if (!objectUtil.$isEqual(data[k], $data[k])) {
      ready2set[k] = data[k]
      $data[k] = objectUtil.$copy(data[k], true)
    }
  }

  if (Object.keys(ready2set).length) {
    page.setData(ready2set)
  }
}

module.exports = {
  formatDate,
  formatTime,
  $init,
  $digest
}
