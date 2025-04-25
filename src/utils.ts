/**
 * 存在チェック用関数
 *
 * @param value - チェック対象の値
 * @returns チェック結果
 */
export const isDefined = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null
