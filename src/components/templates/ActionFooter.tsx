import { component$ } from "@builder.io/qwik"

import Button from "@/components/parts/Button"
import styles from "@/components/templates/ActionFooter.module.css"

export default component$(() => {
  return (
    <div class={styles.actionFooter}>
      <div class={styles.overlay} />
      <div class={styles.buttons}>
        <div class={styles.button}>
          <Button
            color="blue"
            icon="add"
            label="Enqueue"
            onClick$={() => {
              console.log("Enqueue")
            }}
          />
        </div>

        <div class={styles.button}>
          <Button
            color="red"
            icon="cross"
            label="Reset Queue"
            onClick$={() => {
              console.log("Reset Queue")
            }}
          />
        </div>
      </div>
    </div>
  )
})
