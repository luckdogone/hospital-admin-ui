import { get, Result, post, put, deleteRequest } from "../base";

/**
 * 分页查询基础信息数据
 * @param query .
 * @returns .
 */
export function adjuvantQueryPage<T>(query?: any): Promise<Result<T>> {
  return get("/core/adjuvant/query/page", query);
}
/**
 * 查询基础信息数据列表
 * @param query .
 * @returns .
 */
export function adjuvantQueryList<T>(query?: any): Promise<Result<T>> {
  return get("/core/adjuvant/query/list", query);
}
/**
 *  保存基础信息数据
 * @param data .
 * @returns  .
 */
export function adjuvantSave<T>(data?: T): Promise<Result<T>> {
  return post("/core/adjuvant/save", data);
}
/**
 * 根据ID更新基础信息数据
 * @param id 基础信息ID
 * @param data 需要更新的信息
 * @returns .
 */
export function adjuvantUpdate<T>(id: string, data?: T): Promise<Result<T>> {
  return put("/core/adjuvant/update", { id: id }, data);
}
/**
 * 删除基础信息数据
 * @param userIds .
 * @returns  .
 */
export function adjuvantDel<T>(userIds: string[]): Promise<Result<T>> {
  return deleteRequest(`/core/adjuvant/del`, {}, userIds);
}
