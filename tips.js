/* Sélection éditoriale : conseils actionnables, sourcés et utiles pendant la première run.
   Les observations de bêta sont signalées et à revérifier après le lancement. */
window.TIPS = [
  {
    "id": "ruleset-friends",
    "cat": "before",
    "title": "Choisis le même ruleset et la même faction que tes amis",
    "summary": "Même ruleset et même faction que ton groupe avant de créer ton personnage",
    "text": "Mets-toi d’accord avec tes amis sur le ruleset et la faction avant de créer ton personnage. Les transferts depuis un royaume PvP vers Normal ou RP ne sont pas prévus. Le mode Hardcore arrivera plus tard.",
    "source": {
      "url": "https://news.blizzard.com/en-us/article/24302070/choose-your-ruleset-in-world-of-warcraft-forever",
      "type": "Blizzard",
      "name": "Blizzard – Choose your ruleset"
    },
    "must": true
  },
  {
    "id": "preset",
    "cat": "before",
    "title": "Si tu hésites, choisis le preset Enhanced",
    "summary": "Prends Enhanced si tu hésites : tous ses réglages se changent ensuite",
    "text": "Au premier lancement, le jeu propose les presets Classic et Enhanced. Enhanced apporte les aides visuelles et les commandes modernes ; chaque option peut être modifiée ensuite dans les réglages.",
    "source": {
      "url": "https://news.blizzard.com/en-us/article/24315820/world-of-warcraft-forever-goes-live-globally-november-4",
      "type": "Blizzard",
      "name": "Blizzard – Forever goes live Nov 4"
    }
  },
  {
    "id": "cooking-xp",
    "cat": "leveling",
    "title": "Cuisine un plat pour le bonus d’XP des ennemis",
    "summary": "Un plat cuisiné donne +5 % d’XP sur les ennemis vaincus",
    "text": "Apprends Cuisine tôt et garde un plat cuisiné pour profiter du bonus Bien nourri. Le +5 % concerne l’XP des ennemis tués, pas celle des quêtes.",
    "source": {
      "url": "https://www.warcrafttavern.com/forever/news/cooked-food-provides-an-xp-buff-in-world-of-warcraft-forever/",
      "type": "Guide",
      "name": "Warcraft Tavern – Cooked food XP buff"
    },
    "more": [
      {
        "url": "https://www.youtube.com/watch?v=TmxLWnqOkns&t=26s",
        "type": "YouTube",
        "name": "Fairbanks – 6 Launch Day Tips"
      }
    ],
    "badge": "beta",
    "must": true
  },
  {
    "id": "sleeping-bag",
    "cat": "leveling",
    "title": "Récupère le Cozy Sleeping Bag dès le niveau 14",
    "summary": "Au niveau 14, va chercher le Cozy Sleeping Bag pour son bonus d’XP",
    "text": "La suite de quêtes du Cozy Sleeping Bag devient accessible dès le niveau 14. Le sac donne un bonus d’XP reposée utile pendant ta progression ; consulte le guide pour les points de départ Alliance et Horde.",
    "source": {
      "url": "https://www.wowhead.com/forever/guide/cozy-sleeping-bag-locations-rewards",
      "type": "Guide",
      "name": "Wowhead – Cozy Sleeping Bag"
    },
    "must": true
  },
  {
    "id": "camp-strangers",
    "cat": "leveling",
    "title": "Profite des buffs de camp, même chez les autres",
    "summary": "Reste une minute au camp : tu peux récupérer les buffs de ses objets",
    "text": "Assieds-toi ou travaille pendant une minute près d’un feu de camp pour recevoir les effets des objets installés, même si le camp appartient à un autre joueur. Chaque métier peut apporter son objet ; certains effets ne se cumulent pas avec des buffs de classe équivalents. Le Fish Bowl de Pêche donne notamment +8 % aux statistiques.",
    "source": {
      "url": "https://news.blizzard.com/en-us/article/24301516/gather-around-the-campfire-in-world-of-warcraft-forever",
      "type": "Blizzard",
      "name": "Blizzard – Gather Around the Campfire"
    },
    "must": true,
    "image": "assets/camp-buffs.svg",
    "imageMobile": "assets/camp-buffs-mobile.svg",
    "imageAlt": "Schéma : repère un camp, reste une minute près du feu, puis profite des buffs des objets installés. Certains ne se cumulent pas avec les buffs de classe."
  },
  {
    "id": "bag-quests",
    "cat": "leveling",
    "title": "Prends le sac de ta zone de départ",
    "summary": "Cherche la quête de sac dans ta zone de départ avant d’acheter des sacs",
    "text": "Chaque race a une quête de début qui peut donner un sac. Vérifie celle de ta zone avant de dépenser ton premier or dans un sac de marchand ; les récompenses ont changé pendant la bêta.",
    "source": {
      "url": "https://www.method.gg/wow-forever/best-early-bags-in-wow-forever-crafted-bags-quest-bags-vendor-bags-and-more",
      "type": "Guide",
      "name": "Method – Best early bags"
    },
    "more": [
      {
        "url": "https://www.youtube.com/watch?v=TmxLWnqOkns&t=108s",
        "type": "YouTube",
        "name": "Fairbanks – 6 Launch Day Tips"
      }
    ],
    "badge": "beta"
  },
  {
    "id": "library-books",
    "cat": "leveling",
    "title": "Garde les livres trouvés en Azeroth",
    "summary": "Rends 10 livres pour un collier, puis 20 pour un anneau",
    "text": "Les livres de bibliothèque sont dispersés dans le monde et peuvent être collectés par toutes les classes. Rapporte-les à la bibliothèque de ta faction : les premiers paliers donnent un collier puis un anneau.",
    "source": {
      "url": "https://www.wowhead.com/forever/news/everyone-can-collect-books-for-rewards-in-wow-forever-383141",
      "type": "Guide",
      "name": "Wowhead – Collect books for rewards"
    },
    "badge": "beta"
  },
  {
    "id": "secondaries",
    "cat": "professions",
    "title": "Apprends Cuisine, Pêche et Secourisme",
    "summary": "Prends les trois métiers secondaires sur chaque personnage",
    "text": "Cuisine, Pêche et Secourisme ne prennent pas tes emplacements de métiers principaux. Cuisine sert notamment au bonus d’XP des plats, et Secourisme fabrique désormais des potions de soin en plus des bandages.",
    "source": {
      "url": "https://news.blizzard.com/en-us/article/24301516/gather-around-the-campfire-in-world-of-warcraft-forever",
      "type": "Blizzard",
      "name": "Blizzard – Gather Around the Campfire"
    },
    "more": [
      {
        "url": "https://www.wowhead.com/forever/guide/professions/first-aid/overview",
        "type": "Guide",
        "name": "Wowhead – First Aid overview"
      }
    ],
    "must": true
  },
  {
    "id": "waylaid",
    "cat": "professions",
    "title": "Vérifie une caisse Waylaid avant de la jeter",
    "summary": "Une caisse Waylaid peut valoir le coup : regarde son coût et sa récompense",
    "text": "Quand tu trouves une caisse Waylaid, regarde les matériaux demandés et la récompense avant de la vendre ou de l’abandonner. Certaines caisses se remplissent facilement avec des ressources de début de jeu ; d’autres coûtent trop cher pour ton personnage.",
    "source": {
      "url": "https://www.wowhead.com/forever/guide/azeroth-commerce-authority-reputation-professions",
      "type": "Guide",
      "name": "Wowhead – Azeroth Commerce Authority"
    },
    "more": [
      {
        "url": "https://www.youtube.com/watch?v=TmxLWnqOkns&t=193s",
        "type": "YouTube",
        "name": "Fairbanks – 6 Launch Day Tips"
      }
    ],
    "badge": "beta",
    "image": "assets/waylaid-decision.svg",
    "imageMobile": "assets/waylaid-decision-mobile.svg",
    "imageAlt": "Schéma : lis les matériaux d’une caisse Waylaid et compare leur coût à la récompense. Si elle vaut le coup, complète-la et rapporte-la ; sinon, garde-la ou vends-la."
  },
  {
    "id": "gathering-tools",
    "cat": "professions",
    "title": "Achète tes outils de récolte dès que tu apprends le métier",
    "summary": "Minage : pioche. Dépeçage : couteau. Prends l’outil avant de partir",
    "text": "Après avoir appris Minage ou Dépeçage, vérifie que tu as la pioche ou le couteau requis. Sans l’outil, tu risques de passer devant des filons ou des bêtes sans pouvoir les récolter.",
    "source": {
      "url": "https://www.icy-veins.com/wow-forever/professions-overview",
      "type": "Guide",
      "name": "Icy Veins – Professions overview"
    },
    "more": [
      {
        "url": "https://www.wowhead.com/forever/guide/professions/skinning/overview-leveling",
        "type": "Guide",
        "name": "Wowhead – Skinning overview"
      }
    ]
  },
  {
    "id": "dungeon-once",
    "cat": "group",
    "title": "Prends les quêtes avant de partir en donjon",
    "summary": "Rassemble les quêtes du donjon avant ton premier passage",
    "text": "Le premier passage avec ses quêtes peut être intéressant pour progresser. Prépare ces quêtes et un groupe proche de ton niveau ; le farm répété des donjons n’est pas pensé comme la voie la plus rapide pour gagner de l’XP, et l’équilibrage peut encore évoluer.",
    "source": {
      "url": "https://www.pcgamer.com/games/world-of-warcraft/blizzard-refuses-to-let-world-of-warcraft-forevers-dungeons-become-the-fastest-way-to-grind-xp-we-need-to-hold-firm-on-these-balance-adjustments/",
      "type": "Guide",
      "name": "PC Gamer – Dungeon XP balance"
    },
    "must": true
  },
  {
    "id": "no-summon",
    "cat": "group",
    "title": "Prévois le trajet jusqu’au donjon",
    "summary": "Pas d’invocation aux pierres : le groupe doit se rendre à l’entrée",
    "text": "Les pierres de rencontre ne téléportent pas les membres du groupe. Avant de former l’équipe, vérifie où se trouve l’entrée et prévois le temps de trajet de chacun.",
    "source": {
      "url": "https://www.wowhead.com/forever/news/no-summoning-stones-and-mount-cost-changes-kotaku-interview-382944",
      "type": "Guide",
      "name": "Wowhead – No summoning stones"
    },
    "badge": "beta",
    "must": true
  },
  {
    "id": "forever-files",
    "cat": "addons",
    "title": "Installe la version Forever de tes addons",
    "summary": "Télécharge le fichier marqué Forever pour chaque addon",
    "text": "Les fichiers d’addons Classic Era ne sont pas automatiquement compatibles avec le client Forever. Vérifie la version indiquée sur la page de téléchargement et la date de mise à jour avant d’installer un addon.",
    "source": {
      "url": "https://theforeverguides.com/addons/",
      "type": "Guide",
      "name": "The Forever Guides – Addon status"
    }
  }
];

window.CATEGORIES = {
  "before": {
    "label": "Avant le lancement / réglages et UI",
    "short": "Avant le lancement",
    "icon": "⚙️"
  },
  "race": {
    "label": "Choix de race et de classe",
    "short": "Race et classe",
    "icon": "🛡️"
  },
  "leveling": {
    "label": "Route de level et quêtes",
    "short": "Level",
    "icon": "🗺️"
  },
  "professions": {
    "label": "Métiers et or",
    "short": "Or",
    "icon": "⚒️"
  },
  "group": {
    "label": "Groupe et donjons",
    "short": "Groupes",
    "icon": "⚔️"
  },
  "addons": {
    "label": "Addons",
    "short": "Addons",
    "icon": "🧩"
  },
  "mistakes": {
    "label": "Erreurs à éviter",
    "short": "Erreurs",
    "icon": "💀"
  }
};
