import { LegalDocumentSection } from '../LegalDocumentSection'
import type { TocLink } from '../PrivacyLayout'

export const termsMetaEn = {
  title: 'Terms of Use of EduTime',
  tocLabel: 'Table of Contents',
  meta: {
    version: 'Version 1.0',
    lastUpdated: 'March 3, 2025',
  },
}

export const tocLinksEn: TocLink[] = [
  {
    id: 'anwendungsbereich-und-nutzungsvoraussetzungen',
    label: '1. Scope of Application and Prerequisites for Use',
    order: 1,
  },
  { id: 'umfang-der-nutzung', label: '2. Scope of Use', order: 1 },
  {
    id: 'testversion-und-kostenloser-leistungsumfang',
    label: '3. Trial Version and Free Scope of Services',
    order: 1,
  },
  {
    id: 'daten-datenspeicherung-und-backup',
    label: '4. Data, Data Storage, and Backup',
    order: 1,
  },
  {
    id: 'verantwortung-fuer-inhalte-und-rechtmaessige-nutzung',
    label: '5. Responsibility for Content and Lawful Use',
    order: 1,
  },
  {
    id: 'sperrung-bei-unzulaessiger-nutzung',
    label: '6. Suspension in Case of Unauthorized Use',
    order: 1,
  },
  { id: 'geistiges-eigentum', label: '7. Intellectual Property', order: 1 },
  {
    id: 'gewaehrleistung-und-haftung',
    label: '8. Warranty and Liability',
    order: 1,
  },
  {
    id: 'geheimhaltung-und-datenschutz',
    label: '9. Confidentiality and Data Protection',
    order: 1,
  },
  { id: 'aktualisierungen', label: '10. Updates', order: 1 },
  {
    id: 'gerichtsstand-und-anwendbares-recht',
    label: '11. Jurisdiction and Applicable Law',
    order: 1,
  },
]

/**
 * English version of the Terms of Use.
 *
 * To update this content, edit the JSX below directly.
 */
