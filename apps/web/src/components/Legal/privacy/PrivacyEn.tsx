import { LegalDocumentSection } from '../LegalDocumentSection'
import type { TocLink } from '../PrivacyLayout'

export const privacyMetaEn = {
  title: 'EduTime Privacy Policy',
  tocLabel: 'Table of Contents',
  meta: {
    version: 'Version 1.0',
    lastUpdated: 'March 3, 2025',
  },
}

export const tocLinksEn: TocLink[] = [
  { id: 'inhalt', label: '1. Introduction to the Privacy Policy', order: 2 },
  { id: 'wer-ist-verantwortlich', label: '2. Who is responsible?', order: 2 },
  {
    id: 'welche-personendaten-bearbeiten-wir',
    label: '3. What personal data do we process?',
    order: 2,
  },
  { id: 'wie-erheben-wir-personendaten', label: '4. How do we collect personal data?', order: 2 },
  { id: 'ueberlassene-daten', label: '4.1. Provided Data', order: 3 },
  { id: 'erhaltene-daten', label: '4.2 Received Data', order: 3 },
  { id: 'erhobene-daten', label: '4.3 Collected Data', order: 3 },
  {
    id: 'fuer-welche-zwecke-bearbeiten-wir-personendaten',
    label: '5. For what purposes do we process personal data?',
    order: 2,
  },
  { id: 'warum-und-wie-teilen-wir-daten', label: '6. Why and how do we share data?', order: 2 },
  {
    id: 'warum-und-wie-geben-wir-daten-ins-ausland-weiter',
    label: '7. Why and how do we transfer data abroad?',
    order: 2,
  },
  { id: 'wie-setzen-wir-profiling-ein', label: '8. How do we use profiling?', order: 2 },
  {
    id: 'wie-treffen-wir-automatisierte-einzelentscheidungen',
    label: '9. How do we make automated individual decisions?',
    order: 2,
  },
  { id: 'wie-schuetzen-wir-daten', label: '10. How do we protect data?', order: 2 },
  { id: 'wie-lange-bewahren-wir-daten-auf', label: '11. How long do we retain data?', order: 2 },
  { id: 'cookie-richtlinie', label: '12. Cookie Policy', order: 2 },
  { id: 'was-sind-log-daten', label: '12.1 What are log data?', order: 3 },
  {
    id: 'was-sind-cookies-und-aehnliche-technologien',
    label: '12.2 What are cookies and similar technologies?',
    order: 3,
  },
  {
    id: 'wie-koennen-sie-cookies-und-aehnliche-technologien-deaktivieren',
    label: '12.3 How can you disable cookies and similar technologies?',
    order: 3,
  },
  {
    id: 'welche-cookies-und-aehnliche-technologien-setzen-wir-ein-und-wie-nutzen-wir-diese',
    label: '12.4 What cookies and similar technologies do we use and how do we use them?',
    order: 3,
  },
  { id: 'technisch-notwendige-cookies', label: '12.4.1 Technically necessary cookies', order: 3 },
  { id: 'erfolgs-und-reichweitenmessung', label: '12.4.2 Success and reach measurement', order: 3 },
  { id: 'bot-erkennung-und-blockierung', label: '12.4.3 Bot detection and blocking', order: 3 },
  {
    id: 'dienste-von-drittanbieter',
    label: '12.5 Third-party services (especially website plugins)',
    order: 3,
  },
  { id: 'welche-rechte-haben-sie', label: '13. What rights do you have?', order: 2 },
  { id: 'rechtsgrundlagen-nach-dsgvo', label: '14. Legal bases under GDPR', order: 2 },
  {
    id: 'wie-koennen-wir-diese-datenschutzerklaerung-aendern',
    label: '15. How can we change this privacy policy?',
    order: 2,
  },
]

