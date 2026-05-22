import { useCallback, useEffect, useState } from 'react'
import {
  Stack,
  Text,
  Button,
  Group,
  Anchor,
  Title,
  Alert,
  Loader,
  Center,
  Container,
  Paper,
  Checkbox,
} from '@mantine/core'
import { IconAlertCircle, IconExternalLink } from '@tabler/icons-react'
import { supabase } from '@/utils/supabase/client'
import { useUser } from '@/contexts/UserProvider'
import {
  getMissingUserDocuments,
  acceptUserDocument,
  DOCUMENT_ROUTES,
  DOCUMENT_LABELS,
  type MissingDocument,
} from '@edutime/shared'

const REGISTER_LEGAL_METADATA_KEY = 'register_legal_accepted_v1'
const AUTO_ACCEPT_DOC_CODES = new Set(['terms_of_use'])

export function LegalGate({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useUser()
  const [missingDocs, setMissingDocs] = useState<MissingDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [acceptedDocs, setAcceptedDocs] = useState<Set<string>>(new Set())
  const [checkError, setCheckError] = useState<string | null>(null)

  const checkMissingDocuments = useCallback(async () => {
    setIsLoading(true)
    setCheckError(null)
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }
      if (!session) {
        setMissingDocs([])
        return
      }

      let docs = await getMissingUserDocuments(supabase, 'app')

      if (docs.length > 0) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        const shouldAutoAcceptFromRegistration =
          authUser?.user_metadata?.[REGISTER_LEGAL_METADATA_KEY] === true ||
          authUser?.user_metadata?.[REGISTER_LEGAL_METADATA_KEY] === 'true'

        if (shouldAutoAcceptFromRegistration) {
          let autoAcceptSucceeded = false

          try {
            const docsToAccept = docs.filter(
              (doc) => AUTO_ACCEPT_DOC_CODES.has(doc.code) && doc.can_accept,
            )

            for (const doc of docsToAccept) {
              await acceptUserDocument(supabase, doc.code, 'register')
            }

            autoAcceptSucceeded = true
          } catch (error) {
            console.error('Error auto-accepting registration legal documents in gate:', error)
          }

          if (autoAcceptSucceeded) {
            try {
              await supabase.auth.updateUser({
                data: {
                  [REGISTER_LEGAL_METADATA_KEY]: false,
                },
              })
            } catch (error) {
              console.error('Error clearing registration legal marker in gate:', error)
            }

            docs = await getMissingUserDocuments(supabase, 'app')
          }
        }
      }

      setMissingDocs(docs)
    } catch (error) {
      console.error('Error checking missing documents:', error)
      setMissingDocs([])
      setCheckError(
        error instanceof Error ? error.message : 'Legal documents could not be verified.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isInitialized || !user) {
      return
    }
    void checkMissingDocuments()
  }, [isInitialized, user?.user_id, checkMissingDocuments])

  const handleCheckboxChange = (code: string, checked: boolean) => {
    const newAccepted = new Set(acceptedDocs)
    if (checked) {
      newAccepted.add(code)
    } else {
      newAccepted.delete(code)
    }
    setAcceptedDocs(newAccepted)
  }

  const handleContinue = async () => {
    const toAccept = missingDocs.filter((doc) => acceptedDocs.has(doc.code) && doc.can_accept)
    if (toAccept.length === 0) return

    setAccepting(true)
    try {
      for (const doc of toAccept) {
        try {
          await acceptUserDocument(supabase, doc.code, 'register')
        } catch (error) {
          console.error(`Error accepting document ${doc.code}:`, error)
        }
      }
      await checkMissingDocuments()
    } catch (error) {
      console.error('Error accepting documents:', error)
    } finally {
      setAccepting(false)
    }
  }

  if (!isInitialized || !user) {
    return (
      <Center h='100vh'>
        <Loader size='lg' />
      </Center>
    )
  }

  if (isLoading) {
    return (
      <Center h='100vh'>
        <Loader size='lg' />
      </Center>
    )
  }

  if (checkError) {
    return (
      <Center h='100vh' style={{ backgroundColor: 'var(--mantine-color-body)' }}>
        <Container size={600}>
          <Paper withBorder p={30} radius='md'>
            <Stack gap='lg'>
              <Title order={2}>Rechtliche Dokumente</Title>
              <Alert icon={<IconAlertCircle size='1rem' />} color='red' title='Fehler'>
                {checkError}
              </Alert>
              <Button onClick={() => void checkMissingDocuments()} variant='filled'>
                Erneut versuchen
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Center>
    )
  }

  if (missingDocs.length > 0) {
    const allAccepted = missingDocs.every((doc) => acceptedDocs.has(doc.code) || !doc.can_accept)

    return (
      <Center h='100vh' style={{ backgroundColor: 'var(--mantine-color-body)' }}>
        <Container size={600}>
          <Paper withBorder p={30} radius='md'>
            <Stack gap='lg'>
              <Title order={2}>
                Bitte akzeptiere die folgenden Dokumente, um EduTime weiter zu nutzen.
              </Title>
              <Stack gap='md'>
                {missingDocs.map((doc) => (
                  <Stack key={doc.code} gap='xs'>
                    <Group justify='space-between' wrap='nowrap'>
                      <Stack gap='xs' style={{ flex: 1 }}>
                        <Group gap='xs'>
                          <Text fw={500}>{DOCUMENT_LABELS[doc.code] || doc.title}</Text>
                          {doc.version_label && (
                            <Text size='sm' c='dimmed'>
                              ({doc.version_label})
                            </Text>
                          )}
                        </Group>
                        {DOCUMENT_ROUTES[doc.code] && (
                          <Anchor
                            href={DOCUMENT_ROUTES[doc.code]}
                            target='_blank'
                            size='sm'
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <IconExternalLink size='0.875rem' />
                            Dokument öffnen
                          </Anchor>
                        )}
                      </Stack>
                    </Group>
                    {doc.can_accept ? (
                      <Checkbox
                        label={`Ich akzeptiere die ${DOCUMENT_LABELS[doc.code] || doc.title}`}
                        checked={acceptedDocs.has(doc.code)}
                        onChange={(event) =>
                          handleCheckboxChange(doc.code, event.currentTarget.checked)
                        }
                        disabled={accepting}
                      />
                    ) : (
                      <Text size='sm' c='dimmed'>
                        Nicht akzeptierbar
                      </Text>
                    )}
                  </Stack>
                ))}
                {missingDocs.some((doc) => !doc.can_accept) && (
                  <Alert icon={<IconAlertCircle size='1rem' />} color='yellow' title='Hinweis'>
                    Einige Dokumente können derzeit nicht akzeptiert werden. Bitte kontaktieren Sie
                    den Support.
                  </Alert>
                )}
                <Button
                  onClick={handleContinue}
                  loading={accepting}
                  disabled={!allAccepted || accepting}
                  fullWidth
                  mt='md'
                >
                  Weiter
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Center>
    )
  }

  return <>{children}</>
}
