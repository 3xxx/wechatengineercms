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

// ȥǰ��ո�
function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

// ��ʾ������Ϣ
function isError(msg, that) {
  that.setData({
    showTopTips: true,
    errorMsg: msg
  })
}

// ��մ�����Ϣ
function clearError(that) {
  that.setData({
    showTopTips: false,
    errorMsg: ""
  })
}