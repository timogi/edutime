import React, { useState } from 'react'
import { Button, Stack, Text, Group } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'
import { supabase } from '@/utils/supabase/client'

interface DeleteAccountProps {
  user_id: string
}

export const DeleteAccount: React.FC<DeleteAccountProps> = ({ user_id }) => {
  const t = useTranslations('Index')
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    try {
      // Get the current session to use for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session || !session.access_token) {
        setError('Unauthorized')
        setIsDeleting(false)
        return
      }

      // Call the API route to delete the account
      // Send the access token in the Authorization header for reliable authentication
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`, // Send access token directly
        },
        credentials: 'include', // Also send cookies as fallback
        body: JSON.stringify({ user_id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account')
      }

      // Sign out and redirect
      await supabase.auth.signOut()
      router.push('/delete/success')
    } catch (error: unknown) {
      console.error('Deletion error:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
      setIsDeleting(false)
    }
  }

  return (
    <Stack>
      <Text c='dimmed'>{t('delete-account-info')}</Text>
      {error && (
        <Text c='red' size='sm'>
          {error}
        </Text>
      )}
      <Group justify='flex-end' mt='md'>
        <Button variant='filled' color='red' onClick={handleDelete} loading={isDeleting}>
          {t('delete-account')}
        </Button>
      </Group>
    </Stack>
  )
}
export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
