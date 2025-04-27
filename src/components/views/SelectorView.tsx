import { component$ } from "@builder.io/qwik"

import styles from "@/components/views/SelectorView.module.css"

export default component$(() => {
  return (
    <div class={styles.selectorView}>
      <div class={styles.header}>
        <div class={styles.version}>
          <img
            alt="InstantQueue Logo"
            height={16}
            src="https://placehold.jp/16x16.png"
            width={16}
          />
          <span class={styles.text}>InstantQueue v1.0.0</span>
        </div>
        <h1 class={styles.title}>
          Welcome back,
          <br />
          FUGAMARU !
        </h1>
      </div>
    </div>
  )
})
