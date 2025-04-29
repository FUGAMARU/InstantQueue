import { component$ } from "@builder.io/qwik"

import Button from "@/components/parts/Button"
import styles from "@/components/templates/ActionFooter.module.css"

import type { PropsOf } from "@builder.io/qwik"

/** ButtonコンポーネントのProps */
type ButtonProps = PropsOf<typeof Button>

/** Props */
type Props = {
  /** Enqueueボタンを押下した時の処理 */
  onEnqueueButtonClick$: ButtonProps["onClick$"]
  /** Resetボタンを押下した時の処理 */
  onResetButtonClick$: ButtonProps["onClick$"]
  /** Enqueueボタンのチェックマーク表示トリガー */
  enqueueButtonCheckMarkTrigger: ButtonProps["buttonCheckMarkTrigger"]
  /** Resetボタンのチェックマーク表示トリガー */
  resetButtonCheckMarkTrigger: ButtonProps["buttonCheckMarkTrigger"]
  /** Enqueueボタンを処理中表示にするかどうか */
  isEnqueueButtonProcessing: Required<ButtonProps>["isProcessing"]
  /** Resetボタンを処理中表示にするかどうか */
  isResetButtonProcessing: Required<ButtonProps>["isProcessing"]
}

export default component$(
  ({
    onEnqueueButtonClick$: handleEnqueueButtonClick$,
    onResetButtonClick$: handleResetButtonClick$,
    enqueueButtonCheckMarkTrigger,
    resetButtonCheckMarkTrigger,
    isEnqueueButtonProcessing,
    isResetButtonProcessing
  }: Props) => {
    return (
      <div class={styles.actionFooter}>
        <div class={styles.overlay} />
        <div class={styles.buttons}>
          <div class={styles.button}>
            <Button
              buttonCheckMarkTrigger={enqueueButtonCheckMarkTrigger}
              color="blue"
              iconName="add"
              isProcessing={isEnqueueButtonProcessing}
              label="Enqueue"
              onClick$={handleEnqueueButtonClick$}
            />
          </div>

          <div class={styles.button}>
            <Button
              buttonCheckMarkTrigger={resetButtonCheckMarkTrigger}
              color="red"
              iconName="cross"
              isProcessing={isResetButtonProcessing}
              label="Reset"
              onClick$={handleResetButtonClick$}
            />
          </div>
        </div>
      </div>
    )
  }
)
