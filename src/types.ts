/**
 * @file 型定義
 */

/** プレイリスト */
export type Playlist = {
  /** ID */
  playlistId: string
  /** プレイリスト名 */
  name: string
  /** サムネイル */
  thumbnail: string
  /** テーマカラー */
  themeColor: string
}

/** プレイリストの選択状態一覧を管理するStoreの型 */
export type SelectedPlaylistsState = Array<
  Pick<Playlist, "playlistId"> & {
    /** 選択されているかどうか */
    isChecked: boolean
  }
>
