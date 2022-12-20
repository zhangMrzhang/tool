/*
 * @Description:
 * @LastEditTime: 2022-11-30 16:26:43
 * @LastEditors: liqun 13212226759@163.com
 */
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosPromise,
  AxiosResponse
} from 'axios'
import { ElMessage } from 'element-plus'

const enum ContentType {
  form = 'application/x-www-form-urlencoded',
  json = 'application/json; charset=utf-8',
  multipart = 'multipart/form-data'
}

/**
 * 将对象转为 formdate 格式
 * @param {*} obj 传入纯对象
 */
const tansObjToFormdate = (
  obj: { [key: number | string]: any } | FormData
): FormData => {
  let fdInstance: FormData
  if (!(obj instanceof FormData)) {
    fdInstance = new FormData()
    for (let [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        for (let i of value) {
          fdInstance.append(key, i)
        }
      } else {
        fdInstance.append(key, value)
      }
    }
  } else {
    fdInstance = obj
  }
  return fdInstance
}

const delay = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const constants = {
  maxRetry: 2,
  initialRetryInterval: 5000
}

const isTransient = (err: AxiosError) => {
  console.log(err)
  if (err.code == 'ECONNABORTED' && err.message.indexOf('timeout') != -1)
    return true // 超时
  if (err && err.response) {
    // const { response } = err
    // if (
    //   response.status === 429 &&
    //   response.data &&
    //   response.data.error &&
    //   response.data.error.code === '1014'
    // ) {
    //   return false
    // }
    return [408, 429, 444, 500, 503, 504].includes(err.response.status)
  }
  return false
}

const sendRequestWithAutoRetry = async <T>(
  request: () => AxiosPromise<T>,
  maxRetry = constants.maxRetry
) => {
  let currentRetry = 0
  while (currentRetry <= maxRetry) {
    try {
      return await request()
    } catch (err) {
      currentRetry++
      if (currentRetry > maxRetry || !isTransient(err as AxiosError)) {
        ElMessage.error({
          message: (err as any).response.status + '' + (err as any).message
        })
        throw err
      }

      await delay(currentRetry === 2 ? constants.initialRetryInterval : 30000)
    }
  }
}

const request = axios.create({
  timeout: 10 * 60 * 1000,
  headers: { 'Content-Type': ContentType.form }
})

request.interceptors.request.use(
  (config) => {
    // const token = ''
    // if(token) {
    //   config.headers.token = token
    // }
    return config
  },
  (err) => {
    Promise.reject(err)
  }
)

request.interceptors.response.use((response) => {
  // console.log(response)
  if (response.status !== 200) {
    ElMessage.error({
      message: response.data
    })
  }
  return response
})

export default {
  get<T = any>(
    url: string,
    {
      config,
      maxRetry
    }: { config?: AxiosRequestConfig; maxRetry?: number } = {}
  ) {
    return sendRequestWithAutoRetry(() => request.get<T>(url, config), maxRetry)
  },
  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    { maxRetry }: { maxRetry?: number } = {}
  ) {
    return sendRequestWithAutoRetry(
      () => request.post<T>(url, data, config),
      maxRetry
    )
  }
}

export { delay, tansObjToFormdate, ContentType }
