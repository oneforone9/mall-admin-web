import request from '@/utils/request'
export function fetchUsers(params) {
  return request({
    url:'/admin/list',
    method:'get',
    params:params
  })
}
export function fetchRoles(params) {
  return request({
    url:'/role/list',
    method:'get',
    params:params
  })
}
export function fetchPermissions(params) {
  return request({
    url:'/permission/treeList',
    method:'get',
    params:params
  })
}
export function fetchPermissonByRole(roleId) {
  return request({
    url:'/role/permission/'+roleId,
    method:'get'
  })
}
export function updatePermissionByRole(params) {
  return request({
    url:'/role/permission/update',
    method:'post',
    params:params
  })
}
export function fetchPermissonByUser(roleId) {
  return request({
    url:'/admin/permission/'+roleId,
    method:'get'
  })
}
export function updatePermissionByUser(params) {
  return request({
    url:'/admin/permission/update',
    method:'post',
    params:params
  })
}
export function createRole(data) {
  return request({
    url:'/role/create',
    method:'post',
    data:data
  })
}
export function updateRole(data) {
  return request({
    url:'/role/update/',
    method:'post',
    data:data
  })
}
export function deleteRole(params) {
  return request({
    url:'/role/delete',
    method:'post',
    params:params
  })
}
export function createAdmin(data) {
  return request({
    url:'/admin/register',
    method:'post',
    data:data
  })
}
export function updateAdmin(id,data) {
  return request({
    url:'/admin/update/'+id,
    method:'post',
    data:data
  })
}
export function deleteAdmin(id) {
  return request({
    url:'/role/delete'+id,
    method:'post'
  })
}
export function fetchRolesByAdmin(id) {
  return request({
    url:'/admin/role/'+id,
    method:'get',
  })
}
export function updateRolesByAdmin(params) {
  return request({
    url:'/admin/role/update',
    method:'post',
    params:params
  })
}

