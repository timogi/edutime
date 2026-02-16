import type { TocLink } from '../PrivacyLayout'
import { LegalDocumentSection } from '../LegalDocumentSection'

export const agbMetaDe = {
  title: 'Allgemeine Geschäftsbedingungen von EduTime',
  tocLabel: 'Inhaltsverzeichnis',
  meta: {
    version: 'Version 1.0',
    lastUpdated: '3. März 2025',
  },
}

export const tocLinksDe: TocLink[] = [
  { id: 'anwendungsbereich', label: '1. Anwendungsbereich', order: 1 },
  { id: 'umfang-der-nutzung', label: '2. Umfang der Nutzung', order: 1 },
  {
    id: 'testversion-und-kostenloser-leistungsumfang',
    label: '3. Testversion und kostenloser Leistungsumfang',
    order: 1,
  },
  {
    id: 'daten-datenspeicherung-und-backup',
    label: '4. Daten, Datenspeicherung und Backup',
    order: 1,
  },
  {
    id: 'verantwortung-fuer-inhalte',
    label: '5. Verantwortung für Inhalte und rechtmässige Nutzung',
    order: 1,
  },
  {
    id: 'sperrung-bei-unzulaessigen-inhalten',
    label: '6. Sperrung bei Unzulässigen Inhalten',
    order: 1,
  },
  { id: 'wahrung-der-schutzrechte', label: '7. Wahrung der Schutzrechte', order: 1 },
  { id: 'mitwirkungspflichten', label: '8. Mitwirkungspflichten des Kunden', order: 1 },
  {
    id: 'verguetung-und-zahlungsbedingungen',
    label: '9. Vergütung und Zahlungsbedingungen',
    order: 1,
  },
  { id: 'mehr-oder-mindernutzung', label: '10. Mehr- oder Mindernutzung und Auditrecht', order: 1 },
  { id: 'leistungserbringung', label: '11. Leistungserbringung', order: 1 },
  {
    id: 'gewaehrleistung',
    label: '12. Gewährleistung für kostenpflichtigen Leistungsumfang',
    order: 1,
  },
  { id: 'haftung', label: '13. Haftung', order: 1 },
  {
    id: 'vertragsschluss-dauer-beendigung',
    label: '14. Vertragsschluss, Dauer und Beendigung',
    order: 1,
  },
  { id: 'geheimhaltung-und-datenschutz', label: '15. Geheimhaltung und Datenschutz', order: 1 },
  {
    id: 'verletzung-geheimhaltung',
    label: '16. Verletzung der Geheimhaltung und Nutzungseinräumung',
    order: 1,
  },
  { id: 'hoehere-gewalt', label: '17. Höhere Gewalt', order: 1 },
  { id: 'schlussbestimmungen', label: '18. Schlussbestimmungen', order: 1 },
  { id: 'rechtswahl-und-gerichtsstand', label: '19. Rechtswahl und Gerichtsstand', order: 1 },
]

/**
 * German AGB (Allgemeine Geschäftsbedingungen) component.
 *
 * To add other language versions:
 * 1. Create a new component file (e.g., AGBFr.tsx for French, AGBEn.tsx for English)
 * 2. Translate the legal text content while maintaining the same structure
 * 3. Use LegalDocumentSection for each section
 */
