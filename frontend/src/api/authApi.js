import api from './axiosConfig'

export const googleLogin = (googleCredential) =>
  api.post('/auth/google', { credential: googleCredential })

export const loginWithPassword = (email, password) =>
  api.post('/auth/login', { email, password })

export const getMe = () =>
  api.get('/users/me')

export const getAllUsers = (params) =>
  api.get('/users', { params })

export const updateUserRole = (userId, role) =>
  api.put(`/users/${userId}/role`, { role })