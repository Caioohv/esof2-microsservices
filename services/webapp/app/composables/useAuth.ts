export function useAuth() {
  const accessToken = useCookie('access_token', { maxAge: 60 * 15, sameSite: 'lax' })
  const refreshToken = useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })

  const isLoggedIn = computed(() => !!accessToken.value)

  function setTokens(tokens: { access_token: string; refresh_token: string }) {
    accessToken.value = tokens.access_token
    refreshToken.value = tokens.refresh_token
  }

  function clearTokens() {
    accessToken.value = null
    refreshToken.value = null
  }

  return { accessToken, refreshToken, isLoggedIn, setTokens, clearTokens }
}
