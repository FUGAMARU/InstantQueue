import { component$ } from "@builder.io/qwik"

import styles from "@/components/views/LoadingView.module.css"

export default component$(() => {
  return (
    <div class={styles.loadingView}>
      <div class={styles.spinner} />
    </div>
  )
})
