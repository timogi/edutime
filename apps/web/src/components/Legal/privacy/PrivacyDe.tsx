import { LegalDocumentSection } from '../LegalDocumentSection'
import type { TocLink } from '../PrivacyLayout'

export const privacyMetaDe = {
  title: 'EduTime Datenschutzerklärung',
  tocLabel: 'Inhaltsverzeichnis',
  meta: {
    version: 'Version 1.0',
    lastUpdated: '3. März 2025',
  },
}

export const tocLinksDe: TocLink[] = [
  { id: 'inhalt', label: '1. Einleitung zur Datenschutzerklärung', order: 1 },
  { id: 'wer-ist-verantwortlich', label: '2. Wer ist verantwortlich?', order: 1 },
  {
    id: 'welche-personendaten-bearbeiten-wir',
    label: '3. Welche Personendaten bearbeiten wir?',
    order: 1,
  },
  { id: 'wie-erheben-wir-personendaten', label: '4. Wie erheben wir Personendaten?', order: 1 },
  { id: 'ueberlassene-daten', label: '4.1. Überlassene Daten', order: 2 },
  { id: 'erhaltene-daten', label: '4.2 Erhaltene Daten', order: 2 },
  { id: 'erhobene-daten', label: '4.3 Erhobene Daten', order: 2 },
  {
    id: 'fuer-welche-zwecke-bearbeiten-wir-personendaten',
    label: '5. Für welche Zwecke bearbeiten wir Personendaten?',
    order: 1,
  },
  { id: 'warum-und-wie-teilen-wir-daten', label: '6. Warum und wie teilen wir Daten?', order: 1 },
  {
    id: 'warum-und-wie-geben-wir-daten-ins-ausland-weiter',
    label: '7. Warum und wie geben wir Daten ins Ausland weiter?',
    order: 1,
  },
  { id: 'wie-setzen-wir-profiling-ein', label: '8. Wie setzen wir Profiling ein?', order: 1 },
  {
    id: 'wie-treffen-wir-automatisierte-einzelentscheidungen',
    label: '9. Wie treffen wir automatisierte Einzelentscheidungen?',
    order: 1,
  },
  { id: 'wie-schuetzen-wir-daten', label: '10. Wie schützen wir Daten?', order: 1 },
  {
    id: 'wie-lange-bewahren-wir-daten-auf',
    label: '11. Wie lange bewahren wir Daten auf?',
    order: 1,
  },
  { id: 'cookie-richtlinie', label: '12. Cookie-Richtlinie', order: 1 },
  { id: 'was-sind-log-daten', label: '12.1 Was sind Log-Daten?', order: 2 },
  {
    id: 'was-sind-cookies-und-aehnliche-technologien',
    label: '12.2 Was sind Cookies und ähnliche Technologien?',
    order: 2,
  },
  {
    id: 'wie-koennen-sie-cookies-und-aehnliche-technologien-deaktivieren',
    label: '12.3 Wie können Sie Cookies und ähnliche Technologien deaktivieren?',
    order: 2,
  },
  {
    id: 'welche-cookies-und-aehnliche-technologien-setzen-wir-ein-und-wie-nutzen-wir-diese',
    label: '12.4 Welche Cookies und ähnliche Technologien setzen wir ein und wie nutzen wir diese?',
    order: 2,
  },
  { id: 'technisch-notwendige-cookies', label: '12.4.1 Technisch notwendige Cookies', order: 3 },
  {
    id: 'erfolgs-und-reichweitenmessung',
    label: '12.4.2 Erfolgs- und Reichweitenmessung',
    order: 3,
  },
  { id: 'bot-erkennung-und-blockierung', label: '12.4.3 Bot-Erkennung und -Blockierung', order: 3 },
  {
    id: 'dienste-von-drittanbieter',
    label: '12.5 Dienste von Drittanbieter (insb. Webseiten-Plugins)',
    order: 2,
  },
  { id: 'welche-rechte-haben-sie', label: '13. Welche Rechte haben Sie?', order: 1 },
  { id: 'rechtsgrundlagen-nach-dsgvo', label: '14. Rechtsgrundlagen nach DSGVO', order: 1 },
  {
    id: 'wie-koennen-wir-diese-datenschutzerklaerung-aendern',
    label: '15. Wie können wir diese Datenschutzerklärung ändern?',
    order: 1,
  },
]

