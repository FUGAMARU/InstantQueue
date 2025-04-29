import { component$ } from "@builder.io/qwik"

import LoadingSpinner from "@/components/parts/LoadingSpinner"
import styles from "@/components/views/LoadingView.module.css"

export default component$(() => {
  return (
    <div class={styles.loadingView}>
      <div class={styles.spinner}>
        <LoadingSpinner />
      </div>
    </div>
  )
})
