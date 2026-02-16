import type { TocLink } from '../PrivacyLayout'
import { LegalDocumentSection } from '../LegalDocumentSection'

export const agbMetaEn = {
  title: 'General Terms and Conditions of EduTime',
  tocLabel: 'Table of Contents',
  meta: {
    version: 'Version 1.0',
    lastUpdated: 'March 3, 2025',
  },
}

export const tocLinksEn: TocLink[] = [
  { id: 'anwendungsbereich', label: '1. Scope of Application', order: 1 },
  { id: 'umfang-der-nutzung', label: '2. Scope of Use', order: 1 },
  {
    id: 'testversion-und-kostenloser-leistungsumfang',
    label: '3. Trial Version and Free Scope of Services',
    order: 1,
  },
  { id: 'daten-datenspeicherung-und-backup', label: '4. Data, Data Storage, and Backup', order: 1 },
  {
    id: 'verantwortung-fuer-inhalte',
    label: '5. Responsibility for Content and Lawful Use',
    order: 1,
  },
  {
    id: 'sperrung-bei-unzulaessigen-inhalten',
    label: '6. Suspension for Impermissible Content',
    order: 1,
  },
  { id: 'wahrung-der-schutzrechte', label: '7. Protection of Proprietary Rights', order: 1 },
  { id: 'mitwirkungspflichten', label: "8. Customer's Cooperation Obligations", order: 1 },
  {
    id: 'verguetung-und-zahlungsbedingungen',
    label: '9. Remuneration and Payment Terms',
    order: 1,
  },
  {
    id: 'mehr-oder-mindernutzung',
    label: '10. Excess or Reduced Usage and Audit Rights',
    order: 1,
  },
  { id: 'leistungserbringung', label: '11. Service Delivery', order: 1 },
  { id: 'gewaehrleistung', label: '12. Warranty for Paid Scope of Services', order: 1 },
  { id: 'haftung', label: '13. Liability', order: 1 },
  {
    id: 'vertragsschluss-dauer-beendigung',
    label: '14. Contract Formation, Duration, and Termination',
    order: 1,
  },
  {
    id: 'geheimhaltung-und-datenschutz',
    label: '15. Confidentiality and Data Protection',
    order: 1,
  },
  {
    id: 'verletzung-geheimhaltung',
    label: '16. Breach of Confidentiality and License Grant',
    order: 1,
  },
  { id: 'hoehere-gewalt', label: '17. Force Majeure', order: 1 },
  { id: 'schlussbestimmungen', label: '18. Final Provisions', order: 1 },
  { id: 'rechtswahl-und-gerichtsstand', label: '19. Choice of Law and Jurisdiction', order: 1 },
]

/**
 * English translation of the AGB (Allgemeine Geschäftsbedingungen / General Terms and Conditions).
 * Structure mirrors AGBDe.tsx; all section titles and content are professionally translated.
 */
