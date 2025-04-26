import { component$ } from "@builder.io/qwik"

import styles from "@/components/views/TopView.module.css"

export default component$(() => {
  return (
    <div class={styles.topView}>
      <div class={styles.main}>
        <div class={styles.upper}>
          <img
            alt="InstantQueue Logo"
            height={80}
            src="https://placehold.jp/80x80.png"
            width={80}
          />
          <h1 class={styles.title}>InstantQueue</h1>
          <span class={styles.description}>Mashup Multiple Playlists, One Perfect Queue.</span>
        </div>
      </div>
    </div>
  )
})
