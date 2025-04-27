import { component$ } from "@builder.io/qwik"

import PlaylistCard from "@/components/parts/PlaylistCard"
import styles from "@/components/templates/PlaylistGrid.module.css"

import type { PropsOf } from "@builder.io/qwik"

/** Props */
type Props = {
  /** プレイリスト一覧 */
  playlists: Array<PropsOf<typeof PlaylistCard>>
}

export default component$(({ playlists }: Props) => {
  return (
    <div class={styles.artworkGrid}>
      {playlists.map(playlist => (
        <PlaylistCard key={playlist.playlistId} {...playlist} />
      ))}
    </div>
  )
})
