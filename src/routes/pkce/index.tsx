import { component$, useContext, useVisibleTask$ } from "@builder.io/qwik"
import { useNavigate } from "@builder.io/qwik-city"

import { spotifyApi } from "@/axios"
import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY,
  SPOTIFY_PKCE_REDIRECT_URI,
  SPOTIFY_REFRESH_TOKEN_LOCAL_STORAGE_KEY
} from "@/constants"
import { TokenContext } from "@/token-context"
import { isDefined } from "@/utils"

export default component$(() => {
  const accessToken = useContext(TokenContext)
  const navigate = useNavigate()

  /**
   * routeActionを使ってサーバーサイドで処理する実装を試したが、クエリパラメーターがうまく取得できなかったのでクライアントサイドで処理
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // クエリパラメーターのcodeを取得
    const url = new URL(location.href)
    const code = url.searchParams.get("code")
    const codeVerifier = sessionStorage.getItem(SPOTIFY_PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY)

    if (!isDefined(code) || !isDefined(codeVerifier)) {
      navigate("/")
      return
    }

    const { data } = await spotifyApi.post(
      "/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        code_verifier: codeVerifier,
        client_id: SPOTIFY_CLIENT_ID,
        redirect_uri: SPOTIFY_PKCE_REDIRECT_URI // 使用はされないがcodeの取得時と完全に一致する必要がある
      })
    )

    accessToken.value = data.access_token
    sessionStorage.removeItem(SPOTIFY_PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY)
    localStorage.setItem(SPOTIFY_REFRESH_TOKEN_LOCAL_STORAGE_KEY, data.refresh_token)
    navigate("/")
  })

  return null
})
