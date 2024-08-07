import { get, Result, post, put, deleteRequest } from "../base";

/**
 * 分页查询基础信息数据
 * @param query .
 * @returns .
 */
export function generalQueryPage<T>(query?: any): Promise<Result<T>> {
  return get("/core/general/query/page", query);
}
/**
 * 查询基础信息数据列表
 * @param query .
 * @returns .
 */
export function generalQueryList<T>(query?: any): Promise<Result<T>> {
  return get("/core/general/query/list", query);
}
/**
 *  保存基础信息数据
 * @param data .
 * @returns  .
 */
export function generalSave<T>(data?: T): Promise<Result<T>> {
  return post("/core/general/save", data);
}
/**
 * 根据ID更新基础信息数据
 * @param id 基础信息ID
 * @param data 需要更新的信息
 * @returns .
 */
export function generalUpdate<T>(id: string, data?: T): Promise<Result<T>> {
  return put("/core/general/update", { id: id }, data);
}
/**
 * 删除基础信息数据
 * @param userIds .
 * @returns  .
 */
export function generalDel<T>(userIds: string[]): Promise<Result<T>> {
  return deleteRequest(`/core/general/del`, {}, userIds);
}
