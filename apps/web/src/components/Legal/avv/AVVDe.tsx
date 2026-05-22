import type { TocLink } from '../PrivacyLayout'
import { LegalDocumentSection } from '../LegalDocumentSection'
import { SubProcessorsTable } from './SubProcessorsTable'
import { subProcessorsDe } from './subProcessors'

export const avvMetaDe = {
  title: 'Auftragsverarbeitungsvereinbarung (AVV) von EduTime',
  tocLabel: 'Inhaltsverzeichnis',
  meta: {
    version: 'Version 1.0',
    lastUpdated: '3. März 2025',
  },
}

export const tocLinksDe: TocLink[] = [
  { id: 'einleitung', label: 'Einleitung', order: 1 },
  { id: 'praambel-und-geltungsbereich', label: 'Präambel und Geltungsbereich', order: 1 },
  { id: 'gegenstand-dauer-art-zweck', label: 'Gegenstand, Dauer, Art und Zweck', order: 1 },
  { id: 'anwendungsbereich-weisungsrecht', label: 'Anwendungsbereich und Weisungsrecht', order: 1 },
  { id: 'datensicherheit', label: 'Datensicherheit', order: 1 },
  { id: 'vertraulichkeit', label: 'Vertraulichkeit', order: 1 },
  { id: 'rechte-betroffener', label: 'Rechte von betroffenen Personen', order: 1 },
  { id: 'datenschutzverletzung', label: 'Datenschutzverletzung', order: 1 },
  { id: 'herausgabe-loeschung', label: 'Herausgabe und Löschung', order: 1 },
  { id: 'unterauftragsverarbeiter', label: 'Beizug von Unterauftragsverarbeitern', order: 1 },
  { id: 'dokumentation', label: 'Dokumentation, Verarbeitungsverzeichnis', order: 1 },
  { id: 'datenschutz-folgenabschaetzung', label: 'Datenschutz-Folgenabschätzung', order: 1 },
  { id: 'nachweispflichten-auditrecht', label: 'Nachweispflichten und Auditrecht', order: 1 },
  { id: 'drittstaaten', label: 'Datenverarbeitung in Drittstaaten', order: 1 },
  { id: 'haftung', label: 'Haftung', order: 1 },
  { id: 'schlussbestimmungen', label: 'Schlussbestimmungen', order: 1 },
  { id: 'anhaenge', label: 'Anhänge', order: 1 },
  { id: 'anhang-1', label: 'Anhang 1: Ausführungsbestimmungen', order: 1 },
  { id: 'anhang-2', label: 'Anhang 2: Technische und organisatorische Massnahmen', order: 1 },
  { id: 'anhang-3', label: 'Anhang 3: Unterauftragsverarbeiter', order: 1 },
]

