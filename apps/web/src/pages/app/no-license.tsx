import React from 'react'
import { GetStaticPropsContext } from 'next/types'
import { NoLicenseView } from '@/components/NoLicense/NoLicenseView'

export default function NoLicensePage() {
  // All auth guards, subscription checks, and redirects are handled by
  // the persistent AppLayout in _app.tsx — this page just renders content.
  return <NoLicenseView />
}

export async function getServerSideProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
