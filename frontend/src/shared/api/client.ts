import axios from 'axios'
import { useAuthStore } from '../auth/authStore'

// 모든 API 호출은 이 인스턴스를 사용한다. (토큰 첨부·에러 처리 일원화)
const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// TODO(김용현): 401 응답 시 로그아웃 또는 토큰 재발급 처리

export default client
