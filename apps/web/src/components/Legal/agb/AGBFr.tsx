import type { TocLink } from '../PrivacyLayout'
import { LegalDocumentSection } from '../LegalDocumentSection'

export const agbMetaFr = {
  title: "Conditions générales d'EduTime",
  tocLabel: 'Table des matières',
  meta: {
    version: 'Version 1.0',
    lastUpdated: '3 mars 2025',
  },
}

export const tocLinksFr: TocLink[] = [
  { id: 'anwendungsbereich', label: "1. Champ d'application", order: 1 },
  { id: 'umfang-der-nutzung', label: "2. Étendue de l'utilisation", order: 1 },
  {
    id: 'testversion-und-kostenloser-leistungsumfang',
    label: "3. Version d'essai et étendue gratuite des prestations",
    order: 1,
  },
  {
    id: 'daten-datenspeicherung-und-backup',
    label: '4. Données, stockage des données et sauvegarde',
    order: 1,
  },
  {
    id: 'verantwortung-fuer-inhalte',
    label: '5. Responsabilité du contenu et utilisation licite',
    order: 1,
  },
  {
    id: 'sperrung-bei-unzulaessigen-inhalten',
    label: '6. Blocage en cas de contenus illicites',
    order: 1,
  },
  {
    id: 'wahrung-der-schutzrechte',
    label: '7. Protection des droits de propriété',
    order: 1,
  },
  {
    id: 'mitwirkungspflichten',
    label: '8. Obligations de coopération du Client',
    order: 1,
  },
  {
    id: 'verguetung-und-zahlungsbedingungen',
    label: '9. Rémunération et conditions de paiement',
    order: 1,
  },
  {
    id: 'mehr-oder-mindernutzung',
    label: "10. Utilisation excédentaire ou réduite et droit d'audit",
    order: 1,
  },
  {
    id: 'leistungserbringung',
    label: '11. Fourniture des prestations',
    order: 1,
  },
  {
    id: 'gewaehrleistung',
    label: "12. Garantie pour l'étendue payante des prestations",
    order: 1,
  },
  { id: 'haftung', label: '13. Responsabilité', order: 1 },
  {
    id: 'vertragsschluss-dauer-beendigung',
    label: '14. Conclusion, durée et résiliation du contrat',
    order: 1,
  },
  {
    id: 'geheimhaltung-und-datenschutz',
    label: '15. Confidentialité et protection des données',
    order: 1,
  },
  {
    id: 'verletzung-geheimhaltung',
    label: "16. Violation de la confidentialité et de la concession d'utilisation",
    order: 1,
  },
  { id: 'hoehere-gewalt', label: '17. Force majeure', order: 1 },
  { id: 'schlussbestimmungen', label: '18. Dispositions finales', order: 1 },
  {
    id: 'rechtswahl-und-gerichtsstand',
    label: '19. Droit applicable et for juridique',
    order: 1,
  },
]

/**
 * French AGB (Conditions générales) component.
 * Swiss-French legal translation of the German AGB for EduTime.
 */
