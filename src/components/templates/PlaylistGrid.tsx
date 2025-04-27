import { component$ } from "@builder.io/qwik"

import PlaylistCard from "@/components/parts/PlaylistCard"
import styles from "@/components/templates/PlaylistGrid.module.css"

import type { Playlist, SelectedPlaylistsState } from "@/types"
import type { QRL, useStore } from "@builder.io/qwik"

/** Props */
type Props = {
  /** プレイリスト一覧 */
  playlists: Array<Playlist>
  /** プレイリストの選択状態一覧 */
  selectedPlaylistsStateStore: ReturnType<typeof useStore<SelectedPlaylistsState>>
  /** プレイリストカードを押下した時の処理 */
  onPlaylistCardClick$: QRL<(playlistId: string) => void>
}

export default component$(
  ({
    playlists,
    selectedPlaylistsStateStore,
    onPlaylistCardClick$: handlePlaylistCardClick$
  }: Props) => {
    return (
      <div class={styles.artworkGrid}>
        {playlists.map(playlist => (
          <PlaylistCard
            key={playlist.playlistId}
            isSelected={
              selectedPlaylistsStateStore.find(
                selectedPlaylist => selectedPlaylist.playlistId === playlist.playlistId
              )?.isChecked
            }
            onClick$={() => handlePlaylistCardClick$(playlist.playlistId)}
            {...playlist}
          />
        ))}
      </div>
    )
  }
)
