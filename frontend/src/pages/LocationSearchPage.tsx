import { useSearchParams } from 'react-router'
import LocationSearch from '../features/condition/components/LocationSearch'
import AppHeader from '../shared/components/AppHeader'

/** CON-02 위치 설정. /condition/location?type=origin|destination */
export default function LocationSearchPage() {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') === 'destination' ? 'destination' : 'origin'

  return (
    <>
      <AppHeader title={type === 'origin' ? '출발지 설정' : '도착지 설정'} />
      <LocationSearch type={type} />
    </>
  )
}