export function AGBFr() {
  return (
    <>
      <LegalDocumentSection id='anwendungsbereich' title="1. Champ d'application" order={2}>
        <p>
          EduTime GmbH, c/o Tim Ogi, Bienenstrasse 8, 3018 Berne (ci-après « EduTime »), met à
          disposition du Client, sur la base d'un contrat individuel (ci-après également « contrat
          SaaS individuel ») ainsi que des présentes conditions générales (ci-après « CG », y
          compris leurs éléments contractuels intégrants, le tout ci-après « contrat »), pendant la
          durée du contrat, les droits d'utilisation décrits au contrat relatifs à la solution
          logicielle EduTime (ci-après « logiciel SaaS ») avec la documentation associée sur
          l'infrastructure serveur d'EduTime ou du fournisseur de plateforme mandaté par EduTime,
          pour l'utilisation par le Client par accès à distance via Internet, et fournit les
          prestations supplémentaires convenues au contrat et liées à cette utilisation du logiciel
          SaaS (telles que la mise à disposition d'espace de stockage ainsi que le support et la
          maintenance) au sens d'un service cloud (ci-après « service SaaS » dans son ensemble).
        </p>
        <p>
          Les conditions d'achat et de vente du Client ne s'appliquent pas, même si EduTime ne s'y
          oppose pas expressément. En particulier, les présentes CG s'appliquent également lorsque
          les commandes ou contre-confirmations du Client sont faites en se référant à ses propres
          conditions commerciales ou d'achat. Les dérogations aux présentes CG ne sont valables que
          si elles sont convenues par écrit entre les parties contractantes en indiquant une
          dérogation aux présentes CG ou confirmées par écrit par EduTime.
        </p>
        <p>
          Les présentes CG seules n'instaurent réciproquement aucune obligation de livraison, de
          paiement, de réception ou de conclusion de contrat. Un droit du Client à la livraison ou à
          la prestation au regard du champ d'application des CG suppose un contrat SaaS individuel
          conclu. La présentation de produits et de prestations sur les sites web ou dans les listes
          de prix d'EduTime ne constitue pas une offre contractuelle juridiquement contraignante
          d'EduTime. Sans indication contraire, les offres d'EduTime sont valables dix (10) jours.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='umfang-der-nutzung' title="2. Étendue de l'utilisation" order={2}>
        <p>
          EduTime met à disposition du Client, dans le cadre du contrat SaaS individuel, le logiciel
          SaaS qui y est spécifié dans l'étendue des prestations convenue (p. ex. nombre
          d'utilisateurs) pour une utilisation via Internet. À cette fin, EduTime met le logiciel
          SaaS à disposition sur une plateforme serveur à laquelle le Client peut accéder via
          Internet et ainsi utiliser le logiciel SaaS. Les droits d'utilisation concédés au Client
          par EduTime sur le logiciel SaaS tiers sont limités en étendue aux droits d'utilisation
          que des tiers ont concédés à EduTime.
        </p>
        <p>
          Le service SaaS d'EduTime n'est pas autorisé pour une utilisation dans des applications
          critiques pour la sécurité ou d'autres applications dont la défaillance pourrait entraîner
          des dommages corporels, des décès ou des dommages matériels catastrophiques. Si le Client
          utilise le service SaaS pour de telles applications, il reconnaît qu'une telle utilisation
          s'effectue aux seuls risques du Client. Le Client s'engage à dégager, défendre et
          indemniser EduTime de tous les coûts et responsabilités découlant ou en lien avec une
          telle utilisation.
        </p>
        <p>
          Dans le cadre des présentes CG en liaison avec le contrat SaaS individuel correspondant,
          EduTime concède au Client le droit non exclusif, incessible, non sous-licenciable et
          payant d'utiliser le logiciel SaaS conformément aux dispositions des présentes CG et du
          contrat SaaS individuel correspondant, après paiement intégral des redevances
          d'utilisation dues, pour ses propres besoins. Cette concession de droit d'utilisation ne
          comporte pas l'acquisition de droits supplémentaires sur le logiciel SaaS. Il est
          expressément interdit au Client de louer le service SaaS ou des parties de celui-ci et/ou
          de les transmettre à des tiers.
        </p>
        <p>
          Le Client est tenu de veiller à ce que tout accès, utilisation et recours par ses
          utilisateurs (c.-à-d. les personnes physiques autorisées à utiliser le service SaaS au
          profit du Client et disposant d'identifiants et de mots de passe uniques pour le service
          SaaS) soient soumis au présent contrat et conformes à celui-ci. Le Client peut autoriser
          ses utilisateurs à accéder au service SaaS et à l'utiliser ou à bénéficier des services
          acquis dans le cadre d'un contrat SaaS individuel ; ceci à condition que tout accès,
          utilisation et recours par les utilisateurs soient soumis au contrat et que le Client soit
          à tout moment responsable de l'exécution du présent contrat par ses utilisateurs.
        </p>
        <p>
          Sauf convention contraire dans le contrat SaaS individuel, EduTime s'engage à fournir les
          prestations de support suivantes pour le service SaaS les jours ouvrables, de 08h00 à
          17h00, à l'exclusion des jours fériés officiels et des jours fériés usuels au siège
          d'EduTime (les prestations en dehors de ces horaires sont facturées séparément) :
        </p>
        <ul>
          <li>
            Support par e-mail pour le Client en cas de problèmes d'application liés au service SaaS
            ;
          </li>
          <li>Réception et traitement des signalements d'erreurs du Client ;</li>
          <li>Recherche de pannes en cas de dysfonctionnements du service SaaS ;</li>
          <li>Mise à jour de la documentation utilisateur en ligne.</li>
        </ul>
        <p>
          Le Client est tenu de signaler de manière appropriée et documentée les problèmes liés au
          service SaaS, tels que dysfonctionnements, bugs ou erreurs dans le logiciel SaaS ainsi que
          l'utilisation non autorisée du service SaaS dont il a connaissance, par e-mail
          (info@edutime.ch) ou via l'outil de signalement mis à disposition par EduTime à une URL
          déterminée. La correction des erreurs ou le correctif du logiciel SaaS ou de la
          documentation associée sont effectués par EduTime en toute bonne foi. Les prestations de
          support dépassant ce cadre sont facturées au Client selon les tarifs en vigueur d'EduTime.
        </p>
        <p>
          Les exigences techniques actuelles pour l'utilisation/la connexion réseau du Client sont
          fixées dans le contrat SaaS individuel. Les exigences techniques y mentionnées, valables
          au moment de la conclusion du contrat, peuvent être adaptées unilatéralement par EduTime à
          tout moment à l'état de la technique, EduTime informant le Client des adaptations
          importantes dans un délai raisonnable (en règle générale un mois à l'avance), notamment
          par e-mail ou sur un site web approprié. Le Client s'engage à respecter à tout moment les
          exigences techniques et à veiller à ce que les utilisateurs connaissent l'utilisation
          correcte du logiciel SaaS.
        </p>
        <p>
          EduTime est en droit de développer à tout moment le service SaaS, en particulier les
          caractéristiques de performance du logiciel SaaS, et de l'adapter, le restreindre ou
          cesser complètement la fourniture de prestations individuelles pour tenir compte du
          progrès technique et des cadres juridiques modifiés. Les modifications qui restreignent
          sensiblement l'offre de prestations pour le Client sont communiquées par EduTime au Client
          au préalable dans un délai de notification raisonnable par écrit, par e-mail ou sur un
          site web approprié. Si l'utilisation du service SaaS mis à jour est déraisonnable pour le
          Client, celui-ci peut résilier extraordinairement le service SaaS jusqu'à un (1) mois
          après la mise à jour du service SaaS en respectant un délai de résiliation de 20 jours à
          la fin d'un mois par notification en forme écrite (cf. chiffre 17.3).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='testversion-und-kostenloser-leistungsumfang'
        title="3. Version d'essai et étendue gratuite des prestations"
        order={2}
      >
        <p>
          Dans la mesure où le Client utilise le service SaaS ou le logiciel SaaS en version
          d'essai, EduTime lui accorde à cette fin une licence aux seules fins de test et
          d'évaluation et exclusivement pour des usages internes non productifs et, sauf indication
          contraire expresse, pour une durée limitée de 30 jours (« version d'essai »).
        </p>
        <p>
          La version d'essai ainsi que le logiciel SaaS choisi par le Client avec une étendue
          gratuite des prestations sont fournis en l'état (« as is »), à l'exclusion de toute
          garantie de conformité et légale. EduTime décline expressément toutes garanties et
          assurances implicites ou légales (p. ex. concernant les conditions d'utilisation et de
          fonctionnement, les fonctionnalités, l'aptitude à l'usage, etc.). Le Client n'a droit à
          aucune prestation de support, maintenance et entretien.
        </p>
        <p>
          Si la version d'essai n'est pas convertie en étendue payante pendant la période d'essai
          accordée, toutes les données du Client sont supprimées à l'expiration de la licence de la
          version d'essai conformément aux cycles de suppression d'EduTime.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='daten-datenspeicherung-und-backup'
        title='4. Données, stockage des données et sauvegarde'
        order={2}
      >
        <p>
          EduTime met à disposition du Client une capacité de stockage sur l'infrastructure serveur
          d'EduTime pour le stockage des données liées à l'utilisation du logiciel SaaS, selon le
          contrat SaaS individuel.
        </p>
        <p>
          Les données appartiennent à la sphère juridique du Client qui utilise le service SaaS,
          même si elles sont stockées physiquement chez EduTime. Le Client est seul responsable du
          stockage et du traitement des données. Le Client respecte en particulier strictement les
          dispositions de la loi applicable en matière de protection des données lors de la collecte
          et du traitement de données personnelles.
        </p>
        <p>
          EduTime permet au Client de télécharger ses données stockées sur l'infrastructure serveur
          pendant la durée du contrat et dans les trente (30) jours suivant la fin du contrat selon
          une procédure standardisée fournie par EduTime. EduTime ne garantit en aucun cas
          l'utilisabilité des données téléchargées sur d'autres systèmes. EduTime est en droit de
          supprimer les données du Client stockées chez EduTime après la fin du contrat dans le
          cadre des cycles de suppression usuels, sauf si EduTime est tenu de les conserver en vertu
          du droit impératif.
        </p>
        <p>
          EduTime prend les mesures appropriées contre la perte de données en cas de défaillance de
          l'infrastructure serveur ainsi que pour prévenir l'accès non autorisé par des tiers aux
          données du Client. À cette fin, EduTime effectue des sauvegardes régulières (au moins une
          fois par jour) et protège les données d'accès du Client stockées sur le serveur par des
          moyens appropriés correspondant à l'état de la technique contre les accès non autorisés.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='verantwortung-fuer-inhalte'
        title='5. Responsabilité du contenu et utilisation licite'
        order={2}
      >
        <p>
          Le Client s'engage à ne traiter que des contenus licites avec le service SaaS. Sont
          notamment illicites les contenus qui violent ou menacent les droits d'EduTime ou de tiers,
          en particulier les droits de propriété intellectuelle au sens large (par ex. droits
          d'auteur ou marques) ou les droits de la personnalité, ou la réputation commerciale ; sont
          également illicites tous les contenus qui constituent des infractions pénales (notamment
          dans les domaines de la pornographie, de la représentation de la violence, du racisme, des
          secrets d'affaires, de l'atteinte à l'honneur et de la fraude) (ci-après ensemble «
          contenus illicites »). Les utilisations particulièrement gourmandes en ressources, c.-à-d.
          les utilisations pouvant affecter le fonctionnement normal et la sécurité de
          l'infrastructure serveur d'EduTime ainsi que l'utilisation de l'infrastructure serveur par
          d'autres clients, ne sont autorisées qu'avec l'accord préalable d'EduTime. EduTime a toute
          latitude pour décider d'accorder ou non son accord et peut révoquer un accord donné pour
          des raisons de sécurisation de l'exploitation de l'infrastructure serveur à tout moment
          avec effet immédiat.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='sperrung-bei-unzulaessigen-inhalten'
        title='6. Blocage en cas de contenus illicites'
        order={2}
      >
        <p>EduTime n'est pas tenue de surveiller les contenus accessibles via le service SaaS.</p>
        <p>
          EduTime est en droit de bloquer l'accès au service SaaS en tout ou en partie et
          d'interrompre temporairement ou définitivement les prestations (i) si EduTime y est invité
          par une autorité judiciaire ou administrative, ou (ii) si elle pourrait autrement
          s'exposer à une responsabilité juridique ou pénale, ou (iii) lorsqu'un contrôle donne des
          indices concrets ou des soupçons de mise à disposition de contenus illicites ou d'une
          utilisation par ailleurs illicite ou contraire au contrat. EduTime est en droit de
          facturer au Client les frais engagés en lien avec les blocages et autres mesures. En
          outre, le Client s'engage à indemniser intégralement EduTime si un tiers entend faire
          valoir des droits à l'encontre d'EduTime en lien avec la mise à disposition de contenus
          illicites via le service SaaS. Ceci comprend également le remboursement des frais de
          représentation juridique d'EduTime. La revendication de dommages supplémentaires reste
          réservée. EduTime peut exiger du Client une garantie pour la couverture préventive des
          frais et des dommages supplémentaires. Si cette garantie n'est pas fournie ou si le Client
          ne suit pas les demandes relatives aux mesures prises, EduTime peut suspendre la
          fourniture du service SaaS ou résilier le contrat avec le Client sans préavis.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wahrung-der-schutzrechte'
        title='7. Protection des droits de propriété'
        order={2}
      >
        <p>
          Le Client reconnaît les droits de propriété, en particulier le droit d'auteur, d'EduTime
          en tant que titulaire des droits sur le logiciel SaaS, s'abstient pendant la durée de la
          mise à disposition du logiciel SaaS concédée au Client de toute atteinte à l'existence et
          à l'étendue de ces droits et prend, conformément aux instructions d'EduTime, toutes les
          mesures pour préserver les droits d'EduTime et soutient EduTime dans une mesure appropriée
          dans la défense des droits de propriété.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='mitwirkungspflichten'
        title='8. Obligations de coopération du Client'
        order={2}
      >
        <p>
          Le Client est responsable de la fourniture et de l'entretien des terminaux nécessaires à
          l'utilisation du service SaaS, de la liaison de données pour l'accès au logiciel SaaS (p.
          ex. matériel et système d'exploitation, équipements réseau, connexion Internet ou
          location, etc.) et veille à ce que leur configuration et leur état technique correspondent
          aux prescriptions actuelles d'EduTime (actuellement : navigateur Internet HTML5 tel que
          Google Chrome dans sa version la plus récente avec cookies et scripts tiers activés ; avec
          d'autres navigateurs/versions, l'accès au service SaaS peut être impossible ou limité).
          Lors de l'utilisation du service SaaS par lui ou par des utilisateurs désignés par lui, le
          Client respecte les prescriptions d'une éventuelle documentation utilisateur et protège
          les données d'accès contre les accès non autorisés. Toute action effectuée avec les
          identifiants et mots de passe du Client, telle que communications et modifications des
          données utilisateur ou autres paramètres, est imputée au Client par EduTime.
        </p>
        <p>
          Avant de transmettre des données et informations à EduTime, le Client les vérifiera pour
          détecter les virus et utilisera des programmes de protection antivirus et anti-malware
          conformes à l'état de la technique.
        </p>
        <p>
          En cas de violations graves des conditions d'utilisation du service SaaS (par le Client
          lui-même ou par des utilisateurs désignés par lui) ou des obligations de coopération du
          Client, EduTime est en droit de bloquer au Client l'accès au service SaaS en tout ou en
          partie. En cas de concession d'utilisation non autorisée, le Client doit fournir à EduTime
          sur demande sans délai toutes les informations pour faire valoir les prétentions à
          l'encontre de l'utilisateur, en particulier communiquer son nom et son adresse.
        </p>
        <p>
          Le Client prend les mesures appropriées au cas où le logiciel SaaS ne fonctionnerait pas
          correctement en tout ou en partie (p. ex. par sauvegarde des données, diagnostic des
          pannes, vérification régulière des résultats).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='verguetung-und-zahlungsbedingungen'
        title='9. Rémunération et conditions de paiement'
        order={2}
      >
        <p>
          La rémunération due par le Client pour le service SaaS résulte du contrat SaaS individuel.
        </p>
        <p>
          EduTime est en droit d'ajuster unilatéralement la rémunération convenue dans le contrat
          SaaS individuel avec un délai de préavis de deux (2) mois au début d'une nouvelle période
          contractuelle. Si le Client n'est pas d'accord avec l'ajustement des prix, il peut
          résilier le service SaaS en respectant un délai de résiliation de 20 jours à la fin de la
          période contractuelle par notification en forme écrite (cf. chiffre 17.3).
        </p>
        <p>
          Tous les prix s'entendent hors taxe sur la valeur ajoutée en vigueur. EduTime facture en
          principe la rémunération due pour chaque période contractuelle à l'avance. Les factures
          sont payables sans déduction dans les trente (30) jours à compter de la date de facture.
        </p>
        <p>
          Le Client est en retard de paiement sans autre rappel à l'expiration du délai de paiement.
          EduTime est en droit de facturer à compter de l'entrée en retard les intérêts de retard
          légaux ainsi que les frais. Si les créances d'EduTime paraissent compromises, les
          prestations peuvent être suspendues ou subordonnées à un paiement anticipé.
        </p>
        <p>
          Si le Client ne s'acquitte pas intégralement de ses obligations de paiement conformément
          aux dispositions du présent chiffre 9, EduTime se réserve le droit de bloquer
          temporairement les données du Client stockées sur l'infrastructure serveur d'EduTime
          jusqu'au paiement intégral de la rémunération due.
        </p>
        <p>
          Le Client ne peut compenser qu'avec des créances non contestées ou définitivement
          reconnues.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='mehr-oder-mindernutzung'
        title="10. Utilisation excédentaire ou réduite et droit d'audit"
        order={2}
      >
        <p>
          EduTime a le droit de vérifier mensuellement et annuellement l'étendue effective de
          l'utilisation de l'étendue des prestations du service SaaS convenue dans le contrat SaaS
          individuel et de réclamer la rémunération pour une utilisation excédentaire par rapport à
          l'étendue des prestations sous licence.
        </p>
        <p>
          EduTime a le droit de vérifier elle-même ou par un tiers mandaté (p. ex. une fiduciaire)
          le respect des dispositions relatives à l'usage conforme et à la protection du logiciel
          SaaS ou du service SaaS dans l'exploitation du Client au moyen d'inspections ou d'audits,
          tout en préservant les secrets d'affaires et d'exploitation du Client.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='leistungserbringung'
        title='11. Fourniture des prestations'
        order={2}
      >
        <p>
          EduTime est en droit de mandater des tiers comme sous-traitants ; EduTime répond du choix,
          de l'instruction et du contrôle attentifs de ceux-ci. EduTime peut fournir des prestations
          de même nature ou similaires également à d'autres clients.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='gewaehrleistung'
        title="12. Garantie pour l'étendue payante des prestations"
        order={2}
      >
        <p>
          EduTime garantit les caractéristiques du service SaaS ou du logiciel SaaS qu'elle a
          expressément assurées par écrit.
        </p>
        <p>
          Le Client reconnaît que l'accès au service SaaS dépend également de facteurs hors du
          contrôle d'EduTime, tels que l'accès réseau au fournisseur de plateforme sur lequel le
          logiciel SaaS est exploité, et qu'EduTime ne garantit donc pas, sans préjudice de la
          garantie mentionnée au paragraphe précédent, que le service SaaS soit disponible sans
          interruption. En outre, EduTime ne peut garantir ni les temps de réaction, ni les temps de
          rétablissement, ni des disponibilités minimales mensuelles ou annuelles, ni que le
          logiciel SaaS et le centre de calcul du fournisseur de plateforme ou sa plateforme serveur
          soient exempts d'erreurs ou utilisables sans interruption. EduTime est en particulier en
          droit de bloquer l'accès à tout moment pour des travaux de maintenance urgents ou en cas
          de risques de sécurité exceptionnels.
        </p>
        <p>
          Pour les défauts du logiciel SaaS signalés par le Client sans délai et de manière
          documentée après découverte, reproductibles, EduTime éliminera le défaut à son choix,
          mettra à disposition du Client une version logicielle corrigée ou indiquera des solutions
          de contournement raisonnables.
        </p>
        <p>
          Si EduTime ne parvient pas malgré des efforts répétés à corriger un défaut reproductible
          dûment signalé par le Client, et si l'aptitude à l'usage du logiciel SaaS par rapport à la
          description du périmètre fonctionnel en est sensiblement réduite ou exclue, le Client doit
          fixer par écrit deux fois un délai supplémentaire raisonnable et dispose après son
          expiration sans succès d'un droit extraordinaire de résilier le service SaaS. Pour les
          autres défauts, le Client a droit à une réduction ou à une restitution partielle de la
          rémunération correspondant à la dépréciation pour la partie concernée du logiciel SaaS.
          Toute autre garantie d'EduTime est expressément exclue.
        </p>
        <p>
          Le délai de garantie est de six (6) mois à compter de la première mise à disposition
          payante du logiciel SaaS par EduTime.
        </p>
        <p>
          Dans la mesure où un défaut signalé n'est pas démontrable ou n'est pas imputable à
          EduTime, le Client rémunère EduTime pour les frais engagés suite à la recherche de la
          panne. Le Client doit en particulier rémunérer également le surcroît de travail pour la
          correction des défauts supporté par EduTime du fait que le Client n'a pas rempli
          correctement ses obligations de coopération, a utilisé de manière inadéquate le service
          SaaS ou le logiciel SaaS ou n'a pas fait appel aux prestations recommandées par EduTime.
        </p>
        <p>
          EduTime garantit en outre que la concession des droits d'utilisation convenus au Client
          n'est pas contrariée par des droits de tiers. Si un tiers fait valoir des prétentions qui
          s'opposent à l'exercice du droit d'utilisation concédé contractuellement, le Client doit
          en informer EduTime sans délai par écrit et de manière complète. Si le Client cesse
          d'utiliser le service SaaS ou le logiciel SaaS pour des raisons de réduction du préjudice
          ou autres raisons importantes, le Client est tenu d'indiquer au tiers que cette cessation
          d'utilisation ne constitue pas une reconnaissance de la violation de droits de propriété
          alléguée. Le Client autorise par les présentes EduTime à mener seule la discussion avec le
          tiers en justice et à l'amiable. Si EduTime use de cette autorisation, le Client ne peut
          reconnaître les prétentions du tiers sans l'accord d'EduTime et EduTime est tenue de
          repousser les prétentions à ses propres frais. EduTime dégage le Client des frais
          définitivement mis à sa charge et des prétentions à réparation. Les dispositions du
          présent paragraphe s'appliquent indépendamment de l'expiration du délai de garantie selon
          le chiffre 12.5.
        </p>
        <p>
          En cas de vices juridiques démontrés, EduTime garantit par l'exécution complémentaire en
          procurant au Client une possibilité d'utilisation juridiquement irréprochable du service
          SaaS livré ou, au choix d'EduTime, du logiciel SaaS échangé ou modifié de valeur
          équivalente, ou, si ce qui précède n'est pas dans le cadre des possibilités raisonnables
          d'EduTime, en reprenant le composant concerné du logiciel SaaS et en remboursant au Client
          la rémunération déjà versée après déduction d'une indemnité raisonnable pour l'utilisation
          effectuée. Le Client doit accepter une nouvelle version du programme, sauf si cela devait
          entraîner pour lui des problèmes d'adaptation et de conversion déraisonnables.
        </p>
        <p>
          Les droits de garantie du présent chiffre 12 ne s'appliquent pas au logiciel SaaS avec
          étendue gratuite des prestations (cf. chiffre 3 ci-dessus).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='haftung' title='13. Responsabilité' order={2}>
        <p>
          Chaque partie contractante est responsable envers l'autre partie contractante pour les
          dommages résultant d'un contrat entre elles en cas de négligence grave et de dol ainsi
          qu'en cas de décès et de lésions corporelles, sans limitation.
        </p>
        <p>
          Sauf disposition contraire au chiffre 13.1 ci-dessus, la responsabilité globale des
          parties contractantes pour les dommages directs résultant d'une négligence légère dans le
          cadre d'un contrat entre les parties contractantes est limitée par contrat et par an à 50
          % au maximum de la rémunération du contrat concerné, sans toutefois dépasser CHF
          10'000.00.
        </p>
        <p>
          Toute responsabilité d'EduTime ou de ses auxiliaires pour d'autres prétentions et dommages
          ou des prétentions et dommages plus étendus, en particulier les prétentions à réparation
          de dommages indirects ou consécutifs, de dommages consécutifs au vice ou de prétentions de
          tiers, de gain manqué, d'économies non réalisées ou de perte de revenus ainsi que de perte
          de données – quel qu'en soit le fondement juridique – est expressément exclue. EduTime
          n'est pas non plus responsable des dommages causés par des interventions non autorisées de
          tiers sur l'infrastructure serveur et les autres systèmes d'EduTime. Le risque de tels
          dommages incombe au Client seul. Ceci concerne p. ex. les interventions par virus
          informatiques, rançongiciels ou attaques DDoS. L'exclusion de responsabilité comprend
          également les dommages subis par le Client du fait de mesures de défense contre de telles
          interventions. Les délais prévus pour une exécution sont prolongés en fonction de la durée
          de l'effet des circonstances non imputables à EduTime.
        </p>
        <p>Une responsabilité légale impérative plus étendue reste réservée.</p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='vertragsschluss-dauer-beendigung'
        title='14. Conclusion, durée et résiliation du contrat'
        order={2}
      >
        <p>
          Le contrat entre en vigueur à la confirmation de commande par EduTime (contrat SaaS
          individuel) et est conclu pour une durée contractuelle initiale d'un an, sauf convention
          contraire dans le contrat SaaS individuel. Le contrat entre toutefois en vigueur au plus
          tard à la fourniture de la prestation par EduTime au Client. Le contrat se renouvelle
          ensuite automatiquement d'une année supplémentaire à chaque fois, sauf résiliation par
          l'une des parties contractantes dans le respect d'un délai de trois (3) mois avant
          l'expiration de la durée du contrat par écrit ou via une fonction électronique
          éventuellement explicitement mise à disposition du Client par EduTime.
        </p>
        <p>
          Les prestations étendues de support, maintenance et entretien du service SaaS commencent à
          la confirmation de commande par EduTime (contrat individuel), la durée du contrat étant
          alignée sur celle du service SaaS. Pour le renouvellement automatique et la résiliation,
          il est fait application de ce qui est prévu au chiffre 14.1.
        </p>
        <p>
          Les déclarations d'acceptation du Client qui contiennent des extensions, restrictions ou
          autres modifications par rapport à l'offre contractuelle respective d'EduTime valent rejet
          de l'offre contractuelle initiale d'EduTime et ne conduisent à la conclusion d'un contrat
          que si elles sont expressément confirmées par écrit par EduTime. Les déclarations
          d'acceptation du Client intervenant après l'expiration d'un délai d'acceptation ou
          d'engagement défini dans l'offre contractuelle valent nouvelle offre contractuelle du
          Client, qui ne devient effective que si EduTime en confirme expressément l'acceptation par
          écrit.
        </p>
        <p>
          Lorsque le Client viole à plusieurs reprises ou de manière grave une disposition
          contractuelle essentielle, en particulier lorsqu'il abuse du service SaaS ou d'un logiciel
          SaaS à des fins illicites ou lorsqu'une atteinte à la réputation menace EduTime, EduTime
          est en droit de résilier le contrat sans préavis. Le Client doit à EduTime la rémunération
          due jusqu'à la fin normale du contrat ainsi que le remboursement de tous les frais
          supplémentaires supportés par EduTime en lien avec la résiliation sans préavis. EduTime
          peut en outre résilier le contrat avec le Client sans préavis si une procédure de faillite
          ou d'insolvabilité a été ouverte à l'encontre du Client ou s'il apparaît autrement de
          manière évidente que le Client ne peut plus s'acquitter de ses obligations de paiement, et
          si le Client ne paie pas à l'avance les frais pour la prochaine période contractuelle
          avant l'expiration de la durée du contrat ou ne fournit pas de garantie correspondante.
        </p>
        <p>
          Après la fin du contrat concerné, le Client ne peut plus utiliser le service SaaS
          d'EduTime.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='geheimhaltung-und-datenschutz'
        title='15. Confidentialité et protection des données'
        order={2}
      >
        <p>
          Les parties contractantes s'engagent à traiter confidentiellement toutes les informations
          confidentielles et les secrets d'affaires de l'autre partie contractante dont elles ont
          pris connaissance. Tant qu'un intérêt à la confidentialité existe, l'obligation de
          confidentialité s'applique sans limitation dans le temps.
        </p>
        <p>
          Le Client ne peut donner accès au service SaaS aux collaborateurs et autres tiers que dans
          la mesure où cela est nécessaire pour l'exercice du droit d'utilisation concédé par le
          contrat correspondant et les présentes CG. Pour le reste, le Client garde confidentiels
          l'accès et les contenus du service SaaS et informera toutes les personnes auxquelles
          l'accès au service SaaS est accordé des droits d'EduTime sur le service SaaS et de
          l'obligation de les garder confidentiels, et engagera ces personnes à respecter
          l'obligation de confidentialité. L'obligation de confidentialité ne s'applique pas aux
          informations qui sont généralement accessibles, qui sont démontrablement déjà connues des
          parties contractantes, qui ont été développées par elles de manière indépendante ou
          acquises auprès de tiers autorisés.
        </p>
        <p>
          Le Client prend acte que l'exécution du contrat peut impliquer une collecte et un
          traitement de données personnelles au sens de la loi suisse applicable sur la protection
          des données, et qu'EduTime peut effectuer dans le cadre de l'exécution du contrat un
          transfert de données à l'étranger. EduTime collecte et traite les données personnelles du
          Client exclusivement comme décrit dans la déclaration de protection des données d'EduTime.
          La version actuelle de la déclaration de protection des données est publiée sur le site
          web d'EduTime.
        </p>
        <p>
          EduTime et le Client assurent la protection et la sécurité des données dans leur sphère
          d'influence respective. Dans la mesure où EduTime agit en qualité de sous-traitant au sens
          du droit applicable sur la protection des données pour le traitement de données
          personnelles pour le Client, EduTime le fait exclusivement de la manière fixée dans
          l'accord de traitement des données (« ATD ») et exclusivement aux fins du Client et pour
          l'exécution du contrat. Dans ce cas, le Client est seul responsable de la détermination du
          but et des moyens du traitement ou de l'utilisation des données personnelles par EduTime
          dans le cadre du contrat, en particulier du fait qu'un tel traitement ne viole pas les
          lois sur la protection des données en vigueur.
        </p>
        <p>
          Dans la mesure où EduTime traite en qualité de sous-traitant les données personnelles du
          Client, la version actuelle de l'ATD, remise à la conclusion du contrat, fait partie
          intégrante des présentes CG.
        </p>
        <p>
          EduTime est en droit d'inscrire le Client sur sa liste officielle de clients et de faire
          ainsi notamment de la publicité sur le site web d'EduTime. Toute autre référence nécessite
          l'accord préalable du Client.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='verletzung-geheimhaltung'
        title="16. Violation de la confidentialité et de la concession d'utilisation"
        order={2}
      >
        <p>
          Si le Client, ses collaborateurs, auxiliaires ou utilisateurs désignés par lui violent
          intentionnellement ou par négligence grave les dispositions relatives à l'usage et à la
          protection du service SaaS ou du logiciel SaaS, le Client doit à EduTime pour chaque cas
          de violation une pénalité conventionnelle égale au triple de la redevance de licence brute
          due pour l'usage conforme du service SaaS, sans toutefois être inférieure à CHF 10'000.00.
          La revendication de dommages supplémentaires reste réservée.
        </p>
        <p>
          Le paiement de cette pénalité conventionnelle ne libère pas le Client de ses obligations
          contractuelles. EduTime est en particulier en droit d'exiger à tout moment la suppression
          de la situation illicite ou de la violation du contrat ou, en cas de violation répétée des
          conditions d'utilisation, de retirer au Client les droits d'utilisation concédés sans
          remboursement des redevances de licence payées par notification écrite. En cas de retrait
          des droits d'utilisation, le Client s'engage à renoncer sans délai à l'utilisation du
          service SaaS.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='hoehere-gewalt' title='17. Force majeure' order={2}>
        <p>
          Les parties contractantes sont libérées de l'obligation d'exécuter le présent contrat dans
          la mesure et aussi longtemps que la non-exécution des prestations est due à la survenance
          de circonstances de force majeure. Sont considérés comme circonstances de force majeure
          notamment la guerre, les grèves, les troubles, les expropriations, les pandémies et
          épidémies, les tempêtes, les inondations et autres catastrophes naturelles ainsi que
          d'autres circonstances non imputables aux parties contractantes (p. ex. pénurie ou
          contingentement d'électricité). Chaque partie contractante doit informer l'autre partie
          contractante sans délai et par écrit de la survenance d'un cas de force majeure.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='schlussbestimmungen' title='18. Dispositions finales' order={2}>
        <p>
          EduTime se réserve le droit d'apporter des modifications ou compléments ultérieurs aux CG.
          En cas de modifications et compléments pouvant être défavorables au Client, EduTime en
          informera le Client par écrit, par e-mail ou sur un portail de maintenance approprié. Les
          nouvelles CG deviennent partie du contrat si le Client ne s'y oppose pas dans les 14 jours
          suivant leur prise de connaissance. La version actuelle est publiée sur le site web
          d'EduTime https://edutime.ch/docs/agb.
        </p>
        <p>
          En cas de divergence ou de contradiction, les dispositions d'éventuels contrats
          individuels priment sur les présentes CG. La version actuelle de l'accord de traitement
          des données prime également sur les présentes CG lorsqu'il s'agit d'une disposition
          divergente ou contradictoire concernant le traitement des données personnelles.
        </p>
        <p>
          Toutes les communications doivent, sauf si le présent contrat ou la loi n'impose pas une
          forme plus stricte, être adressées par écrit, par voie électronique ou par e-mail aux
          adresses (e-mail) indiquées par le Client dans le contrat SaaS individuel ou sur le site
          web d'EduTime. Le Client est tenu d'informer EduTime sans délai de tout changement
          d'adresse (y compris e-mail), respectivement d'adapter le profil client dans le service
          SaaS, faute de quoi les communications envoyées à la dernière adresse communiquée sont
          réputées avoir été valablement reçues.
        </p>
        <p>
          La forme écrite est respectée (à l'exception des résiliations) également par des
          signatures transmises par voie électronique, par courrier, messagerie ou e-mail (p. ex.
          Skribble, DocuSign, AdobeSign ou par un scan électronique de la signature).
        </p>
        <p>
          Les droits découlant du contrat ou des présentes CG ne peuvent être cédés par le Client
          qu'avec l'accord préalable par écrit d'EduTime. EduTime est libre de transférer le contrat
          en tout ou en partie à des tiers.
        </p>
        <p>
          Si une disposition du contrat ou des présentes CG est nulle ou devient sans effet, les
          autres dispositions restent en vigueur. La disposition nulle ou sans effet doit dans ce
          cas être remplacée par une disposition effective qui se rapproche autant que juridiquement
          possible dans ses effets économiques de celle de la disposition ineffective.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='rechtswahl-und-gerichtsstand'
        title='19. Droit applicable et for juridique'
        order={2}
      >
        <p>
          Aux présentes CG et aux contrats entre le Client et EduTime s'applique exclusivement le
          droit suisse, à l'exclusion de la Convention des Nations Unies du 11 avril 1980 sur les
          contrats de vente internationale de marchandises et du droit international privé.
        </p>
        <p>
          Le for exclusif est celui des tribunaux ordinaires au siège d'EduTime en Suisse. EduTime
          peut également poursuivre le Client à son siège.
        </p>
      </LegalDocumentSection>
    </>
  )
}
