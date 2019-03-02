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

module.exports = {
  formatTime: formatTime,
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