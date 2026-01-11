
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      common: {
        save: "Enregistrer",
        cancel: "Annuler",
        delete: "Supprimer",
        rename: "Renommer",
        edit: "Modifier",
        refresh: "Rafraîchir",
        loading: "Chargement...",
        confirm: "Confirmer",
        autoSave: "Sauvegarde auto",
        locked: "Verrouiller",
        unlock: "Déverrouiller",
        allTime: "Toutes les périodes",
        infinitePeriod: "Période infinie",
        days: "{{count}}j",
        ok: "OK",
        appName: "DataViz",
        reorder: "Réordonner",
        logout: "Déconnexion",
        logoutConfirmTitle: "Déconnexion",
        logoutConfirmDesc: "Voulez-vous vraiment vous déconnecter ?",
        logoutConfirmBtn: "Déconnexion"
      },
      sidebar: {
        dashboards: "Tableaux de bord",
        connections: "Connexions",
        settings: "Paramètres",
        myViews: "Mes vues",
        newDashboard: "Nouveau tableau de bord"
      },
      header: {
        newchart: "Nouveau graphique",
        backup: "Sauvegarde rapide",
        period: "Période",
        from: "Du",
        to: "Au",
        refreshTip: "Rafraîchir les données",
      },
      dashboard: {
        noCharts: "Ajouter mon premier graphique",
        noChartsDesc: "Commencez à visualiser vos données SQL en ajoutant votre premier graphique.",
        addchart: "Ajouter un graphique",
        deleteConfirmTitle: "Supprimer le tableau de bord",
        deleteConfirmDesc: "Supprimer définitivement \"{{name}}\"\u00A0?",
        cannotDeleteLast: "Conservez au moins un tableau de bord.",
        loading: "Chargement du dashboard...",
        title: "Dashboard",
        actionImpossible: "Action impossible",
        newChart: "Nouveau graphique"
      },
      chart: {
        noData: "Aucune donnée",
        badChartType: "Type de graphique invalide",
        deleteTitle: "Supprimer le graphique",
        deleteDesc: "Voulez-vous vraiment supprimer le graphique \"{{title}}\"\u00A0?",
        xAxis: "Axe X",
        yAxis: "Axe Y",
        format: "Format",
        expand: "Agrandir",
        filter: "Filtrer...",
        waitingForData: "En attente de données"
      },
      editor: {
        title: "Configuration de l'Analyse",
        subtitle: "Éditeur de graphique",
        general: "Général",
        chartTitle: "Titre du chart",
        dataSource: "Source de données",
        chartType: "Type d'affichage",
        mapping: "Mapping",
        xAxisLabel: "Axe X (Colonne)",
        xAxisTitle: "Titre Axe X",
        yAxisTitle: "Titre Axe Y",
        xAxisFormat: "Format Axe X",
        rotateX: "Rotation 45° X Labels",
        series: "Séries de données (Y)",
        columns: "Colonnes à afficher",
        testTip: "Exécutez pour mapper les colonnes",
        queryTab: "Requête SQL",
        previewTab: "Aperçu Direct",
        configTab: "Paramétrage",
        formatSql: "Embellir le code",
        variables: "Variables",
        execute: "Exécuter",
        newAnalysis: "Nouvelle Analyse",
        formatLabel: "Format:",
        pieLabels: "Libellés",
        pieValue: "Valeur de série",
        copyVariable: "Cliquer pour copier {{{{name}}}}",
        types: {
          line: "Ligne",
          bar: "Barres",
          pie: "Camembert",
          table: "Tableau",
          stat: "Statistique",
          area: "Zone",
          radial: "Radial",
          scatter: "Nuage de points"
        },
        formats: {
          string: "Texte",
          date: "Date",
          datetime: "Date & Heure",
          time: "Heure",
          int: "Nombre"
        }
      },
      connections: {
        title: "Connexions Base de données",
        new: "Nouvelle connexion",
        none: "Aucune connexion configurée.",
        addTitle: "Ajouter une connexion",
        friendlyName: "Nom usuel",
        host: "Hôte",
        port: "Port",
        databaseName: "Nom de la base",
        user: "Utilisateur",
        password: "Mot de passe",
        requireSsl: "SSL Requis",
        saveConn: "Enregistrer la connexion",
        pageTitle: "Connections",
        manageDataSources: "Gérez vos sources de données SQL et API",
        configureParams: "Configurez les paramètres de connexion",
        sourceType: "Type de source",
        postgresql: "PostgreSQL",
        directDatabase: "Base de données directe",
        apiJson: "API JSON",
        remoteEndpoint: "Endpoint distant",
        securityNote: "Toutes vos informations de connexion sont stockées localement sur votre navigateur de manière sécurisée.",
        generalConfig: "Configuration générale",
        connectionNamePlaceholder: "NOM DE LA CONNEXION (EX: PROD DATA)",
        apiUrlLabel: "URL de l'Endpoint API",
        apiUrlPlaceholder: "https://api.monservice.com/query",
        apiTokenLabel: "Token d'accès (Bearer)",
        apiTokenPlaceholder: "VOTRE_TOKEN_SECRET",
        apiNote: "Note: La requête sera envoyée via POST avec un corps JSON contenant { \"query\": \"...\" }."
      },
      settings: {
        title: "Paramètres & Import/Export",
        desc: "Gérez la persistance de vos données.",
        export: "Exporter",
        exportDesc: "Générer un fichier JSON de sauvegarde.",
        downloadJson: "Télécharger .JSON",
        import: "Importer",
        importDesc: "Restaurer via un fichier ou texte.",
        fileJson: "Fichier .JSON",
        pasteJson: "Coller du JSON",
        closeEditor: "Fermer l'éditeur",
        jsonLabel: "Coller le contenu JSON ici",
        applyImport: "Appliquer l'importation texte",
        resetTitle: "Remise à zéro",
        resetDesc: "Supprimer toutes les données locales.",
        resetBtn: "Reset complet",
        resetConfirmTitle: "Tout supprimer ?",
        resetConfirmDesc: "Cette action effacera définitivement tous vos tableaux de bord, configurations de graphiques et connexions de base de données. Vous repartirez de zéro.",
        importSuccess: "Importation réussie.",
        importError: "Échec de l'importation : {{error}}",
        exportSuccess: "Exportation terminée.",
        pageTitle: "Settings",
        exportFailed: "Échec de l'exportation.",
        exportError: "Erreur d'exportation",
        importErrorTitle: "Erreur d'importation",
        resetError: "Erreur de réinitialisation",
        resetErrorTitle: "Erreur de réinitialisation",
        jsonPlaceholder: "{ \"dashboards\": [...], \"charts\": [...], \"connections\": [...] }"
      },
      annotations: {
        title: "Repères",
        addByClicking: "Ajouter un repère en cliquant sur un label de l'axe X ou Y",
        xAxis: "Axe X",
        yAxis: "Axe Y",
        label: "Libellé",
        labelPlaceholder: "Ex: Objectif",
        value: "Valeur :",
        valuePlaceholder: "Ex: Objectif",
        color: "Couleur",
        active: "Repères actifs",
        none: "Aucun repère",
        axisX: "Axe X",
        axisY: "Axe Y"
      },
      datePicker: {
        selectDate: "Sélectionner une date",
        select: "Sélectionner",
        shortcuts: {
          days7: "7 jours",
          days30: "30 jours",
          months3: "3 mois",
          months6: "6 mois",
          year1: "1 an",
          years2: "2 ans",
          years5: "5 ans"
        },
        smallShortcuts: {
          day1: "1j",
          days7: "7j",
          days30: "30j",
          months3: "3m"
        }
      },
      variables: {
        none: "Aucune variable définie",
        add: "Ajouter une variable",
        configTitle: "Config Variable",
        configDesc: "Personnalisez votre filtre global",
        labelUI: "Label UI",
        labelPlaceholder: "Ex: Client",
        sqlName: "Nom SQL",
        sqlNamePlaceholder: "Ex: id_client",
        dataType: "Type de donnée",
        defaultValue: "Valeur par défaut",
        temporalDynamics: "Dynamisme temporel",
        temporalNote: "Tapez today ou today-30 pour un calcul automatique.",
        listOptions: "Options de la liste",
        optionLabel: "Label",
        optionValue: "Valeur",
        addOption: "+ Ajouter une option",
        defaultVariable: "Ma Variable",
        types: {
          text: "Texte libre",
          number: "Nombre",
          date: "Date picker",
          select: "Liste déroulante",
          boolean: "Switch Oui/Non"
        },
        booleanValues: {
          enabled: "Activé (TRUE)",
          disabled: "Désactivé (FALSE)"
        }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
