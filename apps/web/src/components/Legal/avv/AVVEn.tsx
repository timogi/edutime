import type { TocLink } from '../PrivacyLayout'
import { LegalDocumentSection } from '../LegalDocumentSection'
import { SubProcessorsTable } from './SubProcessorsTable'
import { subProcessorsEn } from './subProcessors'

export const avvMetaEn = {
  title: 'Data Processing Agreement (DPA) of EduTime',
  tocLabel: 'Table of contents',
  meta: {
    version: 'Version 1.0',
    lastUpdated: 'March 3, 2025',
  },
}

export const tocLinksEn: TocLink[] = [
  { id: 'introduction', label: 'Introduction', order: 1 },
  { id: 'preamble-and-scope', label: 'Preamble and scope', order: 1 },
  { id: 'subject-duration-nature-purpose', label: 'Subject, duration, nature and purpose', order: 1 },
  { id: 'scope-and-instructions', label: 'Scope and right to issue instructions', order: 1 },
  { id: 'data-security', label: 'Data security', order: 1 },
  { id: 'confidentiality', label: 'Confidentiality', order: 1 },
  { id: 'data-subject-rights', label: 'Rights of data subjects', order: 1 },
  { id: 'data-breach', label: 'Data breach', order: 1 },
  { id: 'return-and-deletion', label: 'Return and deletion of personal data', order: 1 },
  { id: 'sub-processors', label: 'Engagement of sub-processors', order: 1 },
  { id: 'documentation', label: 'Documentation, records of processing', order: 1 },
  { id: 'data-protection-impact-assessment', label: 'Data protection impact assessment', order: 1 },
  { id: 'audit-rights', label: 'Evidence obligations and audit rights', order: 1 },
  { id: 'third-countries', label: 'Processing in third countries', order: 1 },
  { id: 'liability', label: 'Liability', order: 1 },
  { id: 'final-provisions', label: 'Final provisions', order: 1 },
  { id: 'annexes', label: 'Annexes', order: 1 },
  { id: 'annex-1', label: 'Annex 1: Implementation provisions', order: 1 },
  { id: 'annex-2', label: 'Annex 2: Technical and organizational measures', order: 1 },
  { id: 'annex-3', label: 'Annex 3: Sub-processors', order: 1 },
]

