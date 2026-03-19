import type { TocLink } from '../PrivacyLayout'
import { LegalDocumentSection } from '../LegalDocumentSection'

export const avvMetaDe = {
  title: 'Auftragsverarbeitungsvereinbarung (AVV) von EduTime',
  tocLabel: 'Inhaltsverzeichnis',
  meta: {
    version: 'Version 1.1',
    lastUpdated: '19. März 2026',
  },
}

export const tocLinksDe: TocLink[] = [
  { id: 'zweck-und-geltung', label: '1. Zweck und Geltung', order: 1 },
  { id: 'rollen-der-parteien', label: '2. Rollen der Parteien', order: 1 },
  { id: 'datenarten-und-zwecke', label: '3. Datenarten und Zwecke', order: 1 },
  { id: 'technische-massnahmen', label: '4. Technische und organisatorische Massnahmen', order: 1 },
  { id: 'unterauftragsverarbeiter', label: '5. Unterauftragsverarbeiter', order: 1 },
  { id: 'drittstaatentransfers', label: '6. Datenübermittlungen ins Ausland', order: 1 },
  { id: 'unterstuetzung-und-meldungen', label: '7. Unterstützung und Meldungen', order: 1 },
  { id: 'laufzeit-und-beendigung', label: '8. Laufzeit und Beendigung', order: 1 },
  { id: 'schlussbestimmungen', label: '9. Schlussbestimmungen', order: 1 },
]

export function AVVDe() {
  return (
    <>
      <LegalDocumentSection id='zweck-und-geltung' title='1. Zweck und Geltung' order={2}>
        <p>
          Diese Auftragsverarbeitungsvereinbarung regelt die Verarbeitung personenbezogener Daten
          durch EduTime im Zusammenhang mit dem SaaS-Service. Sie gilt, sobald ein Kunde den
          Dienst nutzt und dabei personenbezogene Daten verarbeitet werden.
        </p>
        <p>
          Die AVV ergänzt die vertraglichen Regelungen zwischen dem Kunden und EduTime. Für
          datenschutzrechtliche Themen gilt die AVV vorrangig, soweit sie spezielle Vorgaben
          enthält.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='rollen-der-parteien' title='2. Rollen der Parteien' order={2}>
        <p>
          Der Kunde ist Verantwortlicher im Sinne des anwendbaren Datenschutzrechts. EduTime ist
          Auftragsverarbeiter und verarbeitet Daten ausschliesslich auf dokumentierte Weisung des
          Kunden, soweit keine gesetzliche Pflicht zur abweichenden Verarbeitung besteht.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='datenarten-und-zwecke' title='3. Datenarten und Zwecke' order={2}>
        <p>
          Verarbeitet werden jene personenbezogenen Daten, die der Kunde im Rahmen der Nutzung von
          EduTime bereitstellt. Dazu gehoeren insbesondere Kontaktdaten, Nutzungsdaten und
          arbeitsbezogene Erfassungsdaten.
        </p>
        <p>
          Die Verarbeitung erfolgt ausschliesslich zur Bereitstellung, Wartung, Absicherung und
          Weiterentwicklung des SaaS-Service sowie zur Erfuellung gesetzlicher Pflichten.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='technische-massnahmen'
        title='4. Technische und organisatorische Massnahmen'
        order={2}
      >
        <p>
          EduTime trifft angemessene technische und organisatorische Massnahmen, um Vertraulichkeit,
          Integritaet, Verfuegbarkeit und Belastbarkeit der Systeme sicherzustellen.
        </p>
        <ul>
          <li>Zugriffsschutz durch rollenbasierte Berechtigungen und starke Authentisierung</li>
          <li>Verschluesselung bei Uebertragung und, wo sinnvoll, bei Speicherung</li>
          <li>Protokollierung sicherheitsrelevanter Ereignisse</li>
          <li>Regelmaessige Updates, Sicherheitspruefungen und Backup-Verfahren</li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='unterauftragsverarbeiter'
        title='5. Unterauftragsverarbeiter'
        order={2}
      >
        <p>
          EduTime darf Unterauftragsverarbeiter einsetzen, soweit dies fuer den Betrieb des
          SaaS-Service erforderlich ist. EduTime stellt durch geeignete vertragliche Regelungen
          sicher, dass Unterauftragsverarbeiter ein gleichwertiges Datenschutzniveau einhalten.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='drittstaatentransfers'
        title='6. Datenübermittlungen ins Ausland'
        order={2}
      >
        <p>
          Erfolgt eine Datenuebermittlung in Staaten ohne angemessenes Datenschutzniveau, setzt
          EduTime geeignete Garantien ein, insbesondere anerkannte Standardvertragsklauseln und
          zusaetzliche Schutzmassnahmen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='unterstuetzung-und-meldungen'
        title='7. Unterstützung und Meldungen'
        order={2}
      >
        <p>
          EduTime unterstuetzt den Kunden bei der Erfuellung datenschutzrechtlicher Pflichten,
          insbesondere bei Auskunftsersuchen, Loesch- und Berichtigungsanfragen sowie bei
          Datenschutzverletzungen.
        </p>
        <p>
          Bekannt gewordene Datenschutzverletzungen werden ohne unangemessene Verzoegerung gemeldet,
          damit der Kunde seinen gesetzlichen Meldepflichten nachkommen kann.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='laufzeit-und-beendigung' title='8. Laufzeit und Beendigung' order={2}>
        <p>
          Die AVV gilt fuer die Dauer der vertraglichen Zusammenarbeit. Nach Vertragsende loescht
          oder gibt EduTime personenbezogene Daten gemaess den vertraglichen Vereinbarungen und den
          gesetzlichen Aufbewahrungspflichten zurueck.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='schlussbestimmungen' title='9. Schlussbestimmungen' order={2}>
        <p>
          Aenderungen dieser AVV erfolgen in Textform. Sollte eine Regelung unwirksam sein, bleiben
          die uebrigen Regelungen davon unberuehrt. Es gilt das im Hauptvertrag vereinbarte Recht
          und der dort vereinbarte Gerichtsstand.
        </p>
      </LegalDocumentSection>
    </>
  )
}
