import { get, Result, post, put, deleteRequest } from "../base";

/**
 * 分页查询角色
 * @param query .
 * @returns .
 */
export function followQueryPage<T>(query?: any): Promise<Result<T>> {
  return get("/core/follow/query/page", query);
}

export function followQueryPending<T>(query?: any): Promise<Result<T>> {
  return get("/core/follow/query/pending", query);
}

export function followByPatientId<T>(patientId?: any): Promise<Result<T>> {
  return get("/core/follow/query/follow", patientId);
}

/**
 * 查询角色列表
 * @param query .
 * @returns .
 */
export function followQueryList<T>(query?: any): Promise<Result<T>> {
  return get("/core/follow/query/list", query);
}

/**
 *  保存角色
 * @param data .
 * @returns  .
 */
export function followSave<T>(data?: T): Promise<Result<T>> {
  return post("/core/follow/save", data);
}

/**
 * 根据ID更新角色
 * @param id 角色ID
 * @param data 需要更新的信息
 * @returns .
 */
export function followUpdate<T>(id: string, data?: T): Promise<Result<T>> {
  return put("/core/follow/update", { id: id }, data);
}

/**
 * 删除
 * @param id .
 * @returns .
 */
export function del<T>(id: any): Promise<Result<T>> {
  return deleteRequest(`/core/follow/del`, {}, id);
}
