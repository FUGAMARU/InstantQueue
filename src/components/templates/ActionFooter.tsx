import { component$ } from "@builder.io/qwik"

import Button from "@/components/parts/Button"
import styles from "@/components/templates/ActionFooter.module.css"

import type { QRL } from "@builder.io/qwik"

/** Props */
type Props = {
  /** Enqueueボタンを押下した時の処理 */
  onEnqueueButtonClick$: QRL<() => void>
  /** Resetボタンを押下した時の処理 */
  onResetButtonClick$: QRL<() => void>
}

export default component$(
  ({
    onEnqueueButtonClick$: handleEnqueueButtonClick$,
    onResetButtonClick$: handleResetButtonClick$
  }: Props) => {
    return (
      <div class={styles.actionFooter}>
        <div class={styles.overlay} />
        <div class={styles.buttons}>
          <div class={styles.button}>
            <Button color="blue" icon="add" label="Enqueue" onClick$={handleEnqueueButtonClick$} />
          </div>

          <div class={styles.button}>
            <Button color="red" icon="cross" label="Reset" onClick$={handleResetButtonClick$} />
          </div>
        </div>
      </div>
    )
  }
)