export function AGBDe() {
  return (
    <>
      <LegalDocumentSection id='anwendungsbereich' title='1. Anwendungsbereich' order={2}>
        <p>
          EduTime GmbH, c/o Tim Ogi, Bienenstrasse 8, 3018 Bern (nachfolgend «EduTime»), stellt dem
          Kunden auf Basis eines Einzelvertrags (nachfolgend auch «SaaS-Einzelvertrag») sowie der
          vorliegenden Allgemeinen Geschäftsbedingungen (nachfolgend «AGB», inkl. deren
          integrierende Vertragsbestandteile, insgesamt nachfolgend «Vertrag») während der
          Vertragsdauer die im Vertrag beschriebenen Nutzungsrechte an der EduTime-Softwarelösung
          (nachfolgend «SaaS-Software») mit der zugehörigen Dokumentation auf der
          Serverinfrastruktur von EduTime oder des von EduTime eingesetzten Plattform-Providers zur
          Nutzung durch den Kunden mittels Fernzugriff über das Internet zur Verfügung und erbringt
          die im Vertrag vereinbarten, mit dieser Nutzung der SaaS-Software verbundenen weiteren
          Leistungen (wie z.B. die Zurverfügungstellung von Speicherplatz sowie Support und Wartung)
          im Sinne eines Cloud-Services (nachfolgend insgesamt «SaaS-Service»).
        </p>
        <p>
          Einkaufs- und Geschäftsbedingungen des Kunden finden keine Anwendung, auch wenn EduTime
          diesen nicht ausdrücklich widerspricht. Insbesondere gelten die vorliegenden AGB auch
          dann, wenn Bestellungen oder Gegenbestätigungen des Kunden unter Hinweis auf eigene
          Geschäfts- bzw. Einkaufsbedingungen erfolgen. Abweichungen von diesen AGB sind nur
          wirksam, wenn sie unter Hinweis auf eine Abweichung von den vorliegenden AGB zwischen den
          Vertragsparteien schriftlich vereinbart oder schriftlich durch EduTime bestätigt werden.
        </p>
        <p>
          Durch die vorliegenden AGB allein werden wechselseitig keinerlei Belieferungs-, Zahlungs-,
          Abnahme- oder Kontrahierungspflichten begründet. Ein Anspruch des Kunden auf Lieferung
          oder Leistung in Bezug auf den Anwendungsbereich der AGB setzt einen abgeschlossenen
          SaaS-Einzelvertrag voraus. Die Präsentation von Produkten und Leistungen auf den Websites
          oder in Preislisten von EduTime stellt noch kein rechtlich bindendes Vertragsangebot von
          EduTime dar. Ohne anderslautende Angaben sind Offerten von EduTime zehn (10) Tage gültig.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='umfang-der-nutzung' title='2. Umfang der Nutzung' order={2}>
        <p>
          EduTime überlässt dem Kunden im Umfang des SaaS-Einzelvertrages die dort spezifizierte
          SaaS-Software im vereinbarten Leistungsumfang (z.B. Anzahl User) zur Nutzung über das
          Internet. Zu diesem Zweck stellt EduTime die SaaS-Software auf einer Serverplattform zur
          Verfügung, auf welche der Kunde über das Internet zugreifen und so die SaaS-Software
          nutzen kann. Die dem Kunden von EduTime überlassenen Nutzungsrechte an fremder, von
          Dritten erstellter SaaS-Software, sind dem Umfang nach auf diejenigen Nutzungsrechte
          beschränkt, welche Dritte EduTime eingeräumt haben.
        </p>
        <p>
          Der SaaS-Service von EduTime ist nicht zugelassen für den Einsatz in sicherheitskritischen
          oder anderen Anwendungen, deren Ausfall zu Personenschäden, Todesfällen oder
          katastrophaler Sachbeschädigung führen kann. Falls der Kunde den SaaS-Service für die
          Nutzung in solchen Anwendungen verwendet, anerkennt er, dass eine solche Nutzung auf
          alleiniges Risiko des Kunden erfolgt. Der Kunde verpflichtet sich EduTime von allen Kosten
          und Haftungen freizustellen, zu verteidigen und schadlos zu halten, die aus oder im
          Zusammenhang mit einer solchen Nutzung entstehen.
        </p>
        <p>
          Unter diesen AGB in Verbindung mit dem entsprechenden SaaS-Einzelvertrag räumt EduTime dem
          Kunden das nicht exklusive, unübertragbare, nicht unterlizenzierbare und entgeltliche
          Recht ein, die SaaS-Software gemäss den Bestimmungen dieser AGB und des entsprechenden
          SaaS-Einzelvertrages nach vollständiger Bezahlung der anfallenden Nutzungsgebühren für
          eigene Zwecke zu nutzen. Ein darüberhinausgehender Erwerb von Rechten an der SaaS-Software
          ist mit dieser Nutzungsrechtseinräumung nicht verbunden. Dem Kunden ist es ausdrücklich
          nicht gestattet, den SaaS-Service oder Teile davon zu vermieten und/oder an Dritte
          weiterzugeben.
        </p>
        <p>
          Der Kunde ist verpflichtet sicherstellen, dass jegliche Zugriffe, Verwendungen und Bezüge
          durch dessen Nutzern (d.h. natürliche Personen, die zur Nutzung des SaaS-Services zum
          Vorteil des Kunden berechtigt sind und die über einzigartige Benutzerkennungen und
          Passwörter für den SaaS-Service verfügen) diesem Vertrag unterliegen und damit im Einklang
          stehen. Der Kunde kann seinen Nutzern das Recht erteilen, auf den SaaS-Service zuzugreifen
          und ihn zu nutzen oder die Dienste, die im Rahmen eines SaaS-Einzelvertrages erworben
          wurden, zu beziehen; dies gilt unter der Voraussetzung, dass jegliche solche Zugriffe,
          Verwendungen und Bezüge durch die Nutzer dem Vertrag unterliegen und dass der Kunde zu
          jedem Zeitpunkt für die Erfüllung des vorliegenden Vertrags durch seine Nutzer haftet.
        </p>
        <p>
          Sofern im SaaS-Einzelvertrag nichts anderes vereinbart ist, verpflichtet sich EduTime, die
          folgenden Supportleistungen für den SaaS-Service an Werktagen, in der Zeit von 08:00 bis
          17:00 Uhr, unter Ausschluss offizieller sowie ortsüblicher Feiertage am Sitz von EduTime
          (Leistungen ausserhalb dieser Zeiten werden gesondert verrechnet) zu erbringen:
        </p>
        <ul>
          <li>
            E-Mail-Support für den Kunden bei Anwendungsproblemen im Zusammenhang mit dem
            SaaS-Service;
          </li>
          <li>Annahme und Behandlung von Fehlermeldungen des Kunden;</li>
          <li>Fehlersuche bei Störungen des SaaS-Services;</li>
          <li>Aktualisierung der Online-Benutzerdokumentation.</li>
        </ul>
        <p>
          Der Kunde ist verpflichtet, Probleme mit dem SaaS-Service, wie z.B. Fehlfunktionen, Bugs
          oder Fehler in der SaaS-Software sowie die ihm bekannte unbefugte Nutzung des
          SaaS-Services, per Mail (info@edutime.ch) oder über das von EduTime unter einer bestimmten
          URL zur Verfügung gestellte Issue-Tool in angemessener Weise dokumentiert zu melden. Die
          Fehlerbehebung oder das Patchen von der SaaS-Software oder der dazugehörigen Dokumentation
          wird von EduTime nach bestem Wissen durchgeführt. Darüberhinausgehende Supportleistungen
          werden dem Kunden, nach den jeweils gültigen Sätzen von EduTime in Rechnung gestellt.
        </p>
        <p>
          Die aktuellen, technischen Voraussetzungen für die Nutzung/Netzwerkanbindung des Kunden
          werden im SaaS-Einzelvertrag festgelegt. Die darin genannten, zur Zeit des
          Vertragsschlusses gültigen technischen Voraussetzungen können von EduTime jederzeit
          einseitig dem Stand der Technik angepasst werden, wobei EduTime den Kunden über
          wesentliche Anpassungen unter Einhaltung einer angemessenen Frist (in der Regel einen
          Monat im Voraus) insbesondere per E-Mail oder auf einer geeigneten Website informiert. Der
          Kunde verpflichtet sich, die technischen Voraussetzungen jederzeit einzuhalten und dafür
          zu sorgen, dass die Benutzer mit der ordnungsgemässen Bedienung der SaaS-Software vertraut
          sind.
        </p>
        <p>
          EduTime ist berechtigt, den SaaS-Service, insbesondere die Leistungsmerkmale der
          SaaS-Software jederzeit weiterzuentwickeln und, um den technischen Fortschritt und
          geänderte rechtliche Rahmenbedingungen zu berücksichtigen, anzupassen, einzuschränken oder
          aber die Erbringung einzelner Dienstleistungen ganz einzustellen. Änderungen, die das
          Leistungsangebot für den Kunden wesentlich einschränken, teilt EduTime dem Kunden
          vorgängig unter Einhaltung einer angemessenen Mitteilungsfrist schriftlich, per E-Mail
          oder auf einer geeigneten Website mit. Sofern die Nutzung des aktualisierten SaaS-Services
          für den Kunden unzumutbar ist, kann der Kunde den SaaS-Service bis ein (1) Monat nach der
          Aktualisierung des SaaS-Services ausserordentlich unter Berücksichtigung einer
          Kündigungsfrist von 20 Tagen auf ein Monatsende hin durch Mitteilung in Schriftform (vgl.
          Ziffer 17.3) kündigen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='testversion-und-kostenloser-leistungsumfang'
        title='3. Testversion und kostenloser Leistungsumfang'
        order={2}
      >
        <p>
          Soweit der Kunde den SaaS-Service oder die SaaS-Software als Testversion einsetzt, gewährt
          EduTime dem Kunden dafür eine Lizenz zum ausschliesslichen Zweck des Testens und
          Evaluieren und ausschliesslich für interne, nicht-produktive Zwecke und, sofern nicht
          ausdrücklich anders angegeben, für eine begrenzte Zeitspanne von 30 Tagen («Testversion»).
        </p>
        <p>
          Die Testversion sowie die vom Kunden gewählte SaaS-Software mit einem kostenlosen
          Leistungsumfang wird unter Ausschluss jeder Sach- und Rechtsgewährleistungen «as is» zur
          Verfügung gestellt. EduTime lehnt ausdrücklich alle stillschweigenden oder gesetzlichen
          Garantien und Zusicherungen (z.B. betreffend Einsatz- und Betriebsbedingungen,
          Funktionalitäten, Eignung etc.) ab. Der Kunde hat keinen Anspruch auf Support-, Wartungs-
          und Pflegeleistungen.
        </p>
        <p>
          Wird die Testversion während der gewährten Testdauer auf keinen kostenpflichtigen
          Leistungsumfang geändert, werden nach Ablauf der Lizenz für die Testversion alle Daten des
          Kunden entsprechend den Löschzyklen von EduTime gelöscht.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='daten-datenspeicherung-und-backup'
        title='4. Daten, Datenspeicherung und Backup'
        order={2}
      >
        <p>
          EduTime stellt dem Kunden zur Speicherung der Daten im Zusammenhang mit der Nutzung der
          SaaS-Software Speicherkapazität auf der Serverinfrastruktur von EduTime nach Massgabe des
          SaaS-Einzelvertrages zur Verfügung.
        </p>
        <p>
          Die Daten gehören zum Rechtsbereich des Kunden, der den SaaS-Service nutzt, auch wenn
          diese örtlich bei EduTime gespeichert sind. Für die Speicherung und Verarbeitung der Daten
          ist ausschliesslich der Kunde verantwortlich. Der Kunde hält sich insbesondere bei der
          Erfassung und Bearbeitung von Personendaten strikte an die Bestimmungen des jeweils
          anwendbaren Datenschutzgesetzes.
        </p>
        <p>
          EduTime ermöglicht dem Kunden, dessen auf der Serverinfrastruktur gespeicherten Daten
          während der Vertragsdauer und innerhalb von dreissig (30) Tagen nach Vertragsbeendigung in
          einem von EduTime zur Verfügung gestellten standardisierten Verfahren herunterzuladen.
          EduTime übernimmt keinerlei Gewähr für eine Nutzbarkeit von heruntergeladenen Daten auf
          anderen Systemen. EduTime ist berechtigt, die bei EduTime gespeicherten Daten des Kunden
          nach Vertragsbeendigung im Zuge üblicher Löschzyklen zu löschen, es sei denn, EduTime ist
          zu deren Aufbewahrung nach zwingendem Recht verpflichtet.
        </p>
        <p>
          EduTime trifft geeignete Vorkehrungen gegen den Datenverlust bei Ausfällen der
          Serverinfrastruktur sowie zur Verhinderung unbefugter Zugriffe durch Dritte auf die Daten
          des Kunden. Zu diesem Zweck nimmt EduTime regelmässige Backups vor (mindestens einmal pro
          Tag) und schützt die auf dem Server gespeicherten Zugangsdaten des Kunden mit geeigneten,
          dem technischen Stand entsprechenden Mitteln gegen unbefugte Zugriffe.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='verantwortung-fuer-inhalte'
        title='5. Verantwortung für Inhalte und rechtmässige Nutzung'
        order={2}
      >
        <p>
          Der Kunde verpflichtet sich, mit dem SaaS-Service nur zulässige Inhalte zu verarbeiten.
          Unzulässig sind insbesondere Inhalte, die Rechte von EduTime oder Dritter, insbesondere
          Immaterialgüterrechte i.w.S. (beispielsweise Urheberrechte oder Markenrechte) oder
          Persönlichkeitsrechte, oder den geschäftlichen Ruf verletzen oder gefährden; unzulässig
          sind ausserdem sämtliche Inhalte, die Straftatbestände (namentlich in den Bereichen
          Pornographie, Gewaltdarstellung, Rassismus, Geschäftsgeheimnisse, Ehrverletzung und
          Betrug) erfüllen (nachfolgend gemeinsam «Unzulässige Inhalte»). Besonders
          ressourcenintensive Nutzungen, d.h. Nutzungen, welche die normale Funktion und die
          Sicherheit der Serverinfrastruktur von EduTime sowie die Nutzung der Serverinfrastruktur
          durch andere Kunden beeinträchtigen können, sind nur mit vorgängiger Zustimmung von
          EduTime erlaubt. EduTime hat volles Ermessen über den Entscheid, ob sie die Zustimmung
          erteilt und kann eine erteilte Zustimmung aus Gründen der Sicherung des Betriebs der
          Serverinfrastruktur jederzeit mit sofortiger Wirkung widerrufen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='sperrung-bei-unzulaessigen-inhalten'
        title='6. Sperrung bei Unzulässigen Inhalten'
        order={2}
      >
        <p>
          EduTime ist nicht zur Überwachung der im SaaS-Service enthaltenen Inhalte verpflichtet.
        </p>
        <p>
          EduTime ist berechtigt, den Zugang zum SaaS-Service ganz oder teilweise zu sperren und die
          Dienstleistungen vorläufig oder ganz einzustellen, (i) falls EduTime dazu gerichtlich oder
          behördlich aufgefordert wird, oder (ii) sich sonst wie selber rechtlich verantwortlich
          oder strafbar machen könnte, oder (iii) wenn eine Stichprobe konkrete Hinweise oder den
          Verdacht auf das Zugänglichmachen von Unzulässigen Inhalten oder auf eine sonstwie rechts-
          oder vertragswidrige Nutzung ergibt. EduTime ist berechtigt, dem Kunden den im
          Zusammenhang mit Sperrungen und anderen Massnahmen entstandenen Aufwand in Rechnung zu
          stellen. Ausserdem verpflichtet sich der Kunde, EduTime vollumfänglich schadlos zu halten,
          wenn ein Dritter EduTime im Zusammenhang mit dem Zugänglichmachen Unzulässiger Inhalte
          über den SaaS-Service ins Recht fassen will. Dies beinhaltet auch den Ersatz für die
          Kosten einer Rechtsvertretung von EduTime. Die Geltendmachung weiteren Schadens bleibt
          vorbehalten. EduTime kann vom Kunden für die vorsorgliche Deckung des Aufwands und des
          weiteren Schadens eine Sicherheitsleistung verlangen. Wird diese Sicherheitsleistung nicht
          bezahlt oder befolgt der Kunde die im Zusammenhang mit den getroffenen Massnahmen
          erfolgten Aufforderungen nicht, kann EduTime die Erbringung des SaaS-Service aussetzen
          oder den Vertrag mit dem Kunden fristlos kündigen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wahrung-der-schutzrechte'
        title='7. Wahrung der Schutzrechte'
        order={2}
      >
        <p>
          Der Kunde anerkennt die Schutzrechte, insbesondere das Urheberrecht, von EduTime als
          Rechtsinhaber an der SaaS-Software, enthält sich während der Dauer der dem Kunden
          eingeräumten Überlassung der SaaS-Software jedes Angriffs auf Bestand und Umfang dieser
          Rechte und ergreift gemäss den Instruktionen von EduTime alle Massnahmen, um die Rechte
          von EduTime zu wahren und unterstützt EduTime in angemessenem Umfang bei der Verteidigung
          der Schutzrechte.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='mitwirkungspflichten'
        title='8. Mitwirkungspflichten des Kunden'
        order={2}
      >
        <p>
          Der Kunde ist verantwortlich für die Bereitstellung und Instandhaltung der für die Nutzung
          des SaaS-Services benötigten Endgeräte, die Datenleitung für den Zugriff auf die
          SaaS-Software (z.B. Hardware und Betriebssystem, Netzwerkgeräte, Miet- oder
          Internetverbindung etc.) und stellt sicher, dass deren Konfiguration und technischer Stand
          den jeweils aktuellen Vorgaben von EduTime entsprechen (zurzeit: HTML5-Internet-Browser
          wie Google Chrome in ihrer aktuellsten Version mit aktivierten Frist-Party-Cookies und
          Skripts; mit andere Browser/Versionen kann es sein, dass auf die SaaS-Service nicht
          zugegriffen oder nur eingeschränkt genutzt werden kann). Bei der Nutzung des SaaS-Services
          durch ihn oder von ihm bestimmte Benutzer beachtet der Kunde die Vorgaben in einer
          allfälligen Benutzerdokumentation und schützt die Zugriffsdaten vor unberechtigten
          Zugriffen. Jegliche unter der Verwendung von Zugangsdaten und Passwörter des Kunden
          getätigte Handlungen wie Mitteilungen und Änderungen an Benutzerdaten oder sonstige
          Einstellungen rechnet EduTime dem Kunden zu.
        </p>
        <p>
          Vor der Übermittlung von Daten und Informationen an EduTime wird der Kunde diese auf Viren
          prüfen und dem Stand der Technik entsprechende Viren- und Malwareschutzprogramme
          einsetzen.
        </p>
        <p>
          Bei schwerwiegenden Verletzungen der Nutzungsbedingungen des SaaS-Services (durch den
          Kunden selbst oder von ihm bestimmte Benutzer) oder der Mitwirkungspflichten des Kunden
          ist EduTime berechtigt, dem Kunden den Zugang zum SaaS-Service ganz oder teilweise zu
          sperren. Bei unberechtigter Nutzungsüberlassung hat der Kunde EduTime auf Verlangen
          unverzüglich sämtliche Angaben zur Geltendmachung der Ansprüche gegen den Nutzer zu
          machen, insbesondere dessen Namen und Anschrift mitzuteilen.
        </p>
        <p>
          Der Kunde trifft angemessene Vorkehrungen für den Fall, dass die SaaS-Software ganz oder
          teilweise nicht ordnungsgemäss arbeitet (z.B. durch Datensicherung, Störungsdiagnose,
          regelmässige Überprüfung der Ergebnisse).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='verguetung-und-zahlungsbedingungen'
        title='9. Vergütung und Zahlungsbedingungen'
        order={2}
      >
        <p>
          Die vom Kunden zu entrichtende Vergütung für den SaaS-Service ergibt sich aus dem
          SaaS-Einzelvertrag.
        </p>
        <p>
          EduTime ist berechtigt, die im SaaS-Einzelvertrag vereinbarte Vergütung unter einer
          Vorankündigungsfrist von zwei (2) Monaten auf den Beginn einer neuen Vertragsperiode hin
          einseitig anzupassen. Falls der Kunde mit der Preisanpassung nicht einverstanden ist, kann
          der Kunde den SaaS-Service unter Berücksichtigung einer Kündigungsfrist von 20 Tagen auf
          das Ende der Vertragsperiode hin durch Mitteilung in Schriftform (vgl. Ziffer 17.3)
          kündigen.
        </p>
        <p>
          Alle Preisangaben verstehen sich zuzüglich der jeweils geltenden Mehrwertsteuer. EduTime
          stellt die geschuldete Vergütung für die jeweilige Vertragsperiode grundsätzlich im Voraus
          in Rechnung. Rechnungen sind ohne Abzug innert dreissig (30) Tagen ab Rechnungsdatum zur
          Zahlung fällig.
        </p>
        <p>
          Der Verzug des Kunden tritt ohne weitere Mahnung nach Ablauf der Zahlungsfrist ein.
          EduTime ist berechtigt, ab Verzugseintritt den gesetzlichen Verzugszins sowie Spesen in
          Rechnung zu stellen. Scheinen Zahlungsansprüche von EduTime als gefährdet, können
          Leistungen ausgesetzt oder von Vorauszahlungen abhängig gemacht werden.
        </p>
        <p>
          Sollte der Kunde seinen Zahlungsverpflichtungen gemäss den Bestimmungen dieser Ziffer 9
          nicht vollständig nachkommen, so behält sich EduTime das Recht vor, die auf der
          Serverinfrastruktur von EduTime gespeicherten Daten des Kunden vorübergehend zu sperren,
          bis zur vollständigen Bezahlung der geschuldeten Vergütung.
        </p>
        <p>
          Der Kunde darf nur mit unbestrittenen oder rechtskräftig festgestellten Forderungen
          verrechnen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='mehr-oder-mindernutzung'
        title='10. Mehr- oder Mindernutzung und Auditrecht'
        order={2}
      >
        <p>
          EduTime hat das Recht, monatlich und jährlich den effektiven Umfang der Nutzung des im
          SaaS-Einzelvertrag vereinbarten Leistungsumfangs des SaaS-Services zu prüfen und die
          Vergütung für eine festgestellte Mehrnutzung gegenüber dem lizenzierten Leistungsumfang
          nachzufordern.
        </p>
        <p>
          EduTime hat das Recht, sich unter Wahrung der Geschäfts- und Betriebsgeheimnisse des
          Kunden die Einhaltung der Vorschriften über den bestimmungsgemässen Gebrauch und den
          Schutz der SaaS-Software oder des SaaS-Services im Betrieb des Kunden mittels Inspektionen
          oder Audits selbst oder durch einen beauftragten Dritten (z.B. eine Treuhandgesellschaft)
          zu überprüfen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='leistungserbringung' title='11. Leistungserbringung' order={2}>
        <p>
          EduTime ist berechtigt, Dritte als Unterbeauftragte einzusetzen, für deren sorgfältige
          Auswahl, Instruktion und Überwachung EduTime einsteht. EduTime kann Dienstleistungen
          gleicher oder ähnlicher Art auch für andere Kunden erbringen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='gewaehrleistung'
        title='12. Gewährleistung für kostenpflichtigen Leistungsumfang'
        order={2}
      >
        <p>
          EduTime leistet Gewähr für die von ihr schriftlich abgegebenen, zugesicherten
          Eigenschaften des SaaS-Services oder der SaaS-Software.
        </p>
        <p>
          Der Kunde anerkennt, dass der Zugang zum SaaS-Service auch von Faktoren abhängt, die
          ausserhalb der Kontrolle von EduTime liegen, wie z.B. der Netzwerkzugang zum
          Plattform-Provider, in dem die SaaS-Software betrieben wird, und dass EduTime daher,
          unbeschadet der im vorstehenden Absatz genannten Gewährleistung, keine Garantie dafür
          übernimmt, dass der SaaS-Service ohne Unterbrechungen verfügbar ist. Darüber hinaus kann
          EduTime keine Reaktionszeiten, Wiederherstellungszeiten oder monatliche oder jährliche
          Mindestverfügbarkeiten garantieren und auch nicht, dass die SaaS-Software und das
          Rechenzentrum des Plattform-Providers bzw. dessen Serverplattform fehlerfrei sind oder
          unterbrechungsfrei genutzt werden können. Insbesondere ist EduTime berechtigt, den Zugang
          für dringende Wartungsarbeiten oder bei aussergewöhnlichen Sicherheitsrisiken jederzeit zu
          sperren.
        </p>
        <p>
          Für vom Kunden nach Entdeckung unverzüglich und dokumentiert gemeldete, nachvollziehbare
          Mängel an der SaaS-Software wird EduTime nach eigener Wahl den Mangel beseitigen, dem
          Kunden eine nachgebesserte Softwareversion bereitstellen oder zumutbare
          Umgehungsmöglichkeiten aufzeigen.
        </p>
        <p>
          Gelingt es EduTime trotz wiederholter Bemühungen nicht, einen vom Kunden ordnungsgemäss
          gerügten, nachvollziehbaren Mangel nachzubessern, und wird dadurch die
          Gebrauchstauglichkeit der SaaS-Software gegenüber der Beschreibung des Funktionsumfangs
          wesentlich herabgesetzt oder ausgeschlossen, so hat der Kunde zweimal schriftlich eine
          angemessene Nachfrist anzusetzen und hat nach deren erfolglosem Ablauf ein
          ausserordentliches Recht zur Kündigung des SaaS-Services. Bei sonstigen Mängeln hat der
          Kunde das Recht auf eine dem Minderwert entsprechende Herabsetzung bzw. teilweise
          Rückleistung der Vergütung für den betreffenden Teil der SaaS-Software. Jede weitere
          Gewährleistung von EduTime wird hiermit ausdrücklich ausgeschlossen.
        </p>
        <p>
          Die Gewährleistungsfrist beträgt sechs (6) Monate ab erstmaliger, kostenpflichtiger
          Bereitstellung der SaaS-Software durch EduTime.
        </p>
        <p>
          Soweit ein gemeldeter Mangel nicht nachweisbar oder nicht von EduTime verschuldet ist,
          vergütet der Kunde EduTime infolge der Fehlersuche entstandenen Aufwendungen. Zu vergüten
          ist vom Kunden insbesondere auch der Mehraufwand bei der Beseitigung von Mängeln, der bei
          EduTime dadurch entsteht, dass der Kunde die Mitwirkungspflichten nicht ordnungsgemäss
          erfüllt, den SaaS-Service oder die SaaS-Software unsachgemäss bedient oder von EduTime
          empfohlene Dienstleistungen nicht in Anspruch genommen hat.
        </p>
        <p>
          EduTime leistet überdies Gewähr dafür, dass der Einräumung der vereinbarten
          Nutzungsbefugnisse an den Kunden keine Rechte Dritter entgegenstehen. Wenn ein Dritter
          Ansprüche behauptet, die der Ausübung der vertraglich eingeräumten Nutzungsbefugnis
          entgegenstehen, so hat der Kunde EduTime unverzüglich schriftlich und umfassend zu
          unterrichten. Stellt der Kunde die Nutzung des SaaS-Services oder der SaaS-Software aus
          Schadensminderungs- oder sonstigen wichtigen Gründen ein, ist der Kunde verpflichtet, den
          Dritten darauf hinzuweisen, dass mit der Nutzungseinstellung keine Anerkennung der
          behaupteten Schutzrechtsverletzung verbunden ist. Der Kunde ermächtigt EduTime hiermit,
          die Auseinandersetzung mit dem Dritten gerichtlich und aussergerichtlich allein zu führen.
          Macht EduTime von dieser Ermächtigung Gebrauch, so darf der Kunde die Ansprüche des
          Dritten nicht ohne Zustimmung von EduTime anerkennen und EduTime ist verpflichtet, die
          Ansprüche auf eigene Kosten abzuwehren. EduTime stellt den Kunden von rechtskräftig
          auferlegten Kosten und Schadenersatzansprüchen frei. Die Regelungen dieses Absatzes gelten
          unabhängig vom Ablauf der Gewährleistungsfrist gemäss Ziffer 12.5.
        </p>
        <p>
          Bei nachgewiesenen Rechtsmängeln leistet EduTime Gewähr durch Nacherfüllung, indem sie dem
          Kunden eine rechtlich einwandfreie Benutzungsmöglichkeit am gelieferten SaaS-Service oder
          nach Wahl von EduTime an ausgetauschter oder geänderter gleichwertiger SaaS-Software
          verschafft, oder, wenn das Vorangehende nicht im Rahmen der vertretbaren Möglichkeiten von
          EduTime liegt, die betreffende Komponente der SaaS-Software zurücknimmt und dem Kunden die
          bereits geleistete Vergütung unter Abzug einer angemessenen Entschädigung für die erfolgte
          Nutzung anteilig zurückzahlt. Der Kunde hat einen neuen Programmstand zu übernehmen,
          ausser dies würde bei ihm zu unangemessenen Anpassungs- und Umstellungsproblemen führen.
        </p>
        <p>
          Die Gewährleistungsrechte dieser Ziffer 12 gelten nicht für SaaS-Software mit kostenlosem
          Leistungsumfang (vgl. Ziffer 3 oben).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='haftung' title='13. Haftung' order={2}>
        <p>
          Jede Vertragspartei haftet der anderen Vertragspartei für Schäden, die sich aus einem
          Vertrag zwischen ihnen ergeben, bei grober Fahrlässigkeit und Vorsatz sowie bei Tod und
          Körperverletzung unbeschränkt.
        </p>
        <p>
          Sofern in vorstehender Ziffer 13.1 nichts anderes bestimmt ist, ist die Gesamthaftung der
          Vertragsparteien für unmittelbare Schäden, die sich aus leichter Fahrlässigkeit im
          Zusammenhang mit einem Vertrag zwischen den Vertragsparteien ergeben, pro Vertrag und Jahr
          auf maximal 50 % der Vergütung aus dem jeweiligen Vertrag, höchstens jedoch CHF 10'000.00,
          beschränkt.
        </p>
        <p>
          Jede Haftung von EduTime oder ihrer Hilfspersonen für andere oder weitergehende Ansprüche
          und Schäden, insbesondere Ansprüche auf Ersatz indirekter oder Folgeschäden, von
          Mangelfolgeschäden oder Ansprüchen Dritter, entgangener Gewinn, nicht realisierte
          Einsparungen oder Verdienstausfall sowie Datenverlust – gleich aus welchem Rechtsgrund –
          ist ausdrücklich ausgeschlossen. EduTime haftet auch nicht für Schäden, die durch
          unbefugte Eingriffe Dritter auf die Serverinfrastruktur und die sonstigen Systeme von
          EduTime entstehen. Das Risiko für solche Schäden trägt der Kunde allein. Dies betrifft
          z.B. Eingriffe durch Computerviren, Ransomware oder DDoS-Attacken. Der Haftungsausschluss
          umfasst auch Schäden, die dem Kunden durch Massnahmen zur Abwehr solcher Eingriffe
          entstehen. Die für eine Erfüllung vorgesehenen Termine werden entsprechend der Dauer der
          Einwirkung der von EduTime nicht zu vertretenden Umstände erstreckt.
        </p>
        <p>Vorbehalten bleibt eine weitergehende zwingende gesetzliche Haftung.</p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='vertragsschluss-dauer-beendigung'
        title='14. Vertragsschluss, Dauer und Beendigung'
        order={2}
      >
        <p>
          Der Vertrag tritt mit Bestellbestätigung durch EduTime (SaaS-Einzelvertrag) in Kraft und
          gilt für eine initiale Vertragsdauer von einem Jahr, sofern im SaaS-Einzelvertrag nichts
          Abweichendes vereinbart wurde. Der Vertrag tritt jedoch spätestens mit der
          Leistungserbringung von EduTime für den Kunden in Kraft. Der Vertrag verlängert sich
          anschliessend automatisch um jeweils ein weiteres Jahr, sofern er nicht durch eine der
          Vertragsparteien unter Einhaltung einer Frist von drei (3) Monaten vor Ablauf der
          Vertragsdauer schriftlich oder über eine von EduTime allenfalls explizit dem Kunden zur
          Verfügung gestellten elektronischen Funktion gekündigt wird.
        </p>
        <p>
          Erweiterte Support-, Wartungs- und Pflegeleistungen des SaaS-Services beginnen mit
          Bestellbestätigung durch EduTime (Einzelvertrag), wobei die Vertragsdauer derjenigen für
          den SaaS-Service angeglichen wird. Für die automatische Verlängerung und Kündigung gilt
          das in der Ziffer 14.1 ausgeführte.
        </p>
        <p>
          Annahmeerklärungen des Kunden, die Erweiterungen, Einschränkungen oder sonstige Änderungen
          zum jeweiligen Vertragsangebot von EduTime enthalten, gelten als Ablehnung des
          ursprünglichen Vertragsangebots von EduTime und führen nur dann zum Abschluss eines
          Vertrags, wenn sie von EduTime ausdrücklich schriftlich bestätigt werden.
          Annahmeerklärungen des Kunden, die nach Ablauf einer im Vertragsangebot definierten
          Annahme- bzw. Angebotsbindefrist erfolgen, gelten als neues Vertragsangebot des Kunden,
          welches erst wirksam wird, wenn EduTime die Annahme ausdrücklich schriftlich bestätigt.
        </p>
        <p>
          Wenn der Kunde mehrfach oder in grober Art gegen eine wesentliche Vertragsbestimmung
          verstösst, insbesondere wenn er den SaaS-Service oder eine SaaS-Software zu rechtswidrigen
          Zwecken missbraucht oder wenn EduTime ein Reputationsschaden droht, ist EduTime
          berechtigt, den Vertrag fristlos zu kündigen. Der Kunde schuldet EduTime die bis zur
          ordentlichen Vertragsbeendigung geschuldete Vergütung sowie Ersatz für sämtliche
          zusätzlichen Kosten, die EduTime im Zusammenhang mit der fristlosen Kündigung anfallen.
          EduTime kann den Vertrag mit dem Kunden zudem fristlos kündigen, wenn gegen den Kunden ein
          Verfahren wegen Konkurs oder Zahlungsunfähigkeit eingeleitet worden ist oder wenn auf
          anderem Wege offenkundig wird, dass der Kunde seinen Zahlungsverpflichtungen nicht mehr
          nachkommen kann, und wenn der Kunde vor Ablauf der Vertragsdauer die Kosten für die
          nächste Vertragsdauer nicht vorauszahlt oder entsprechende Sicherstellung leistet.
        </p>
        <p>
          Nach Beendigung des entsprechenden Vertrages darf der Kunde den SaaS-Service von EduTime
          nicht mehr nutzen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='geheimhaltung-und-datenschutz'
        title='15. Geheimhaltung und Datenschutz'
        order={2}
      >
        <p>
          Die Vertragsparteien verpflichten sich, alle erlangten Kenntnisse von vertraulichen
          Informationen und Betriebsgeheimnissen der jeweils anderen Vertragspartei, vertraulich zu
          behandeln. Solange ein Geheimhaltungsinteresse besteht, gilt die Geheimhaltungspflicht
          zeitlich unbegrenzt.
        </p>
        <p>
          Der Kunde darf Mitarbeitern und sonstigen Dritten den SaaS-Service nur zugänglich machen,
          soweit dies zur Ausübung der durch den entsprechenden Vertrag und diese AGB eingeräumten
          Nutzungsbefugnis erforderlich ist. Im Übrigen hält der Kunde den Zugang sowie die Inhalte
          des SaaS-Services geheim und wird alle Personen, denen Zugang zum SaaS-Service gewährt
          wird, über die Rechte von EduTime am SaaS-Service und die Pflicht zu ihrer Geheimhaltung
          belehren und diese Personen auf die Einhaltung der Geheimhaltungspflicht verpflichten. Die
          Geheimhaltungspflicht gilt nicht für Informationen, welche allgemein zugänglich sind, den
          Vertragsparteien nachweislich schon bekannt sind, von ihnen unabhängig entwickelt oder von
          berechtigten Dritten erworben wurden.
        </p>
        <p>
          Der Kunde nimmt zur Kenntnis, dass die Vertragsabwicklung eine Sammlung und Bearbeitung
          von Personendaten im Sinne des anwendbaren schweizerischen Datenschutzgesetzes umfassen
          kann, und dass EduTime im Rahmen der Vertragsabwicklung auch einen Datentransfer ins
          Ausland vornehmen kann. EduTime erhebt und bearbeitet Personendaten des Kunden
          ausschliesslich wie in der Datenschutzerklärung von EduTime beschrieben. Die jeweils
          aktuelle Fassung der Datenschutzerklärung ist auf der Website von EduTime veröffentlicht.
        </p>
        <p>
          EduTime und der Kunde sorgen für den Datenschutz und die Datensicherheit in ihrem
          jeweiligen Einflussbereich. Soweit EduTime im Sinne des anwendbaren Datenschutzrechts als
          Auftragsbearbeiter Personendaten für den Kunden bearbeitet, tut dies EduTime
          ausschliesslich auf die in der Auftragsverarbeitungsvereinbarung («AVV») festgelegten
          Weise sowie ausschliesslich für die Zwecke des Kunden und zur Erfüllung des Vertrages. In
          diesem Fall ist der Kunde allein für die Bestimmung des Zwecks und der Mittel der
          Verarbeitung bzw. Nutzung der Personendaten durch EduTime im Rahmen des Vertrags
          verantwortlich, wie insbesondere auch dafür, dass eine solche Bearbeitung nicht geltende
          Datenschutzgesetze verletzt.
        </p>
        <p>
          Soweit EduTime als Auftragsbearbeiter Personendaten des Kunden bearbeitet, bildet die
          jeweils aktuelle Fassung der AVV, die bei Vertragsschluss zugestellt wird, Bestandteil
          dieser AGB.
        </p>
        <p>
          EduTime ist berechtigt, den Kunden in ihre offizielle Kundenliste aufzunehmen und damit
          insbesondere auf der Website von EduTime zu werben. Weitere Referenzangaben bedürfen der
          vorgängigen Zustimmung des Kunden.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='verletzung-geheimhaltung'
        title='16. Verletzung der Geheimhaltung und Nutzungseinräumung'
        order={2}
      >
        <p>
          Sollte der Kunde bzw. dessen Mitarbeiter, Hilfspersonen oder von ihm bestimmte Benutzer
          absichtlich oder grobfahrlässig die Bestimmungen über den Gebrauch und den Schutz des
          SaaS-Services oder der SaaS-Software verletzen, schuldet der Kunde EduTime für jeden Fall
          der Verletzung eine Konventionalstrafe in Höhe des Dreifachen der für den
          bestimmungsgemässen Gebrauch des SaaS-Services geschuldeten vollen Brutto-Lizenzgebühr,
          mindestens jedoch CHF 10'000.00. Vorbehalten bleibt die Geltendmachung des weiteren
          Schadens.
        </p>
        <p>
          Die Bezahlung dieser Konventionalstrafe befreit den Kunden nicht von den vertraglichen
          Pflichten. EduTime ist insbesondere berechtigt, jederzeit die Beseitigung des
          rechtswidrigen Zustandes bzw. der Vertragsverletzung zu verlangen oder, bei wiederholter
          Verletzung der Nutzungsbestimmungen, dem Kunden die eingeräumten Nutzungsrechte ohne
          Rückzahlung der bezahlten Lizenzgebühren durch schriftliche Mitteilung zu entziehen. Im
          Falle des Entzugs der Nutzungsrechte verpflichtet sich der Kunde, umgehend auf die
          Benutzung des SaaS-Services zu verzichten.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='hoehere-gewalt' title='17. Höhere Gewalt' order={2}>
        <p>
          Die Vertragsparteien sind von der Verpflichtung zur Leistung aus diesem Vertrag befreit,
          solange und soweit die Nichterfüllung von Leistungen auf das Eintreten von Umständen
          höherer Gewalt zurückzuführen ist. Als Umstände höherer Gewalt gelten beispielsweise
          Krieg, Streiks, Unruhen, Enteignungen, Pandemien und Epidemien, Sturm, Überschwemmungen
          und sonstige Naturkatastrophen sowie andere von den Vertragsparteien nicht zu vertretende
          Umstände (z.B. Stromknappheit oder -kontingentierung). Jede Vertragspartei hat die andere
          Vertragspartei über den Eintritt eines Falles von höherer Gewalt unverzüglich und
          schriftlich in Kenntnis zu setzen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='schlussbestimmungen' title='18. Schlussbestimmungen' order={2}>
        <p>
          EduTime behält sich das Recht vor, nachträgliche Änderungen oder Ergänzungen der AGB
          vorzunehmen. Im Falle von Änderungen und Ergänzungen, die sich für den Kunden nachteilig
          auswirken können, wird EduTime den Kunden schriftlich, per E-Mail oder auf einem
          geeigneten Pflegeportal orientieren. Die neuen AGB werden zum Vertragsbestandteil,
          insofern der Kunde nicht innert 14 Tagen seit Kenntnisnahme widerspricht. Die jeweils
          aktuelle Fassung wird auf der Website von EduTime https://edutime.ch/docs/agb
          veröffentlicht.
        </p>
        <p>
          Im Falle von Abweichungen oder Widersprüchen gehen die Bestimmungen allfälliger
          Einzelverträge diesen AGB vor. Ebenfalls geht die aktuelle Fassung der
          Auftragsverarbeitungsvereinbarung diesen AGB vor, sofern es eine abweichende oder
          widersprüchliche Regelung betreffend die Bearbeitung von Personendaten betrifft.
        </p>
        <p>
          Sämtliche Mitteilungen sind, sofern in diesem Vertrag oder von Gesetzes wegen nicht
          zwingend eine strengere Form vorgesehen ist, schriftlich, elektronisch oder per E-Mail an
          die vom Kunden im SaaS-Einzelvertrag angegebenen bzw. auf der Website von EduTime
          angegebenen (E-Mail-)Adressen zu richten. Der Kunde ist verpflichtet, EduTime
          Adressänderungen (inkl. E-Mail) unverzüglich bekannt zu geben, respektive das Kundenprofil
          im SaaS-Service anzupassen, widrigenfalls Mitteilungen an der zuletzt bekannt gegebenen
          Adresse als rechtswirksam zugegangen gelten.
        </p>
        <p>
          Die Schriftform ist (abgesehen von Kündigungen) auch durch elektronisch, per Post, Kurier
          oder E-Mail übermittelte Unterschriften (z.B. Skribble, DocuSign, AdobeSign oder durch
          einen elektronischen Scan der Unterschrift) gewahrt.
        </p>
        <p>
          Rechte aus dem Vertrag bzw. diesen AGB können vom Kunden nur mit vorheriger schriftlicher
          Zustimmung von EduTime abgetreten werden. EduTime ist frei, den Vertrag ganz oder
          teilweise an Dritte zu übertragen.
        </p>
        <p>
          Sollte eine Bestimmung des Vertrages bzw. diesen AGB nichtig sein oder rechtsunwirksam
          werden, so gelten die übrigen Bestimmungen weiter. Die nichtige oder rechtsunwirksame
          Bestimmung soll in diesem Fall durch eine wirksame Bestimmung ersetzt werden, die in ihrer
          wirtschaftlichen Auswirkung derjenigen der unwirksamen Bestimmung so nahe kommt wie
          rechtlich möglich.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='rechtswahl-und-gerichtsstand'
        title='19. Rechtswahl und Gerichtsstand'
        order={2}
      >
        <p>
          Auf diese AGB und die Verträge zwischen dem Kunden und EduTime kommt ausschliesslich
          Schweizer Recht zur Anwendung, unter Ausschluss des Übereinkommens der Vereinten Nationen
          über Verträge über den internationalen Warenkauf vom 11. April 1980 und des
          Kollisionsrechts.
        </p>
        <p>
          Ausschliesslicher Gerichtsstand sind die ordentlichen Gerichte am Sitz von EduTime in der
          Schweiz. EduTime kann den Kunde auch an dessen Sitz belangen.
        </p>
      </LegalDocumentSection>
    </>
  )
}
