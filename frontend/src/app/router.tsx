import { createBrowserRouter } from 'react-router'
import Layout from '../shared/layout/Layout'
import HomePage from '../pages/HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      // { path: 'condition', element: <ConditionPage /> },      // 외출 조건 설정
      // { path: 'category', element: <CategoryPage /> },        // 카테고리 선택
      // { path: 'results', element: <ResultListPage /> },       // 추천 결과 목록
      // { path: 'results/:id', element: <ResultDetailPage /> }, // 추천 결과 상세
      // { path: 'login', element: <LoginPage /> },
      // { path: 'mypage', element: <MyPage /> },
    ],
  },
  // { path: '/admin', element: <AdminLayout />, children: [...] },
])
