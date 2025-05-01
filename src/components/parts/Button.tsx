import { component$, isServer, useSignal, useTask$ } from "@builder.io/qwik"
import { createTimeline } from "animejs"
import clsx from "clsx"
import { capitalize } from "es-toolkit"

import Icon from "@/components/icons/Icon"
import styles from "@/components/parts/Button.module.css"
import LoadingSpinner from "@/components/parts/LoadingSpinner"
import { ELEMENTS } from "@/constants"
import { isDefined } from "@/utils"

import type { PropsOf, QRL } from "@builder.io/qwik"

/** Props */
type Props = {
  /** 色 */
  color: "blue" | "red" | "green"
  /** ラベル */
  label: string
  /** アイコン */
  iconName: PropsOf<typeof Icon>["name"]
  /** 押下した時の処理 */
  onClick$: QRL<() => void>
  /** ボタンをチェックマーク表示にするトリガー */
  buttonCheckMarkTrigger?: boolean | undefined
  /** 処理中かどうか */
  isProcessing?: boolean
}

export default component$(
  ({
    color,
    label,
    iconName,
    onClick$: handleClick$,
    buttonCheckMarkTrigger,
    isProcessing = false
  }: Props) => {
    const buttonContentsRef = useSignal<HTMLButtonElement>()
    const shouldDisplayCheckMark = useSignal(false)

    useTask$(({ track }) => {
      track(() => buttonCheckMarkTrigger)

      if (isServer || !isDefined(buttonCheckMarkTrigger)) {
        return
      }

      const contents = buttonContentsRef.value

      if (!isDefined(contents)) {
        return
      }

      const timeline = createTimeline({
        defaults: {
          duration: ELEMENTS.BUTTON_CONTENTS_FADE_ANIMATION_DURATION
        }
      })

      timeline
        .add(contents, {
          opacity: 0,
          /** アニメーションが完了した時の処理 */
          onComplete: () => {
            shouldDisplayCheckMark.value = true
          }
        })
        .add(contents, {
          opacity: 1
        })
        .add(contents, {
          opacity: 0,
          delay: ELEMENTS.BUTTON_CONTENTS_CHECK_MARK_DISPLAY_DURATION,
          /** アニメーションが完了した時の処理 */
          onComplete: () => {
            shouldDisplayCheckMark.value = false
          }
        })
        .add(contents, {
          opacity: 1
        })
    })

    return (
      <button
        class={clsx(styles.buttonTag, styles[capitalize(color)])}
        onClick$={handleClick$}
        type="button"
      >
        <div ref={buttonContentsRef} class={styles.contents}>
          {shouldDisplayCheckMark.value ? (
            <span class={styles.check}>
              <Icon name="check" />
            </span>
          ) : (
            <div class={styles.normal}>
              <span class={styles.label}>{label}</span>
              <span class={styles.icon}>
                {isProcessing ? <LoadingSpinner isThin /> : <Icon name={iconName} />}
              </span>
            </div>
          )}
        </div>
      </button>
    )
  }
)