export function PrivacyDe() {
  return (
    <>
      <LegalDocumentSection id='inhalt' title='1. Einleitung zur Datenschutzerklärung' order={2}>
        <p>
          Mit dieser Datenschutzerklärung informieren wir Sie darüber, welche Personendaten (Daten,
          die Sie direkt oder indirekt identifizieren) wir im Zusammenhang mit unseren Aktivitäten
          erheben und bearbeiten. Sie gilt für sämtliche Bearbeitungstätigkeiten, die im
          Zusammenhang mit Personendaten stehen. Die erhaltenen und gesammelten Daten bearbeiten wir
          verantwortungsvoll, in Übereinstimmung mit den anwendbaren gesetzlichen Bestimmungen und
          gemäss dieser Datenschutzerklärung. Unsere Bearbeitung unterliegt grundsätzlich dem
          Schweizer Datenschutzgesetz (DSG).
        </p>
        <p>
          Sofern wir es für sinnvoll erachten, stellen wir Ihnen für einzelne oder zusätzliche
          Bearbeitungen ergänzende Datenschutzerklärungen sowie sonstige rechtliche Dokumente (insb.
          AGB, Nutzungs- und Teilnahmebedingungen) zur Verfügung.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wer-ist-verantwortlich'
        title='2. Wer ist verantwortlich?'
        order={2}
      >
        <p>
          Für die Bearbeitung Ihrer Personendaten, wie in dieser Datenschutzerklärung beschrieben
          und soweit im Einzelfall nichts anderes angegeben ist, ist der Verantwortliche im Sinne
          des Datenschutzgesetzes:
        </p>
        <p>
          EduTime GmbH
          <br />
          c/o Tim Ogi
          <br />
          Bienenstrasse 8
          <br />
          3018 Bern
        </p>
        <p>
          In dieser Datenschutzerklärung benutzte Verweise auf «EduTime», «wir» oder «uns» sind
          Verweise auf den soeben erwähnten Verantwortlichen. Wenn Sie ein datenschutzrechtliches
          Anliegen haben, können Sie sich gerne jederzeit an uns wenden, insbesondere an folgende
          E-Mail-Adresse:
        </p>
        <p>privacy@edutime.ch (Betreff «Datenschutz»).</p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='welche-personendaten-bearbeiten-wir'
        title='3. Welche Personendaten bearbeiten wir?'
        order={2}
      >
        <p>Wir erheben und bearbeiten insbesondere folgende Personendaten von Ihnen:</p>
        <ul>
          <li>
            Stammdaten, wie z.B. Name, Adresse, E-Mail-Adresse, Telefon-Nummer, Geschlecht,
            Geburtsdatum, Social Media Profile, Fotos, Videos, Beziehungsangaben (Kunde,
            Dienstleister etc.), Historie, behördliche Angaben (z.B. Handelsregisterauszüge,
            Bewilligungen etc.), Angaben zu abonnierten Newslettern oder sonstiger Werbung (inkl.
            Einwilligungen);
          </li>
          <li>
            Kommunikationsdaten, wie z.B. Kontaktdaten, Art und Weise der Kommunikation (Telefon,
            E-Mail, Textnachrichten, Videonachrichten etc.) sowie Ort, Datum, Uhrzeit und Inhalt der
            Kommunikation;
          </li>
          <li>Registrierungsdaten, wie z.B. Benutzername, Passwort, E-Mail-Adresse;</li>
          <li>Finanzdaten, wie z.B. Zahlungsangaben, Bonitätsangaben;</li>
          <li>
            Vertragsdaten, Daten, die im Zusammenhang mit dem Vertragsschluss bzw. der
            Vertragsabwicklung anfallen, wie z.B. Angaben zum Vertragsschluss, erworbene Ansprüche
            und Forderungen, Informationen zur Kundenzufriedenheit, Einkaufsinformationen (z.B.
            Einkaufsdatum, -ort, -zeit, -historie sowie Menge, Art und Wert der
            Waren/Dienstleistungen);
          </li>
          <li>
            Technische Daten, wie z.B. IP-Adresse, Betriebssystem, Datum, Uhrzeit, geografische
            Angabe;
          </li>
          <li>
            Verhaltensdaten, wie z.B. Dauer und Häufigkeit der Besuche unserer Webseite oder App,
            Datum und Uhrzeit eines Besuchs oder Öffnung einer Nachricht (Newsletter, E-Mail etc.),
            Standort Ihres Endgeräts, Interaktion mit unseren Online-Präsenzen auf sozialen
            Netzwerken oder sonstigen Plattformen von Dritten;
          </li>
          <li>
            Präferenzdaten, wie z.B. Nutzereinstellungen, Daten aus der Analyse der erhobenen Daten
            (insb. Verhaltensdaten);
          </li>
          <li>Sonstige Daten, die Sie uns über sich zur Verfügung stellen.</li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-erheben-wir-personendaten'
        title='4. Wie erheben wir Personendaten?'
        order={2}
      >
        <p>
          Wir erheben Ihre Personendaten auf vielfältige Art und Weise. Einerseits erheben wir Ihre
          Personendaten, die Sie uns zur Verfügung gestellt haben (z.B. mit E-Mail, Telefon,
          Briefpost, Registrierung), die wir von Dritten erhalten (z.B. von Geschäftspartnern,
          Behörden) und die wir über Sie erheben (z.B. von öffentlich zugänglichen Registern,
          Webseiten, Geschäftspartnern).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='ueberlassene-daten' title='4.1. Überlassene Daten' order={3}>
        <p>
          Sie stellen uns Ihre Personendaten zur Verfügung, wenn Sie mit uns interagieren, wie
          beispielsweise unter folgenden Umständen:
        </p>
        <ul>
          <li>Wenn Sie mit uns oder unseren Mitarbeitenden kommunizieren;</li>
          <li>Wenn Sie bei uns ein Benutzerkonto erstellen;</li>
          <li>Wenn Sie unsere Geschäftsräumlichkeiten besuchen;</li>
          <li>Wenn Sie an Kundenanlässen und öffentlichen Veranstaltungen von uns teilnehmen;</li>
          <li>Wenn Sie unsere Produkte oder Dienstleistungen erwerben (z.B. Online);</li>
          <li>
            Wenn Sie sich registrieren, um bestimmte Angebote und Dienstleistungen nutzen zu können
            (z.B. Apps, Newsletter, kostenloses WLAN);
          </li>
          <li>Wenn Sie an einem unserer Wettbewerbe oder Gewinnspiele teilnehmen.</li>
        </ul>
        <p>
          Bei den überlassenen Daten handelt es sich insbesondere um Stamm-, Kommunikations-,
          Registrierungs- und Vertragsdaten, aber auch Präferenzdaten.
        </p>
        <p>
          In der Regel ist die Bereitstellung von Personendaten freiwillig, d.h. Sie sind in den
          meisten Fällen nicht verpflichtet, uns Personendaten bekannt zu geben. Wir müssen jedoch
          diejenigen Personendaten erheben und bearbeiten, die für die Abwicklung eines
          Vertragsverhältnisses und die Erfüllung der damit verbundenen Pflichten erforderlich oder
          gesetzlich vorgeschrieben sind, z.B. obligatorische Stamm- und Vertragsdaten. Andernfalls
          können wir den jeweiligen Vertrag nicht abschliessen oder fortführen.
        </p>
        <p>
          Wenn Sie Daten über andere Personen (z.B. Familienangehörige, Mitarbeitende) an uns
          übermitteln, gehen wir davon aus, dass Sie dazu berechtigt sind und dass diese Daten
          richtig sind. Bitte stellen Sie sicher, dass diese anderen Personen über diese
          Datenschutzerklärung informiert sind.
        </p>
        <p>
          Sofern Sie uns bestimmte Personendaten nicht überlassen, kann dies dazu führen, dass die
          Erbringung der damit zusammenhängenden Dienstleistung oder ein Vertragsabschluss nicht
          möglich ist. Wir geben Ihnen grundsätzlich bekannt, wo von uns verlangte Personendaten
          zwingend sind.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='erhaltene-daten' title='4.2 Erhaltene Daten' order={3}>
        <p>
          Auch von Dritten können wir Personendaten über Sie erhalten, wie beispielsweise von
          folgenden Dritten:
        </p>
        <ul>
          <li>
            Von Geschäftspartnern, mit denen wir zusammenarbeiten, z.B. Banken, Versicherungen,
            Vertriebs- und andere Vertragspartner (insb. Organisationen wie Schulen);
          </li>
          <li>Von Personen, die mit uns kommunizieren;</li>
          <li>Von Kreditauskunfteien, z.B. wenn wir Bonitätsauskünfte einholen;</li>
          <li>
            Von Adresshändlern oder der schweizerischen Post, z.B. für Adressaktualisierungen;
          </li>
          <li>Von Anbietern von Online-Diensten, z.B. Internet-Analysedienste;</li>
          <li>
            Von Behörden und Gerichten, im Zusammenhang mit behördlichen und gerichtlichen
            Verfahren.
          </li>
        </ul>
        <p>
          Bei den erhaltenen Daten handelt es sich insbesondere um Stamm-, Kommunikations-, Finanz-
          und Vertragsdaten, aber auch Präferenzdaten.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='erhobene-daten' title='4.3 Erhobene Daten' order={3}>
        <p>
          Ihre Personendaten können wir auch selbst oder automatisiert erheben, wie beispielsweise
          unter folgenden Umständen:
        </p>
        <ul>
          <li>Wenn Sie unsere Angebote nutzen;</li>
          <li>Wenn Sie unsere Dienstleistungen in Anspruch nehmen;</li>
          <li>Wenn Sie bei uns Leistungen bestellen und/oder einkaufen;</li>
          <li>Wenn Sie unsere Webseiten besuchen oder unsere Apps verwenden;</li>
          <li>
            Wenn wir öffentlich zugängliche Quellen konsultieren (z.B. öffentliche Register,
            Webseiten, Plattformen);
          </li>
          <li>
            Wenn wir Auskünfte bei Ihrer Organisation oder bei einer anderen Organisation oder
            Unternehmung über Sie einholen (z.B. zu Referenzzwecken im Bewerbungsprozess, sofern Sie
            dem zustimmen);
          </li>
          <li>Wenn wir mit Geschäftspartnern zusammenarbeiten;</li>
          <li>
            Wenn Sie auf einen Link in einem unserer Newsletter klicken oder anderweitig mit einer
            unserer elektronischen Werbemitteilungen interagieren.
          </li>
        </ul>
        <p>
          Bei den erhobenen Daten handelt es sich insbesondere um Verhaltensdaten sowie um
          technische Daten.
        </p>
        <p>
          Wir können auch aus bereits vorhandenen Personendaten weitere Personendaten ableiten, z.B.
          indem wir die Verhaltensdaten auswerten. Häufig handelt es sich bei solchen abgeleiteten
          Personendaten um Präferenzdaten.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='fuer-welche-zwecke-bearbeiten-wir-personendaten'
        title='5. Für welche Zwecke bearbeiten wir Personendaten?'
        order={2}
      >
        <p>
          Wir bearbeiten Ihre Personendaten primär, um unsere Verträge mit Ihnen, unseren Kunden und
          unseren Geschäftspartnern abzuschliessen und abzuwickeln. Insbesondere bearbeiten wir Ihre
          Personendaten auch zu folgenden Zwecken:
        </p>
        <ul>
          <li>um mit Ihnen zu kommunizieren;</li>
          <li>
            um Ihnen und unseren Kunden unsere Dienstleistungen (inkl. Webseiten) zur Verfügung zu
            stellen und diese zu verbessern;
          </li>
          <li>um die Geschäftsbeziehung mit Ihnen und unseren Kunden zu verwalten;</li>
          <li>um Werbung, Marketing, Marktforschung und Produkteentwicklung zu betreiben;</li>
          <li>
            um Ihre und unsere Sicherheit zu gewährleisten und Missbräuche vorzubeugen (z.B. zur
            IT-Sicherheit, Diebstahls-, Betrugs- und Missbrauchsprävention und zu Beweiszwecken);
          </li>
          <li>um rechtliche Verpflichtungen einzuhalten;</li>
          <li>um unsere Ansprüche durchzusetzen und uns gegen Ansprüche anderer zu verteidigen;</li>
          <li>
            um den Verkauf oder Kauf von Geschäftsbereichen, Gesellschaften oder Teilen von
            Gesellschaften und andere gesellschaftsrechtliche Transaktionen vorzubereiten und
            durchzuführen sowie damit verbunden die Übertragung von Personendaten;
          </li>
          <li>zur Geschäftssteuerung.</li>
        </ul>
        <p>
          Bei der Bearbeitung der Personendaten für die in dieser Erklärung beschriebenen Zwecke
          stützen wir uns unter anderem auf unser berechtigtes Interesse an der Aufrechterhaltung,
          dem Ausbau und der Verwaltung der Geschäftsbeziehung und der Kommunikation mit Ihnen als
          Geschäftspartner über unsere Produkte und Dienstleistungen.
        </p>
        <p>
          Für bestimmte Zwecke können Sie uns eine Einwilligung zur Bearbeitung Ihrer Personendaten
          erteilen. Soweit wir keine andere Rechtsgrundlage haben, bearbeiten wir Ihre Personendaten
          im Rahmen und gestützt auf diese Einwilligung. Sie können Ihre Einwilligung jederzeit
          widerrufen. Ein Widerruf hat keine Auswirkung auf bereits erfolgte Bearbeitungen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='warum-und-wie-teilen-wir-daten'
        title='6. Warum und wie teilen wir Daten?'
        order={2}
      >
        <p>
          Wir können Ihre Personendaten sofern erforderlich oder sinnvoll für die Erbringung unserer
          Dienstleistungen oder die Erfüllung der in dieser Datenschutzerklärung definierten Zwecke
          vertrauenswürdigen Dritten weitergeben. Folgenden Kategorien von Empfängern können wir
          Ihre Personendaten weitergeben: Externe Dienstleistende (z.B. IT-Dienstleister, Revisoren,
          Speditionen, Zahlungsdienste); Kundinnen und Kunden sowie andere Vertragspartner;
          Gegenparteien, ihre Rechtsvertreter und involvierte Personen; Geschäftspartner, mit denen
          wir die Dienstleistungserbringung gegebenenfalls koordinieren müssen; Behörden und
          Gerichte. Bitte beachten Sie, dass diese Empfänger ihrerseits Dritte beiziehen können, so
          dass Ihre Daten auch diesen zugänglich werden können.
        </p>
        <p>
          Sofern wir Ihre Personendaten mit Dritten, welche Ihre Personendaten in unserem Auftrag
          bearbeiten, teilen, geschieht dies auf Grundlage unserer Weisungen und im Einklang mit
          unserer Datenschutzerklärung sowie anderen geeigneten Vertraulichkeits- und
          Sicherheitsmassnahmen. Beispielsweise nutzen wir Dienstanbieter zur Unterstützung beim
          Betrieb unserer IT-Infrastruktur, Bereitstellen unserer Produkte und Dienste, Verbessern
          unserer internen Geschäftsprozesse und Anbieten zusätzlichen Supports für unsere Kunden.
        </p>
        <p>
          Wir bearbeiten Ihre Personendaten grundsätzlich nur in der Schweiz und im Europäischen
          Wirtschaftsraum (EWR) (siehe auch unten Ziff. 6). Auf unseren Webseiten und Apps nutzen
          wir Dienste von Drittanbietern, beachten Sie dazu unsere Cookie-Richtlinie (unten Ziff.
          13) zur selbständigen Datenerhebung durch die Drittanbieter.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='warum-und-wie-geben-wir-daten-ins-ausland-weiter'
        title='7. Warum und wie geben wir Daten ins Ausland weiter?'
        order={2}
      >
        <p>
          Ihre Personendaten können wir an Empfänger im Europäischen Wirtschaftsraum (EWR)
          übermitteln, sowie an Empfänger in den USA und in weiteren Ländern, die kein mit Schweizer
          Recht vergleichbares Datenschutzniveau gewährleisten (sog. Drittstaaten). Wir tun dies
          normalerweise, wenn es zur Erfüllung eines Vertrages oder zur Durchsetzung von
          Rechtsansprüchen notwendig ist. Sofern wir Daten in weitere Drittstaaten bekannt geben und
          Ihnen dies nicht bereits bekannt ist (z.B. aus Vertrag oder der Kommunikation mit uns),
          ist grundsätzlich dieser Datenschutzerklärung und insbesondere der Cookie-Richtlinie an
          entsprechender Stelle der jeweilige Staat, das internationale Organ oder zumindest die
          Region zu entnehmen. Wir übermitteln Ihre Personendaten nur in einen Drittstaat, wenn die
          datenschutzrechtlichen Voraussetzungen gegeben sind (z.B. nach Abschluss von anerkannten
          Standarddatenschutzklauseln, gemäss dem Swiss-U.S. Data Privacy Frameworks oder erhaltener
          Einwilligung) oder wenn wir uns auf eine Ausnahmebestimmung stützen können. Eine Ausnahme
          kann namentlich in Fällen überwiegender öffentlicher Interessen vorliegen oder wenn die
          Abwicklung eines Vertrages, der in Ihrem Interesse ist, eine solche Bekanntgabe erfordert.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-setzen-wir-profiling-ein'
        title='8. Wie setzen wir Profiling ein?'
        order={2}
      >
        <p>
          Unter «Profiling» ist die automatisierte Bearbeitung von Personendaten zu verstehen, damit
          persönliche Aspekte analysiert oder Prognosen getroffen werden können (z.B. Analyse
          persönlicher Interessen und Gewohnheiten). In der Regel werden durchs Profiling
          Präferenzdaten abgeleitet. Profiling verwenden wir insbesondere bei der automatischen
          Bearbeitung von Stamm-, Vertrags-, Verhalts- und Präferenzdaten bei der Nutzung und dem
          Erwerb unserer Angebote und Dienstleistungen, jedoch auch im Zusammenhang mit unseren
          Webseiten, Apps, Events, Wettbewerben und Gewinnspielen. Wir nutzen Profiling
          insbesondere, um unsere Angebote zu verbessern, diese und unsere Inhalte bedarfsgerecht zu
          präsentieren, Ihnen nur die Werbung und Angebote zu unterbreiten, die für Sie
          wahrscheinlich relevant sind und zu entscheiden, welche Zahlungsmöglichkeiten aufgrund
          einer Bonitätsprüfung Ihnen zur Verfügung stehen. Wir können als Grundlage des Profilings
          auch Personendaten aus unterschiedlichen Quellen miteinander verknüpfen, um die Qualität
          unserer Analysen und Prognosen zu verbessern.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-treffen-wir-automatisierte-einzelentscheidungen'
        title='9. Wie treffen wir automatisierte Einzelentscheidungen?'
        order={2}
      >
        <p>
          «Automatisierte Einzelentscheidung» sind Entscheidungen, die vollautomatisch, d.h. ohne
          menschliche Mitwirkung, getroffen werden und für die betroffene Person rechtliche Folgen
          nach sich ziehen oder sie in sonstiger Weise erheblich beeinträchtigen kann. Wir setzen
          automatisierte Einzelentscheidungen in der Regel nicht ein, falls doch, werden wir Sie im
          Einzelfall gesondert informieren.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-schuetzen-wir-daten'
        title='10. Wie schützen wir Daten?'
        order={2}
      >
        <p>
          Wir ergreifen angemessene technische (z.B. Firewall, SSL-Verschlüsselung, Passwortschutz)
          und organisatorische (z.B. Zugriffsbeschränkung, Schulung der Berechtigten)
          Sicherheitsmassnahmen, um die Sicherheit Ihrer Personendaten zu wahren. Durch diese
          Massnahmen schützen wir Ihre Personendaten gegen unberechtigte oder unrechtmässige
          Bearbeitung, Zugriffe und/oder gegen unbeabsichtigten Verlust, Veränderung,
          Bekanntmachung. Bitte beachten Sie stets, dass die Übermittlung von Informationen über das
          Internet und andere elektronische Mittel gewisse Sicherheitsrisiken birgt. Wir können
          keine Garantie übernehmen, für die Sicherheit von Informationen, die auf diese Weise
          übermittelt werden.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-lange-bewahren-wir-daten-auf'
        title='11. Wie lange bewahren wir Daten auf?'
        order={2}
      >
        <p>
          Wir bewahren Ihre Personendaten so lange auf, wie es unsere Bearbeitungszwecke (vgl. Ziff.
          4), die gesetzlichen Aufbewahrungsfristen (in der Regel fünf bzw. 10 Jahre) und unsere
          berechtigten Interessen, insbesondere zu Dokumentations- und Beweiszwecken, es verlangen
          oder eine Speicherung technisch bedingt ist (z.B. im Falle von Backups oder
          Dokumentenmanagementsystemen). Wir löschen oder anonymisieren Ihre Personendaten, sofern
          keine rechtlichen oder vertraglichen Pflichten oder technische Gründe entgegenstehen,
          grundsätzlich nach Ablauf der Speicher- und Bearbeitungsdauer im Rahmen unserer üblichen
          Abläufe und in Einklang mit unserer Aufbewahrungsrichtlinie.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='cookie-richtlinie' title='12. Cookie-Richtlinie' order={2}>
        <p>
          Im Folgenden beschreiben wir, wie und wozu wir Log-Daten, Cookies, ähnliche Technologien
          sowie weitere Dienste von Drittanbieter bei der Benutzung unserer Webseiten und Apps
          (nachfolgend gemeinsam «Webseite») einsetzen und dabei Personen- und andere Daten
          bearbeiten.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='was-sind-log-daten' title='12.1 Was sind Log-Daten?' order={3}>
        <p>
          Bei jeder Verbindung mit einem Webserver werden technisch bedingt gewisse Informationen
          protokolliert und gespeichert. Wenn Sie unsere Webseite besuchen, werden automatisch
          Informationen an den Server unserer Webseite gesendet. Diese Informationen beinhalten die
          IP-Adresse Ihres Rechners, das Datum und die Uhrzeit des Zugriffs, den Namen und die URL
          der abgerufenen Daten, die Webseite, von der aus der Zugriff erfolgt (Referrer-URL), den
          Browsertyp und -version sowie weitere durch den Browser übermittelte Informationen (z.B.
          Betriebssystem Ihres Rechners, geografische Herkunft, Spracheinstellung). Diese
          Informationen werden temporär in einem sogenannten Logfile gespeichert und nach den
          gesetzlichen Vorgaben aufbewahrt. Die Daten bearbeiten wir zum Zwecke der Gewährleistung
          eines reibungslosen Verbindungsaufbaus und einer komfortablen Nutzung unserer Webseite
          sowie der Auswertung der Systemsicherheit und -stabilität.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='was-sind-cookies-und-aehnliche-technologien'
        title='12.2 Was sind Cookies und ähnliche Technologien?'
        order={3}
      >
        <p>
          Wir können auf unserer Webseite Cookies und ähnliche Technologien setzen. Cookies sind in
          der Regel kleine Text-Dateien, die Ihr Browser automatisch erstellt und auf Ihrem Endgerät
          (Computer, Tablet, Smartphone etc.) speichert, wenn Sie unsere Seite aufrufen. Session
          Cookies speichern Ihre Eingaben, während Sie innerhalb der Webseite von Seite zu Seite
          navigieren. Session Cookies werden nach kurzer Zeit gelöscht, spätestens beim Schliessen
          Ihres Browsers. Dauerhafte Cookies bleiben auch nach dem Schliessen des Browsers für einen
          bestimmten Zeitraum gespeichert. Unter ähnlichen Technologien sind z.B. Pixel Tags (nicht
          sichtbare Bilder oder ein Programmcode, die von einem Server geladen werden und dabei dem
          Betreiber des Servers bestimmte Angaben übermitteln), Fingerprints (Informationen des
          Endgeräts und des Browsers, die beim Aufrufen einer Webseite gesammelt werden und in
          Verbindung das Endgerät von anderen unterscheidet) und andere Technologien (z.B. «Web
          Storage») zur Speicherung von Daten im Browser zu verstehen.
        </p>
        <p>
          Wir verwenden auf unserer Webseite sowohl dauerhafte als auch Session Cookies. Wir können
          Sie nicht in jedem Fall mit einem Cookie identifizieren. Wir setzen Cookies und ähnliche
          Technologien ein, damit wir die Nutzung unserer Webseite statistisch erfassen und zum
          Zwecke der Optimierung und der Benutzerfreundlichkeit auswerten können. Ebenso setzen wir
          Cookies zum Zwecke der Erbringung unserer Dienste ein (insb. technisch notwendige
          Cookies). Cookies haben unterschiedliche Aufbewahrungsdauern. Wir haben keinen Einfluss
          über die Aufbewahrungsdauer von Cookies, die von Drittanbietern gesetzt wurden.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-koennen-sie-cookies-und-aehnliche-technologien-deaktivieren'
        title='12.3 Wie können Sie Cookies und ähnliche Technologien deaktivieren?'
        order={3}
      >
        <p>
          Sie können Ihren Browser so konfigurieren, dass er Cookies und ähnliche Technologien nicht
          automatisch akzeptiert oder bestehende Cookies und andere im Browser gespeicherte Daten
          löscht. Ihren Browser können Sie auch mit zusätzlicher Software (sog. «Add-Ons» oder
          «Plug-Ins») erweitern, die dann das Tracking durch bestimmte Dritte verhindert (solche
          Plug-Ins gibt es z.B. unter www.noscript.net oder unter www.ghostery.com). In der Regel
          finden Sie in Ihrem Browser in den Hilfeseiten unter dem Stichwort «Datenschutz» weitere
          Informationen. Beachten Sie bitte, dass die teilweise oder vollständige Deaktivierung von
          Cookies dazu führen kann, dass Sie nicht alle Funktionen unserer Webseiten nutzen können.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='welche-cookies-und-aehnliche-technologien-setzen-wir-ein-und-wie-nutzen-wir-diese'
        title='12.4 Welche Cookies und ähnliche Technologien setzen wir ein und wie nutzen wir diese?'
        order={3}
      >
        <p>
          Technisch notwendige Cookies: Wir nutzen dauerhafte Cookies, um Ihre persönlichen
          Nutzereinstellungen (insb. betreffend Cookies und Sprachwahl auf unserer Webseite) zu
          speichern. Dabei werden wir keine Personendaten von Ihnen bearbeiten. Zweck der
          Bearbeitung ist die erneute Identifikation Ihrer persönlichen Einstellungen auf unserer
          Webseite. Diese Cookies sind notwendig für die Funktionalität unserer Webseite. Nach
          spätestens einem Monat werden diese Cookies automatisch von Ihrem System gelöscht. Sie
          können die Cookies auch jederzeit manuell löschen. Beachten Sie, dass dabei Ihre
          Nutzereinstellungen verloren gehen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='technisch-notwendige-cookies'
        title='12.4.1 Technisch notwendige Cookies'
        order={4}
      >
        <p>
          Wir nutzen dauerhafte Cookies, um Ihre persönlichen Nutzereinstellungen (insb. betreffend
          Cookies und Sprachwahl auf unserer Webseite) zu speichern. Dabei werden wir keine
          Personendaten von Ihnen bearbeiten. Zweck der Bearbeitung ist die erneute Identifikation
          Ihrer persönlichen Einstellungen auf unserer Webseite. Diese Cookies sind notwendig für
          die Funktionalität unserer Webseite. Nach spätestens einem Monat werden diese Cookies
          automatisch von Ihrem System gelöscht. Sie können die Cookies auch jederzeit manuell
          löschen. Beachten Sie, dass dabei Ihre Nutzereinstellungen verloren gehen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='erfolgs-und-reichweitenmessung'
        title='12.4.2 Erfolgs- und Reichweitenmessung'
        order={4}
      >
        <p>Wir verwenden zur Erfolgs- und Reichweitenmessung insbesondere folgende Dienste:</p>
        <ul>
          <li>
            Supabase von Supabase, Inc. mit Sitz in 970 Toa Payoh North #07-04, Singapore 318992.
            Mit diesem Dienst wird die Art und Weise, wie unsere Authentication Service unserer
            Appgenutzt wird, überwacht und aufgezeichnet. Supabase stellt uns die gesammelten
            Informationen in aggregierter Form zur Verfügung. Wir haben nicht die Möglichkeit den
            einzelnen Besucher zu identifizieren. Der Datentransfer erfolgt auf der Grundlage der
            Standardvertragsklauseln der EU-Kommission mit Anpassung fürs Schweizer Recht.
            Einzelheiten finden Sie unter: https://supabase.com/legal/dpa. Supabase kann die von ihr
            zusätzlich gesammelten Daten und der daraus gewonnen Erkenntnisse für eigene Zwecke
            verwenden. Supabase bearbeitet Ihre Personendaten dann in eigener Verantwortung und nach
            dessen Datenschutzbestimmungen. Mehr Informationen bezüglich der gesammelten Daten
            erhalten Sie in der Datenschutzerklärung von Supabase unter:
            https://supabase.com/privacy.
          </li>
          <li>
            Plausible Analytics von Plausible Insights OÜ, Västriku tn 2, 50403, Tartu, Estland. Wir
            verwenden Plausible Analytics zur datenschutzfreundlichen Analyse der Nutzung unserer
            Webseite. Plausible verzichtet vollständig auf Cookies und speichert keine
            personenbezogenen Daten. Die erhobenen Informationen sind aggregiert und lassen keinen
            Rückschluss auf einzelne Besucher zu. Die Datenverarbeitung erfolgt ausschliesslich
            innerhalb der EU. Weitere Informationen erhalten Sie unter:
            https://plausible.io/data-policy
          </li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='bot-erkennung-und-blockierung'
        title='12.4.3 Bot-Erkennung und -Blockierung'
        order={4}
      >
        <p>
          Wir verwenden zur Identifizierung und Blockierung von Bots insbesondere folgende Dienste:
        </p>
        <ul>
          <li>
            Cloudflare Bot Manager von Cloudflare, Inc., 101 Townsend Street, San Francisco,
            California 94107, USA. Wir verwenden Cloudflare Bot Manager, um unsere Website vor
            schädlichen Bots zu schützen. Das gesetzte Cookie wird nach 30 Minuten gelöscht. Weiter
            Informationen hierzu finden Sie unter:
            https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/#__cf_bm-cookie-for-cloudflare-bot-products.
            Cloudflare nimmt am Selbstzertifizierungsverfahren des US-Handelsministeriums teil und
            hält sich bei der Bearbeitung von Personendaten aus der Schweiz an die Grundsätze des
            Swiss-U.S. Data Privacy Frameworks. Die Datenschutzerklärung von Cloudflare finden Sie
            unter: https://www.cloudflare.com/privacypolicy/
          </li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='dienste-von-drittanbieter'
        title='12.5 Dienste von Drittanbieter (insb. Webseiten-Plugins)'
        order={3}
      >
        <p>
          Wir verwenden Dienste von Dritten, um Ihnen unsere Webseite bereitzustellen und
          zusätzliche Funktionen anbieten zu können. Insbesondere verwenden wir folgende Dienste:
        </p>
        <ul>
          <li>
            Supabase von Supabase, Inc., 970 Toa Payoh North #07-04, Singapore 318992. Wir verwenden
            Supabase, um unsere Website und Daten zu speichern und zu bearbeiten (insb. Datenbank),
            damit wir Ihnen die Inhalte und Daten schnell und einwandfrei auf allen Geräten
            ausliefern können. Die Bearbeitung der Personendaten findet in der EU statt
            (Serverstandort Frankfurt, DE). Sofern Personendaten in einen unsicheren Drittstaat
            übermittelt werden, erfolgt dieser Datentransfer auf der Grundlage der
            Standardvertragsklauseln der EU-Kommission mit Anpassung fürs Schweizer Recht.
            Einzelheiten finden Sie unter: https://supabase.com/legal/dpa. Die Datenschutzerklärung
            von Supabase finden Sie unter: https://supabase.com/privacy;
          </li>
          <li>
            Cloudflare von Cloudflare, Inc., 101 Townsend Street, San Francisco, California 94107,
            USA. Wir verwenden Cloudflare, um unsere Website-Inhalte schnell und einwandfrei auf
            allen Geräten ausliefern zu können. Cloudflare nimmt am Selbstzertifizierungsverfahren
            des US-Handelsministeriums teil und hält sich bei der Bearbeitung von Personendaten aus
            der Schweiz an die Grundsätze des Swiss-U.S. Data Privacy Frameworks. Die
            Datenschutzerklärung von Cloudflare finden Sie unter:
            https://www.cloudflare.com/privacypolicy/;
          </li>
          <li>
            DigitalOcean, LLC, 101 6th Ave New York, NY 10013, USA. Wir verwenden DigitalOcean, um
            unsere Website-Inhalte schnell und einwandfrei auf allen Geräten ausliefern zu können
            (insb. Hosting und Webserver). Die Bearbeitung der Personendaten findet in der EU statt
            (Serverstandort Frankfurt, DE). DigitalOcean nimmt am Selbstzertifizierungsverfahren des
            US-Handelsministeriums teil und hält sich bei der Bearbeitung von Personendaten aus der
            Schweiz an die Grundsätze des Swiss-U.S. Data Privacy Frameworks. Die
            Datenschutzerklärung von DigitalOcean finden Sie unter:
            https://www.digitalocean.com/legal/privacy-policy;
          </li>
          <li>
            Plausible Analytics von Plausible Insights OÜ, Västriku tn 2, 50403, Tartu, Estland. Wir
            setzen Plausible Analytics zur Analyse und Optimierung unserer Webseite ein. Der Dienst
            kommt ohne Cookies aus und erhebt keine personenbezogenen Daten. Die Verarbeitung
            erfolgt vollständig innerhalb der EU. Weitere Informationen finden Sie unter:
            https://plausible.io/privacy;
          </li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='welche-rechte-haben-sie'
        title='13. Welche Rechte haben Sie?'
        order={2}
      >
        <p>
          Als allfällig betroffene Person können Sie uns gegenüber und gemäss den jeweils
          anwendbaren nationalen und internationalen Bestimmungen verschiedene Ansprüche geltend
          machen. Wir bearbeiten gegebenenfalls zur Erfüllung Ihrer Ansprüche erneut Ihre
          Personendaten.
        </p>
        <p>Sie haben folgende Rechte in Bezug auf Ihre Personendaten:</p>
        <ul>
          <li>
            Auskunftsrecht: Sie haben das Recht, Auskunft darüber zu erhalten, welche Personendaten
            wir über Sie haben und wie wir diese bearbeiten;
          </li>
          <li>
            Recht auf Datenherausgabe oder -übertragung: Sie haben das Recht auf Herausgabe oder
            Übertragung einer Kopie Ihrer Personendaten in einem gängigen elektronischen Format,
            sofern diese automatisiert bearbeitet werden und die Daten mit Ihrer Einwilligung oder
            in unmittelbarem Zusammenhang mit dem Abschluss oder der Abwicklung eines Vertrages
            zwischen Ihnen und uns bearbeitet werden;
          </li>
          <li>
            Recht auf Berichtigung: Sie haben das Recht, Ihre Personendaten berichtigen zu lassen,
            wenn sie unrichtig sind;
          </li>
          <li>Recht auf Löschung: Sie haben das Recht, Ihre Personendaten löschen zu lassen;</li>
          <li>
            Widerspruchsrecht: Sie haben das Recht, der Bearbeitung Ihrer Personendaten zu
            widersprechen (insbesondere bei der Datenbearbeitung zum Zwecke des Direktmarketings).
          </li>
        </ul>
        <p>
          Beachten Sie, dass für diese Rechte Voraussetzungen und Ausnahmen gelten. Wir können Ihre
          Anfrage zur Ausübung dieser Rechte, sofern rechtlich zulässig, einschränken oder ablehnen.
          Wir behalten uns vor, Kopien aus datenschutzrechtlichen Gründen oder Gründen der
          Geheimhaltung zu schwärzen oder nur auszugweise zu liefern.
        </p>
        <p>
          Wenn Sie uns gegenüber Ihre Rechte ausüben wollen oder mit unserem Umgang mit Ihren
          Rechten oder dem Datenschutz nicht einverstanden sind, wenden Sie sich an uns; unsere
          Kontaktangaben finden Sie in Ziffer 1. Damit wir einen Missbrauch ausschliessen können,
          müssen wir Sie identifizieren (z.B. mit einer Ausweiskopie, falls nötig).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='rechtsgrundlagen-nach-dsgvo'
        title='14. Rechtsgrundlagen nach DSGVO'
        order={2}
      >
        <p>
          Wir gehen nicht davon aus, dass die EU-Datenschutzgrundverordnung («DSGVO») in unserem
          Fall anwendbar ist. Sollte dies jedoch ausnahmsweise für bestimmte Datenbearbeitungen
          anders sein, so gilt ausschliesslich für die Zwecke der DSGVO und der ihr unterliegenden
          Datenbearbeitungen zusätzlich diese Ziffer 15.
        </p>
        <p>Wir stützen die Bearbeitung Ihrer Personendaten insbesondere darauf, dass</p>
        <ul>
          <li>
            sie wie in Ziffer 4 beschrieben erforderlich ist für die Anbahnung und den Abschluss von
            Verträgen und dessen Verwaltung und Durchsetzung (Art. 6 Abs. 1 lit. b DSGVO);
          </li>
          <li>
            sie erforderlich ist zur Wahrung berechtigter Interessen von uns oder von Dritten wie in
            Ziffer 4 beschrieben, namentlich für die Kommunikation mit Ihnen oder Dritten, um unsere
            Website zu betreiben, für die Verbesserung unserer elektronischen Angebote und die
            Registrierung für bestimmte Angebote und Dienstleistungen, für Sicherheitszwecke, für
            die Einhaltung schweizerischen Rechts und interner Regularien für unser Risikomanagement
            und die Unternehmensführung und für weitere Zwecke wie etwa Schulung und Ausbildung,
            Administration, Beweis- und Qualitätssicherung, Organisation, Durchführung und
            Nachbereitung von Anlässen und zur Wahrung weiterer berechtigter Interessen (dazu Ziff.
            4) (Art. 6 Abs. 1 lit. f DSGVO);
          </li>
          <li>
            sie aufgrund unseres Auftrags oder unserer Stellung nach dem Recht des EWR bzw. eines
            Mitgliedsstaats gesetzlich vorgeschrieben oder erlaubt ist (Art. 6 Abs. 1 lit. c DSGVO)
            oder erforderlich ist, um Ihre lebenswichtigen Interessen oder jene von anderen
            natürlichen Personen zu schützen (Art. 6 Abs. 1 lit. d DSGVO);
          </li>
          <li>
            Sie in die Bearbeitung separat eingewilligt haben, bspw. über eine entsprechende
            Erklärung auf unserer Website (Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a DSGVO).
          </li>
        </ul>
        <p>
          Wenn Sie sich im EWR befinden, haben Sie in Ergänzung zu den Rechten in Ziff. 14 zudem das
          Recht auf Einschränkung der Datenbearbeitung und sie können sich bei der
          Datenschutz-Aufsichtsbehörde Ihres Landes beschweren. Eine Liste der Behörden im EWR
          finden Sie hier: https://edpb.europa.eu/about-edpb/board/members_de
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-koennen-wir-diese-datenschutzerklaerung-aendern'
        title='15. Wie können wir diese Datenschutzerklärung ändern?'
        order={2}
      >
        <p>
          Wir können diese Datenschutzerklärung jederzeit ändern oder neue Bearbeitungstätigkeiten
          aufnehmen. Wir aktualisieren diese Datenschutzerklärung von Zeit zu Zeit auch, um
          gesetzliche Anforderungen zu berücksichtigen. Wir werden Sie über solche Anpassungen und
          Ergänzungen in geeigneter Form informieren, insbesondere publizieren wir die jeweils
          aktuelle Datenschutzerklärung auf unserer Webseite (vgl. nachstehend). Die aktuelle
          Datenschutzerklärung kann jederzeit auf https://edutime.ch/docs/privacy abgerufen werden.
        </p>
      </LegalDocumentSection>
    </>
  )
}
