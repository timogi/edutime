import type { TocLink } from '../PrivacyLayout'
import { LegalDocumentSection } from '../LegalDocumentSection'
import { SubProcessorsTable } from './SubProcessorsTable'
import { subProcessorsFr } from './subProcessors'

export const avvMetaFr = {
  title: "Accord de traitement des donnees (ATD) d'EduTime",
  tocLabel: 'Table des matieres',
  meta: {
    version: 'Version 1.0',
    lastUpdated: '3 mars 2025',
  },
}

export const tocLinksFr: TocLink[] = [
  { id: 'introduction', label: 'Introduction', order: 1 },
  { id: 'preambule-et-champ', label: 'Preambule et champ d application', order: 1 },
  { id: 'objet-duree-nature-finalite', label: 'Objet, duree, nature et finalite', order: 1 },
  { id: 'champ-et-instructions', label: 'Champ et droit d instruction', order: 1 },
  { id: 'securite-des-donnees', label: 'Securite des donnees', order: 1 },
  { id: 'confidentialite', label: 'Confidentialite', order: 1 },
  { id: 'droits-des-personnes', label: 'Droits des personnes concernees', order: 1 },
  { id: 'violation-de-donnees', label: 'Violation de donnees', order: 1 },
  { id: 'restitution-et-suppression', label: 'Restitution et suppression', order: 1 },
  { id: 'sous-traitants', label: 'Recours a des sous-traitants', order: 1 },
  { id: 'documentation', label: 'Documentation, registre', order: 1 },
  { id: 'analyse-d-impact', label: 'Analyse d impact relative a la protection des donnees', order: 1 },
  { id: 'audits', label: 'Obligations de preuve et droit d audit', order: 1 },
  { id: 'pays-tiers', label: 'Traitement dans des pays tiers', order: 1 },
  { id: 'responsabilite', label: 'Responsabilite', order: 1 },
  { id: 'dispositions-finales', label: 'Dispositions finales', order: 1 },
  { id: 'annexes', label: 'Annexes', order: 1 },
  { id: 'annexe-1', label: 'Annexe 1 : Dispositions d execution', order: 1 },
  { id: 'annexe-2', label: 'Annexe 2 : Mesures techniques et organisationnelles', order: 1 },
  { id: 'annexe-3', label: 'Annexe 3 : Sous-traitants', order: 1 },
]

