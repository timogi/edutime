import React, { useState } from 'react'
import { Modal, Stack, TextInput, Button, Alert } from '@mantine/core'
import { IconAlertCircle, IconInfoCircle, IconMail } from '@tabler/icons-react'
import { useWindowEvent } from '@mantine/hooks' // Import useWindowEvent from Mantine
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'
import { OrganizationMember } from '@/utils/supabase/organizations'

interface InviteModalProps {
  opened: boolean
  close: () => void
  inviteEmail: string
  setInviteEmail: (email: string) => void
  handleInvite: (comment: string) => void
  users: OrganizationMember[]
}

const InviteModal = ({
  opened,
  close,
  inviteEmail,
  setInviteEmail,
  handleInvite,
  users,
}: InviteModalProps) => {
  const t = useTranslations('Index')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [userExists, setUserExists] = useState<boolean>(false)
  const [comment, setComment] = useState<string>('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInviteClick = () => {
    if (validateEmail(inviteEmail)) {
      setEmailError(null)
      if (users.some((user) => user.email === inviteEmail)) {
        setUserExists(true)
      } else {
        setUserExists(false)
        handleInvite(comment)
      }
    } else {
      setEmailError(t('Invalid email'))
    }
  }

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === 'NumpadEnter') {
      handleInviteClick()
    }
  }

  // Use Mantine's useWindowEvent hook to listen for keydown event
  useWindowEvent('keydown', handleKeyPress)

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={t('Invite by Email')}
      styles={{
        title: {
          color: 'var(--mantine-color-text)',
          fontWeight: 600,
        },
        content: {
          backgroundColor: 'var(--mantine-color-body)',
        },
        header: {
          backgroundColor: 'var(--mantine-color-body)',
        },
      }}
    >
      <Stack>
        {userExists && (
          <Alert icon={<IconAlertCircle size='1rem' />} title={t('User Exists')} color='red'>
            {t('The user is already a member of the organization')}
          </Alert>
        )}
        <Alert icon={<IconInfoCircle size='1rem' />} title={''}>
          {t('No email will be sent')}
        </Alert>
        <TextInput
          placeholder={t('Enter email')}
          value={inviteEmail}
          onChange={(event) => setInviteEmail(event.currentTarget.value)}
          error={emailError}
          size='md'
        />
        <TextInput
          placeholder={t('comment-placeholder')}
          label={t('comment')}
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
        />
        <Button onClick={handleInviteClick}>{t('Add Member')}</Button>
      </Stack>
    </Modal>
  )
}

export default InviteModal

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
