import request from '../axios'
// 图片的 file文件转 url
const imgFileToUrl = (files) => {
  const resList = []
  if (window.FileReader) {
    for (let file of files) {
      resList.push(
        new Promise((resolve) => {
          let reader = new FileReader()
          reader.readAsDataURL(file)
          reader.addEventListener(
            'load',
            function () {
              // console.log('reader.result', reader.result, file)
              resolve({
                src: reader.result,
                name: file.name
              })
            },
            false
          )
        })
      )
    }
  } else {
    alert('Not supported by your browser!')
  }
  return resList
}

// 图片 url 转 file文件
const imgUrlToFile = (urlList) => {
  return urlList.map((imgUrl) => {
    return new Promise((resolve) => {
      request
        .get(imgUrl, {
          config: {
            responseType: 'blob'
          },
          maxRetry: 2
        })
        .then((res) => {
          if (res) {
            const imgName = imgUrl.split('/').at(-1)
            let file = new File([res], imgName, { type: res.type })
            // console.log(file)
            resolve(file)
          } else {
            Message.error('upload_file接口取得的图片url转file失败 ' + imgUrl)
          }
        })
    })
  })
}

const debounce = (fn, delay = 300) => {
  let timer

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(this, ...args)
      timer = null
    }, delay)
  }
}
