import axios from 'axios'

// 모든 API 호출은 이 인스턴스를 사용한다. (토큰 첨부·에러 처리 일원화)
const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 인증(JWT) 구현 후 토큰 저장 위치에 맞춰 조정한다.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default client