export function AVVFr() {
  return (
    <>
      <LegalDocumentSection
        id='introduction'
        title='Accord de traitement des donnees (ATD)'
        order={2}
      >
        <p>
          Tim Ogi (entreprise individuelle), c/o Bildung Bern, Monbijoustrasse 36, 3011 Berne
          (ci-apres le « Prestataire » ou « Sous-traitant ») fournit au client (ci-apres le «
          Mandant » ou « Responsable du traitement ») des services SaaS relatifs a un logiciel SaaS.
        </p>
        <p>
          Le present accord de traitement des donnees et ses annexes (l&apos;« ATD ») sont integres
          aux conditions generales conclues entre le Prestataire et le Mandant et en font partie. Le
          present ATD reflete l&apos;accord des parties concernant le traitement des donnees
          personnelles par le Prestataire en qualite de sous-traitant pour le compte du Mandant.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='preambule-et-champ' title='Preambule et champ d application' order={2}>
        <p>
          Les parties ont conclu une ou plusieurs conventions (le « Contrat » ou les « Contrats ») aux
          termes desquelles le Prestataire intervient en qualite de prestataire de services aupres du
          Mandant ou de ses clients. La fourniture des services selon le Contrat par le Prestataire peut
          constituer un traitement de donnees personnelles (ci-apres uniformement « donnees
          personnelles ») au sens du droit applicable en matiere de protection des donnees. Lorsque le
          Prestataire traite des donnees personnelles du Mandant ou de ses clients en qualite de
          sous-traitant ou de sous-traitant ulterieur dans le cadre de la collaboration (toute operation
          sur des donnees personnelles), le present accord de traitement des donnees (l&apos;« ATD » ou
          l&apos;« Accord ») complete le Contrat et precise les obligations des parties en matiere de
          protection des donnees. Le droit applicable en matiere de protection des donnees designe la loi
          federale suisse sur la protection des donnees et le reglement general sur la protection des
          donnees (RGPD) de l&apos;UE, dans la mesure ou il est applicable (« droit applicable en matiere
          de protection des donnees »).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='objet-duree-nature-finalite'
        title='Objet, duree, nature et finalite de l accord'
        order={2}
      >
        <p>
          L&apos;objet du mandat ainsi que la nature et la finalite du traitement resultent du Contrat,
          les dispositions du present ATD completant celles du Contrat. Le present Accord constitue une
          partie integrante du Contrat. Il entre en vigueur des son incorporation au Contrat, comme
          indique dans le Contrat, un bon de commande, les conditions generales ou un avenant signe au
          Contrat.
        </p>
        <p>
          La duree du present Accord correspond a celle du Contrat (ou, en cas de plusieurs Contrats, du
          dernier Contrat actif) entre le Mandant et le Prestataire en vertu duquel le Prestataire traite
          des donnees personnelles pour le Mandant, sauf obligations plus longues prevues au present Accord.
          L&apos;ATD prend egalement fin automatiquement des que le Prestataire ne detient plus ni ne
          traite de donnees personnelles pour le Mandant selon le Contrat, ou a la resiliation du (dernier)
          Contrat actif.
        </p>
        <p>
          La possibilite de resiliation pour juste motif sans preavis reste reservee. Constituent notamment
          un juste motif des manquements repetes ou graves d&apos;une partie aux dispositions du Contrat,
          du present ATD ou du droit applicable. Le droit de resiliation speciale selon la section 8 autorise
          egalement une resiliation sans preavis. La resiliation sans preavis du present Accord autorise
          egalement la resiliation sans preavis du Contrat.
        </p>
        <p>
          Si la nature des donnees personnelles traitees, la nature et la finalite du traitement ainsi que
          les categories de personnes concernees ne figurent pas deja dans le Contrat respectif, elles sont
          enumerees a l&apos;annexe 1 du present Accord.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='champ-et-instructions' title='Champ et droit d instruction' order={2}>
        <p>
          Le Prestataire traite les donnees personnelles exclusivement a des fins determinees conformement
          au Contrat respectif, au present ATD ou aux instructions documentees du Mandant.
        </p>
        <p>
          Les instructions sont en principe donnees sous forme textuelle (ecrit, fax, e-mail ou format
          electronique documente). Les instructions orales doivent etre confirmees sans delai sous forme
          textuelle ou electronique documentee. Le Mandant documente toutes les instructions sous forme
          textuelle.
        </p>
        <p>
          Le Prestataire informe le Mandant sans delai s&apos;il estime qu&apos;une instruction viole le
          droit applicable. Il peut suspendre l&apos;execution de l&apos;instruction jusqu&apos;a
          confirmation ou modification par le Mandant.
        </p>
        <p>
          Les notifications aux autorites ou aux personnes concernees concernant des violations ne peuvent
          etre effectuees par le Prestataire qu&apos;apres instruction prealable du Mandant. Les obligations
          imperatives du droit applicable (p.ex. ordres d&apos;autorites competentes) restent reservees;
          le Mandant en est informe dans les delais, dans la mesure permise par la loi.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='securite-des-donnees' title='Securite des donnees' order={2}>
        <p>
          Le Prestataire met en oeuvre des mesures techniques et organisationnelles (MTO) appropriees selon
          l&apos;annexe 2 pour organiser, verifier et adapter en permanence son organisation interne dans son
          domaine de responsabilite afin de garantir un niveau adequat de protection des donnees conforme
          au droit applicable et de proteger les donnees personnelles contre la destruction, la perte, la
          modification ou la divulgation accidentelles ou illegales, etc. Il tient compte de l&apos;etat de
          la technique, des couts, de la nature, de l&apos;etendue, des circonstances et des finalites du
          traitement ainsi que des risques pour les droits et libertes des personnes concernees.
        </p>
        <p>
          Les mesures evoluent avec le progres technique. Des mesures alternatives ou supplementaires
          peuvent etre mises en oeuvre si le niveau de protection des mesures definies n&apos;est pas
          diminue.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='confidentialite' title='Confidentialite' order={2}>
        <p>
          Le Prestataire s&apos;engage a traiter de maniere confidentielle les donnees personnelles recues
          en vertu du Contrat ou du present ATD et a n&apos;y donner acces qu&apos;aux personnes qui en ont
          besoin pour remplir leurs obligations envers le Prestataire. Il veille a ce que les personnes
          autorisees a traiter les donnees s&apos;engagent a la confidentialite, sauf obligation legale de
          secret. Les collaborateurs et autres personnes agissant pour le Prestataire ne peuvent pas traiter
          ces donnees en dehors du Contrat et du present ATD. L&apos;obligation de confidentialite subsiste
          cinq ans apres la fin du present ATD.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='droits-des-personnes' title='Droits des personnes concernees' order={2}>
        <p>
          Si une personne concernee s&apos;adresse directement au Prestataire pour rectification, effacement,
          acces ou autres droits relatifs aux donnees personnelles, le Prestataire la renvoie sans delai au
          Mandant lorsque l&apos;attribution au Mandant est possible selon les informations fournies.
        </p>
        <p>
          Le Prestataire assiste le Mandant, compte tenu de la nature du traitement, par des mesures
          techniques et organisationnelles appropriees pour repondre aux demandes des personnes concernees
          exercant leurs droits selon le droit applicable.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='violation-de-donnees' title='Violation de donnees' order={2}>
        <p>Le Prestataire informe le Mandant sans delai si :</p>
        <ul>
          <li>
            une violation de donnees est constatee ou suspectee par le Prestataire ou un sous-traitant. Les
            informations requises par le droit applicable (notamment nature, etendue et gravite) doivent
            etre fournies pour permettre au Mandant de satisfaire a ses obligations de notification;
          </li>
          <li>des donnees personnelles doivent etre communiquees a une autorite competente;</li>
          <li>
            une demande, convocation ou requete d&apos;inspection par une autorite competente est recue,
            sauf si la notification au Mandant est interdite par la loi.
          </li>
        </ul>
        <p>
          En cas de violation chez le Prestataire ou un sous-traitant, le Prestataire prend a ses frais les
          mesures raisonnablement attendues pour en determiner la cause et proteger les donnees et attenuer
          les consequences pour les personnes concernees.
        </p>
        <p>
          Les obligations d&apos;assistance du Prestataire envers le Mandant selon la presente section sont
          gratuites. Des prestations supplementaires peuvent faire l&apos;objet d&apos;un accord de
          remuneration entre les parties.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='restitution-et-suppression'
        title='Restitution et suppression des donnees personnelles'
        order={2}
      >
        <p>
          Sur premiere instruction du Mandant, le Prestataire restitue sans delai toutes les donnees,
          supports et autres materiels. Il ne conserve les donnees que le temps necessaire a l&apos;execution
          de ses obligations selon le Contrat, sauf obligation legale de conservation.
        </p>
        <p>
          A la fin du Contrat, les donnees personnelles recues doivent etre restituees ou supprimees selon
          le Contrat; a defaut, au choix du Mandant, restitution et suppression des copies, ou suppression,
          sauf obligation legale de conservation. Jusqu&apos;a la suppression ou la restitution, le Prestataire
          assure le respect du present ATD.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='sous-traitants' title='Recours a des sous-traitants' order={2}>
        <p>
          Aux fins du present Accord, « sous-traitant ulterieur » designe tout prestataire mandate par le
          Prestataire (ou par un autre sous-traitant du Prestataire) dans le cadre du present ATD pour
          traiter des donnees personnelles.
        </p>
        <p>
          Le Prestataire recoit par les presentes une autorisation generale prealable ecrite de recourir a
          des sous-traitants. S&apos;ils ne figurent pas deja au Contrat, ils sont listes a l&apos;annexe 3.
          La liste doit etre tenue a jour.
        </p>
        <p>
          L&apos;ajout ou le remplacement de sous-traitants releve du Prestataire. Le Mandant est informe a
          l&apos;avance avec un delai raisonnable des modifications prevues. Si le Mandant dispose d&apos;un
          motif objectivement imperieux selon le droit applicable, il peut s&apos;opposer dans les vingt jours
          suivant la notification. A defaut d&apos;opposition, le nouveau sous-traitant est repute approuve.
          En cas de motif imperieux et d&apos;absence de solution amiable, le Mandant dispose d&apos;un droit
          de resiliation speciale (sans preavis).
        </p>
        <p>
          Le Prestataire conclut les accords necessaires pour que les sous-traitants soient soumis aux memes
          obligations que le Prestataire selon le present ATD et le Contrat. Sur demande, il fournit des
          informations sur le contenu contractuel essentiel et la mise en oeuvre des obligations par le
          sous-traitant.
        </p>
        <p>
          Si un sous-traitant ne respecte pas ses obligations, le Prestataire est responsable envers le
          Mandant des manquements du sous-traitant selon le present ATD.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='documentation'
        title='Documentation, registre des activites de traitement'
        order={2}
      >
        <p>
          Chaque partie est responsable de ses obligations de documentation, notamment la tenue du registre
          des activites de traitement lorsque le droit applicable l&apos;exige. Chaque partie assiste
          l&apos;autre de maniere appropriee, y compris en fournissant les informations demandees sous une
          forme raisonnable (p.ex. systeme electronique), afin que l&apos;autre partie puisse satisfaire a
          ses obligations de registre.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='analyse-d-impact'
        title='Analyse d impact relative a la protection des donnees'
        order={2}
      >
        <p>
          Si le Mandant est tenu selon le droit applicable de realiser une analyse d&apos;impact ou une
          consultation prealable d&apos;une autorite de controle, le Prestataire met gratuitement a
          disposition, sur demande, les documents generalement disponibles pour les services du Contrat
          (p.ex. le present ATD, le Contrat, rapports d&apos;audit ou certifications). Toute assistance
          supplementaire est convenue entre les parties.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='audits'
        title='Obligations de preuve et droit d audit'
        order={2}
      >
        <p>
          Le Prestataire prouve au Mandant le respect des obligations du present ATD par des moyens
          appropries (p.ex. certificats).
        </p>
        <p>
          Le Mandant a le droit de verifier le respect des obligations legales ou contractuelles concernant
          le traitement des donnees personnelles lui-meme ou par des auditeurs mandates, soumis a une stricte
          confidentialite et n&apos;etant pas en concurrence directe avec le Prestataire, par inspections ou
          audits, lorsque :
        </p>
        <ul>
          <li>
            le Prestataire ne fournit pas de preuve suffisante (certificats, rapports d&apos;audit) du
            respect des MTO protegeant les systemes et processus utilises;
          </li>
          <li>une violation de la protection des donnees personnelles s&apos;est produite;</li>
          <li>un audit est officiellement exige par une autorite de controle du Mandant; ou</li>
          <li>
            le Mandant dispose d&apos;un droit d&apos;audit direct selon le droit applicable imperatif.
          </li>
        </ul>
        <p>
          Le Prestataire coopere de maniere appropriee. Les parties conviennent a l&apos;avance du moment,
          de la duree et de l&apos;objet des audits ainsi que des regles de securite et de confidentialite,
          sauf si un audit sans preavis est necessaire pour ne pas compromettre son objet. L&apos;audit ne
          doit pas perturber excessivement les operations du Prestataire. Les audits du Mandant sont en
          principe limites a trois jours ouvrables par an.
        </p>
        <p>
          Chaque partie supporte ses propres frais. Pour un effort depassant trois jours ouvrables, le
          Prestataire peut exiger une remuneration pour l&apos;assistance a un audit mandate par le Mandant.
        </p>
        <p>
          En cas de manquements materiels constates apres presentation de preuves ou dans le cadre d&apos;un
          audit, le Prestataire met en oeuvre sans delai et gratuitement des mesures correctives appropriees.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='pays-tiers' title='Traitement dans des pays tiers' order={2}>
        <p>
          Le traitement a lieu exclusivement en Suisse, dans un Etat membre de l&apos;UE, dans un autre Etat
          contractant de l&apos;EEE ou dans un pays disposant d&apos;un niveau de protection adequat selon une
          decision de la Commission europeenne ou du PFPDT. Le traitement en dehors de cette zone n&apos;est
          permis qu&apos;apres information du Mandant et conformement au droit applicable. En cas de
          communication vers un Etat sans protection adequate, le Prestataire s&apos;engage notamment a
          conclure des accords complementaires bases sur les clauses contractuelles types actuelles de l&apos;UE
          (adaptees a la Suisse si necessaire) et a prendre des mesures juridiques, techniques ou
          organisationnelles supplementaires.
        </p>
        <p>
          Le Prestataire peut transferer des donnees personnelles aux Etats-Unis pour l&apos;execution du
          Contrat. Lorsque des donnees soumises au droit suisse ou europeen sont traitees aux Etats-Unis, elles
          le sont selon le Swiss-U.S. Data Privacy Framework et l&apos;EU-U.S. Data Privacy Framework
          (ensemble le « cadre de confidentialite »).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='responsabilite' title='Responsabilite' order={2}>
        <p>
          Le Prestataire est responsable des fautes de ses sous-traitants comme de ses propres actes. L&apos;etendue
          de la responsabilite des parties selon le present ATD est regie par les dispositions et limitations de
          responsabilite du Contrat ou, en cas de plusieurs Contrats, du Contrat concerne. Les autres recours
          legaux restent reserves.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='dispositions-finales' title='Dispositions finales' order={2}>
        <p>
          <strong>Contenu de l accord.</strong> Le present ATD et ses annexes regissent exclusivement les
          relations des parties concernant le traitement des donnees personnelles et remplacent les negociations
          et correspondances anterieures. En cas de contradiction entre le Contrat et le present ATD, le present
          ATD prevaut lorsque le traitement des donnees par le Prestataire dans le cadre du Contrat concerne
          est en jeu. En cas de contradiction, une annexe prevaut; en cas de plusieurs annexes contradictoires,
          les dispositions des annexes les plus recentes prevaut sur les conditions plus anciennes.
        </p>
        <p>
          Les termes de protection des donnees tels que « donnees personnelles », « traiter », « responsable du
          traitement », « sous-traitant », « analyse d impact », etc. ont le sens qui leur est attribue par la
          loi suisse ou, selon le contexte, le RGPD. « Traiter » est utilise comme synonyme de « traiter » au
          sens suisse. « Violation de donnees » designe une « violation de la securite des donnees a caractere
          personnel ».
        </p>
        <p>
          <strong>Modifications.</strong> Le Prestataire se reserve le droit de modifier ou completer l&apos;ATD.
          En cas de modifications pouvant nuire au Mandant, le Prestataire l&apos;informe par ecrit, e-mail ou
          portail client. Le nouvel ATD devient partie du Contrat sauf opposition du Mandant dans les 14 jours
          suivant la prise de connaissance.
        </p>
        <p>
          <strong>Notifications.</strong> Sauf disposition contraire, les notifications pour exercer droits et
          obligations doivent etre faites par ecrit, courrier ou e-mail aux adresses indiquees au Contrat.
        </p>
        <p>
          <strong>Divisibilite.</strong> Si une disposition est nulle ou inapplicable, la validite du reste
          n&apos;est pas affectee. Les parties adapteront l&apos;Accord pour atteindre autant que possible l&apos;objet
          de la disposition invalide.
        </p>
        <p>
          <strong>Reglement des differends.</strong> Les parties s&apos;engagent a rechercher de bonne foi un
          reglement amiable en cas de desaccord.
        </p>
        <p>
          <strong>Droit applicable et for.</strong> En l&apos;absence d&apos;accord amiable, le litige est regi
          selon les dispositions du Contrat respectif (droit applicable et for).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='annexes' title='Annexes' order={2}>
        <p>Les annexes suivantes font partie integrante de l&apos;Accord :</p>
        <ul>
          <li>Annexe 1 : Dispositions d&apos;execution</li>
          <li>Annexe 2 : Mesures techniques et organisationnelles</li>
          <li>Annexe 3 : Liste des sous-traitants</li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='annexe-1'
        title="Annexe 1 a l'accord de traitement des donnees – Dispositions d'execution"
        order={2}
      >
        <p>Version 1.0 du 3 mars 2025</p>
        <p>
          <strong>Liste des parties</strong>
        </p>
        <p>
          <strong>Exportateur de donnees</strong>
          <br />
          Nom : Le Mandant selon le Contrat
          <br />
          Adresse : L&apos;adresse du Mandant selon le Contrat
          <br />
          Nom, fonction et coordonnees du contact : Coordonnees du Mandant selon le Contrat et/ou le profil
          client
          <br />
          Activites pertinentes : Traitement de donnees personnelles lie a l&apos;utilisation du service SaaS
          par le Mandant selon les conditions contractuelles
          <br />
          Role : Responsable du traitement (en qualite de responsable, sous-traitant ou pour le compte d&apos;un
          autre responsable)
        </p>
        <p>
          <strong>Importateur de donnees</strong>
          <br />
          Nom : Le Prestataire selon le Contrat
          <br />
          Adresse : L&apos;adresse du Prestataire selon le Contrat
          <br />
          Coordonnees du contact : Selon le Contrat ou la politique de confidentialite du Prestataire
          <br />
          Activites pertinentes : Traitement de donnees personnelles lie a l&apos;utilisation du service SaaS
          <br />
          Role : Sous-traitant
        </p>
        <p>
          <strong>Description du transfert</strong>
        </p>
        <p>
          <strong>Categories de personnes concernees</strong>
          <br />
          Lors de l&apos;utilisation du service SaaS, le Mandant peut transferer des donnees personnelles dont
          il determine l&apos;etendue. Les donnees peuvent concerner notamment : contacts du Mandant et autres
          utilisateurs finaux, employes, contractants, personnel et clients du Mandant.
        </p>
        <p>
          <strong>Categories de donnees personnelles transferees</strong>
          <br />
          Le Mandant peut transferer des coordonnees (selon le Contrat) et toute autre donnee personnelle
          transmise via le service SaaS (notamment donnees de suivi du temps).
        </p>
        <p>
          <strong>Transfert de categories particulieres de donnees</strong>
          <br />
          En principe, aucune categorie particuliere n&apos;est transferee. Si le Mandant le souhaite
          neanmoins, un accord separe doit etre conclu avec restrictions et mesures de protection convenues.
        </p>
        <p>
          <strong>Frequence du transfert</strong>
          <br />
          En continu
        </p>
        <p>
          <strong>Nature du traitement</strong>
          <br />
          Stockage et autres traitements necessaires a la fourniture, maintenance et amelioration du service SaaS;
          et/ou divulgation selon le Contrat (y compris le present ATD) et/ou la loi applicable.
        </p>
        <p>
          <strong>Finalite du transfert et traitements ulterieurs</strong>
          <br />
          Le Prestataire traite les donnees dans la mesure necessaire a la fourniture du service SaaS selon le
          Contrat et les instructions du Mandant.
        </p>
        <p>
          <strong>Duree de conservation</strong>
          <br />
          Sous reserve de la section 7.4 de l&apos;ATD, le Prestataire traite les donnees pendant la duree de
          l&apos;Accord sauf accord ecrit contraire.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='annexe-2'
        title="Annexe 2 a l'accord de traitement des donnees – Description des mesures techniques et organisationnelles (MTO) selon la section 4 de l'ATD"
        order={2}
      >
        <p>Version 1.0 du 3 mars 2025</p>
        <p>
          Description des mesures techniques et organisationnelles du Prestataire en lien avec le traitement
          des donnees personnelles et l&apos;execution de ses obligations, art. 8 LPD en lien avec art. 2 ss.
          OPDo et, le cas echeant, art. 32 RGPD :
        </p>
        <p>
          <strong>Confidentialite</strong> — Mesures incluant controle d&apos;acces, d&apos;utilisation et
          d&apos;utilisateurs.
        </p>
        <p>
          <strong>Controle d&apos;acces (physique)</strong> — Les installations de traitement ne sont pas
          accessibles aux personnes non autorisees. Presence enregistree dans les zones securisees. Personnes
          non autorisees accompagnees.
        </p>
        <p>
          <strong>Controle utilisateur (acces numerique)</strong> — Les systemes ne peuvent etre utilises par des
          personnes non autorisees.
        </p>
        <p>
          <strong>Controle d&apos;utilisation</strong> — Chiffrement et autres mesures garantissent l&apos;acces
          autorise uniquement aux donnees pertinentes.
        </p>
        <p>
          <strong>Controle de separation</strong> — Donnees collectees a des fins differentes traitees separement.
        </p>
        <p>
          <strong>Pseudonymisation</strong> — Fichiers de correspondance stockes separement, chiffres, acces
          limite. Anonymisation/pseudonymisation lorsque possible.
        </p>
        <p>
          <strong>Disponibilite et integrite</strong> — Mesures de disponibilite et d&apos;integrite contre
          interruptions et traitements illegaux.
        </p>
        <p>
          <strong>Controle du transport</strong> — Protection lors des transmissions electroniques et sur supports.
        </p>
        <p>
          <strong>Reprise</strong> — Restauration rapide apres incident physique ou technique.
        </p>
        <p>
          <strong>Controle de disponibilite</strong> — Protection contre destruction ou perte accidentelle.
        </p>
        <p>
          <strong>Securite des systemes</strong> — Mises a jour regulieres et correction rapide des vulnerabilites.
        </p>
        <p>
          <strong>Tracabilite</strong> — Traitement tracable, acces non autorises identifiables.
        </p>
        <p>
          <strong>Controle des saisies</strong> — Journalisation via fichiers logs automatiques.
        </p>
        <p>
          <strong>Detection et remediation des violations</strong> — Detection rapide et mesures correctives.
        </p>
        <p>
          <strong>Mesures de protection des donnees</strong> — Politiques accessibles, formations, AIPD au besoin,
          processus pour demandes d&apos;acces.
        </p>
        <p>
          <strong>Gestion des incidents</strong> — Incidents journalises et signales; information immediate des
          superieurs.
        </p>
        <p>
          <strong>Privacy by design / by default</strong> — Collecte limite aux donnees necessaires.
        </p>
        <p>
          <strong>Controle des sous-traitants</strong> — Pas de traitement sans instruction; selection et suivi
          rigoureux.
        </p>
        <p>
          <strong>Adaptations</strong> — Modifications possibles sans diminuer le niveau de protection convenu.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='annexe-3'
        title="Annexe 3 a l'accord de traitement des donnees – Liste des sous-traitants selon la section 8 de l'ATD"
        order={2}
      >
        <p>Version 1.0 du 3 mars 2025</p>
        <p>
          Pour l&apos;execution du ou des Contrat(s), le Prestataire peut, selon la section 8 de l&apos;ATD,
          recourir aux sous-traitants designes ci-dessous pour les prestations indiquees :
        </p>
        <SubProcessorsTable
          rows={subProcessorsFr}
          headers={{
            company: 'Entreprise, forme juridique',
            address: 'Adresse',
            processingLocation: 'Lieu de traitement',
            serviceType: 'Type de prestation',
          }}
        />
      </LegalDocumentSection>
    </>
  )
}
