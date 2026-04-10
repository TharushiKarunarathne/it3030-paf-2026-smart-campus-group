import api from './axiosConfig'

export const getNotifications = () =>
  api.get('/notifications')

export const markAsRead = (id) =>
  api.patch(`/notifications/${id}/read`)

export const markAllAsRead = () =>
  api.patch('/notifications/read-all')

export const clearNotifications = () =>
  api.delete('/notifications/clear')