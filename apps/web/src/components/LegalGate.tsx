import { useEffect, useState } from 'react'
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
import { useTranslations } from 'next-intl'
import { IconAlertCircle, IconExternalLink } from '@tabler/icons-react'
import { supabase } from '@/utils/supabase/client'

interface MissingDocument {
  code: string
  title: string
  version_label: string | null
  can_accept: boolean
}

const DOCUMENT_ROUTES: Record<string, string> = {
  privacy_policy: '/docs/privacy',
  terms_of_use: '/docs/terms',
  saas_agb: '/docs/agb',
  saas_single_contract: '/contract',
  avv: '/avv',
}

const DOCUMENT_LABELS: Record<string, string> = {
  privacy_policy: 'Datenschutzbestimmungen',
  terms_of_use: 'Nutzungsbedingungen',
  saas_agb: 'SaaS AGB',
  saas_single_contract: 'SaaS-Einzelvertrag (Muster)',
  avv: 'AVV',
}

interface RegisterIntent {
  timestamp: number
  termsAccepted: boolean
  privacyAccepted: boolean
}

const REGISTER_INTENT_KEY = 'edutime_register_intent'
const REGISTER_INTENT_MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

export function LegalGate({ children }: { children: React.ReactNode }) {
  const [missingDocs, setMissingDocs] = useState<MissingDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [acceptedDocs, setAcceptedDocs] = useState<Set<string>>(new Set())
  const [registerIntent, setRegisterIntent] = useState<RegisterIntent | null>(null)
  const t = useTranslations('Index')

  useEffect(() => {
    // Check for register intent in localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(REGISTER_INTENT_KEY)
        if (stored) {
          const intent: RegisterIntent = JSON.parse(stored)
          // Check if intent is still valid (not older than 24 hours)
          if (Date.now() - intent.timestamp < REGISTER_INTENT_MAX_AGE) {
            setRegisterIntent(intent)
            // Pre-check documents based on register intent
            const preChecked = new Set<string>()
            if (intent.termsAccepted) preChecked.add('terms_of_use')
            if (intent.privacyAccepted) preChecked.add('privacy_policy')
            setAcceptedDocs(preChecked)
          } else {
            // Remove expired intent
            localStorage.removeItem(REGISTER_INTENT_KEY)
          }
        }
      } catch (e) {
        console.error('Failed to read register intent:', e)
      }
    }
    checkMissingDocuments()
  }, [])

  const checkMissingDocuments = async () => {
    setIsLoading(true)
    try {
      // Call RPC directly from client
      const { data, error } = await supabase.rpc('legal_missing_documents', {
        p_context: 'app',
        p_organization_id: null,
      })

      if (error) {
        console.error('Error calling legal_missing_documents:', error)
        setIsLoading(false)
        return
      }

      // Filter to only show terms_of_use and privacy_policy for app context
      const appDocs = (data || []).filter(
        (doc: MissingDocument) => doc.code === 'terms_of_use' || doc.code === 'privacy_policy',
      )
      setMissingDocs(appDocs)
    } catch (error) {
      console.error('Error checking missing documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
    // Only accept documents that are checked and missing
    const toAccept = missingDocs.filter((doc) => acceptedDocs.has(doc.code) && doc.can_accept)

    if (toAccept.length === 0) {
      return
    }

    setAccepting(true)
    try {
      // Accept each document via RPC
      for (const doc of toAccept) {
        const { error } = await supabase.rpc('legal_accept_document', {
          p_code: doc.code,
          p_organization_id: null,
          p_source: 'register',
        })

        if (error) {
          console.error(`Error accepting document ${doc.code}:`, error)
          // Continue with other documents even if one fails
        }
      }

      // Remove register intent from localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(REGISTER_INTENT_KEY)
        } catch (e) {
          console.error('Failed to remove register intent:', e)
        }
      }

      // Re-check missing documents
      await checkMissingDocuments()
    } catch (error) {
      console.error('Error accepting documents:', error)
    } finally {
      setAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <Center h='100vh'>
        <Loader size='lg' />
      </Center>
    )
  }

  // Only show gate for terms_of_use and privacy_policy in app context
  const appMissingDocs = missingDocs.filter(
    (doc) => doc.code === 'terms_of_use' || doc.code === 'privacy_policy',
  )

  if (appMissingDocs.length > 0) {
    const allAccepted = appMissingDocs.every((doc) => acceptedDocs.has(doc.code) || !doc.can_accept)

    return (
      <Center h='100vh' style={{ backgroundColor: 'var(--mantine-color-body)' }}>
        <Container size={600}>
          <Paper withBorder p={30} radius='md'>
            <Stack gap='lg'>
              <Title order={2}>
                Bitte akzeptiere die folgenden Dokumente, um EduTime weiter zu nutzen.
              </Title>
              <Stack gap='md'>
                {appMissingDocs.map((doc) => (
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
                        <Anchor
                          href={DOCUMENT_ROUTES[doc.code]}
                          target='_blank'
                          size='sm'
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <IconExternalLink size='0.875rem' />
                          Dokument öffnen
                        </Anchor>
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
                {appMissingDocs.some((doc) => !doc.can_accept) && (
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
