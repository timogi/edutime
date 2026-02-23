import { useEffect, useState, useCallback } from 'react'
import {
  Stack,
  Text,
  Button,
  Group,
  Anchor,
  Title,
  Alert,
  Loader,
  Paper,
  Container,
} from '@mantine/core'
import { IconAlertCircle, IconExternalLink, IconCheck } from '@tabler/icons-react'
import { DOCUMENT_ROUTES, DOCUMENT_LABELS } from '@edutime/shared'

interface MissingDocumentResponse {
  document_code: string
  document_version_id: number
  title: string
  version_label: string
  can_accept: boolean
}

interface CheckoutLegalGateProps {
  accessToken?: string
  onAllAccepted: () => void
  onAuthError?: () => void
}

export function CheckoutLegalGate({
  accessToken,
  onAllAccepted,
  onAuthError,
}: CheckoutLegalGateProps) {
  const [missingDocs, setMissingDocs] = useState<MissingDocumentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accepting, setAccepting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkMissingDocuments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await fetch('/api/legal/missing', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ context: 'checkout_individual' }),
      })

      if (!response.ok) {
        if (response.status === 401 && onAuthError) {
          onAuthError()
          return
        }
        const errorData = await response.json()
        setError(errorData.error || 'Failed to check missing documents')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      const missing = data.missing || []
      setMissingDocs(missing)

      if (missing.length === 0) {
        onAllAccepted()
      }
    } catch (error) {
      console.error('Error checking missing documents:', error)
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, onAllAccepted, onAuthError])

  useEffect(() => {
    checkMissingDocuments()
  }, [checkMissingDocuments])

  const handleAccept = async (doc: MissingDocumentResponse) => {
    setAccepting(doc.document_version_id)
    setError(null)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await fetch('/api/legal/accept', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          documentCode: doc.document_code,
          source: 'checkout',
        }),
      })

      if (!response.ok) {
        if (response.status === 401 && onAuthError) {
          onAuthError()
          return
        }
        const errorData = await response.json()
        setError(errorData.error || 'Failed to accept document')
        return
      }

      await checkMissingDocuments()
    } catch (error) {
      console.error('Error accepting document:', error)
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
    } finally {
      setAccepting(null)
    }
  }

  if (isLoading) {
    return (
      <Container size={600} my={40}>
        <Paper withBorder p={30} radius='md'>
          <Stack gap='md' align='center'>
            <Loader size='lg' />
            <Text c='dimmed' ta='center'>
              Dokumente werden überprüft...
            </Text>
          </Stack>
        </Paper>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size={600} my={40}>
        <Paper withBorder p={30} radius='md'>
          <Stack gap='lg'>
            <Title order={2}>Fehler</Title>
            <Alert icon={<IconAlertCircle size='1rem' />} color='red' title='Fehler'>
              {error}
            </Alert>
            <Button onClick={checkMissingDocuments} variant='filled'>
              Erneut versuchen
            </Button>
          </Stack>
        </Paper>
      </Container>
    )
  }

  if (missingDocs.length === 0) {
    return null
  }

  return (
    <Container size={600} my={40}>
      <Paper withBorder p={30} radius='md'>
        <Stack gap='lg'>
          <Title order={2}>Erforderliche Dokumente</Title>
          <Text c='dimmed'>
            Bitte akzeptieren Sie die folgenden Dokumente, um mit der Zahlung fortzufahren.
          </Text>

          {missingDocs.some((doc) => !doc.can_accept) && (
            <Alert icon={<IconAlertCircle size='1rem' />} color='yellow' title='Hinweis'>
              Einige Dokumente können derzeit nicht akzeptiert werden. Bitte kontaktieren Sie den
              Support.
            </Alert>
          )}

          <Stack gap='md'>
            {missingDocs.map((doc) => (
              <Group key={doc.document_version_id} justify='space-between' wrap='nowrap'>
                <Stack gap='xs' style={{ flex: 1 }}>
                  <Group gap='xs'>
                    <Text fw={500}>{DOCUMENT_LABELS[doc.document_code] || doc.title}</Text>
                    {doc.version_label && (
                      <Text size='sm' c='dimmed'>
                        ({doc.version_label})
                      </Text>
                    )}
                  </Group>
                  {DOCUMENT_ROUTES[doc.document_code] && (
                    <Anchor
                      href={DOCUMENT_ROUTES[doc.document_code]}
                      target='_blank'
                      size='sm'
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <IconExternalLink size='0.875rem' />
                      Dokument öffnen
                    </Anchor>
                  )}
                </Stack>
                {doc.can_accept ? (
                  <Button
                    onClick={() => handleAccept(doc)}
                    loading={accepting === doc.document_version_id}
                    size='sm'
                    leftSection={<IconCheck size='1rem' />}
                  >
                    Akzeptieren
                  </Button>
                ) : (
                  <Text size='sm' c='dimmed'>
                    Nicht akzeptierbar
                  </Text>
                )}
              </Group>
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}