export function AVVDe() {
  return (
    <>
      <LegalDocumentSection id='einleitung' title='Auftragsverarbeitungsvereinbarung (AVV)' order={2}>
        <p>
          Tim Ogi (Einzelunternehmen), c/o Bildung Bern, Monbijoustrasse 36, 3011 Bern (nachfolgend
          «Auftragnehmer» oder «Auftragsverarbeiter») erbringt gegenüber dem Kunden (nachfolgend
          «Auftraggeber» oder «Verantwortlicher») SaaS-Services in Bezug auf eine SaaS-Software.
        </p>
        <p>
          Diese Auftragsverarbeitungsvereinbarung und ihre Anhänge («AVV») sind in die zwischen dem
          Auftragnehmer und dem Auftraggeber geschlossenen Allgemeinen Geschäftsbedingungen
          integriert und bilden einen Teil davon. Diese AVV spiegelt die Vereinbarung der Parteien in
          Bezug auf die Verarbeitung von Personendaten durch den Auftragnehmer als
          Auftragsverarbeiter im Namen des Auftraggebers wider.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='praambel-und-geltungsbereich'
        title='Präambel und Geltungsbereich'
        order={2}
      >
        <p>
          Die Parteien haben eine oder mehrere Vereinbarungen («Vertrag» oder «Verträge»)
          geschlossen, in denen der Auftragnehmer als Leistungserbringer gegenüber dem Auftraggeber
          oder dessen Kunden auftritt. Die Erbringung der Dienstleistungen gemäss Vertrag durch den
          Auftragnehmer kann als Verarbeitung bzw. Bearbeitung (nachfolgend einheitlich
          «Verarbeitung») von personenbezogenen Daten (nachfolgend einheitlich «Personendaten») im
          Sinne des anwendbaren Datenschutzrechts qualifiziert werden. Soweit der Auftragnehmer im
          Rahmen der Zusammenarbeit als Auftragsverarbeiter oder Unterauftragsverarbeiter
          Personendaten des Auftraggebers oder dessen Kunden verarbeitet (jeder Umgang mit
          Personendaten), ergänzt die vorliegende Auftragsverarbeitungsvereinbarung («AVV» oder
          «Vereinbarung») den Vertrag und konkretisiert die Verpflichtungen der Parteien zum
          Datenschutz. Als anwendbares Datenschutzrecht gilt das Schweizer Datenschutzgesetz sowie
          die europäische Datenschutzgrundverordnung (DSGVO), sofern und soweit diese anwendbar ist
          («anwendbares Datenschutzrecht»).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='gegenstand-dauer-art-zweck'
        title='Gegenstand, Dauer, Art und Zweck der Vereinbarung'
        order={2}
      >
        <p>
          Der Gegenstand des Auftrages sowie Art und Zweck der Verarbeitung ergeben sich aus dem
          Vertrag, wobei die Bestimmungen dieser AVV diejenigen im Vertrag ergänzen. Die vorliegende
          Vereinbarung ist ein integraler Bestandteil des Vertrages. Sie tritt in Kraft, sobald sie
          in den Vertrag aufgenommen wird, was im Vertrag, in einem Bestellformular, den Allgemeinen
          Geschäftsbedingungen oder in einer ausgeführten Änderung des Vertrages angegeben sein
          kann.
        </p>
        <p>
          Die Laufzeit dieser Vereinbarung richtet sich nach der Laufzeit des Vertrages (bzw. bei
          mehreren Verträgen des letzten aktiven Vertrages) zwischen dem Auftraggeber und dem
          Auftragnehmer, unter welchen der Auftragnehmer für den Auftraggeber Personendaten
          verarbeitet, sofern sich aus den Bestimmungen dieser Vereinbarung nicht darüberhinausgehende
          Verpflichtungen ergeben. Zudem endet die AVV automatisch, sobald der Auftragnehmer keine
          Personendaten mehr für den Auftraggeber gemäss dem Vertrag besitzt und verarbeitet oder mit
          Beendigung des (letzten aktiven) Vertrages.
        </p>
        <p>
          Die Möglichkeit zur fristlosen Kündigung aus wichtigem Grund bleibt unberührt. Als wichtiger
          Grund gelten insbesondere ein wiederholter oder schwerwiegender Verstoss einer Partei gegen
          die Regelungen des Vertrages, dieser AVV oder gegen anwendbares Datenschutzrecht. Auch das
          Sonderkündigungsrecht gemäss Ziffer 8 berechtigt zur fristlosen Kündigung. Eine fristlose
          Kündigung dieser Vereinbarung berechtigt auch zur fristlosen Kündigung des Vertrages.
        </p>
        <p>
          Soweit sich die Art der verarbeiteten Personendaten, die Art und der Zweck der
          Datenverarbeitung sowie die Kategorien der durch die Verarbeitung betroffenen Personen nicht
          bereits aus dem jeweiligen Vertrag ergeben, werden sie in Anhang 1 zu dieser Vereinbarung
          aufgeführt.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='anwendungsbereich-weisungsrecht'
        title='Anwendungsbereich und Weisungsrecht'
        order={2}
      >
        <p>
          Der Auftragnehmer verarbeitet Personendaten ausschliesslich zweckgebunden gemäss dem
          jeweiligen Vertrag, dieser AVV oder den dokumentierten Weisungen des Auftraggebers.
        </p>
        <p>
          Weisungen sind in der Regel in Textform (d.h. schriftlich, per Fax, per E-Mail oder in
          einem dokumentierten elektronischen Format) zu erteilen. Mündliche Weisungen sind
          unverzüglich in Textform oder in einem dokumentierten elektronischen Format zu bestätigen.
          Der Auftraggeber dokumentiert sämtliche Weisungen in Textform.
        </p>
        <p>
          Der Auftragnehmer hat den Auftraggeber unverzüglich zu informieren, wenn er der Meinung
          ist, eine Weisung verstosse gegen anwendbares Datenschutzrecht. Der Auftragnehmer ist
          berechtigt, die Durchführung der entsprechenden Weisung so lange auszusetzen, bis sie durch
          den Auftraggeber bestätigt oder geändert wird.
        </p>
        <p>
          Meldungen an die Behörden oder an betroffene Personen bezüglich Datenschutzverletzungen und
          -verstösse darf der Auftragnehmer nur nach vorheriger Weisung des Auftraggebers selbst
          durchführen. Vorbehalten bleiben abweichende Pflichten des anwendbaren Rechts (z.B.
          verbindliche Anordnungen zuständiger Behörden), worüber der Auftraggeber zeitnah zu
          informieren ist, soweit dies rechtlich zulässig ist.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='datensicherheit' title='Datensicherheit' order={2}>
        <p>
          Der Auftragnehmer ergreift geeignete technische und organisatorische Massnahmen (TOM)
          gemäss Anhang 2, um in seinem Verantwortungsbereich die innerbetriebliche Organisation zu
          gestalten, zu überprüfen und laufend anzupassen, damit er stets ein angemessenes
          Datenschutzniveau gemäss anwendbarem Datenschutzrecht gewährleisten kann, um die
          Personendaten vor unbeabsichtigter oder unrechtmässigen Zerstörung, Verlust, Veränderung,
          Weitergabe etc. zu schützen. Der Auftragnehmer berücksichtigt dabei den Stand der Technik,
          die Implementierungskosten sowie die Art, den Umfang, die Umstände und die Zwecke der
          Verarbeitung sowie die unterschiedlichen Eintrittswahrscheinlichkeiten und die Schwere des
          Risikos für die Rechte und Freiheiten von betroffenen Personen.
        </p>
        <p>
          Die Massnahmen unterliegen dem technischen Fortschritt und der Weiterentwicklung. Es können
          alternative oder zusätzliche Massnahmen umgesetzt werden, wenn das Schutzniveau der
          festgelegten Massnahmen nicht unterschritten wird.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='vertraulichkeit' title='Vertraulichkeit' order={2}>
        <p>
          Der Auftragnehmer verpflichtet sich, unter dem Vertrag oder dieser AVV erhaltene
          Personendaten vertraulich zu behandeln und nur Personen zugänglich zu machen, die für die
          Erfüllung ihrer Pflichten gegenüber dem Auftragnehmer auf Zugang zu den Personendaten
          angewiesen sind. Der Auftragnehmer stellt sicher, dass sich die zur Verarbeitung der
          Personendaten befugten Personen zur Vertraulichkeit/Geheimhaltung verpflichtet haben, soweit
          sie nicht einer gesetzlichen Verschwiegenheitspflicht unterliegen. Den mit der Verarbeitung
          der relevanten Personendaten befassten Mitarbeitern und anderen für den Auftragnehmer
          tätigen Personen ist es untersagt, die relevanten Personendaten ausserhalb des Vertrags und
          dieser AVV zu verarbeiten. Die Vertraulichkeits-/Verschwiegenheitspflicht besteht auch nach
          Beendigung dieser AVV für eine Dauer von fünf Jahren fort.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='rechte-betroffener'
        title='Rechte von betroffenen Personen'
        order={2}
      >
        <p>
          Wendet sich eine betroffene Person mit Forderungen zur Berichtigung, Löschung, Auskunft
          oder anderen Ansprüchen zu Personendaten direkt an den Auftragnehmer, wird der
          Auftragnehmer die betroffene Person ohne Verzug an den Auftraggeber verweisen, sofern eine
          Zuordnung zum Auftraggeber nach Angaben der betroffenen Person möglich ist.
        </p>
        <p>
          Der Auftragnehmer unterstützt den Auftraggeber unter Berücksichtigung der Art der
          Verarbeitung mit geeigneten technischen und organisatorischen Massnahmen dabei, seiner
          Pflicht nachzukommen, Anträge von betroffenen Personen auf zustehende Rechte gemäss
          anwendbarem Datenschutzrecht zu beantworten.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='datenschutzverletzung' title='Datenschutzverletzung' order={2}>
        <p>Der Auftragnehmer unterrichtet den Auftraggeber unverzüglich, wenn:</p>
        <ul>
          <li>
            vom Auftragnehmer oder einem Unterauftragsverarbeiter eine Datenschutzverletzung
            festgestellt oder vermutet wird. Dabei sind diejenigen Informationen gemäss anwendbarem
            Datenschutzrecht (u.a. Art, Umfang, Ausmass der Verletzung) zu liefern, damit der
            Auftraggeber einer eventuellen Meldepflicht an die zuständige Datenschutzbehörde und/oder
            die betroffenen Personen gemäss anwendbarem Datenschutzrecht nachkommen kann;
          </li>
          <li>
            die Personendaten an eine zuständige Behörde weitergegeben werden sollen;
          </li>
          <li>
            eine Anfrage, Vorladung oder Antrag auf Einsichtnahme oder Prüfung der Verarbeitung
            durch eine zuständige Behörde eingeht, ausser die Mitteilung an den Auftraggeber ist
            gesetzlich untersagt.
          </li>
        </ul>
        <p>
          Im Falle einer Datenschutzverletzung beim Auftragnehmer oder einem Unterauftragsverarbeiter
          trifft der Auftragnehmer auf eigene Kosten die vernünftigerweise zumutbaren Massnahmen, um
          die Ursache der Datenschutzverletzung zu ermitteln sowie zur Sicherung des Schutzes der
          Personendaten und zur Minderung möglicher nachteiligen Folgen für die betroffenen Personen.
        </p>
        <p>
          Die Unterstützungspflichten des Auftragnehmers gegenüber dem Auftraggeber gemäss dieser
          Ziffer 7 erfolgen kostenlos. Über weitergehende Unterstützungsleistungen können die Parteien
          eine Vergütungsregelung treffen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='herausgabe-loeschung'
        title='Herausgabe und Löschung von Personendaten'
        order={2}
      >
        <p>
          Der Auftragnehmer gibt alle Daten, Datenträger sowie sonstige Materialien auf erste
          Instruktion des Auftraggebers hin unverzüglich an den Auftraggeber zurück. Der
          Auftragnehmer darf Daten nicht länger aufbewahren, als dies für die Erfüllung seiner
          Verpflichtungen gemäss dem Vertrag erforderlich ist, soweit keine gesetzliche
          Aufbewahrungspflicht entgegensteht.
        </p>
        <p>
          Bei Beendigung des Vertrages sind die unter dem Vertrag oder dieser AVV erhaltenen
          Personendaten gemäss den vertraglichen Bestimmungen entweder dem Auftraggeber herauszugeben
          oder zu löschen; falls eine solche Bestimmung fehlt, sind nach Wahl des Auftraggebers die
          Personendaten entweder dem Auftraggeber herauszugeben und bestehende Kopien zu löschen oder
          sie sind zu löschen, sofern nicht von Gesetzes wegen eine Verpflichtung des Auftragnehmers
          besteht, die Personendaten aufzubewahren oder zu speichern. Bis zur Löschung oder
          Herausgabe stellt der Auftragnehmer weiterhin die Einhaltung dieser AVV sicher.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='unterauftragsverarbeiter'
        title='Beizug von Unterauftragsverarbeitern'
        order={2}
      >
        <p>
          Für die Zwecke dieser Vereinbarung bezeichnet der Begriff «Unterauftragsverarbeiter» jeden
          Leistungserbringer, der vom Auftragnehmer (oder von einem anderen Unterauftragsverarbeiter
          des Auftragnehmers) im Zusammenhang mit dieser AVV mit der Verarbeitung von Personendaten
          beauftragt wird.
        </p>
        <p>
          Der Auftragnehmer erhält hiermit eine vorherige allgemeine schriftliche Genehmigung, für die
          Verarbeitung von Personendaten Unterauftragsverarbeiter beizuziehen. Soweit sich die
          zulässigen Unterauftragsverarbeiter nicht bereits aus dem Vertrag ergeben, sind sie in
          Anhang 3 aufzuführen. Die Liste der Unterauftragsverarbeiter ist laufend auf dem aktuellen
          Stand zu halten.
        </p>
        <p>
          Ein Hinzufügen sowie der Austausch von Unterauftragsverarbeitern durch den Auftragnehmer
          erfolgen nach dem Ermessen des Auftragnehmers. Der Auftraggeber wird im Voraus mit
          angemessener Ankündigungsfrist über die geplante Änderung der Liste der
          Unterauftragsverarbeiter informiert. Sofern der Auftraggeber gemäss anwendbarem
          Datenschutzrecht einen objektiv zwingenden Grund hat, ist dieser berechtigt, innert zwanzig
          Tagen seit der Mitteilung des Auftragnehmers Einspruch gegen die Verarbeitung von
          Personendaten durch einen neuen Unterauftragsverarbeiter einzulegen. Erfolgt kein Einspruch
          innerhalb dieser Frist, so gilt der neue Unterauftragsverarbeiter als vom Auftraggeber
          genehmigt. Liegt ein objektiv zwingender datenschutzrechtlicher Grund vor und sofern eine
          einvernehmliche Lösungsfindung zwischen den Parteien nicht möglich ist, wird dem
          Auftragsverarbeiter ein Sonderkündigungsrecht (Recht zur fristlosen Kündigung) eingeräumt.
        </p>
        <p>
          Der Auftragnehmer ist verpflichtet, die erforderlichen Vereinbarungen mit dem
          Unterauftragsverarbeiter abzuschliessen, um sicherzustellen, dass der
          Unterauftragsverarbeiter denselben Verpflichtungen unterliegt, wie sie dem Auftragnehmer auf
          Grund vorliegender AVV und des jeweiligen Vertrages obliegen. Der Auftragnehmer ist
          verpflichtet, dem Auftraggeber auf seine Anforderung hin Auskunft über den wesentlichen
          Vertragsinhalt und die Umsetzung der datenschutzrelevanten Verpflichtungen durch den
          Unterauftragsverarbeiter zu erteilen.
        </p>
        <p>
          Kommt der Unterauftragsverarbeiter seinen Datenschutzpflichten nicht nach, so haftet der
          Auftragnehmer gegenüber dem Auftraggeber für etwaige Verstösse durch den
          Unterauftragsverarbeiter gemäss den Bestimmungen dieser AVV.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='dokumentation'
        title='Dokumentation, Verarbeitungsverzeichnis'
        order={2}
      >
        <p>
          Jede Partei ist für die Einhaltung ihrer Dokumentationspflichten verantwortlich,
          insbesondere für die Führung von Verarbeitungsverzeichnissen, soweit dies nach dem
          anwendbaren Datenschutzrecht erforderlich ist. Jede Partei unterstützt die andere Partei in
          angemessener Weise bei der Erfüllung von deren Dokumentationspflichten, einschliesslich der
          Bereitstellung der Informationen, die die andere Partei von ihr benötigt, in einer von der
          anderen Partei in angemessener Weise angeforderten Form (z.B. durch die Verwendung eines
          elektronischen Systems), damit die andere Partei den Verpflichtungen im Zusammenhang mit
          der Führung von Verarbeitungsverzeichnissen nachkommen kann.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='datenschutz-folgenabschaetzung'
        title='Datenschutz-Folgenabschätzung'
        order={2}
      >
        <p>
          Wenn der Auftraggeber gemäss anwendbarem Datenschutzrecht verpflichtet ist, eine
          Datenschutz-Folgenabschätzung oder eine vorherige Konsultation mit einer Aufsichtsbehörde
          durchzuführen, stellt der Auftragnehmer auf Wunsch des Auftraggebers diejenigen Dokumente
          kostenlos zur Verfügung, die für die Dienstleistungen des jeweiligen Vertrages allgemein
          verfügbar sind (z.B. diese AVV, der Vertrag, Auditberichte oder Zertifizierungen). Jede
          zusätzliche Unterstützung wird zwischen den Parteien einvernehmlich vereinbart.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='nachweispflichten-auditrecht'
        title='Nachweispflichten und Auditrecht'
        order={2}
      >
        <p>
          Der Auftragnehmer weist dem Auftraggeber die Einhaltung der in dieser AVV festgehaltenen
          Pflichten mit geeigneten Mitteln (z.B. Zertifikate) nach.
        </p>
        <p>
          Der Auftraggeber hat das Recht, die Einhaltung der gesetzlichen oder vertraglichen
          Pflichten in Bezug auf die Verarbeitung von Personendaten selbst oder durch von ihm
          beauftragten Prüfer, welche zum Schutz des Auftragnehmers unter strikter Vertraulichkeit
          und nicht in unmittelbarem Wettbewerbsverhältnis mit dem Auftragnehmer stehen, mittels
          Inspektionen oder Audits zu prüfen, wenn
        </p>
        <ul>
          <li>
            der Auftragnehmer keinen ausreichenden Nachweis (u.a. Zertifikat, Auditbericht) über die
            Einhaltung der technischen und organisatorischen Massnahmen über den Schutz der
            eingesetzten Systeme und Verarbeitungsprozesse erbringt;
          </li>
          <li>eine Verletzung des Schutzes von Personendaten vorliegt;</li>
          <li>
            eine Prüfung offiziell durch eine Aufsichtsbehörde des Auftraggebers verlangt wird; oder
          </li>
          <li>
            der Auftraggeber gemäss zwingendem, anwendbarem Datenschutzrecht über ein direktes
            Auditrecht verfügt.
          </li>
        </ul>
        <p>
          Der Auftragnehmer ist verpflichtet, bei einem Audit angemessen mitzuwirken. Die Parteien
          einigen sich im Vorfeld über Zeitpunkt, Dauer und Gegenstand der Prüfungen und über
          anwendbare Sicherheits- und Vertraulichkeitsbestimmungen, sofern nicht eine Prüfung ohne
          vorherige Anmeldung erforderlich erscheint, weil andernfalls der Prüfzweck gefährdet wäre.
          Das Audit ist so durchzuführen, dass keine Betriebsabläufe des Auftragnehmers übermässig
          gestört werden. Audits und Inspektionen des Auftraggebers sind grundsätzlich auf drei
          Werktage pro Jahr beschränkt.
        </p>
        <p>
          Jede Partei trägt die bei ihr anfallenden Kosten und Ausgaben im Zusammenhang mit dem Audit
          oder der Inspektion selber. Bei einem über drei Werktage hinausgehenden Aufwand kann der
          Auftragnehmer für die Unterstützung bei der Durchführung einer vom Auftraggeber veranlassten
          Inspektion bzw. Audit vom Auftraggeber eine Vergütung verlangen.
        </p>
        <p>
          Werden nach Vorlage von Nachweisen oder Berichten oder im Rahmen eines Audits wesentliche
          Verletzungen dieser AVV oder Mängel bei der Umsetzung der Pflichten des Auftragnehmers
          festgestellt, so hat der Auftragnehmer umgehend und kostenlos geeignete Korrekturmassnahmen
          zu implementieren.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='drittstaaten'
        title='Datenverarbeitung in Drittstaaten'
        order={2}
      >
        <p>
          Die Verarbeitung der Daten findet ausschliesslich in der Schweiz, in einem Mitgliedsstaat
          der Europäischen Union (EU), in einem anderen Vertragsstaat des Abkommens über den
          Europäischen Wirtschaftsraum (EWR) oder in einem Land, welches gemäss
          Angemessenheitsbeschluss der Europäischen Kommission oder des Eidgenössischen
          Datenschutzbeauftragten über einen angemessenen Schutzniveau verfügt, statt. Die
          Verarbeitung von Daten ausserhalb dieses Gebietes ist nur nach Information an den
          Auftraggeber und in Übereinstimmung mit den anwendbaren gesetzlichen Bestimmungen zulässig.
          Der Auftragnehmer verpflichtet sich für den Fall einer Datenbekanntgabe in einen Staat ohne
          angemessenes Datenschutzniveau insbesondere, mit den Datenempfängern einen Zusatzvertrag auf
          der Basis der aktuellen EU-Standardvertragsklauseln (wo notwendig angepasst auf die Schweiz)
          abzuschliessen sowie zusätzlich angemessene rechtliche, technische oder organisatorische
          Massnahmen zu treffen.
        </p>
        <p>
          Der Auftragnehmer kann Personendaten zur Vertragserfüllung in die USA übermitteln. Werden
          Personendaten, die dem Schutz des Schweizer oder europäischen Datenschutzrechts unterliegen,
          in den USA verarbeitet, werden diese Daten gemäss dem Swiss-U.S. Data Privacy Framework
          sowie EU-U.S. Data Privacy Framework (zusammen der «Datenschutzrahmen») verarbeitet.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='haftung' title='Haftung' order={2}>
        <p>
          Der Auftragnehmer haftet für ein Verschulden seiner Unterauftragsverarbeiter wie für eigene
          Handlungen. Der Umfang der Haftung der Parteien unter dieser AVV richtet sich nach den
          Haftungsbestimmungen und -beschränkungen unter dem Vertrag bzw. bei mehreren Verträgen unter
          dem betroffenen Vertrag. Weitergehende gesetzliche Haftungsansprüche bleiben vorbehalten.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='schlussbestimmungen' title='Schlussbestimmungen' order={2}>
        <p>
          <strong>Vereinbarungsinhalt.</strong> Diese AVV und deren Anhänge regeln die Beziehungen
          zwischen den Parteien in Bezug auf die Verarbeitung von Personendaten abschliessend und
          ersetzen die vor Vertragsschluss geführten Verhandlungen und Korrespondenzen. Im Falle von
          Widersprüchen zwischen dem Vertrag und dieser AVV geht die AVV den Bestimmungen des
          Vertrages vor, wenn und soweit die Verarbeitung von Personendaten durch den Auftragnehmer im
          Rahmen des betreffenden Vertrages betroffen ist. Im Falle von Widersprüchen geht ein Anhang
          dieser Vereinbarung vor; im Falle von mehreren Anhängen gehen die jeweils letzten gültig zu
          Stande gekommenen Bestimmungen der Anhänge den widersprüchlichen Bedingungen in einem älteren
          Anhang vor.
        </p>
        <p>
          Datenschutzrechtliche Begriffe wie «Personendaten», «verarbeiten», «Verantwortlicher»,
          «Auftragsverarbeiter», «Datenschutz-Folgenabschätzung» etc. haben die ihnen im Schweizer
          Datenschutzgesetz oder, je nach Kontext, in der EU-DSGVO zugeschriebene Bedeutung. Der
          Begriff «verarbeiten» wird synonym für «bearbeiten» verwendet. «Datenschutzverletzung» meint
          «Verletzung des Schutzes personenbezogener Daten» (englisch: «Personal Data Breach»).
        </p>
        <p>
          <strong>Änderungen.</strong> Der Auftragnehmer behält sich das Recht vor, nachträgliche
          Änderungen oder Ergänzungen der AVV vorzunehmen. Im Falle von Änderungen und Ergänzungen,
          die sich für den Auftraggeber nachteilig auswirken können, wird der Auftragnehmer den
          Auftraggeber schriftlich, per E-Mail oder auf einem geeigneten Pflegeportal orientieren. Die
          neuen AVV werden zum Vertragsbestandteil, insofern der Auftraggeber nicht innert 14 Tagen
          seit Kenntnisnahme widerspricht.
        </p>
        <p>
          <strong>Mitteilungen.</strong> Sofern nicht explizit abweichend geregelt, sind zur Ausübung
          von Rechten und Pflichten aus dieser Vereinbarung bestimmte Mitteilungen in schriftlicher
          Form, per Brief oder mit E-Mail, an die im Vertrag angegebenen Adressen der Parteien zu
          richten.
        </p>
        <p>
          <strong>Teilnichtigkeit.</strong> Sollten sich einzelne Bestimmungen oder Teile dieser
          Vereinbarung bzw. eines Anhanges als nichtig oder unwirksam erweisen, so wird dadurch die
          Gültigkeit der Vereinbarung im Übrigen nicht berührt. Die Parteien werden in einem solchen
          Fall die Vereinbarung so anpassen, dass der mit dem nichtigen oder unwirksam gewordenen Teil
          angestrebte Zweck so weit wie möglich erreicht wird.
        </p>
        <p>
          <strong>Streiterledigung.</strong> Beide Parteien verpflichten sich, im Falle von
          Meinungsverschiedenheiten im Zusammenhang mit dieser Vereinbarung in guten Treuen eine
          einvernehmliche Regelung anzustreben.
        </p>
        <p>
          <strong>Anwendbares Recht und Gerichtsstand.</strong> Wenn trotz der Bemühungen der Parteien
          auf gütlichem Wege keine Einigung zustande kommt, wird eine rechtliche Auseinandersetzung
          gemäss den Bestimmungen im jeweiligen Vertrag (anwendbares Recht und Gerichtsstand) geführt.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='anhaenge' title='Anhänge' order={2}>
        <p>Die nachfolgenden Anhänge stellen integrierte Bestandteile der Vereinbarung dar:</p>
        <ul>
          <li>Anhang 1: Ausführungsbestimmungen</li>
          <li>Anhang 2: Technisch und organisatorische Massnahmen</li>
          <li>Anhang 3: Liste der Unterauftragsverarbeiter</li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='anhang-1'
        title='Anhang 1 zur Auftragsverarbeitungsvereinbarung – Ausführungsbestimmungen'
        order={2}
      >
        <p>Version 1.0 vom 3. März 2025</p>
        <p>
          <strong>Liste der Parteien</strong>
        </p>
        <p>
          <strong>Datenexporteur</strong>
          <br />
          Name: Der Auftraggeber gemäss Vertrag
          <br />
          Adresse: Die Adresse des Auftraggebers, wie im Vertrag angegeben
          <br />
          Name, Position und Kontaktdaten der Kontaktperson: Die Kontaktdaten des Auftraggebers, wie
          im Vertrag und/oder im Kundenprofil des Auftraggebers angegeben
          <br />
          Aktivitäten, die für die gemäss dieser AVV übermittelten Daten relevant sind: Verarbeitung
          von Personendaten in Verbindung mit der Nutzung des SaaS-Services durch den Auftraggeber
          gemäss den Vertragsbedingungen
          <br />
          Rolle (Verantwortlicher/Auftragsverarbeiter): Verantwortlicher (Verantwortlicher bzw. in
          der Eigenschaft als Verantwortlicher, als Auftragsverarbeiter oder im Namen eines anderen
          Verantwortlichen)
        </p>
        <p>
          <strong>Datenimporteur</strong>
          <br />
          Name: Der Auftragnehmer gemäss Vertrag
          <br />
          Adresse: Die Adresse des Auftragnehmers, wie im Vertrag angegeben
          <br />
          Name, Position und Kontaktdaten der Kontaktperson: Die Kontaktdaten des Auftragnehmers, wie
          im Vertrag oder der Datenschutzerklärung des Auftragnehmers angegeben
          <br />
          Aktivitäten, die für die gemäss dieser AVV übermittelten Daten relevant sind: Verarbeitung
          von Personendaten in Verbindung mit der Nutzung des SaaS-Services durch den Auftraggeber
          gemäss den Vertragsbedingungen
          <br />
          Rolle (für die Verarbeitung Verantwortlicher/Auftragsverarbeiter): Auftragsverarbeiter
        </p>
        <p>
          <strong>Beschreibung der Übermittlung</strong>
        </p>
        <p>
          <strong>
            Kategorien von betroffenen Personen, deren Personendaten übermittelt werden
          </strong>
          <br />
          Bei der Verwendung des SaaS-Services des Auftragnehmers kann der Auftraggeber Personendaten
          übermitteln, wobei der Auftraggeber den Umfang dieser Übermittlung nach eigenem Ermessen
          bestimmt und kontrolliert. Die übermittelten Daten können unter anderen Personendaten von
          folgenden Kategorien betroffener Personen enthalten: Kontakte des Auftraggebers und weitere
          Endnutzer einschliesslich der Angestellten, Vertragsnehmer, Mitarbeiter, Kunden des
          Auftraggebers.
        </p>
        <p>
          <strong>Kategorien der übermittelten Personendaten</strong>
          <br />
          Der Auftraggeber kann Personendaten an den SaaS-Service übermitteln, wobei er den Umfang
          dieser Übermittlung nach eigenem Ermessen bestimmt und kontrolliert. Die übermittelten Daten
          können unter anderem die folgenden Kategorien von Personendaten enthalten: Kontaktinformationen
          (wie im Vertrag definiert). Jegliche anderen Personendaten, die vom Auftraggeber oder dessen
          Endnutzern über den SaaS-Service übermittelt, gesendet oder empfangen wurden (insb.
          Zeiterfassungsdaten).
        </p>
        <p>
          <strong>Übermittlung besonders schützenswerter Personendaten</strong>
          <br />
          Grundsätzlich werden keine besonders schützenswerten Personendaten übermittelt. Sollte dies
          dennoch vom Auftraggeber gewünscht sein, so ist dieser verpflichtet, mit dem Auftragnehmer
          eine separate Vereinbarung über die Verarbeitung besonders schützenswerter Personendaten
          abzuschliessen, in der Einschränkungen, Beschränkungen und Schutzmassnahmen einvernehmlich
          vereinbart werden.
        </p>
        <p>
          <strong>Häufigkeit der Übermittlung</strong>
          <br />
          Kontinuierlich
        </p>
        <p>
          <strong>Art der Verarbeitung</strong>
          <br />
          Personendaten werden in Übereinstimmung mit dem Vertrag (einschliesslich dieser AVV)
          verarbeitet und können den folgenden Verarbeitungstätigkeiten unterliegen: Speicherung und
          sonstige Verarbeitung, die für die Bereitstellung, Aufrechterhaltung und Verbesserung des dem
          Auftraggeber bereitgestellten SaaS-Services erforderlich ist; und/oder Offenlegung gemäss
          dem Vertrag (einschliesslich dieser AVV) und/oder gemäss geltendem Recht.
        </p>
        <p>
          <strong>Zweck der Übermittlung und weitere Verarbeitung</strong>
          <br />
          Der Auftragnehmer wird Personendaten verarbeiten, soweit dies für die Erbringung des
          SaaS-Services gemäss Vertrag und den Weisungen des Auftraggebers bei der Nutzung des
          SaaS-Services erforderlich ist.
        </p>
        <p>
          <strong>Dauer der Aufbewahrung von Personendaten</strong>
          <br />
          Vorbehaltlich der Ziff. 7.4 AVV wird der Auftragnehmer Personendaten für die Dauer der
          Vereinbarung verarbeiten, sofern nichts anderes schriftlich vereinbart wurde.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='anhang-2'
        title='Anhang 2 zur Auftragsverarbeitungsvereinbarung – Beschreibung der technischen und organisatorischen Massnahmen (TOM) gemäss Ziffer 4 AVV'
        order={2}
      >
        <p>Version 1.0 vom 3. März 2025</p>
        <p>
          Im Folgenden werden die technischen und organisatorischen Massnahmen beschrieben, die der
          Auftragnehmer im Zusammenhang mit der Verarbeitung von Personendaten und der Erfüllung
          seiner Verpflichtungen im Rahmen der bestehenden Verträge, Art. 8 DSG i.V.m. Art. 2 ff. DSV
          und, sofern und soweit anwendbar, Art. 32 DSGVO trifft:
        </p>
        <p>
          <strong>Vertraulichkeit</strong>
          <br />
          Massnahmen zur Umsetzung des Gebots der Vertraulichkeit sind unter anderem solche, welche
          die Zugangs-, Zugriffs- oder Benutzerkontrolle festlegen.
        </p>
        <p>
          <strong>Zugangskontrolle (physische Zutrittskontrolle)</strong>
          <br />
          Datenverarbeitungsanlagen, mit denen Daten verarbeitet oder genutzt werden, dürfen von
          Unbefugten nicht betreten werden. Es erfolgt eine Protokollierung der Anwesenheit im
          Sicherheitsbereich. Unbefugtes Personal und betriebsfremde Personen dürfen die Räume nur in
          Begleitung von Befugten betreten.
        </p>
        <p>
          <strong>Benutzerkontrolle (digitale Zutritts- bzw. Zugangskontrolle)</strong>
          <br />
          Es wird sichergestellt, dass Datenverarbeitungssysteme nicht von Unbefugten genutzt werden
          können.
        </p>
        <p>
          <strong>Zugriffskontrolle</strong>
          <br />
          Durch geeignete technische Vorkehrungen (insbesondere Verschlüsselung) und sonstige
          geeignete Massnahmen wird sichergestellt, dass die zur Benutzung eines Datenverarbeitungssystems
          Berechtigten ausschliesslich auf die ihrer Zugriffsberechtigung unterliegenden Daten
          zugreifen können und dass Daten bei der Verarbeitung, Nutzung oder Speicherung nicht
          unbefugt gelesen, kopiert, verändert oder entfernt werden können.
        </p>
        <p>
          <strong>Trennungskontrolle</strong>
          <br />
          Es wird sichergestellt, dass Daten, die zu unterschiedlichen Zwecken erhoben wurden, getrennt
          voneinander verarbeitet werden.
        </p>
        <p>
          <strong>Pseudonymisierung</strong>
          <br />
          Es wird sichergestellt, dass im Falle der Pseudonymisierung die Verarbeitung
          personenbezogener Daten in einer Weise geschieht, dass die Daten ohne Hinzuziehung
          zusätzlicher Informationen nicht mehr einer spezifischen betroffenen Person zugeordnet werden
          können. Die Zuordnungsdatei wird gesondert aufbewahrt (verschlüsselt, Zugriffsberechtigung
          eingeschränkt). Die Datensätze werden zur Pseudonymisierung manuell oder automatisch
          gekürzt. Es bestehen interne Anweisungen, Personendaten im Falle einer Weitergabe oder auch
          nach Ablauf der gesetzlichen Löschfrist möglichst zu anonymisieren/pseudonymisieren.
        </p>
        <p>
          <strong>Verfügbarkeit und Integrität</strong>
          <br />
          Massnahmen zur Verfügbarkeit sind solche, welche gewährleisten, dass Daten und IT-Systeme zur
          Verfügung stehen und von autorisierten Personen genutzt werden können. Eine unbefugte
          Unterbrechung z.B. durch Serverausfall oder Ausfall von Kommunikationsmitteln stellt einen
          Angriff auf die Verfügbarkeit dar. Massnahmen zur Umsetzung des Gebots der Integrität sind
          beispielsweise solche, die zum Schutz vor unbefugter oder unrechtmässiger Verarbeitung,
          Zerstörung oder unbeabsichtigter Schädigung beitragen.
        </p>
        <p>
          <strong>Transportkontrolle (Weitergabekontrolle)</strong>
          <br />
          Mit geeigneten Massnahmen wird sichergestellt, dass Daten bei der elektronischen Übertragung
          oder während ihres Transports oder ihrer Speicherung auf Datenträger nicht unbefugt gelesen,
          kopiert, verändert oder entfernt werden können, und dass überprüft und festgestellt werden
          kann, an welche Stelle eine Übermittlung von Daten durch Einrichtungen zur Datenübertragung
          vorgesehen ist.
        </p>
        <p>
          <strong>Wiederherstellung</strong>
          <br />
          Es wird sichergestellt, dass eine Wiederherstellung der Verfügbarkeit der Daten und dem
          Zugang zu ihnen nach einem physischen oder technischen Zwischenfall rasch möglich ist.
        </p>
        <p>
          <strong>Verfügbarkeitskontrolle</strong>
          <br />
          Es wird sichergestellt, dass Daten gegen zufällige Zerstörung oder Verlust gesichert sind.
        </p>
        <p>
          <strong>Systemsicherheit</strong>
          <br />
          Es wird sichergestellt, dass die Betriebssysteme und Anwendungssoftware regelmässig
          aktualisiert und bekannte kritische Sicherheitslücken umgehend geschlossen werden.
        </p>
        <p>
          <strong>Nachvollziehbarkeit</strong>
          <br />
          Massnahmen, welche gewährleisten, dass Personendaten nachvollziehbar verarbeitet werden und
          unbefugte Zugriffe und Missbräuche identifizierbar sind.
        </p>
        <p>
          <strong>Eingabekontrolle</strong>
          <br />
          Es wird sichergestellt, dass nachträglich überprüft und festgestellt werden kann, ob und von
          wem Daten in Datenverarbeitungssysteme eingegeben, verändert oder entfernt wurden. Dazu wird
          der Auftragnehmer mit Hilfe von automatisch generierten Logfiles Eingaben dokumentieren bzw.
          protokollieren.
        </p>
        <p>
          <strong>Erkennung und Beseitigung von Verletzungen der Datensicherheit</strong>
          <br />
          Es wird sichergestellt, dass Verletzungen der Datensicherheit rasch erkannt werden und
          Massnahmen zur Minderung oder Beseitigung der Folgen ergriffen werden.
        </p>
        <p>
          <strong>Verfahren zur regelmässigen Überprüfung, Bewertung und Evaluierung</strong>
        </p>
        <p>
          <strong>Datenschutz-Massnahmen</strong>
          <br />
          Es wird sichergestellt, dass zentral alle Richtlinien, Weisungen, Handbücher etc. zum
          Datenschutz mit Zugriffsmöglichkeit für alle Mitarbeitenden nach Bedarf/Berechtigung
          bestehen. Es werden regelmässige Schulungen der Mitarbeitenden zum Datenschutz durchgeführt
          wie auch bedarfsgerechte Datenschutz-Folgenabschätzungen. Es besteht ein Prozess zur
          Verarbeitung von Auskunftsanfragen betroffener Personen.
        </p>
        <p>
          <strong>Incident-Response-Management</strong>
          <br />
          Es wird sichergestellt, dass Sicherheitsvorfälle entsprechend protokolliert und ggf. an die
          entsprechenden Stellen und Personen gemeldet werden. Mitarbeitende informieren ihren
          Vorgesetzten unverzüglich über Sicherheitsvorfälle.
        </p>
        <p>
          <strong>Datenschutzfreundliche Voreinstellungen (Privacy by design / Privacy by default)</strong>
          <br />
          Grundsätzlich werden nur Daten erhoben und verarbeitet, die für die Geschäftstätigkeiten
          zweckmässig und erforderlich sind. Verfahren der automatisierten Datenerfassung und
          -verarbeitung sind so gestaltet, dass nur die erforderlichen Daten erhoben werden können.
        </p>
        <p>
          <strong>Auftragskontrolle (Outsourcing an Dritte)</strong>
          <br />
          Es erfolgt keine Auftragsverarbeitung ohne entsprechende Weisung des Auftraggebers, z.B.:
          eindeutige Vertragsgestaltung, formalisiertes Auftragsmanagement, strenge Auswahl des
          Dienstleisters, Vorabüberzeugungspflicht, Nachkontrollen.
        </p>
        <p>
          <strong>Anpassungen und Änderungen</strong>
          <br />
          Eine Änderung der getroffenen Sicherheitsmassnahmen bleibt dem Auftragnehmer vorbehalten,
          wobei sichergestellt werden muss, dass das vertraglich vereinbarte Schutzniveau nicht
          unterschritten wird.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='anhang-3'
        title='Anhang 3 zur Auftragsverarbeitungsvereinbarung – Liste der Unterauftragsverarbeiter gemäss Ziffer 8 AVV'
        order={2}
      >
        <p>Version 1.0 vom 3. März 2025</p>
        <p>
          Zum Zweck der Erfüllung des Vertrages bzw. der Verträge darf der Auftragnehmer gemäss
          Ziffer 8 AVV die nachfolgend bezeichneten Unterauftragsverarbeiter für die unten
          vorgesehenen Leistungen einsetzen:
        </p>
        <SubProcessorsTable
          rows={subProcessorsDe}
          headers={{
            company: 'Firma, Rechtsform',
            address: 'Adresse',
            processingLocation: 'Verarbeitungsstandort',
            serviceType: 'Art der Dienstleistung',
          }}
        />
      </LegalDocumentSection>
    </>
  )
}
