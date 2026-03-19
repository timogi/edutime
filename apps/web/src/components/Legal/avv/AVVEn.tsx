import type { TocLink } from '../PrivacyLayout'
import { LegalDocumentSection } from '../LegalDocumentSection'

export const avvMetaEn = {
  title: 'Data Processing Agreement (DPA) of EduTime',
  tocLabel: 'Table of contents',
  meta: {
    version: 'Version 1.1',
    lastUpdated: 'March 19, 2026',
  },
}

export const tocLinksEn: TocLink[] = [
  { id: 'purpose-and-scope', label: '1. Purpose and scope', order: 1 },
  { id: 'roles-of-the-parties', label: '2. Roles of the parties', order: 1 },
  { id: 'data-categories-and-purposes', label: '3. Data categories and purposes', order: 1 },
  { id: 'security-measures', label: '4. Technical and organizational measures', order: 1 },
  { id: 'sub-processors', label: '5. Sub-processors', order: 1 },
  { id: 'international-transfers', label: '6. International data transfers', order: 1 },
  { id: 'support-and-notifications', label: '7. Support and notifications', order: 1 },
  { id: 'term-and-termination', label: '8. Term and termination', order: 1 },
  { id: 'final-provisions', label: '9. Final provisions', order: 1 },
]

export function AVVEn() {
  return (
    <>
      <LegalDocumentSection id='purpose-and-scope' title='1. Purpose and scope' order={2}>
        <p>
          This Data Processing Agreement governs EduTime&apos;s processing of personal data in
          connection with the SaaS service. It applies as soon as a customer uses the service and
          personal data is processed.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='roles-of-the-parties' title='2. Roles of the parties' order={2}>
        <p>
          The customer acts as controller. EduTime acts as processor and processes personal data
          only on documented instructions, unless mandatory law requires otherwise.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='data-categories-and-purposes'
        title='3. Data categories and purposes'
        order={2}
      >
        <p>
          EduTime processes only data provided by the customer for operation, maintenance, security,
          and improvement of the SaaS service, as well as for legal obligations.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='security-measures' title='4. Technical and organizational measures' order={2}>
        <p>
          EduTime implements appropriate measures to protect confidentiality, integrity, and
          availability of personal data.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='sub-processors' title='5. Sub-processors' order={2}>
        <p>
          EduTime may engage sub-processors where required for service delivery and ensures they are
          bound to equivalent data protection obligations.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='international-transfers' title='6. International data transfers' order={2}>
        <p>
          For transfers to countries without an adequate level of protection, EduTime uses
          appropriate safeguards, including standard contractual clauses and additional measures.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='support-and-notifications' title='7. Support and notifications' order={2}>
        <p>
          EduTime supports the customer with data subject requests and incident response, including
          timely notification of personal data breaches.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='term-and-termination' title='8. Term and termination' order={2}>
        <p>
          This agreement is valid for the duration of the contractual relationship. After termination,
          personal data is returned or deleted according to contract and legal retention duties.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='final-provisions' title='9. Final provisions' order={2}>
        <p>
          Changes to this agreement require text form. If one provision is invalid, the remaining
          provisions remain effective.
        </p>
      </LegalDocumentSection>
    </>
  )
}
