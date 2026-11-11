import { createBrowserRouter } from 'react-router'
import ConditionPage from '../pages/ConditionPage'
import CourseDetailPage from '../pages/CourseDetailPage'
import CourseMapPage from '../pages/CourseMapPage'
import HomePage from '../pages/HomePage'
import LocationSearchPage from '../pages/LocationSearchPage'
import LoginPage from '../pages/LoginPage'
import MyPage from '../pages/MyPage'
import NearbyPage from '../pages/NearbyPage'
import PlaceReplacePage from '../pages/PlaceReplacePage'
import ProfileEditPage from '../pages/ProfileEditPage'
import ResultPage from '../pages/ResultPage'
import SavedCourseDetailPage from '../pages/SavedCourseDetailPage'
import SavedCourseListPage from '../pages/SavedCourseListPage'
import SignupPage from '../pages/SignupPage'
import RequireAuth from '../shared/auth/RequireAuth'
import Layout from '../shared/layout/Layout'

// 화면 ID는 화면설계서 v1.0 기준
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // 홈
      { index: true, element: <HomePage /> }, //                                         HOM-01 홈 / 바로 추천
      { path: 'nearby', element: <NearbyPage /> }, //                                    HOM-02 주변 장소 탐색 (바텀시트)

      // 외출 조건
      { path: 'condition', element: <ConditionPage /> }, //                              CON-01 외출 조건 설정
      { path: 'condition/location', element: <LocationSearchPage /> }, //                CON-02 위치 설정 (?type=origin|destination)

      // 추천 결과 · 결과 상세
      { path: 'results', element: <ResultPage /> }, //                                   RES-01 추천 결과 목록
      { path: 'results/:courseId', element: <CourseDetailPage /> }, //                   DET-01 추천 결과 상세
      { path: 'results/:courseId/map', element: <CourseMapPage source="recommend" /> }, // DET-02 코스 지도 상세
      { path: 'results/:courseId/replace/:placeId', element: <PlaceReplacePage /> }, //  DET-03 장소 교체

      // 회원 · 마이페이지
      { path: 'mypage', element: <MyPage /> }, //                                        MY-01 마이페이지 (비회원은 로그인 안내)
      {
        element: <RequireAuth />, //                                                     회원 전용: 비로그인 시 AUT-01로 이동
        children: [
          { path: 'mypage/courses', element: <SavedCourseListPage /> }, //               MY-02 저장한 코스 목록
          { path: 'mypage/courses/:courseId', element: <SavedCourseDetailPage /> }, //   MY-03 저장한 코스 상세
          { path: 'mypage/courses/:courseId/map', element: <CourseMapPage source="saved" /> }, // DET-02 (MY-03에서 진입)
          { path: 'mypage/edit', element: <ProfileEditPage /> }, //                      MY-04 회원 정보 수정·탈퇴
        ],
      },
      { path: 'login', element: <LoginPage /> }, //                                      AUT-01 로그인
      { path: 'signup', element: <SignupPage /> }, //                                    AUT-02 회원가입
    ],
  },
  // { path: '/admin', element: <AdminLayout />, children: [...] },  // 관리자 (정종화)
])
