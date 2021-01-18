import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/api/cron/list',
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

export function start(params) {
  return request({
    url: '/api/cron/start',
    method: 'post',
    data: params
  })
}

export function stop(params) {
  return request({
    url: '/api/cron/stop',
    method: 'post',
    data: params
  })
}