export function AVVEn() {
  return (
    <>
      <LegalDocumentSection id='introduction' title='Data Processing Agreement (DPA)' order={2}>
        <p>
          Tim Ogi (sole proprietorship), c/o Bildung Bern, Monbijoustrasse 36, 3011 Bern (hereinafter
          the «Contractor» or «Processor») provides SaaS services relating to SaaS software to the
          customer (hereinafter the «Client» or «Controller»).
        </p>
        <p>
          This Data Processing Agreement and its annexes (the «DPA») are integrated into and form part
          of the General Terms and Conditions concluded between the Contractor and the Client. This
          DPA reflects the parties&apos; agreement regarding the processing of personal data by the
          Contractor as processor on behalf of the Client.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='preamble-and-scope' title='Preamble and scope' order={2}>
        <p>
          The parties have entered into one or more agreements (the «Contract» or «Contracts») under
          which the Contractor acts as service provider to the Client or its customers. The provision
          of services under the Contract by the Contractor may qualify as processing of personal data
          (hereinafter uniformly «personal data») within the meaning of applicable data protection
          law. Where the Contractor processes personal data of the Client or its customers as
          processor or sub-processor in the course of cooperation (any handling of personal data),
          this Data Processing Agreement (the «DPA» or «Agreement») supplements the Contract and
          specifies the parties&apos; data protection obligations. Applicable data protection law
          means the Swiss Federal Act on Data Protection and the EU General Data Protection
          Regulation (GDPR), insofar and to the extent applicable («applicable data protection law»).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='subject-duration-nature-purpose'
        title='Subject, duration, nature and purpose of the agreement'
        order={2}
      >
        <p>
          The subject matter of the engagement and the nature and purpose of processing arise from
          the Contract, whereby the provisions of this DPA supplement those in the Contract. This
          Agreement is an integral part of the Contract. It enters into force once incorporated into
          the Contract, as indicated in the Contract, an order form, the General Terms and Conditions,
          or an executed amendment to the Contract.
        </p>
        <p>
          The term of this Agreement follows the term of the Contract (or, where several Contracts
          exist, the last active Contract) between the Client and the Contractor under which the
          Contractor processes personal data for the Client, unless this Agreement provides for
          obligations beyond that term. The DPA also ends automatically once the Contractor no longer
          holds or processes personal data for the Client under the Contract, or upon termination of
          the (last active) Contract.
        </p>
        <p>
          The right to terminate for cause without notice remains unaffected. Repeated or serious
          breaches by a party of the Contract, this DPA, or applicable data protection law constitute
          cause in particular. The special termination right under Section 8 also entitles either
          party to terminate without notice. Termination of this Agreement without notice also
          entitles termination of the Contract without notice.
        </p>
        <p>
          Where the nature of personal data processed, the nature and purpose of processing, and the
          categories of data subjects are not already set out in the respective Contract, they are
          listed in Annex 1 to this Agreement.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='scope-and-instructions'
        title='Scope and right to issue instructions'
        order={2}
      >
        <p>
          The Contractor processes personal data exclusively for specified purposes in accordance
          with the respective Contract, this DPA, or documented instructions from the Client.
        </p>
        <p>
          Instructions are generally to be given in text form (i.e. in writing, by fax, by email, or in
          a documented electronic format). Oral instructions must be confirmed without delay in text
          form or in a documented electronic format. The Client documents all instructions in text
          form.
        </p>
        <p>
          The Contractor must inform the Client without delay if it believes an instruction violates
          applicable data protection law. The Contractor may suspend implementation of the relevant
          instruction until it is confirmed or amended by the Client.
        </p>
        <p>
          Notifications to authorities or data subjects regarding data breaches and violations may
          only be made by the Contractor itself after prior instruction from the Client. Mandatory
          obligations under applicable law (e.g. binding orders from competent authorities) remain
          reserved; the Client shall be informed promptly where legally permitted.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='data-security' title='Data security' order={2}>
        <p>
          The Contractor implements appropriate technical and organizational measures (TOM) in
          accordance with Annex 2 to organize, review, and continuously adapt its internal operations
          within its area of responsibility so as to maintain an adequate level of data protection
          under applicable data protection law and protect personal data against accidental or unlawful
          destruction, loss, alteration, disclosure, etc. The Contractor takes into account the state
          of the art, implementation costs, and the nature, scope, circumstances, and purposes of
          processing as well as varying likelihoods and severity of risks to the rights and freedoms of
          data subjects.
        </p>
        <p>
          Measures are subject to technical progress and further development. Alternative or
          additional measures may be implemented provided the level of protection of the specified
          measures is not undermined.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='confidentiality' title='Confidentiality' order={2}>
        <p>
          The Contractor undertakes to treat personal data received under the Contract or this DPA
          confidentially and to grant access only to persons who require access to fulfill their
          obligations towards the Contractor. The Contractor ensures that persons authorized to process
          personal data have undertaken confidentiality obligations unless they are already subject to
          a statutory duty of confidentiality. Employees and other persons working for the Contractor
          who process relevant personal data are prohibited from processing such data outside the
          Contract and this DPA. The duty of confidentiality/secrecy continues for five years after
          termination of this DPA.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='data-subject-rights' title='Rights of data subjects' order={2}>
        <p>
          If a data subject contacts the Contractor directly with requests for rectification, erasure,
          access, or other claims relating to personal data, the Contractor will refer the data subject
          to the Client without delay where attribution to the Client is possible based on the data
          subject&apos;s information.
        </p>
        <p>
          The Contractor supports the Client, taking into account the nature of processing, with
          appropriate technical and organizational measures in fulfilling its obligation to respond to
          data subjects&apos; requests for rights under applicable data protection law.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='data-breach' title='Data breach' order={2}>
        <p>The Contractor shall notify the Client without delay if:</p>
        <ul>
          <li>
            a personal data breach is detected or suspected by the Contractor or a sub-processor. The
            information required under applicable data protection law (including nature, scope, and
            extent of the breach) must be provided so that the Client can meet any obligation to notify
            the competent supervisory authority and/or data subjects;
          </li>
          <li>personal data are to be disclosed to a competent authority;</li>
          <li>
            a request, summons, or application for inspection or review of processing by a competent
            authority is received, unless notification to the Client is prohibited by law.
          </li>
        </ul>
        <p>
          In the event of a personal data breach at the Contractor or a sub-processor, the Contractor
          shall at its own expense take reasonably expected measures to determine the cause of the
          breach and to secure protection of personal data and mitigate possible adverse consequences
          for data subjects.
        </p>
        <p>
          The Contractor&apos;s support obligations towards the Client under this section are
          provided free of charge. The parties may agree remuneration for further support services.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='return-and-deletion'
        title='Return and deletion of personal data'
        order={2}
      >
        <p>
          Upon first instruction from the Client, the Contractor shall return all data, data carriers,
          and other materials to the Client without delay. The Contractor may not retain data longer
          than necessary to fulfill its obligations under the Contract unless statutory retention
          obligations apply.
        </p>
        <p>
          Upon termination of the Contract, personal data received under the Contract or this DPA must
          be returned or deleted in accordance with contractual provisions; if no such provision exists,
          at the Client&apos;s choice personal data must either be returned and existing copies deleted,
          or deleted, unless the Contractor is legally obliged to retain or store them. Until deletion
          or return, the Contractor continues to ensure compliance with this DPA.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='sub-processors' title='Engagement of sub-processors' order={2}>
        <p>
          For the purposes of this Agreement, «sub-processor» means any service provider engaged by the
          Contractor (or by another sub-processor of the Contractor) in connection with this DPA to
          process personal data.
        </p>
        <p>
          The Contractor is hereby granted prior general written authorization to engage sub-processors
          for the processing of personal data. Where permitted sub-processors are not already set out
          in the Contract, they are listed in Annex 3. The list of sub-processors must be kept up to
          date.
        </p>
        <p>
          Adding or replacing sub-processors is at the Contractor&apos;s discretion. The Client will be
          informed in advance with reasonable notice of planned changes to the list of
          sub-processors. If the Client has an objectively compelling reason under applicable data
          protection law, it may object within twenty days of the Contractor&apos;s notice to processing
          by a new sub-processor. If no objection is raised within that period, the new sub-processor is
          deemed approved by the Client. Where an objectively compelling data protection reason exists
          and no amicable solution is possible, the Client is granted a special termination right
          (right to terminate without notice).
        </p>
        <p>
          The Contractor must conclude the necessary agreements with sub-processors to ensure they are
          subject to the same obligations as the Contractor under this DPA and the respective Contract.
          Upon request, the Contractor must provide information on essential contract content and
          implementation of data protection obligations by the sub-processor.
        </p>
        <p>
          If a sub-processor fails to meet its data protection obligations, the Contractor is liable to
          the Client for any breaches by the sub-processor in accordance with this DPA.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='documentation'
        title='Documentation, records of processing activities'
        order={2}
      >
        <p>
          Each party is responsible for complying with its documentation obligations, in particular
          maintaining records of processing activities where required under applicable data protection
          law. Each party supports the other party appropriately in fulfilling its documentation
          obligations, including providing information requested by the other party in a form reasonably
          requested (e.g. via an electronic system), so that the other party can meet obligations
          relating to records of processing activities.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='data-protection-impact-assessment'
        title='Data protection impact assessment'
        order={2}
      >
        <p>
          Where the Client is obliged under applicable data protection law to carry out a data
          protection impact assessment or prior consultation with a supervisory authority, the
          Contractor will provide free of charge, upon the Client&apos;s request, those documents
          generally available for the services under the respective Contract (e.g. this DPA, the
          Contract, audit reports, or certifications). Any additional support will be agreed between the
          parties.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='audit-rights'
        title='Evidence obligations and audit rights'
        order={2}
      >
        <p>
          The Contractor demonstrates compliance with obligations set out in this DPA to the Client by
          appropriate means (e.g. certificates).
        </p>
        <p>
          The Client has the right to verify compliance with legal or contractual obligations regarding
          processing of personal data itself or through auditors appointed by it who are bound by strict
          confidentiality and are not in direct competition with the Contractor, by means of inspections
          or audits, where:
        </p>
        <ul>
          <li>
            the Contractor does not provide sufficient evidence (including certificates, audit reports)
            of compliance with technical and organizational measures protecting systems and processing
            operations used;
          </li>
          <li>a breach of protection of personal data has occurred;</li>
          <li>an audit is officially required by a supervisory authority of the Client; or</li>
          <li>
            the Client has a direct audit right under mandatory applicable data protection law.
          </li>
        </ul>
        <p>
          The Contractor must cooperate appropriately in an audit. The parties agree in advance on
          timing, duration, and subject matter of audits and applicable security and confidentiality
          provisions, unless an audit without prior notice is necessary because otherwise the purpose
          of the audit would be jeopardized. Audits must be conducted so as not to unduly disrupt the
          Contractor&apos;s operations. Client audits and inspections are generally limited to three
          business days per year.
        </p>
        <p>
          Each party bears its own costs and expenses in connection with the audit or inspection. For
          support exceeding three business days, the Contractor may charge the Client remuneration for
          an inspection or audit arranged by the Client.
        </p>
        <p>
          Where material breaches of this DPA or deficiencies in the Contractor&apos;s implementation of
          its obligations are identified after submission of evidence or reports or in the course of an
          audit, the Contractor must implement appropriate corrective measures promptly and free of
          charge.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='third-countries' title='Processing in third countries' order={2}>
        <p>
          Processing takes place exclusively in Switzerland, in a member state of the European Union
          (EU), in another contracting state of the Agreement on the European Economic Area (EEA), or
          in a country with an adequate level of protection according to a decision of the European
          Commission or the Swiss Federal Data Protection and Information Commissioner. Processing
          outside this area is permitted only after informing the Client and in accordance with
          applicable legal requirements. Where data are disclosed to a state without adequate data
          protection, the Contractor undertakes in particular to conclude supplementary agreements with
          recipients based on current EU standard contractual clauses (adapted for Switzerland where
          necessary) and to implement additional appropriate legal, technical, or organizational measures.
        </p>
        <p>
          The Contractor may transfer personal data to the USA for contract performance. Where personal
          data subject to Swiss or European data protection law are processed in the USA, they are
          processed in accordance with the Swiss-U.S. Data Privacy Framework and the EU-U.S. Data
          Privacy Framework (together the «Privacy Framework»).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='liability' title='Liability' order={2}>
        <p>
          The Contractor is liable for fault of its sub-processors as for its own acts. The scope of the
          parties&apos; liability under this DPA is governed by the liability provisions and limitations
          under the Contract or, where several Contracts exist, the affected Contract. Further statutory
          liability claims remain reserved.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='final-provisions' title='Final provisions' order={2}>
        <p>
          <strong>Content of the agreement.</strong> This DPA and its annexes govern the parties&apos;
          relationship regarding processing of personal data exclusively and replace negotiations and
          correspondence prior to conclusion of the Contract. In case of conflict between the Contract
          and this DPA, this DPA prevails where processing of personal data by the Contractor under the
          relevant Contract is affected. In case of conflict, an annex to this Agreement prevails; where
          several annexes conflict, the most recently valid provisions of the annexes prevail over
          conflicting terms in an older annex.
        </p>
        <p>
          Data protection terms such as «personal data», «process», «controller», «processor», «data
          protection impact assessment», etc. have the meaning assigned under Swiss data protection law
          or, depending on context, the EU GDPR. «Process» is used synonymously with «process/handle».
          «Data breach» means «breach of security of personal data».
        </p>
        <p>
          <strong>Amendments.</strong> The Contractor reserves the right to amend or supplement this DPA.
          Where amendments may adversely affect the Client, the Contractor will inform the Client in
          writing, by email, or via an appropriate customer portal. The new DPA becomes part of the
          Contract unless the Client objects within 14 days of becoming aware.
        </p>
        <p>
          <strong>Notices.</strong> Unless expressly agreed otherwise, notices required to exercise rights
          and obligations under this Agreement must be made in writing, by letter or email, to the
          addresses specified in the Contract.
        </p>
        <p>
          <strong>Severability.</strong> If individual provisions or parts of this Agreement or an annex
          are void or unenforceable, the validity of the remainder is unaffected. The parties will
          adapt the Agreement so that the purpose of the void or unenforceable part is achieved as far
          as possible.
        </p>
        <p>
          <strong>Dispute resolution.</strong> Both parties undertake to seek an amicable settlement in
          good faith in case of disagreements relating to this Agreement.
        </p>
        <p>
          <strong>Applicable law and jurisdiction.</strong> If no agreement is reached amicably despite
          the parties&apos; efforts, legal proceedings are conducted in accordance with the provisions
          in the respective Contract (applicable law and place of jurisdiction).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='annexes' title='Annexes' order={2}>
        <p>The following annexes form integral parts of this Agreement:</p>
        <ul>
          <li>Annex 1: Implementation provisions</li>
          <li>Annex 2: Technical and organizational measures</li>
          <li>Annex 3: List of sub-processors</li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='annex-1'
        title='Annex 1 to the Data Processing Agreement – Implementation provisions'
        order={2}
      >
        <p>Version 1.0 of March 3, 2025</p>
        <p>
          <strong>List of parties</strong>
        </p>
        <p>
          <strong>Data exporter</strong>
          <br />
          Name: The Client as specified in the Contract
          <br />
          Address: The Client&apos;s address as specified in the Contract
          <br />
          Name, position and contact details of contact person: The Client&apos;s contact details as
          specified in the Contract and/or the Client&apos;s customer profile
          <br />
          Activities relevant to data transferred under this DPA: Processing of personal data in
          connection with use of the SaaS service by the Client under the contractual terms
          <br />
          Role (controller/processor): Controller (as controller, as processor, or on behalf of another
          controller)
        </p>
        <p>
          <strong>Data importer</strong>
          <br />
          Name: The Contractor as specified in the Contract
          <br />
          Address: The Contractor&apos;s address as specified in the Contract
          <br />
          Name, position and contact details of contact person: The Contractor&apos;s contact details as
          specified in the Contract or the Contractor&apos;s privacy policy
          <br />
          Activities relevant to data transferred under this DPA: Processing of personal data in
          connection with use of the SaaS service by the Client under the contractual terms
          <br />
          Role (for processing controller/processor): Processor
        </p>
        <p>
          <strong>Description of the transfer</strong>
        </p>
        <p>
          <strong>Categories of data subjects whose personal data are transferred</strong>
          <br />
          When using the Contractor&apos;s SaaS service, the Client may transfer personal data, with the
          Client determining and controlling the scope of such transfer. Transferred data may include
          personal data of the following categories of data subjects: the Client&apos;s contacts and
          other end users including employees, contractors, staff, and the Client&apos;s customers.
        </p>
        <p>
          <strong>Categories of personal data transferred</strong>
          <br />
          The Client may transfer personal data to the SaaS service, determining and controlling the
          scope. Transferred data may include: contact information (as defined in the Contract); any
          other personal data transmitted, sent, or received by the Client or its end users via the SaaS
          service (in particular time tracking data).
        </p>
        <p>
          <strong>Transfer of special categories of personal data</strong>
          <br />
          As a rule, no special categories of personal data are transferred. If the Client nevertheless
          wishes to do so, it must conclude a separate agreement with the Contractor on processing
          special categories of personal data, setting restrictions and protective measures by mutual
          agreement.
        </p>
        <p>
          <strong>Frequency of transfer</strong>
          <br />
          Continuous
        </p>
        <p>
          <strong>Nature of processing</strong>
          <br />
          Personal data are processed in accordance with the Contract (including this DPA) and may be
          subject to: storage and other processing necessary to provide, maintain, and improve the SaaS
          service provided to the Client; and/or disclosure under the Contract (including this DPA)
          and/or applicable law.
        </p>
        <p>
          <strong>Purpose of transfer and further processing</strong>
          <br />
          The Contractor processes personal data insofar as necessary to provide the SaaS service under
          the Contract and the Client&apos;s instructions when using the SaaS service.
        </p>
        <p>
          <strong>Duration of retention of personal data</strong>
          <br />
          Subject to Section 7.4 of the DPA, the Contractor processes personal data for the duration of
          the Agreement unless otherwise agreed in writing.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='annex-2'
        title='Annex 2 to the Data Processing Agreement – Description of technical and organizational measures (TOM) pursuant to Section 4 DPA'
        order={2}
      >
        <p>Version 1.0 of March 3, 2025</p>
        <p>
          The following describes the technical and organizational measures implemented by the Contractor
          in connection with processing personal data and fulfilling its obligations under existing
          contracts, Art. 8 FADP in conjunction with Art. 2 ff. FDPO and, where applicable, Art. 32
          GDPR:
        </p>
        <p>
          <strong>Confidentiality</strong> — Measures implementing the requirement of confidentiality
          include those defining access, usage, or user controls.
        </p>
        <p>
          <strong>Access control (physical)</strong> — Data processing facilities may not be entered by
          unauthorized persons. Attendance in secure areas is logged. Unauthorized and external persons
          may enter premises only when accompanied by authorized persons.
        </p>
        <p>
          <strong>User control (digital access)</strong> — Data processing systems may not be used by
          unauthorized persons.
        </p>
        <p>
          <strong>Usage control</strong> — Appropriate technical measures (in particular encryption) and
          other suitable measures ensure that authorized users access only data within their authorization
          and that data cannot be read, copied, altered, or removed without authorization during
          processing, use, or storage.
        </p>
        <p>
          <strong>Separation control</strong> — Data collected for different purposes are processed
          separately.
        </p>
        <p>
          <strong>Pseudonymization</strong> — Where pseudonymization applies, personal data are processed
          so they cannot be attributed to a specific data subject without additional information. Mapping
          files are stored separately (encrypted, restricted access). Records are truncated manually or
          automatically for pseudonymization. Internal instructions require anonymization/pseudonymization
          where possible when sharing data or after statutory deletion periods.
        </p>
        <p>
          <strong>Availability and integrity</strong> — Availability measures ensure data and IT systems
          are available to authorized persons. Unauthorized interruption (e.g. server or communication
          failure) threatens availability. Integrity measures protect against unauthorized or unlawful
          processing, destruction, or accidental damage.
        </p>
        <p>
          <strong>Transport control (disclosure control)</strong> — Appropriate measures ensure data
          cannot be read, copied, altered, or removed without authorization during electronic transmission,
          transport, or storage on media, and that transfer destinations can be verified.
        </p>
        <p>
          <strong>Recovery</strong> — Availability of data and access can be restored quickly after
          physical or technical incidents.
        </p>
        <p>
          <strong>Availability control</strong> — Data are protected against accidental destruction or
          loss.
        </p>
        <p>
          <strong>System security</strong> — Operating systems and application software are updated
          regularly and known critical vulnerabilities are closed promptly.
        </p>
        <p>
          <strong>Traceability</strong> — Measures ensure personal data are processed traceably and
          unauthorized access and misuse are identifiable.
        </p>
        <p>
          <strong>Input control</strong> — It can be verified retrospectively whether and by whom data
          were entered, altered, or removed in processing systems. The Contractor documents inputs using
          automatically generated log files.
        </p>
        <p>
          <strong>Detection and remediation of security breaches</strong> — Security breaches are
          detected quickly and measures are taken to mitigate or eliminate consequences.
        </p>
        <p>
          <strong>Regular review, assessment, and evaluation procedures</strong>
        </p>
        <p>
          <strong>Data protection measures</strong> — Policies, instructions, manuals, etc. on data
          protection are centrally available to employees as needed/authorized. Regular data protection
          training and impact assessments as required are conducted. A process exists for handling data
          subject access requests.
        </p>
        <p>
          <strong>Incident response management</strong> — Security incidents are logged and reported to
          appropriate bodies and persons. Employees inform supervisors immediately of security incidents.
        </p>
        <p>
          <strong>Privacy by design / privacy by default</strong> — Only data necessary for business
          activities are collected and processed. Automated data collection and processing procedures are
          designed to collect only necessary data.
        </p>
        <p>
          <strong>Processor control (outsourcing to third parties)</strong> — No processing on behalf of
          the Client occurs without appropriate instruction, e.g. clear contract design, formalized order
          management, strict vendor selection, due diligence, follow-up checks.
        </p>
        <p>
          <strong>Adaptations and changes</strong> — The Contractor may change security measures provided
          the contractually agreed level of protection is not undermined.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='annex-3'
        title='Annex 3 to the Data Processing Agreement – List of sub-processors pursuant to Section 8 DPA'
        order={2}
      >
        <p>Version 1.0 of March 3, 2025</p>
        <p>
          For performance of the Contract(s), the Contractor may engage the following sub-processors
          pursuant to Section 8 of the DPA for the services indicated below:
        </p>
        <SubProcessorsTable
          rows={subProcessorsEn}
          headers={{
            company: 'Company, legal form',
            address: 'Address',
            processingLocation: 'Processing location',
            serviceType: 'Type of service',
          }}
        />
      </LegalDocumentSection>
    </>
  )
}
