import { get, Result, post, put, deleteRequest } from "../base";

/**
 * 分页查询基础信息数据
 * @param query .
 * @returns .
 */
export function patientAllInfoQueryPage<T>(query?: any): Promise<Result<T>> {
  return post("/core/patient/query/search", query);
}

/**
 * 分页查询基础信息数据
 * @param query .
 * @returns .
 */
export function patientQueryPage<T>(query?: any): Promise<Result<T>> {
  return get("/core/patient/query/page", query);
}
/**
 * 查询基础信息数据列表
 * @param query .
 * @returns .
 */
export function patientQueryList<T>(query?: any): Promise<Result<T>> {
  return get("/core/patient/query/list", query);
}
/**
 *  保存基础信息数据
 * @param data .
 * @returns  .
 */
export function patientSave<T>(data?: T): Promise<Result<T>> {
  return post("/core/patient/save", data);
}
/**
 * 根据ID更新基础信息数据
 * @param id 基础信息ID
 * @param data 需要更新的信息
 * @returns .
 */
export function patientUpdate<T>(id: string, data?: T): Promise<Result<T>> {
  return put("/core/patient/update", { id: id }, data);
}
/**
 * 删除基础信息数据
 * @param userIds .
 * @returns  .
 */
export function patientDel<T>(userIds: string[]): Promise<Result<T>> {
  return deleteRequest(`/core/patient/del`, {}, userIds);
}
