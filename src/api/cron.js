import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/api/cron/list_all',
    method: 'post',
    data: params
  })
}

export function add(params) {
  return request({
    url: '/api/cron/add',
    method: 'post',
    data: params
  })
}

export function remove(params) {
  return request({
    url: '/api/cron/remove',
    method: 'post',
    data: params
  })
}

