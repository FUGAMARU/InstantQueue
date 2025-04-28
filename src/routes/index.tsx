import { component$, useContext, useSignal, useVisibleTask$ } from "@builder.io/qwik"

import { spotifyAccountsApiFunctions } from "@/api"
import SelectorView from "@/components/views/SelectorView"
import TopView from "@/components/views/TopView"
import { WEB_STORAGE } from "@/constants"
import { TokenContext } from "@/token-context"
import { isValidString } from "@/utils"

import type { DocumentHead } from "@builder.io/qwik-city"

export default component$(() => {
  const accessToken = useContext(TokenContext)
  const view = useSignal<"blank" | "top" | "selector">("blank")

  // useTask + サーバーガードだとなぜか1度サインインしてページリロードするとまたトップ画面に戻ってしまうのでuseVisibleTaskを使用
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup }) => {
    const refreshToken = localStorage.getItem(WEB_STORAGE.REFRESH_TOKEN_LOCAL_STORAGE_KEY)

    const hasAccessToken = isValidString(accessToken.value)
    const hasRefreshToken = isValidString(refreshToken)

    /**
     * アクセストークンをリフレッシュして、新しいアクセストークンをセットする
     *
     * @param refreshToken - リフレッシュトークン
     */
    const refreshAndSetAccessToken = async (refreshToken: string): Promise<void> => {
      const spotifyAccountsApi = await spotifyAccountsApiFunctions()
      const accessTokenInfo = await spotifyAccountsApi.refreshAccessToken(refreshToken)
      accessToken.value = accessTokenInfo.accessToken
      localStorage.setItem(
        WEB_STORAGE.REFRESH_TOKEN_LOCAL_STORAGE_KEY,
        accessTokenInfo.refreshToken
      )
    }

    // if文で早期returnするとfocusのイベントハンドリングまで到達できないのでswitch文を使用
    switch (true) {
      case hasAccessToken: {
        view.value = "selector"
        break
      }

      case hasRefreshToken: {
        try {
          await refreshAndSetAccessToken(refreshToken)
          view.value = "selector"
        } catch {
          view.value = "top"
        }
        break
      }

      default: {
        view.value = "top"
        break
      }
    }

    /** フォーカスした時の処理 */
    const handleFocus = async (): Promise<void> => {
      const currentRefreshToken = localStorage.getItem(WEB_STORAGE.REFRESH_TOKEN_LOCAL_STORAGE_KEY)

      if (!hasRefreshToken || !isValidString(currentRefreshToken)) {
        return
      }

      try {
        await refreshAndSetAccessToken(currentRefreshToken)
      } catch {
        view.value = "top"
      }
    }

    window.addEventListener("focus", handleFocus)

    cleanup(() => {
      window.removeEventListener("focus", handleFocus)
    })
  })

  switch (view.value) {
    case "top":
      return <TopView />
    case "selector":
      return <SelectorView accessToken={accessToken.value} />
    case "blank":
      return null
  }
})

export const head: DocumentHead = {
  title: "InstantQueue",
  meta: [
    {
      name: "description",
      content: "Qwik site description"
    }
  ]
}
