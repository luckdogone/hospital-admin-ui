import { get, Result, post, put, deleteRequest } from "../base";

/**
 * 分页查询基础信息数据
 * @param query .
 * @returns .
 */
export function caseQueryPage<T>(query?: any): Promise<Result<T>> {
  return get("/core/case/query/page", query);
}
/**
 * 查询基础信息数据列表
 * @param query .
 * @returns .
 */
export function radiationQueryList<T>(query?: any): Promise<Result<T>> {
  return get("/core/radiation/query/list", query);
}
/**
 *  保存基础信息数据
 * @param data .
 * @returns  .
 */
export function radiationSave<T>(data?: T): Promise<Result<T>> {
  return post("/core/radiation/save", data);
}
/**
 * 根据ID更新基础信息数据
 * @param id 基础信息ID
 * @param data 需要更新的信息
 * @returns .
 */
export function radiationUpdate<T>(id: string, data?: T): Promise<Result<T>> {
  return put("/core/radiation/update", { id: id }, data);
}
/**
 * 删除基础信息数据
 * @param userIds .
 * @returns  .
 */
export function radiationDel<T>(userIds: string[]): Promise<Result<T>> {
  return deleteRequest(`/core/radiation/del`, {}, userIds);
}
