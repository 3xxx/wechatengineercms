const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatTime2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

const formatTime3 = date => {
  const year = date.getFullYear() + 1
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

const formatYear = date => {
  const year = date.getFullYear()
  // const month = date.getMonth() + 1
  // const day = date.getDate()
  return [year].map(formatNumber).join('')
}
const formatMonth = date => {
  const month = date.getMonth()+1
  return [month].map(formatNumber).join('')
}
const formatDay = date => {
  const day = date.getDate()
  return [day].map(formatNumber).join('')
}
// const formatNumber = n => {
//   n = n.toString()
//   return n[1] ? n : '0' + n
// }

//日期的加减
const addDay = data => {
  //下面的不是时间戳，是时间戳*1000
  var timestamp = Date.parse(new Date());
  var newTimestamp = timestamp + data * 24 * 60 * 60 * 1000;
  var date = new Date(newTimestamp);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return [year, month, day].map(formatNumber).join('-');
}

module.exports = {
  formatTime: formatTime,
  formatTime2: formatTime2,
  formatTime3: formatTime3,
  formatYear: formatYear,
  formatMonth: formatMonth,
  formatDay: formatDay,
  addDay: addDay,
  // req: req,
  trim: trim,
  isError: isError,
  clearError: clearError,
  // getReq: getReq,
  // uploadFile: uploadFile
}

// 去前后空格
function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

// 提示错误信息
function isError(msg, that) {
  that.setData({
    showTopTips: true,
    errorMsg: msg
  })
}

// 清空错误信息
function clearError(that) {
  that.setData({
    showTopTips: false,
    errorMsg: ""
  })
}