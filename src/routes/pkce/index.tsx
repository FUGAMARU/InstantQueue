import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik"

import {
  SPOTIFY_API_ENDPOINT_TOKEN,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY,
  SPOTIFY_PKCE_REDIRECT_URI
} from "@/constants"
import { isDefined } from "@/utils"

export default component$(() => {
  const userName = useSignal("")

  /**
   * routeActionを使ってサーバーサイドで処理する実装を試したが、クエリパラメーターがうまく取得できなかったのでクライアントサイドで処理
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // クエリパラメーターのcodeを取得
    const url = new URL(window.location.href)
    const code = url.searchParams.get("code")
    const codeVerifier = sessionStorage.getItem(SPOTIFY_PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY)

    if (!isDefined(code) || !isDefined(codeVerifier)) {
      window.location.href = "/"
      return
    }

    const response = await fetch(SPOTIFY_API_ENDPOINT_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        code_verifier: codeVerifier,
        client_id: SPOTIFY_CLIENT_ID,
        redirect_uri: SPOTIFY_PKCE_REDIRECT_URI // 使用はされないがcodeの取得時と完全に一致する必要がある
      })
    })

    const json = await response.json()
    console.log(json)
  })

  return (
    <div>
      <h1>PKCE</h1>
      <p>PKCE flow for Spotify API</p>
      <h2>Your name is {userName}</h2>
    </div>
  )
})
