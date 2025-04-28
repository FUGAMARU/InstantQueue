import {
  $,
  component$,
  isServer,
  useContext,
  useSignal,
  useTask$,
  useVisibleTask$
} from "@builder.io/qwik"

import { spotifyAccountsApiFunctions, spotifyApiFunctions } from "@/api"
import LoadingView from "@/components/views/LoadingView"
import SelectorView from "@/components/views/SelectorView"
import TopView from "@/components/views/TopView"
import { WEB_STORAGE } from "@/constants"
import { TokenContext } from "@/token-context"
import { isValidString } from "@/utils"

import type { PropsOf } from "@builder.io/qwik"
import type { DocumentHead } from "@builder.io/qwik-city"

export default component$(() => {
  const accessToken = useContext(TokenContext)
  const playbackState = useSignal<PropsOf<typeof SelectorView>["playbackState"]>("unable")
  const view = useSignal<"loading" | "top" | "selector">("loading")

  /** 利用可能な再生デバイス数を取得し再生可能かどうかの状態をセットする */
  const getAvailableDeviceCountAndSetState = $(async (accessToken: string): Promise<void> => {
    const availableDeviceCount = await (
      await spotifyApiFunctions(accessToken)
    ).getAvailableDeviceCount()

    playbackState.value = availableDeviceCount > 0 ? "ready" : "unable"
  })

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
        await getAvailableDeviceCountAndSetState(accessToken.value)
      } catch {
        view.value = "top"
      }
    }

    window.addEventListener("focus", handleFocus)

    cleanup(() => {
      window.removeEventListener("focus", handleFocus)
    })
  })

  // アクセストークンが取得できてから再生可能かどうかを取得する
  useTask$(async ({ track }) => {
    track(() => accessToken.value)

    if (isServer) {
      return
    }

    await getAvailableDeviceCountAndSetState(accessToken.value)
  })

  switch (view.value) {
    case "top":
      return <TopView />
    case "selector":
      return <SelectorView accessToken={accessToken.value} playbackState={playbackState.value} />
    case "loading":
      return <LoadingView />
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
