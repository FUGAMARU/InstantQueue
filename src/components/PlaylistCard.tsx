import { component$ } from "@builder.io/qwik"

import styles from "@/components/PlaylistCard.module.css"

export default component$(() => {
  return (
    <div class={styles.playlistCard}>
      <div class={styles.contents}>
        <img
          alt="PLATINUM DISC"
          class={styles.artwork}
          height={138}
          src="https://images.iflyer.tv/1_450jfjt0aounajjhmdlvq.jpg"
          width={138}
        />
        <div class={styles.title}>PLATINUM DISC</div>
      </div>
    </div>
  )
})
