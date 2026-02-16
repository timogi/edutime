import { Container, Group, Text, Button } from '@mantine/core'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { ActionToggle } from '@/components/Header/ActionToggle'
import classes from './Header.module.css'

export function HeaderSimple() {
  const t = useTranslations('Index')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkAuth()
  }, [])

  return (
    <Container className={classes.header} h={60}>
      <Link href={'/'}>
        <Group>
          <Image src='/logo.svg' width={28} height={28} alt={'logo'} />
          <Text>EduTime</Text>
        </Group>
      </Link>
      <Group gap='sm'>
        <ActionToggle />
        {isLoggedIn ? (
          <Link href={'/app'}>
            <Button variant='default'>{t('go_back_to_app')}</Button>
          </Link>
        ) : (
          <Link href={'/login'}>
            <Button variant='default'>{t('login')}</Button>
          </Link>
        )}
      </Group>
    </Container>
  )
}