export function AGBEn() {
  return (
    <>
      <LegalDocumentSection id='anwendungsbereich' title='1. Scope of Application' order={2}>
        <p>
          EduTime GmbH, c/o Tim Ogi, Bienenstrasse 8, 3018 Bern (hereinafter «EduTime»), makes
          available to the customer on the basis of an individual contract (hereinafter also «SaaS
          individual contract») and these General Terms and Conditions (hereinafter «GTC», including
          their integral contract components, collectively hereinafter «Contract») for the duration
          of the contract the usage rights described in the contract to the EduTime software
          solution (hereinafter «SaaS software») together with the associated documentation on the
          server infrastructure of EduTime or of the platform provider engaged by EduTime for use by
          the customer by remote access via the Internet, and provides the further services agreed
          in the contract in connection with this use of the SaaS software (such as the provision of
          storage space and support and maintenance) in the sense of a cloud service (hereinafter
          collectively «SaaS service»).
        </p>
        <p>
          The customer's purchasing and business terms and conditions do not apply, even if EduTime
          does not expressly object to them. In particular, these GTC also apply when the customer's
          orders or counter-confirmations refer to its own business or purchasing terms and
          conditions. Deviations from these GTC are only valid if they are agreed in writing between
          the parties with reference to a deviation from these GTC or confirmed in writing by
          EduTime.
        </p>
        <p>
          These GTC alone do not create any mutual obligations to supply, pay, accept, or contract.
          Any claim of the customer to delivery or performance in relation to the scope of
          application of the GTC requires a concluded SaaS individual contract. The presentation of
          products and services on EduTime's websites or in price lists does not constitute a
          legally binding contractual offer by EduTime. Unless otherwise stated, offers from EduTime
          are valid for ten (10) days.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='umfang-der-nutzung' title='2. Scope of Use' order={2}>
        <p>
          EduTime grants the customer, to the extent of the SaaS individual contract, the use of the
          SaaS software specified therein in the agreed scope of services (e.g. number of users) via
          the Internet. For this purpose, EduTime makes the SaaS software available on a server
          platform to which the customer can access via the Internet and thus use the SaaS software.
          The usage rights in third-party SaaS software created by others that EduTime grants to the
          customer are limited in scope to those usage rights that third parties have granted to
          EduTime.
        </p>
        <p>
          EduTime's SaaS service is not authorised for use in safety-critical or other applications
          whose failure could lead to personal injury, death, or catastrophic property damage. If
          the customer uses the SaaS service for such applications, the customer acknowledges that
          such use is at the customer's sole risk. The customer undertakes to indemnify, defend, and
          hold EduTime harmless from all costs and liabilities arising from or in connection with
          such use.
        </p>
        <p>
          Under these GTC in conjunction with the corresponding SaaS individual contract, EduTime
          grants the customer the non-exclusive, non-transferable, non-sublicensable, and paid right
          to use the SaaS software in accordance with the provisions of these GTC and the
          corresponding SaaS individual contract after full payment of the applicable usage fees for
          the customer's own purposes. No acquisition of rights in the SaaS software beyond this is
          associated with this grant of usage rights. The customer is expressly not permitted to
          rent and/or transfer the SaaS service or parts thereof to third parties.
        </p>
        <p>
          The customer is obliged to ensure that all access, use, and consumption by its users (i.e.
          natural persons authorised to use the SaaS service for the benefit of the customer and who
          have unique user identifiers and passwords for the SaaS service) are subject to and in
          compliance with this contract. The customer may grant its users the right to access and
          use the SaaS service or to obtain the services acquired under a SaaS individual contract;
          this is subject to the condition that all such access, use, and consumption by users are
          subject to the contract and that the customer is at all times liable for the performance
          of this contract by its users.
        </p>
        <p>
          Unless otherwise agreed in the SaaS individual contract, EduTime undertakes to provide the
          following support services for the SaaS service on business days, from 08:00 to 17:00,
          excluding official and local public holidays at EduTime's seat (services outside these
          hours are charged separately):
        </p>
        <ul>
          <li>
            Email support for the customer for application issues in connection with the SaaS
            service;
          </li>
          <li>Acceptance and handling of the customer's error reports;</li>
          <li>Troubleshooting for disruptions to the SaaS service;</li>
          <li>Updates to the online user documentation.</li>
        </ul>
        <p>
          The customer is obliged to report problems with the SaaS service, such as malfunctions,
          bugs, or errors in the SaaS software, as well as any known unauthorised use of the SaaS
          service, in a duly documented manner by email (info@edutime.ch) or via the issue tool made
          available by EduTime at a specified URL. Remediation of defects or patching of the SaaS
          software or the associated documentation is carried out by EduTime to the best of its
          knowledge. Additional support services are invoiced to the customer at EduTime's
          then-current rates.
        </p>
        <p>
          The current technical requirements for the customer's use/network connection are set out
          in the SaaS individual contract. The technical requirements valid at the time of contract
          conclusion mentioned therein may be unilaterally adapted by EduTime at any time to the
          state of the art, whereby EduTime informs the customer of material changes in compliance
          with a reasonable period (as a rule one month in advance), in particular by email or on a
          suitable website. The customer undertakes to comply with the technical requirements at all
          times and to ensure that users are familiar with the proper operation of the SaaS
          software.
        </p>
        <p>
          EduTime is entitled at any time to further develop the SaaS service, in particular the
          performance features of the SaaS software, and to adapt, restrict, or discontinue the
          provision of individual services in order to take account of technical progress and
          changed legal framework conditions. Changes that materially restrict the scope of services
          for the customer are communicated by EduTime to the customer in advance in compliance with
          a reasonable notice period in writing, by email, or on a suitable website. If use of the
          updated SaaS service becomes unreasonable for the customer, the customer may terminate the
          SaaS service extraordinarily within one (1) month after the update of the SaaS service,
          subject to a notice period of 20 days to the end of a month, by notice in writing (cf.
          Clause 17.3).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='testversion-und-kostenloser-leistungsumfang'
        title='3. Trial Version and Free Scope of Services'
        order={2}
      >
        <p>
          To the extent the customer uses the SaaS service or the SaaS software as a trial version,
          EduTime grants the customer a licence for the sole purpose of testing and evaluating and
          exclusively for internal, non-production purposes and, unless expressly stated otherwise,
          for a limited period of 30 days («trial version»).
        </p>
        <p>
          The trial version and the SaaS software with a free scope of services chosen by the
          customer are made available «as is» to the exclusion of any warranty as to quality or
          title. EduTime expressly disclaims all implied or statutory guarantees and representations
          (e.g. as to fitness for purpose, operating conditions, functionality, suitability, etc.).
          The customer has no claim to support, maintenance, or care services.
        </p>
        <p>
          If the trial version is not changed to any paid scope of services during the granted trial
          period, all of the customer's data will be deleted upon expiry of the trial version
          licence in accordance with EduTime's deletion cycles.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='daten-datenspeicherung-und-backup'
        title='4. Data, Data Storage, and Backup'
        order={2}
      >
        <p>
          EduTime makes storage capacity on EduTime's server infrastructure available to the
          customer for the storage of data in connection with the use of the SaaS software in
          accordance with the SaaS individual contract.
        </p>
        <p>
          The data belong to the legal sphere of the customer using the SaaS service, even if they
          are stored locally with EduTime. The customer is solely responsible for the storage and
          processing of the data. The customer in particular strictly complies with the provisions
          of the applicable data protection law when collecting and processing personal data.
        </p>
        <p>
          EduTime enables the customer to download its data stored on the server infrastructure
          during the contract term and within thirty (30) days after contract termination using a
          standardised procedure made available by EduTime. EduTime gives no warranty as to the
          usability of downloaded data on other systems. EduTime is entitled to delete the
          customer's data stored with EduTime after contract termination in the course of usual
          deletion cycles, unless EduTime is obliged to retain them under mandatory law.
        </p>
        <p>
          EduTime takes appropriate measures against data loss in the event of server infrastructure
          failures and to prevent unauthorised access by third parties to the customer's data. For
          this purpose, EduTime performs regular backups (at least once per day) and protects the
          customer's access data stored on the server with appropriate means corresponding to the
          technical standard against unauthorised access.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='verantwortung-fuer-inhalte'
        title='5. Responsibility for Content and Lawful Use'
        order={2}
      >
        <p>
          The customer undertakes to process only permissible content with the SaaS service. In
          particular, content is impermissible if it infringes or endangers rights of EduTime or
          third parties, in particular intellectual property rights in the broad sense (e.g.
          copyright or trademark rights) or personality rights, or business reputation; furthermore,
          all content that constitutes criminal offences (in particular in the areas of pornography,
          depiction of violence, racism, trade secrets, defamation, and fraud) is impermissible
          (hereinafter collectively «Impermissible Content»). Particularly resource-intensive use,
          i.e. use that may impair the normal operation and security of EduTime's server
          infrastructure and the use of the server infrastructure by other customers, is only
          permitted with prior consent from EduTime. EduTime has full discretion as to whether to
          grant consent and may revoke any consent granted for reasons of securing the operation of
          the server infrastructure at any time with immediate effect.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='sperrung-bei-unzulaessigen-inhalten'
        title='6. Suspension for Impermissible Content'
        order={2}
      >
        <p>EduTime is not obliged to monitor the content contained in the SaaS service.</p>
        <p>
          EduTime is entitled to block access to the SaaS service in whole or in part and to suspend
          or discontinue the services temporarily or permanently (i) if EduTime is required to do so
          by a court or authority, or (ii) could otherwise become legally liable or subject to
          criminal penalty, or (iii) if a spot check reveals concrete indications or suspicion of
          the making available of Impermissible Content or of other unlawful or contract-violating
          use. EduTime is entitled to invoice the customer for the effort incurred in connection
          with blockings and other measures. Furthermore, the customer undertakes to indemnify
          EduTime in full if a third party seeks to hold EduTime liable in connection with the
          making available of Impermissible Content via the SaaS service. This also includes
          reimbursement of the costs of legal representation of EduTime. The assertion of further
          damage remains reserved. EduTime may demand from the customer security for the advance
          coverage of the effort and further damage. If this security is not paid or the customer
          does not comply with the requests made in connection with the measures taken, EduTime may
          suspend the provision of the SaaS service or terminate the contract with the customer
          without notice.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wahrung-der-schutzrechte'
        title='7. Protection of Proprietary Rights'
        order={2}
      >
        <p>
          The customer acknowledges EduTime's proprietary rights, in particular copyright, as right
          holder in the SaaS software, refrains during the term of the grant of the SaaS software to
          the customer from any attack on the existence and scope of these rights, and takes all
          measures in accordance with EduTime's instructions to preserve EduTime's rights and
          supports EduTime to a reasonable extent in the defence of the proprietary rights.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='mitwirkungspflichten'
        title="8. Customer's Cooperation Obligations"
        order={2}
      >
        <p>
          The customer is responsible for providing and maintaining the end devices required for use
          of the SaaS service, the data connection for access to the SaaS software (e.g. hardware
          and operating system, network devices, leased line or Internet connection, etc.) and
          ensures that their configuration and technical standard comply with EduTime's then-current
          requirements (currently: HTML5 Internet browsers such as Google Chrome in their latest
          version with third-party cookies and scripts enabled; with other browsers/versions it may
          not be possible to access the SaaS service or only with limited functionality). When using
          the SaaS service by itself or by users designated by it, the customer observes the
          specifications in any user documentation and protects the access data from unauthorised
          access. All actions carried out using the customer's access data and passwords, such as
          communications and changes to user data or other settings, are attributed by EduTime to
          the customer.
        </p>
        <p>
          Before transmitting data and information to EduTime, the customer shall check them for
          viruses and use virus and malware protection programmes corresponding to the state of the
          art.
        </p>
        <p>
          In the event of serious breaches of the terms of use of the SaaS service (by the customer
          itself or by users designated by it) or of the customer's cooperation obligations, EduTime
          is entitled to block the customer's access to the SaaS service in whole or in part. In the
          event of unauthorised granting of use, the customer shall provide EduTime upon request
          without delay with all information for the assertion of claims against the user, in
          particular the user's name and address.
        </p>
        <p>
          The customer takes appropriate precautions for the case that the SaaS software does not
          operate properly in whole or in part (e.g. through data backup, fault diagnosis, regular
          checking of results).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='verguetung-und-zahlungsbedingungen'
        title='9. Remuneration and Payment Terms'
        order={2}
      >
        <p>
          The remuneration payable by the customer for the SaaS service is set out in the SaaS
          individual contract.
        </p>
        <p>
          EduTime is entitled to unilaterally adjust the remuneration agreed in the SaaS individual
          contract with a notice period of two (2) months to the start of a new contract period. If
          the customer does not agree with the price adjustment, the customer may terminate the SaaS
          service subject to a notice period of 20 days to the end of the contract period by notice
          in writing (cf. Clause 17.3).
        </p>
        <p>
          All prices are exclusive of the applicable value added tax. EduTime generally invoices the
          remuneration due for the respective contract period in advance. Invoices are due for
          payment within thirty (30) days of the invoice date without deduction.
        </p>
        <p>
          The customer is in default without further reminder upon expiry of the payment period.
          EduTime is entitled to charge statutory default interest and expenses from the time
          default commences. If EduTime's payment claims appear to be at risk, services may be
          suspended or made dependent on advance payment.
        </p>
        <p>
          Should the customer not fully comply with its payment obligations in accordance with the
          provisions of this Clause 9, EduTime reserves the right to temporarily block the
          customer's data stored on EduTime's server infrastructure until full payment of the due
          remuneration.
        </p>
        <p>The customer may only set off against undisputed or finally adjudicated claims.</p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='mehr-oder-mindernutzung'
        title='10. Excess or Reduced Usage and Audit Rights'
        order={2}
      >
        <p>
          EduTime has the right to verify on a monthly and annual basis the actual extent of use of
          the scope of services of the SaaS service agreed in the SaaS individual contract and to
          claim remuneration for any excess use beyond the licensed scope of services.
        </p>
        <p>
          EduTime has the right to verify compliance with the provisions on proper use and
          protection of the SaaS software or the SaaS service in the customer's operations by means
          of inspections or audits itself or through an appointed third party (e.g. an auditing
          firm), while respecting the customer's business and operational secrets.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='leistungserbringung' title='11. Service Delivery' order={2}>
        <p>
          EduTime is entitled to engage third parties as sub-contractors; EduTime is responsible for
          their careful selection, instruction, and supervision. EduTime may also provide services
          of the same or similar kind for other customers.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='gewaehrleistung'
        title='12. Warranty for Paid Scope of Services'
        order={2}
      >
        <p>
          EduTime warrants the characteristics of the SaaS service or the SaaS software that it has
          expressly warranted in writing.
        </p>
        <p>
          The customer acknowledges that access to the SaaS service also depends on factors outside
          EduTime's control, such as network access to the platform provider on whose systems the
          SaaS software is operated, and that EduTime therefore, without prejudice to the warranty
          mentioned in the preceding paragraph, does not guarantee that the SaaS service is
          available without interruption. Furthermore, EduTime cannot guarantee response times,
          recovery times, or minimum monthly or annual availability, nor that the SaaS software and
          the platform provider's data centre or its server platform are free of defects or can be
          used without interruption. In particular, EduTime is entitled to block access at any time
          for urgent maintenance work or in the event of exceptional security risks.
        </p>
        <p>
          For defects in the SaaS software that are reported by the customer without delay and in
          documented form upon discovery and that are reproducible, EduTime will at its option
          remedy the defect, provide the customer with a corrected software version, or indicate
          reasonable workarounds.
        </p>
        <p>
          If EduTime, despite repeated efforts, fails to remedy a defect that has been duly reported
          by the customer and is reproducible, and the usability of the SaaS software in relation to
          the description of the scope of functions is thereby materially reduced or excluded, the
          customer shall set a reasonable grace period twice in writing and, after its unsuccessful
          expiry, has an extraordinary right to terminate the SaaS service. For other defects, the
          customer has the right to a reduction in or partial refund of the remuneration
          corresponding to the diminution in value for the relevant part of the SaaS software. Any
          further warranty by EduTime is hereby expressly excluded.
        </p>
        <p>
          The warranty period is six (6) months from the first paid provision of the SaaS software
          by EduTime.
        </p>
        <p>
          To the extent a reported defect is not demonstrable or not attributable to EduTime, the
          customer shall reimburse EduTime for the expenses incurred as a result of the fault
          investigation. The customer shall in particular also reimburse the additional effort at
          EduTime in remedying defects that arises because the customer has not properly fulfilled
          its cooperation obligations, has operated the SaaS service or the SaaS software
          improperly, or has not availed itself of services recommended by EduTime.
        </p>
        <p>
          EduTime furthermore warrants that the grant of the agreed usage rights to the customer is
          not opposed by any rights of third parties. If a third party asserts claims that oppose
          the exercise of the contractually granted usage rights, the customer shall inform EduTime
          without delay in writing and in full. If the customer discontinues use of the SaaS service
          or the SaaS software for reasons of mitigation of damage or other important reasons, the
          customer is obliged to inform the third party that the discontinuation of use does not
          constitute an admission of the alleged infringement of proprietary rights. The customer
          hereby authorises EduTime to conduct the dispute with the third party in and out of court
          alone. If EduTime makes use of this authorisation, the customer may not acknowledge the
          third party's claims without EduTime's consent, and EduTime is obliged to defend the
          claims at its own cost. EduTime indemnifies the customer against finally imposed costs and
          claims for damages. The provisions of this paragraph apply irrespective of the expiry of
          the warranty period under Clause 12.5.
        </p>
        <p>
          For proven defects in title, EduTime performs warranty by subsequent performance by
          providing the customer with a legally unimpeachable possibility of use of the delivered
          SaaS service or, at EduTime's option, of exchanged or modified equivalent SaaS software,
          or, if the foregoing is not within EduTime's reasonable possibilities, by taking back the
          relevant component of the SaaS software and refunding to the customer the remuneration
          already paid, less an appropriate compensation for the use that has occurred, on a pro
          rata basis. The customer must accept a new programme version unless this would cause
          unreasonable adaptation and conversion problems for the customer.
        </p>
        <p>
          The warranty rights under this Clause 12 do not apply to SaaS software with a free scope
          of services (cf. Clause 3 above).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='haftung' title='13. Liability' order={2}>
        <p>
          Each party is liable to the other party for damage arising from a contract between them in
          the case of gross negligence and intent, as well as in the case of death and personal
          injury, without limitation.
        </p>
        <p>
          Unless otherwise provided in Clause 13.1 above, the total liability of the parties for
          direct damage arising from slight negligence in connection with a contract between the
          parties is limited per contract and per year to a maximum of 50% of the remuneration under
          the respective contract, but at most CHF 10,000.00.
        </p>
        <p>
          Any liability of EduTime or its auxiliaries for other or further claims and damage, in
          particular claims for compensation for indirect or consequential damage, for damage
          resulting from defects, or for claims of third parties, lost profit, unrealised savings,
          or loss of earnings, as well as data loss—on whatever legal basis—is expressly excluded.
          EduTime is also not liable for damage caused by unauthorised interference by third parties
          with EduTime's server infrastructure and other systems. The risk of such damage is borne
          by the customer alone. This includes, for example, interference through computer viruses,
          ransomware, or DDoS attacks. The exclusion of liability also extends to damage suffered by
          the customer as a result of measures to ward off such interference. The dates provided for
          performance are extended accordingly by the duration of the impact of circumstances not
          attributable to EduTime.
        </p>
        <p>Mandatory statutory liability remains reserved.</p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='vertragsschluss-dauer-beendigung'
        title='14. Contract Formation, Duration, and Termination'
        order={2}
      >
        <p>
          The contract enters into force upon order confirmation by EduTime (SaaS individual
          contract) and applies for an initial contract term of one year, unless otherwise agreed in
          the SaaS individual contract. The contract enters into force at the latest, however, upon
          EduTime's provision of services to the customer. The contract subsequently renews
          automatically by one further year each time, unless it is terminated by either party in
          compliance with a notice period of three (3) months before the end of the contract term in
          writing or via an electronic function that EduTime may explicitly make available to the
          customer.
        </p>
        <p>
          Extended support, maintenance, and care services for the SaaS service commence upon order
          confirmation by EduTime (individual contract), whereby the contract term is aligned with
          that for the SaaS service. The provisions in Clause 14.1 apply to automatic renewal and
          termination.
        </p>
        <p>
          Acceptances by the customer that contain extensions, restrictions, or other changes to
          EduTime's respective contractual offer are deemed a rejection of EduTime's original
          contractual offer and only result in the conclusion of a contract if they are expressly
          confirmed in writing by EduTime. Acceptances by the customer that are made after expiry of
          an acceptance or offer validity period defined in the contractual offer are deemed a new
          contractual offer by the customer, which only becomes effective if EduTime expressly
          confirms acceptance in writing.
        </p>
        <p>
          If the customer repeatedly or in a gross manner breaches an essential contract provision,
          in particular if it misuses the SaaS service or SaaS software for unlawful purposes or if
          EduTime is threatened with reputational damage, EduTime is entitled to terminate the
          contract without notice. The customer owes EduTime the remuneration due until ordinary
          contract termination as well as compensation for all additional costs incurred by EduTime
          in connection with the termination without notice. EduTime may also terminate the contract
          with the customer without notice if proceedings for bankruptcy or insolvency have been
          initiated against the customer or if it otherwise becomes apparent that the customer can
          no longer meet its payment obligations, and if the customer does not pay in advance the
          costs for the next contract term or provide corresponding security before the end of the
          contract term.
        </p>
        <p>
          After termination of the corresponding contract, the customer may no longer use the SaaS
          service of EduTime.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='geheimhaltung-und-datenschutz'
        title='15. Confidentiality and Data Protection'
        order={2}
      >
        <p>
          The parties undertake to treat all information obtained about confidential information and
          business secrets of the respective other party as confidential. The obligation of
          confidentiality applies for an unlimited period for as long as an interest in
          confidentiality exists.
        </p>
        <p>
          The customer may only make the SaaS service accessible to employees and other third
          parties to the extent necessary for the exercise of the usage rights granted by the
          corresponding contract and these GTC. Otherwise, the customer keeps access to and the
          contents of the SaaS service confidential and will instruct all persons to whom access to
          the SaaS service is granted about EduTime's rights in the SaaS service and the obligation
          to keep them confidential, and will oblige such persons to comply with the obligation of
          confidentiality. The obligation of confidentiality does not apply to information that is
          generally accessible, was demonstrably already known to the parties, was independently
          developed by them, or was acquired from authorised third parties.
        </p>
        <p>
          The customer acknowledges that contract performance may involve the collection and
          processing of personal data within the meaning of the applicable Swiss data protection
          law, and that EduTime may also carry out a transfer of data abroad in the course of
          contract performance. EduTime collects and processes the customer's personal data
          exclusively as described in EduTime's data protection statement. The current version of
          the data protection statement is published on EduTime's website.
        </p>
        <p>
          EduTime and the customer ensure data protection and data security in their respective
          sphere of influence. To the extent EduTime processes personal data for the customer as a
          processor within the meaning of the applicable data protection law, EduTime does so
          exclusively in the manner specified in the data processing agreement («DPA») and
          exclusively for the customer's purposes and for the performance of the contract. In this
          case, the customer is solely responsible for determining the purpose and means of the
          processing or use of personal data by EduTime under the contract, including in particular
          ensuring that such processing does not violate applicable data protection laws.
        </p>
        <p>
          To the extent EduTime processes the customer's personal data as a processor, the current
          version of the DPA, which is provided upon contract conclusion, forms part of these GTC.
        </p>
        <p>
          EduTime is entitled to include the customer in its official customer list and thereby in
          particular to advertise on EduTime's website. Further reference details require the prior
          consent of the customer.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='verletzung-geheimhaltung'
        title='16. Breach of Confidentiality and License Grant'
        order={2}
      >
        <p>
          Should the customer or its employees, auxiliaries, or designated users intentionally or
          with gross negligence breach the provisions on the use and protection of the SaaS service
          or the SaaS software, the customer owes EduTime for each case of breach a contractual
          penalty in the amount of three times the full gross licence fee due for the proper use of
          the SaaS service, but at least CHF 10,000.00. The assertion of further damage remains
          reserved.
        </p>
        <p>
          Payment of this contractual penalty does not release the customer from its contractual
          obligations. EduTime is in particular entitled at any time to demand the removal of the
          unlawful situation or the contract breach or, in the event of repeated breach of the terms
          of use, to withdraw the granted usage rights from the customer without refund of the
          licence fees paid by written notice. In the event of withdrawal of the usage rights, the
          customer undertakes to refrain from using the SaaS service without delay.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='hoehere-gewalt' title='17. Force Majeure' order={2}>
        <p>
          The parties are released from the obligation to perform under this contract for as long
          and to the extent that non-performance of obligations is due to the occurrence of
          circumstances of force majeure. Circumstances of force majeure include, for example, war,
          strikes, unrest, expropriation, pandemics and epidemics, storm, flooding, and other
          natural disasters, as well as other circumstances not attributable to the parties (e.g.
          power shortages or rationing). Each party shall inform the other party of the occurrence
          of a case of force majeure without delay and in writing.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='schlussbestimmungen' title='18. Final Provisions' order={2}>
        <p>
          EduTime reserves the right to make subsequent changes or additions to the GTC. In the
          event of changes and additions that may have an adverse effect on the customer, EduTime
          will inform the customer in writing, by email, or on a suitable maintenance portal. The
          new GTC become part of the contract unless the customer objects within 14 days of becoming
          aware of them. The current version is published on EduTime's website at
          https://edutime.ch/docs/agb.
        </p>
        <p>
          In the event of discrepancies or contradictions, the provisions of any individual
          contracts take precedence over these GTC. The current version of the data processing
          agreement also takes precedence over these GTC where it contains a deviating or
          contradictory provision regarding the processing of personal data.
        </p>
        <p>
          All notices must, unless this contract or the law requires a stricter form, be sent in
          writing, electronically, or by email to the (email) addresses specified by the customer in
          the SaaS individual contract or specified on EduTime's website. The customer is obliged to
          inform EduTime of address changes (including email) without delay, or to update the
          customer profile in the SaaS service, failing which notices are deemed to have been
          effectively received at the last notified address.
        </p>
        <p>
          The written form is (apart from terminations) also satisfied by signatures transmitted
          electronically, by post, courier, or email (e.g. Skribble, DocuSign, AdobeSign, or by an
          electronic scan of the signature).
        </p>
        <p>
          Rights under the contract or these GTC may only be assigned by the customer with prior
          written consent of EduTime. EduTime is free to transfer the contract in whole or in part
          to third parties.
        </p>
        <p>
          Should a provision of the contract or these GTC be or become null or invalid, the
          remaining provisions continue to apply. The null or invalid provision shall in that case
          be replaced by a valid provision that comes as close as legally possible in its economic
          effect to that of the invalid provision.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='rechtswahl-und-gerichtsstand'
        title='19. Choice of Law and Jurisdiction'
        order={2}
      >
        <p>
          These GTC and the contracts between the customer and EduTime are governed exclusively by
          Swiss law, to the exclusion of the United Nations Convention on Contracts for the
          International Sale of Goods of 11 April 1980 and of the rules on conflict of laws.
        </p>
        <p>
          The exclusive place of jurisdiction is the ordinary courts at EduTime's seat in
          Switzerland. EduTime may also bring proceedings against the customer at the customer's
          seat.
        </p>
      </LegalDocumentSection>
    </>
  )
}
