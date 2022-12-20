import qs from 'qs'
import request, { tansObjToFormdate, ContentType } from './api'

interface SeniorSearchResponse<T = any> {
  data: T
  errCode: number
  errMsg: string
}

interface ProjectFilter {
  key: string
  more: number
  name: string
  source: null | string
  values: string[]
}

class Test {
  prefix = '/api'

  // 获取项目筛选数据
  async getProjectFilter({ proj_id }) {
    let params = tansObjToFormdate({
      id: 1
    })
    let resp = await request.post<SeniorSearchResponse<ProjectFilter[]>>(
      `${this.prefix}/outline/adv_search_filter?proj_id=${proj_id}`,
      params,
      {
        headers: {
          'Content-Type': ContentType.json
        }
      }
    )
    // console.log(resp)
    return resp
  }

  async getInitDate(id: number) {
    let params = {
      id
    }
    let resp = await request.get<SeniorSearchResponse<ProjectFilter>>(
      `${this.prefix}/outline/show?${qs.stringify(params)}`
    )
    // console.log(resp)
    return resp!.data
  }
}

export default new Test()
export type { SeniorSearchResponse, ProjectFilter }
