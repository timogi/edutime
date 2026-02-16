import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetStaticPropsContext } from 'next/types'
import { Center, Loader } from '@mantine/core'

export default function AppIndex() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/app/time-tracking')
  }, [router])

  // Show inline loader while redirect happens — AppLayout keeps the shell visible
  return (
    <Center h='100%'>
      <Loader size='lg' />
    </Center>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