export function TermsEn() {
  return (
    <>
      <LegalDocumentSection
        id='anwendungsbereich-und-nutzungsvoraussetzungen'
        title='1. Scope of Application and Prerequisites for Use'
        order={2}
      >
        <p>
          EduTime GmbH, c/o Tim Ogi, Bienenstrasse 8, 3018 Bern (hereinafter &quot;EduTime&quot;),
          enables users under the following conditions to use EduTime&apos;s online services via (i)
          the browser-based web application &quot;EduTime&quot; (hereinafter &quot;Web App&quot;)
          and/or via (ii) the mobile device application &quot;EduTime&quot; (hereinafter
          &quot;App&quot;; collectively hereinafter &quot;Services&quot;).
        </p>
        <p>
          Any contractual relationship regarding the Services exists between EduTime and the person
          or organization that has entered into a contract based on EduTime&apos;s General Terms and
          Conditions. EduTime&apos;s contractual partner is hereinafter referred to as
          &quot;Customer&quot;.
        </p>
        <p>
          Only natural persons aged 14 years or older with residence in Switzerland, with a
          registration for the Services, and who have (i) directly under a contract with EduTime or
          (ii) indirectly from a Customer of EduTime received authorization to use the Services
          (hereinafter &quot;User&quot;), are entitled to download the App, access the Services,
          and/or use the Services.
        </p>
        <p>
          Within the scope of these Terms of Use, the terms &quot;you&quot;, &quot;your&quot; and
          similar refer to the User as defined above in Section 1.3.
        </p>
        <p>
          When you use a Service, these Terms of Use apply to you, regardless of whether you are a
          Customer of EduTime or not. You undertake to comply with these Terms of Use and are liable
          for violations. You may not assist or involve others in a manner that would violate these
          Terms of Use. EduTime will enforce and ensure compliance with these Terms of Use by
          methods that EduTime considers appropriate. In the event of violations of these Terms of
          Use, EduTime may suspend or terminate your use of the Services.
        </p>
        <p>
          These Terms of Use alone do not create any mutual obligations to deliver, pay, accept, or
          contract. A claim for delivery or performance within the scope of these Terms of Use
          requires a concluded contract for the Services. The presentation of products and services
          on EduTime&apos;s websites, in the Services, or in EduTime&apos;s price lists does not
          constitute a legally binding contractual offer by EduTime.
        </p>
        <p>
          In the event of conflicts between these Terms of Use and the contract concluded with the
          Customer, the provisions of the contract shall prevail, unless otherwise stipulated
          therein.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='umfang-der-nutzung' title='2. Scope of Use' order={2}>
        <p>
          The scope of functionalities available to you differs depending on whether you have a
          registration or not, or, if you have a registration, whether you have simultaneously
          entered into a contract with EduTime for the Services or have received authorization to
          use the Services through a Customer of EduTime.
        </p>
        <p>
          Under these Terms of Use in conjunction with the corresponding contract, EduTime grants
          the Customer and the Users a non-exclusive, non-transferable, non-sublicensable, and paid
          right to use the Services in accordance with the provisions of these Terms of Use and the
          corresponding contract upon full payment of the applicable usage fees for their own
          purposes. No further acquisition of rights to the Services is associated with this grant
          of usage rights. The usage rights granted by EduTime to third-party software are limited
          in scope to the usage rights that third parties have granted to EduTime.
        </p>
        <p>
          You are obligated to report problems with the Services, such as malfunctions, bugs, or
          errors, as well as any recognized unauthorized use of the Services, via email
          (info@edutime.ch) or through the issue tool provided by EduTime at a specific URL in an
          appropriately documented manner. Bug fixes or patching of the Services or the associated
          documentation will be performed by EduTime to the best of its knowledge.
        </p>
        <p>
          In order to access and use the Services, you must use the most current technologies, in
          particular the latest version of the internet browser and/or the operating system of your
          mobile device. When using older or uncommon technologies, you may not be able to access
          the Services or may only be able to use the Services to a limited extent.
        </p>
        <p>
          EduTime is entitled to further develop the Services, in particular the features of the
          Services, at any time and to adapt, restrict, or discontinue individual services and
          functions entirely or make them available only to a subset of Users, in order to account
          for technological progress and changed legal frameworks.
        </p>
        <p>
          You acknowledge that access to the Services also depends on factors beyond EduTime&apos;s
          control, such as network access to the server platform or the availability of the App
          through an official distribution platform, and that EduTime therefore does not guarantee
          that the Services will be available without interruptions. Furthermore, EduTime cannot
          guarantee response times, recovery times, or minimum monthly or annual availability, nor
          that the Services are error-free or can be used without interruption. In particular,
          EduTime is entitled to block access at any time for urgent maintenance work or in the
          event of extraordinary security risks.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='testversion-und-kostenloser-leistungsumfang'
        title='3. Trial Version and Free Scope of Services'
        order={2}
      >
        <p>
          To the extent that you use the Services as a trial version, EduTime grants you a license
          for the sole purpose of testing and evaluation and exclusively for internal purposes and,
          unless expressly stated otherwise, for a limited period of 30 days (&quot;Trial
          Version&quot;).
        </p>
        <p>
          The Trial Version and the Services with a free scope of services selected by you are
          provided &quot;as is&quot; without any warranties of merchantability or fitness. EduTime
          expressly disclaims all implied or statutory warranties and representations (e.g.,
          regarding operating conditions, functionalities, suitability, etc.). You have no
          entitlement to support, maintenance, or care services.
        </p>
        <p>
          If the Trial Version is not changed to a paid scope of services during the granted trial
          period, all your data will be deleted in accordance with EduTime&apos;s deletion cycles
          after the trial license expires.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='daten-datenspeicherung-und-backup'
        title='4. Data, Data Storage, and Backup'
        order={2}
      >
        <p>
          EduTime provides the User with storage capacity for data in connection with the use of the
          Services in accordance with the contract with the Customer.
        </p>
        <p>
          The data you enter belongs to your legal domain, even if it is physically stored at
          EduTime or a service provider. You are solely responsible for the storage and processing
          of data. You shall strictly comply with the provisions of the applicable data protection
          law, particularly when collecting and processing personal data.
        </p>
        <p>
          EduTime enables you to download the data stored on the server infrastructure by you during
          the contract term and within thirty (30) days after contract termination using a
          standardized procedure provided by EduTime. EduTime assumes no warranty for the usability
          of downloaded data on other systems. EduTime is entitled to delete your data stored at
          EduTime after contract termination in the course of regular deletion cycles, unless
          EduTime is obligated to retain such data under mandatory law.
        </p>
        <p>
          EduTime takes appropriate precautions against data loss in the event of Service outages
          and to prevent unauthorized access by third parties to your data. For this purpose,
          EduTime performs regular backups (at least once per day) and protects your stored access
          credentials with appropriate, state-of-the-art measures against unauthorized access.
        </p>
        <p>
          You shall take appropriate precautions in the event that the Services do not operate
          properly in whole or in part (e.g., through data backup, fault diagnosis, regular
          verification of results).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='verantwortung-fuer-inhalte-und-rechtmaessige-nutzung'
        title='5. Responsibility for Content and Lawful Use'
        order={2}
      >
        <p>
          You undertake to process only permissible content with the Services. Impermissible content
          includes, in particular, content that violates or endangers the rights of EduTime or third
          parties, in particular intellectual property rights in the broadest sense (e.g.,
          copyrights or trademark rights) or personality rights, or business reputation; also
          impermissible are all content that fulfills criminal offenses (namely in the areas of
          pornography, depiction of violence, racism, trade secrets, defamation, and fraud)
          (collectively hereinafter &quot;Impermissible Content&quot;). Particularly
          resource-intensive uses, i.e., uses that may impair the normal function and security of
          EduTime&apos;s Services and the use of the server infrastructure by other Customers and
          Users, are prohibited.
        </p>
        <p>
          Any actions taken using your access credentials and passwords, such as communications and
          changes to user data or other settings, are attributed to you by EduTime.
        </p>
        <p>EduTime is not obligated to monitor the content contained in the Services.</p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='sperrung-bei-unzulaessiger-nutzung'
        title='6. Suspension in Case of Unauthorized Use'
        order={2}
      >
        <p>
          EduTime is entitled to block your access to the Services in whole or in part and to
          suspend or discontinue the services temporarily or entirely, (i) if EduTime is required to
          do so by court or governmental order, or (ii) could otherwise become legally responsible
          or liable, or (iii) if a spot check reveals concrete indications or suspicion of making
          Impermissible Content accessible or of otherwise unlawful, contractually, or
          terms-of-use-violating use. EduTime is entitled to invoice the Customer and/or the User
          for the expenses incurred in connection with suspensions and other measures. Furthermore,
          you undertake to fully indemnify EduTime if a third party seeks to take legal action
          against EduTime in connection with the contractually or terms-of-use-violating use. This
          includes reimbursement of the costs of legal representation for EduTime. The right to
          claim further damages is reserved. EduTime may require a security deposit from you for the
          precautionary coverage of expenses and further damages. If this security deposit is not
          paid or if you do not comply with the instructions issued in connection with the measures
          taken, EduTime may suspend the provision of the Services or terminate the entire contract
          with the Customer without notice.
        </p>
        <p>
          In the event of unauthorized transfer of use, you shall immediately provide EduTime, upon
          request, with all information necessary for the assertion of claims against the user, in
          particular their name and address.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='geistiges-eigentum' title='7. Intellectual Property' order={2}>
        <p>
          All copyrights and other intellectual property rights, claims, and interests in the
          Services and in the information contained in or available through the Services (including
          trademarks, names, logos, images, designs, texts, etc., with the exception of user
          content) are and remain the exclusive property of EduTime or its licensors.
        </p>
        <p>
          You acknowledge the proprietary rights, in particular the copyright, of EduTime as the
          rights holder of the Services, shall refrain during the term of the usage authorization
          granted to the Customer and thus also to you from any attack on the existence and scope of
          these rights, and shall take all measures in accordance with EduTime&apos;s instructions
          to protect EduTime&apos;s rights and support EduTime to a reasonable extent in the defense
          of the proprietary rights.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='gewaehrleistung-und-haftung'
        title='8. Warranty and Liability'
        order={2}
      >
        <p>
          The Services are provided on an &quot;as available&quot; basis. EduTime makes no
          representations, guarantees, or warranties in connection with the Services, unless
          otherwise agreed in the contract with the Customer, in particular not for the functioning
          of the Services, for the availability or error-free nature of the Services and their
          features and functionalities, or for any information contained in the Services.
        </p>
        <p>
          You are liable to EduTime and, if you have received authorization to use the Services from
          a Customer, to that Customer without limitation for damages arising from the violation of
          these Terms of Use.
        </p>
        <p>
          You use the Services at your own risk and responsibility. EduTime&apos;s liability is
          limited to the extent agreed in the contract with the Customer. If there is no contract
          between the User and EduTime, EduTime shall not be liable except for mandatory statutory
          liability.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='geheimhaltung-und-datenschutz'
        title='9. Confidentiality and Data Protection'
        order={2}
      >
        <p>
          You and EduTime undertake to treat all acquired knowledge of confidential information and
          trade secrets of the other party as confidential. As long as a confidentiality interest
          exists, the confidentiality obligation applies without time limitation.
        </p>
        <p>
          You and EduTime shall ensure data protection and data security within their respective
          areas of influence.
        </p>
        <p>
          The processing of personal data by EduTime is carried out in accordance with
          EduTime&apos;s Privacy Policy, which is available on the website www.edutime.ch.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='aktualisierungen' title='10. Updates' order={2}>
        <p>
          EduTime reserves the right to make subsequent amendments or additions to these Terms of
          Use. In the event of changes and additions that may adversely affect you, EduTime will
          inform you in writing, by email, or on a suitable maintenance portal.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='gerichtsstand-und-anwendbares-recht'
        title='11. Jurisdiction and Applicable Law'
        order={2}
      >
        <p>
          For disputes arising from these Terms of Use, the place of jurisdiction shall be the
          domicile of the User or the registered office of EduTime.
        </p>
        <p>These Terms of Use are exclusively governed by Swiss law.</p>
      </LegalDocumentSection>
    </>
  )
}
