export const selectAuthState = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => Boolean(state.auth.token && state.auth.user)
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error
