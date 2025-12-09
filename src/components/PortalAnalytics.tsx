'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GoogleAnalytics, GTMNoScript } from './GoogleAnalytics'

interface PortalAnalyticsData {
  ga_measurement_id: string | null
  gtm_container_id: string | null
}

export function PortalAnalytics() {
  const [analytics, setAnalytics] = useState<PortalAnalyticsData | null>(null)

  useEffect(() => {
    async function loadPortalAnalytics() {
      const supabase = createClient()

      const { data } = await supabase
        .from('portals')
        .select('ga_measurement_id, gtm_container_id')
        .eq('is_active', true)
        .limit(1)
        .single()

      if (data) {
        setAnalytics(data)
      }
    }

    loadPortalAnalytics()
  }, [])

  if (!analytics) {
    return null
  }

  return (
    <>
      <GoogleAnalytics
        gaMeasurementId={analytics.ga_measurement_id}
        gtmContainerId={analytics.gtm_container_id}
      />
      <GTMNoScript gtmContainerId={analytics.gtm_container_id} />
    </>
  )
}
