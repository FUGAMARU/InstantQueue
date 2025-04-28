/**
 * @file 共通関数
 */

/**
 * 存在チェック用関数
 *
 * @param value - チェック対象の値
 * @returns チェック結果
 */
export const isDefined = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null

/**
 * 有効な文字列かどうか
 *
 * @param value - チェック対象の値
 * @returns チェック結果
 */
export const isValidString = (value: string | undefined | null): value is string =>
  isDefined(value) && typeof value === "string" && value.trim().length > 0

/**
 * 有効な配列かどうか
 *
 * @param value - チェック対象の値
 * @returns チェック結果
 */
export const isValidArray = <T>(value: Array<T> | undefined | null): value is Array<T> =>
  isDefined(value) && value.length > 0