export function PrivacyEn() {
  return (
    <>
      <LegalDocumentSection id='inhalt' title='1. Introduction to the Privacy Policy' order={2}>
        <p>
          With this privacy policy, we inform you about the personal data (data that can directly or
          indirectly identify you) we collect and process in connection with our activities. It
          applies to all processing activities related to personal data. We handle the received and
          collected data responsibly, in accordance with applicable legal provisions and this
          privacy policy. Our processing is primarily governed by the Swiss Data Protection Act
          (DSG).
        </p>
        <p>
          If we consider it useful, we may provide you with additional privacy policies or other
          legal documents (e.g., terms and conditions, usage and participation conditions) for
          specific or additional processing activities.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='wer-ist-verantwortlich' title='2. Who is responsible?' order={2}>
        <p>
          The responsible party for the processing of your personal data as described in this
          privacy policy, unless otherwise specified in individual cases, is the data controller
          under the Data Protection Act:
        </p>
        <p>
          EduTime GmbH
          <br />
          c/o Tim Ogi
          <br />
          Bienenstrasse 8<br />
          3018 Bern
        </p>
        <p>
          References to &apos;EduTime&apos;, &apos;we&apos;, or &apos;us&apos; in this privacy
          policy are references to the aforementioned data controller. If you have a data protection
          concern, you can contact us at any time, particularly at the following email address:
        </p>
        <p>privacy@edutime.ch (Subject: &apos;Data Protection&apos;).</p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='welche-personendaten-bearbeiten-wir'
        title='3. What personal data do we process?'
        order={2}
      >
        <p>We collect and process the following personal data from you:</p>
        <ul>
          <li>
            Master data, such as name, address, email address, phone number, gender, date of birth,
            social media profiles, photos, videos, relationship information (customer, service
            provider, etc.), history, official information (e.g., commercial register extracts,
            permits, etc.), information on subscribed newsletters or other advertising (including
            consents);
          </li>
          <li>
            Communication data, such as contact details, communication methods (phone, email, text
            messages, video messages, etc.), and the location, date, time, and content of the
            communication;
          </li>
          <li>Registration data, such as username, password, email address;</li>
          <li>Financial data, such as payment information, credit information;</li>
          <li>
            Contract data, data related to contract conclusion or contract processing, such as
            information on contract conclusion, acquired rights and claims, customer satisfaction
            information, purchase information (e.g., purchase date, location, time, history, and
            quantity, type, and value of goods/services);
          </li>
          <li>
            Technical data, such as IP address, operating system, date, time, geographic
            information;
          </li>
          <li>
            Behavioral data, such as the duration and frequency of visits to our website or app, the
            date and time of a visit or opening a message (newsletter, email, etc.), the location of
            your device, interaction with our online presences on social networks or other
            third-party platforms;
          </li>
          <li>
            Preference data, such as user settings, data from the analysis of collected data
            (especially behavioral data);
          </li>
          <li>Other data that you provide to us about yourself.</li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-erheben-wir-personendaten'
        title='4. How do we collect personal data?'
        order={2}
      >
        <p>
          We collect your personal data in various ways. On the one hand, we collect the personal
          data that you provide to us (e.g., via email, phone, postal mail, registration), that we
          receive from third parties (e.g., from business partners, authorities), and that we
          collect about you (e.g., from publicly accessible registers, websites, business partners).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='ueberlassene-daten' title='4.1. Provided Data' order={3}>
        <p>
          You provide us with your personal data when you interact with us, such as in the following
          circumstances:
        </p>
        <ul>
          <li>When you communicate with us or our employees;</li>
          <li>When you create a user account with us;</li>
          <li>When you visit our business premises;</li>
          <li>When you attend our customer events and public events;</li>
          <li>When you purchase our products or services (e.g., online);</li>
          <li>
            When you register to use certain offers and services (e.g., apps, newsletters, free
            Wi-Fi);
          </li>
          <li>When you participate in one of our competitions or sweepstakes.</li>
        </ul>
        <p>
          The provided data primarily includes master, communication, registration, and contract
          data, but also preference data.
        </p>
        <p>
          In general, the provision of personal data is voluntary, meaning that you are not usually
          required to provide us with personal data. However, we must collect and process the
          personal data necessary for the processing of a contractual relationship and the
          fulfillment of associated obligations or as required by law, such as mandatory master and
          contract data. Otherwise, we may not be able to conclude or continue the respective
          contract.
        </p>
        <p>
          If you provide us with data about other people (e.g., family members, employees), we
          assume that you are authorized to do so and that the data is accurate. Please ensure that
          these other individuals are informed about this privacy policy.
        </p>
        <p>
          If you do not provide certain personal data, it may result in the inability to provide the
          associated service or conclude a contract. We will generally inform you where the
          provision of personal data is mandatory.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='erhaltene-daten' title='4.2 Received Data' order={3}>
        <p>
          We may also receive personal data about you from third parties, such as the following:
        </p>
        <ul>
          <li>
            From business partners with whom we cooperate, such as banks, insurance companies,
            distributors, and other contractual partners (especially organizations like schools);
          </li>
          <li>From individuals who communicate with us;</li>
          <li>From credit agencies, e.g., when we obtain credit information;</li>
          <li>From address traders or the Swiss Post, e.g., for address updates;</li>
          <li>From online service providers, e.g., internet analytics services;</li>
          <li>
            From authorities and courts in connection with administrative and judicial proceedings.
          </li>
        </ul>
        <p>
          The received data primarily includes master, communication, financial, and contract data,
          but also preference data.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='erhobene-daten' title='4.3 Collected Data' order={3}>
        <p>
          We may also collect your personal data ourselves or automatically, such as in the
          following circumstances:
        </p>
        <ul>
          <li>When you use our services;</li>
          <li>When you make use of our services;</li>
          <li>When you place orders and/or make purchases with us;</li>
          <li>When you visit our websites or use our apps;</li>
          <li>
            When we consult publicly accessible sources (e.g., public registers, websites,
            platforms);
          </li>
          <li>
            When we obtain information about you from your organization or another organization or
            company (e.g., for reference purposes during the application process, if you consent);
          </li>
          <li>When we work with business partners;</li>
          <li>
            When you click on a link in one of our newsletters or otherwise interact with one of our
            electronic marketing communications.
          </li>
        </ul>
        <p>The collected data primarily includes behavioral data and technical data.</p>
        <p>
          We may also derive further personal data from already existing personal data, for example,
          by evaluating behavioral data. Frequently, such derived personal data includes preference
          data.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='fuer-welche-zwecke-bearbeiten-wir-personendaten'
        title='5. For what purposes do we process personal data?'
        order={2}
      >
        <p>
          We primarily process your personal data to conclude and manage our contracts with you, our
          customers, and our business partners. We also process your personal data for the following
          purposes:
        </p>
        <ul>
          <li>to communicate with you;</li>
          <li>
            to provide and improve our services (including websites) to you and our customers;
          </li>
          <li>to manage the business relationship with you and our customers;</li>
          <li>to conduct advertising, marketing, market research, and product development;</li>
          <li>
            to ensure your and our security and prevent abuse (e.g., for IT security, theft, fraud,
            and abuse prevention, and for evidence purposes);
          </li>
          <li>to comply with legal obligations;</li>
          <li>to enforce our claims and defend ourselves against claims from others;</li>
          <li>
            to prepare and execute the sale or purchase of business areas, companies, or parts of
            companies and other corporate transactions, including the transfer of personal data;
          </li>
          <li>for business management.</li>
        </ul>
        <p>
          When processing personal data for the purposes described in this policy, we rely, among
          other things, on our legitimate interest in maintaining, expanding, and managing the
          business relationship and communication with you as a business partner regarding our
          products and services.
        </p>
        <p>
          For certain purposes, you may grant us your consent to process your personal data. To the
          extent that we have no other legal basis, we process your personal data within the scope
          of and based on this consent. You may revoke your consent at any time. A revocation does
          not affect processing that has already taken place.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='warum-und-wie-teilen-wir-daten'
        title='6. Why and how do we share data?'
        order={2}
      >
        <p>
          We may share your personal data with trusted third parties as necessary or useful for the
          provision of our services or to fulfill the purposes defined in this privacy policy. We
          may share your personal data with the following categories of recipients: external service
          providers (e.g., IT service providers, auditors, shipping companies, payment services);
          customers and other contractual partners; counterparties, their legal representatives, and
          involved persons; business partners with whom we may need to coordinate the provision of
          services; authorities and courts. Please note that these recipients may, in turn, engage
          third parties, so your data may also be accessible to them.
        </p>
        <p>
          If we share your personal data with third parties who process your personal data on our
          behalf, this is done based on our instructions and in accordance with our privacy policy
          and other appropriate confidentiality and security measures. For example, we use service
          providers to support the operation of our IT infrastructure, provide our products and
          services, improve our internal business processes, and offer additional support to our
          customers.
        </p>
        <p>
          We generally process your personal data only in Switzerland and the European Economic Area
          (EEA) (see also below Section 6). On our websites and apps, we use services from
          third-party providers; please refer to our cookie policy (below Section 13) for
          information on data collection by these third-party providers.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='warum-und-wie-geben-wir-daten-ins-ausland-weiter'
        title='7. Why and how do we transfer data abroad?'
        order={2}
      >
        <p>
          We may transfer your personal data to recipients in the European Economic Area (EEA), as
          well as to recipients in the USA and other countries that do not provide a level of data
          protection comparable to Swiss law (so-called third countries). We typically do this when
          it is necessary to fulfill a contract or enforce legal claims. If we transfer data to
          other third countries that you are not already aware of (e.g., from the contract or
          communication with us), the respective country, international organization, or at least
          the region will generally be indicated in this privacy policy and specifically in the
          cookie policy. We only transfer your personal data to a third country if the legal
          requirements for data protection are met (e.g., after concluding recognized standard data
          protection clauses, according to the Swiss-U.S. Data Privacy Framework, or obtaining
          consent) or if we can rely on an exception. An exception may apply in cases of overriding
          public interest or when the processing of a contract that is in your interest requires
          such disclosure.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-setzen-wir-profiling-ein'
        title='8. How do we use profiling?'
        order={2}
      >
        <p>
          Profiling refers to the automated processing of personal data to analyze or make
          predictions about personal aspects (e.g., analyzing personal interests and habits).
          Profiling generally derives preference data. We use profiling primarily in the automated
          processing of master, contract, behavioral, and preference data when using and purchasing
          our offers and services, but also in connection with our websites, apps, events,
          competitions, and sweepstakes. We use profiling primarily to improve our offers, present
          these and our content according to your needs, present you with only the advertisements
          and offers that are likely relevant to you, and decide which payment options are available
          to you based on a credit check. We may also link personal data from different sources to
          improve the quality of our analyses and predictions.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-treffen-wir-automatisierte-einzelentscheidungen'
        title='9. How do we make automated individual decisions?'
        order={2}
      >
        <p>
          Automated individual decisions are decisions made fully automatically, i.e., without human
          involvement, which may have legal consequences for the individual concerned or otherwise
          significantly affect them. We generally do not use automated individual decisions, but if
          we do, we will inform you separately in individual cases.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-schuetzen-wir-daten'
        title='10. How do we protect data?'
        order={2}
      >
        <p>
          We take appropriate technical (e.g., firewall, SSL encryption, password protection) and
          organizational (e.g., access restriction, training of authorized personnel) security
          measures to ensure the security of your personal data. These measures protect your
          personal data against unauthorized or unlawful processing, access, and/or against
          accidental loss, alteration, or disclosure. Please always keep in mind that transmitting
          information over the internet and other electronic means carries certain security risks.
          We cannot guarantee the security of information transmitted in this way.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-lange-bewahren-wir-daten-auf'
        title='11. How long do we retain data?'
        order={2}
      >
        <p>
          We retain your personal data as long as necessary for our processing purposes (see Section
          4), legal retention periods (typically five or ten years), and our legitimate interests,
          especially for documentation and evidence purposes, require or technical reasons make
          storage necessary (e.g., in the case of backups or document management systems). We delete
          or anonymize your personal data, provided there are no legal or contractual obligations or
          technical reasons preventing this, generally after the expiration of the storage and
          processing period as part of our usual procedures and in accordance with our retention
          policy.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='cookie-richtlinie' title='12. Cookie Policy' order={2}>
        <p>
          Below, we describe how and for what purposes we use log data, cookies, similar
          technologies, and other third-party services when using our websites and apps
          (collectively referred to as &apos;website&apos;) and thereby process personal and other
          data.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='was-sind-log-daten' title='12.1 What are log data?' order={3}>
        <p>
          Certain information is automatically logged and stored whenever a web server is connected
          for technical reasons. When you visit our website, information is automatically sent to
          the server of our website. This information includes the IP address of your computer, the
          date and time of access, the name and URL of the retrieved data, the website from which
          access was made (referrer URL), the browser type and version, and other information
          transmitted by the browser (e.g., operating system of your computer, geographic location,
          language setting). This information is temporarily stored in a so-called log file and
          retained in accordance with legal requirements. We process this data for the purpose of
          ensuring a smooth connection setup and a comfortable use of our website, as well as for
          evaluating system security and stability.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='was-sind-cookies-und-aehnliche-technologien'
        title='12.2 What are cookies and similar technologies?'
        order={3}
      >
        <p>
          We may use cookies and similar technologies on our website. Cookies are typically small
          text files that your browser automatically creates and stores on your device (computer,
          tablet, smartphone, etc.) when you access our site. Session cookies store your inputs
          while you navigate from page to page within the website. Session cookies are deleted after
          a short period, at the latest when you close your browser. Persistent cookies remain
          stored even after the browser is closed for a specific period. Similar technologies
          include, for example, pixel tags (invisible images or a program code that are loaded from
          a server and transmit specific information to the server operator), fingerprints
          (information about the device and browser collected when visiting a website and
          distinguishing the device from others), and other technologies (e.g., &apos;web
          storage&apos;) for storing data in the browser.
        </p>
        <p>
          We use both persistent and session cookies on our website. We may not always be able to
          identify you with a cookie. We use cookies and similar technologies to statistically
          capture the use of our website and evaluate it for optimization and user-friendliness
          purposes. We also use cookies for the purpose of providing our services (especially
          technically necessary cookies). Cookies have different retention periods. We have no
          control over the retention periods of cookies set by third parties.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-koennen-sie-cookies-und-aehnliche-technologien-deaktivieren'
        title='12.3 How can you disable cookies and similar technologies?'
        order={3}
      >
        <p>
          You can configure your browser not to automatically accept cookies and similar
          technologies or to delete existing cookies and other data stored in the browser. You can
          also extend your browser with additional software (so-called &apos;add-ons&apos; or
          &apos;plug-ins&apos;) that prevent tracking by certain third parties (such plug-ins are
          available, for example, at www.noscript.net or www.ghostery.com). You can usually find
          more information in your browser&apos;s help pages under the keyword &apos;privacy&apos;.
          Please note that partial or complete deactivation of cookies may result in you not being
          able to use all the functions of our websites.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='welche-cookies-und-aehnliche-technologien-setzen-wir-ein-und-wie-nutzen-wir-diese'
        title='12.4 What cookies and similar technologies do we use and how do we use them?'
        order={3}
      >
        <p>
          Technically necessary cookies: We use persistent cookies to save your personal user
          settings (especially concerning cookies and language selection on our website). We do not
          process any personal data from you in this process. The purpose of the processing is to
          re-identify your personal settings on our website. These cookies are necessary for the
          functionality of our website. These cookies are automatically deleted from your system
          after a maximum of one month. You can also delete the cookies manually at any time. Please
          note that your user settings will be lost.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='technisch-notwendige-cookies'
        title='12.4.1 Technically necessary cookies'
        order={4}
      >
        <p>
          We use persistent cookies to save your personal user settings (especially concerning
          cookies and language selection on our website). We do not process any personal data from
          you in this process. The purpose of the processing is to re-identify your personal
          settings on our website. These cookies are necessary for the functionality of our website.
          These cookies are automatically deleted from your system after a maximum of one month. You
          can also delete the cookies manually at any time. Please note that your user settings will
          be lost.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='erfolgs-und-reichweitenmessung'
        title='12.4.2 Success and reach measurement'
        order={4}
      >
        <p>We use the following services for success and reach measurement:</p>
        <ul>
          <li>
            Supabase by Supabase, Inc., based at 970 Toa Payoh North #07-04, Singapore 318992. This
            service monitors and records the way our app&apos;s authentication service is used.
            Supabase provides us with the collected information in aggregated form. We cannot
            identify individual visitors. Data transfer is based on the EU Commission&apos;s
            standard contractual clauses with adjustments for Swiss law. Details can be found at:
            https://supabase.com/legal/dpa. Supabase may use the data it additionally collects and
            the insights gained from it for its own purposes. Supabase then processes your personal
            data under its own responsibility and according to its privacy policy. More information
            regarding the collected data can be found in Supabase&apos;s privacy policy at:
            https://supabase.com/privacy.
          </li>
          <li>
            Plausible Analytics by Plausible Insights OÜ, Västriku tn 2, 50403, Tartu, Estonia. We
            use Plausible Analytics for privacy-friendly analysis of our website usage. Plausible
            completely avoids cookies and does not store any personal data. The collected
            information is aggregated and does not allow identification of individual visitors. Data
            processing takes place exclusively within the EU. More information can be found at:
            https://plausible.io/data-policy
          </li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='bot-erkennung-und-blockierung'
        title='12.4.3 Bot detection and blocking'
        order={4}
      >
        <p>We use the following services to identify and block bots:</p>
        <ul>
          <li>
            Cloudflare Bot Manager by Cloudflare, Inc., 101 Townsend Street, San Francisco,
            California 94107, USA. We use Cloudflare Bot Manager to protect our website from harmful
            bots. The set cookie is deleted after 30 minutes. More information can be found at:
            https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/#__cf_bm-cookie-for-cloudflare-bot-products.
            Cloudflare participates in the US Department of Commerce&apos;s self-certification
            process and complies with the principles of the Swiss-U.S. Data Privacy Framework when
            processing personal data from Switzerland. Cloudflare&apos;s privacy policy can be found
            at: https://www.cloudflare.com/privacypolicy/
          </li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='dienste-von-drittanbieter'
        title='12.5 Third-party services (especially website plugins)'
        order={3}
      >
        <p>
          We use third-party services to provide you with our website and offer additional features.
          In particular, we use the following services:
        </p>
        <ul>
          <li>
            Supabase by Supabase, Inc., 970 Toa Payoh North #07-04, Singapore 318992. We use
            Supabase to store and process our website and data (especially database) so that we can
            deliver content and data quickly and flawlessly on all devices. The processing of
            personal data takes place in the EU (server location Frankfurt, DE). If personal data is
            transferred to an insecure third country, this data transfer is based on the EU
            Commission&apos;s standard contractual clauses with adjustments for Swiss law. Details
            can be found at: https://supabase.com/legal/dpa. Supabase&apos;s privacy policy can be
            found at: https://supabase.com/privacy;
          </li>
          <li>
            Cloudflare by Cloudflare, Inc., 101 Townsend Street, San Francisco, California 94107,
            USA. We use Cloudflare to deliver our website content quickly and flawlessly on all
            devices. Cloudflare participates in the US Department of Commerce&apos;s
            self-certification process and complies with the principles of the Swiss-U.S. Data
            Privacy Framework when processing personal data from Switzerland. Cloudflare&apos;s
            privacy policy can be found at: https://www.cloudflare.com/privacypolicy/;
          </li>
          <li>
            DigitalOcean, LLC, 101 6th Ave New York, NY 10013, USA. We use DigitalOcean to deliver
            our website content quickly and flawlessly on all devices (especially hosting and web
            server). The processing of personal data takes place in the EU (server location
            Frankfurt, DE). DigitalOcean participates in the US Department of Commerce&apos;s
            self-certification process and complies with the principles of the Swiss-U.S. Data
            Privacy Framework when processing personal data from Switzerland. DigitalOcean&apos;s
            privacy policy can be found at: https://www.digitalocean.com/legal/privacy-policy;
          </li>
          <li>
            Plausible Analytics by Plausible Insights OÜ, Västriku tn 2, 50403, Tartu, Estonia. We
            use Plausible Analytics for website analysis and optimization. The service works without
            cookies and does not collect any personal data. Processing takes place entirely within
            the EU. More information can be found at: https://plausible.io/privacy;
          </li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='welche-rechte-haben-sie'
        title='13. What rights do you have?'
        order={2}
      >
        <p>
          As a potentially affected person, you may assert various claims against us in accordance
          with the applicable national and international provisions. We may process your personal
          data again to fulfill your claims.
        </p>
        <p>You have the following rights regarding your personal data:</p>
        <ul>
          <li>
            Right to information: You have the right to receive information about the personal data
            we have about you and how we process it;
          </li>
          <li>
            Right to data release or transfer: You have the right to receive or transfer a copy of
            your personal data in a common electronic format, provided it is processed automatically
            and the data is processed based on your consent or in direct connection with the
            conclusion or fulfillment of a contract between you and us;
          </li>
          <li>
            Right to rectification: You have the right to have your personal data corrected if it is
            inaccurate;
          </li>
          <li>Right to erasure: You have the right to have your personal data erased;</li>
          <li>
            Right to object: You have the right to object to the processing of your personal data
            (especially when processing for direct marketing purposes).
          </li>
        </ul>
        <p>
          Please note that these rights are subject to conditions and exceptions. We may restrict or
          deny your request to exercise these rights if legally permissible. We reserve the right to
          redact or provide copies only in part for data protection or confidentiality reasons.
        </p>
        <p>
          If you wish to exercise your rights with respect to us or are not satisfied with how we
          handle your rights or privacy, please contact us; our contact details are in Section 1. To
          prevent misuse, we must identify you (e.g., with a copy of your ID, if necessary).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='rechtsgrundlagen-nach-dsgvo'
        title='14. Legal bases under GDPR'
        order={2}
      >
        <p>
          We do not assume that the EU General Data Protection Regulation (&apos;GDPR&apos;) applies
          in our case. However, if this is exceptionally different for certain data processing
          activities, then this Section 15 applies exclusively for the purposes of the GDPR and the
          data processing activities subject to it.
        </p>
        <p>We base the processing of your personal data particularly on the following grounds:</p>
        <ul>
          <li>
            it is necessary as described in Section 4 for the initiation and conclusion of contracts
            and their management and enforcement (Art. 6(1)(b) GDPR);
          </li>
          <li>
            it is necessary to safeguard our legitimate interests or those of third parties as
            described in Section 4, namely for communication with you or third parties, to operate
            our website, to improve our electronic offerings and register for certain offers and
            services, for security purposes, to comply with Swiss law and internal regulations for
            our risk management and corporate governance, and for other purposes such as training
            and education, administration, evidence and quality assurance, organization,
            implementation and follow-up of events, and to safeguard other legitimate interests (see
            Section 4) (Art. 6(1)(f) GDPR);
          </li>
          <li>
            it is legally required or permitted due to our mandate or position under the law of the
            EEA or a member state (Art. 6(1)(c) GDPR) or necessary to protect your vital interests
            or those of other natural persons (Art. 6(1)(d) GDPR);
          </li>
          <li>
            you have given your consent to the processing, e.g., via a corresponding declaration on
            our website (Art. 6(1)(a) and Art. 9(2)(a) GDPR).
          </li>
        </ul>
        <p>
          If you are in the EEA, in addition to the rights in Section 14, you also have the right to
          restrict data processing, and you can complain to the data protection supervisory
          authority in your country. A list of authorities in the EEA can be found here:
          https://edpb.europa.eu/about-edpb/board/members_en
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-koennen-wir-diese-datenschutzerklaerung-aendern'
        title='15. How can we change this privacy policy?'
        order={2}
      >
        <p>
          We may change this privacy policy at any time or initiate new processing activities. We
          also update this privacy policy from time to time to reflect legal requirements. We will
          inform you of such changes and additions in an appropriate manner, particularly by
          publishing the current privacy policy on our website (see below). The current privacy
          policy can be accessed at any time at https://edutime.ch/docs/privacy.
        </p>
      </LegalDocumentSection>
    </>
  )
}
