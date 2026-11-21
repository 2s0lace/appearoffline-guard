import { CounterPeriod, Language, UnlockCategory } from "../storage";

export interface Translations {
  locale: string
  blockedTitle: string
  breatheLabel: string
  stillWantLabel: string
  pausedHint: string
  enterReasonToggle: string
  reasonPlaceholder: string
  charsMin: (len: number, min: number) => string
  charsOk: (len: number) => string
  codePlaceholder: string
  waitBtn: string
  unlockForBtn: (mins: string) => string
  unlockingBtn: string
  closeTabTooltip: string
  historyTooltip: string
  settingsTooltip: string
  thisWeekPrefix: string
  errWait: (sec: number) => string
  errCategory: string
  errReasonMin: (min: number) => string
  errCodeUsed: string
  errCodeInvalid: string
  errCodeEmpty: string
  categories: Record<UnlockCategory, string>
  categoriesFull: Record<UnlockCategory, string>
  periods: Record<CounterPeriod, string>
  periodsTitle: Record<CounterPeriod, string>
  // Options page
  optionsTitle: string
  lockTitle: string
  lockDesc: string
  unlockedTitle: (min: number) => string
  unlockedDesc: string
  unlockSettingsBtn: string
  relockSettingsBtn: string
  settingsReasonPlaceholder: string
  confirmBtn: string
  enabledLabel: string
  yes: string
  no: string
  unlockModeLabel: string
  modeStandard: string
  modeWithCode: string
  languageLabel: string
  themeLabel: string
  themeLight: string
  themeDark: string
  codesPoolLabel: string
  codesRemaining: (rem: number, total: number) => string
  generateCodesBtn: string
  generatedTitle: string
  generatedDesc: string
  copyCodesBtn: string
  copiedBtn: string
  hideCodesBtn: string
  contextMenuLabel: string
  quickAddPlaceholder: string
  addSiteBtn: string
  blockedSitesHeading: string
  resolutionLabel: string
  resShowPage: string
  resCloseTab: string
  showCounterLabel: string
  counterPeriodLabel: string
  historyHeading: string
  clearHistoryBtn: string
  resetCountersBtn: string
  historyEmpty: string
  settingsChangeBadge: string
  settingsPanelLabel: string
  confirmClearHistory: string
  confirmResetCounters: string
  deleteEntryTooltip: string
}

const pl: Translations = {
  locale: "pl-PL",
  blockedTitle: "Chwila oddechu — Unruminate",
  breatheLabel: "weź spokojny oddech",
  stillWantLabel: "nadal chcesz wejść?",
  pausedHint: "odliczanie zatrzymane — wróć na tę kartę",
  enterReasonToggle: "wpisz powód",
  reasonPlaceholder: "Po co dokładnie tu wchodzisz? (zapisze się w historii)",
  charsMin: (len, min) => `${len} / ${min} znaków`,
  charsOk: (len) => `${len} znaków ✓`,
  codePlaceholder: "Kod AI (XXXX-XXXX)",
  waitBtn: "Odczekaj",
  unlockForBtn: (mins) => `Odblokuj na ${mins} min`,
  unlockingBtn: "Odblokowywanie...",
  closeTabTooltip: "Zamknij kartę",
  historyTooltip: "Historia wejść",
  settingsTooltip: "Ustawienia",
  thisWeekPrefix: "Ten tydzień",
  errWait: (sec) => `Odczekaj jeszcze ${sec} s.`,
  errCategory: "Wybierz kategorię powodu wejścia.",
  errReasonMin: (min) => `Opisz powód wejścia (minimum ${min} znaków).`,
  errCodeUsed: "Ten kod został już wykorzystany.",
  errCodeInvalid: "Nieprawidłowy kod pozwolenia.",
  errCodeEmpty: "Wpisz jednorazowy kod pozwolenia.",
  categories: {
    NEED: "Potrzeba",
    BOREDOM: "Nuda",
    RUMINATION: "Ruminacja",
    OTHER: "Inne",
  },
  categoriesFull: {
    NEED: "Potrzeba / Cel",
    BOREDOM: "Nuda / Prokrastynacja",
    RUMINATION: "Ruminacja / Impuls",
    OTHER: "Inne",
  },
  periods: {
    ALL_TIME: "łącznie",
    THIS_MONTH: "w tym miesiącu",
    THIS_WEEK: "w tym tygodniu",
    TODAY: "dzisiaj",
  },
  periodsTitle: {
    ALL_TIME: "Cały czas",
    THIS_MONTH: "Ten miesiąc",
    THIS_WEEK: "Ten tydzień",
    TODAY: "Dzisiaj",
  },
  optionsTitle: "Unruminate — Opcje i historia",
  lockTitle: "Ustawienia są chronione kodem",
  lockDesc: "Możesz swobodnie dodawać nowe strony poniżej. Aby wyłączyć blokadę, zmienić tryb lub usunąć strony/historię, odblokuj ustawienia kodem.",
  unlockedTitle: (min) => `Ustawienia tymczasowo odblokowane (~${min} min)`,
  unlockedDesc: "Możesz teraz edytować listę stron, zmienić tryb, wyłączyć blokadę lub wyczyścić historię.",
  unlockSettingsBtn: "Odblokuj ustawienia (5 min)",
  relockSettingsBtn: "Zablokuj teraz",
  settingsReasonPlaceholder: "Powód zmiany ustawień (min. 10 znaków)...",
  confirmBtn: "Potwierdź",
  enabledLabel: "Blokowanie aktywne?",
  yes: "Tak",
  no: "Nie",
  unlockModeLabel: "Tryb odblokowania:",
  modeStandard: "Standardowy (30s pauzy + zapis powodu)",
  modeWithCode: "Z kodem (30s pauzy + powód + jednorazowy kod AI / partnera)",
  languageLabel: "Język:",
  themeLabel: "Motyw:",
  themeLight: "Jasny (biały)",
  themeDark: "Ciemny",
  codesPoolLabel: "Pula kodów:",
  codesRemaining: (rem, total) => `${rem} / ${total} pozostało`,
  generateCodesBtn: "Wygeneruj nową paczkę 50 kodów",
  generatedTitle: "Wygenerowano zaszyfrowaną paczkę 50 kodów (RSA-OAEP + AES-256)",
  generatedDesc: "Kody są zaszyfrowane — nie zobaczysz ich tutaj. Skopiuj poniższy blok i wyślij go swojemu AI do odszyfrowania. Wtyczka zapisała wyłącznie ich solone hashe PBKDF2.",
  copyCodesBtn: "Kopiuj zaszyfrowaną paczkę",
  copiedBtn: "Skopiowano ✓",
  hideCodesBtn: "Przekazałem kody — ukryj",
  contextMenuLabel: "Menu kontekstowe?",
  quickAddPlaceholder: "Szybkie dodanie strony do blokowania (np. reddit.com, youtube.com)...",
  addSiteBtn: "Dodaj stronę",
  blockedSitesHeading: "Zablokowane strony",
  resolutionLabel: "Reakcja na blokadę:",
  resShowPage: "Ekran świadomego odblokowania (30s)",
  resCloseTab: "Zamknij kartę od razu",
  showCounterLabel: "Pokazywać licznik blokad?",
  counterPeriodLabel: "Okres licznika blokad:",
  historyHeading: "Historia i statystyki wejść",
  clearHistoryBtn: "Wyczyść historię",
  resetCountersBtn: "Resetuj liczniki",
  historyEmpty: "Brak zapisanych odblokowań w wybranym okresie.",
  settingsChangeBadge: "Zmiana ustawień",
  settingsPanelLabel: "Panel opcji",
  confirmClearHistory: "Na pewno wyczyścić całą historię odblokowań?",
  confirmResetCounters: "Na pewno zresetować liczniki zablokowanych wejść?",
  deleteEntryTooltip: "Usuń wpis",
};

const en: Translations = {
  locale: "en-US",
  blockedTitle: "Take a breath — Unruminate",
  breatheLabel: "take a calm breath",
  stillWantLabel: "still want to visit?",
  pausedHint: "countdown paused — stay on this tab",
  enterReasonToggle: "enter reason",
  reasonPlaceholder: "Why are you visiting right now? (saved to history)",
  charsMin: (len, min) => `${len} / ${min} chars`,
  charsOk: (len) => `${len} chars ✓`,
  codePlaceholder: "AI Code (XXXX-XXXX)",
  waitBtn: "Wait",
  unlockForBtn: (mins) => `Unlock for ${mins} min`,
  unlockingBtn: "Unlocking...",
  closeTabTooltip: "Close tab",
  historyTooltip: "Visit history",
  settingsTooltip: "Settings",
  thisWeekPrefix: "This week",
  errWait: (sec) => `Please wait ${sec}s more.`,
  errCategory: "Choose a category for this visit.",
  errReasonMin: (min) => `Write a reason (at least ${min} characters).`,
  errCodeUsed: "This code has already been used.",
  errCodeInvalid: "Invalid permission code.",
  errCodeEmpty: "Enter a one-time permission code.",
  categories: {
    NEED: "Need",
    BOREDOM: "Boredom",
    RUMINATION: "Rumination",
    OTHER: "Other",
  },
  categoriesFull: {
    NEED: "Need / Purpose",
    BOREDOM: "Boredom / Procrastination",
    RUMINATION: "Rumination / Impulse",
    OTHER: "Other",
  },
  periods: {
    ALL_TIME: "overall",
    THIS_MONTH: "this month",
    THIS_WEEK: "this week",
    TODAY: "today",
  },
  periodsTitle: {
    ALL_TIME: "All Time",
    THIS_MONTH: "This Month",
    THIS_WEEK: "This Week",
    TODAY: "Today",
  },
  optionsTitle: "Unruminate — Options & History",
  lockTitle: "Settings are protected by a code",
  lockDesc: "You can freely add new sites below. To disable blocking, change mode, or remove sites/history, unlock settings with a code.",
  unlockedTitle: (min) => `Settings temporarily unlocked (~${min} min)`,
  unlockedDesc: "You can now edit the blocklist, change mode, disable blocking, or clear history.",
  unlockSettingsBtn: "Unlock settings (5 min)",
  relockSettingsBtn: "Lock now",
  settingsReasonPlaceholder: "Reason for changing settings (min. 10 chars)...",
  confirmBtn: "Confirm",
  enabledLabel: "Blocking enabled?",
  yes: "Yes",
  no: "No",
  unlockModeLabel: "Unlock mode:",
  modeStandard: "Standard (30s pause + logged reason)",
  modeWithCode: "With code (30s pause + reason + one-time AI / partner code)",
  languageLabel: "Language:",
  themeLabel: "Theme:",
  themeLight: "Light (white)",
  themeDark: "Dark",
  codesPoolLabel: "Code pool:",
  codesRemaining: (rem, total) => `${rem} / ${total} remaining`,
  generateCodesBtn: "Generate new batch of 50 codes",
  generatedTitle: "Generated encrypted batch of 50 codes (RSA-OAEP + AES-256)",
  generatedDesc: "Codes are sealed — you cannot read them here. Copy the encrypted block below and send it to your AI to decrypt. The extension only stores salted PBKDF2 hashes.",
  copyCodesBtn: "Copy encrypted batch",
  copiedBtn: "Copied ✓",
  hideCodesBtn: "I saved them — hide",
  contextMenuLabel: "Context menu?",
  quickAddPlaceholder: "Quick add site to block (e.g. reddit.com, youtube.com)...",
  addSiteBtn: "Add site",
  blockedSitesHeading: "Blocked sites",
  resolutionLabel: "When blocked:",
  resShowPage: "Conscious unlock screen (30s)",
  resCloseTab: "Close tab immediately",
  showCounterLabel: "Show block count?",
  counterPeriodLabel: "Block count period:",
  historyHeading: "Visit history & stats",
  clearHistoryBtn: "Clear history",
  resetCountersBtn: "Reset counters",
  historyEmpty: "No unlocked visits recorded in this period.",
  settingsChangeBadge: "Settings change",
  settingsPanelLabel: "Options panel",
  confirmClearHistory: "Are you sure you want to clear all unlock history?",
  confirmResetCounters: "Are you sure you want to reset block counters?",
  deleteEntryTooltip: "Delete entry",
};

const es: Translations = {
  locale: "es-ES",
  blockedTitle: "Toma un respiro — Unruminate",
  breatheLabel: "respira con calma",
  stillWantLabel: "¿aún quieres entrar?",
  pausedHint: "cuenta pausada — vuelve a esta pestaña",
  enterReasonToggle: "escribir motivo",
  reasonPlaceholder: "¿Por qué entras ahora mismo? (se guardará en el historial)",
  charsMin: (len, min) => `${len} / ${min} caracteres`,
  charsOk: (len) => `${len} caracteres ✓`,
  codePlaceholder: "Código IA (XXXX-XXXX)",
  waitBtn: "Espera",
  unlockForBtn: (mins) => `Desbloquear ${mins} min`,
  unlockingBtn: "Desbloqueando...",
  closeTabTooltip: "Cerrar pestaña",
  historyTooltip: "Historial",
  settingsTooltip: "Ajustes",
  thisWeekPrefix: "Esta semana",
  errWait: (sec) => `Espera ${sec} s más.`,
  errCategory: "Elige una categoría para esta visita.",
  errReasonMin: (min) => `Escribe un motivo (mínimo ${min} caracteres).`,
  errCodeUsed: "Este código ya fue utilizado.",
  errCodeInvalid: "Código de permiso inválido.",
  errCodeEmpty: "Introduce un código de un solo uso.",
  categories: {
    NEED: "Necesidad",
    BOREDOM: "Aburrimiento",
    RUMINATION: "Rumiación",
    OTHER: "Otro",
  },
  categoriesFull: {
    NEED: "Necesidad / Objetivo",
    BOREDOM: "Aburrimiento / Procrastinación",
    RUMINATION: "Rumiación / Impulso",
    OTHER: "Otro",
  },
  periods: {
    ALL_TIME: "en total",
    THIS_MONTH: "este mes",
    THIS_WEEK: "esta semana",
    TODAY: "hoy",
  },
  periodsTitle: {
    ALL_TIME: "Todo el tiempo",
    THIS_MONTH: "Este mes",
    THIS_WEEK: "Esta semana",
    TODAY: "Hoy",
  },
  optionsTitle: "Unruminate — Ajustes e historial",
  lockTitle: "Los ajustes están protegidos con código",
  lockDesc: "Puedes añadir nuevos sitios abajo libremente. Para desactivar el bloqueo, cambiar el modo o borrar sitios/historial, desbloquea con un código.",
  unlockedTitle: (min) => `Ajustes desbloqueados temporalmente (~${min} min)`,
  unlockedDesc: "Ahora puedes editar la lista, cambiar el modo, desactivar el bloqueo o borrar el historial.",
  unlockSettingsBtn: "Desbloquear ajustes (5 min)",
  relockSettingsBtn: "Bloquear ahora",
  settingsReasonPlaceholder: "Motivo del cambio (mín. 10 caracteres)...",
  confirmBtn: "Confirmar",
  enabledLabel: "¿Bloqueo activo?",
  yes: "Sí",
  no: "No",
  unlockModeLabel: "Modo de desbloqueo:",
  modeStandard: "Estándar (pausa de 30s + motivo guardado)",
  modeWithCode: "Con código (pausa 30s + motivo + código único de IA / pareja)",
  languageLabel: "Idioma:",
  themeLabel: "Tema:",
  themeLight: "Claro (blanco)",
  themeDark: "Oscuro",
  codesPoolLabel: "Códigos:",
  codesRemaining: (rem, total) => `${rem} / ${total} restantes`,
  generateCodesBtn: "Generar nuevo lote de 50 códigos",
  generatedTitle: "50 nuevos códigos de un solo uso generados",
  generatedDesc: "Cópialos y pásalos a tu IA o compañero. La extensión solo guarda sus hashes SHA-256 — al cerrarlos no volverás a verlos.",
  copyCodesBtn: "Copiar todos los códigos",
  copiedBtn: "Copiado ✓",
  hideCodesBtn: "Ya los guardé — ocultar",
  contextMenuLabel: "¿Menú contextual?",
  quickAddPlaceholder: "Añadir sitio rápido (ej. reddit.com, youtube.com)...",
  addSiteBtn: "Añadir sitio",
  blockedSitesHeading: "Sitios bloqueados",
  resolutionLabel: "Al bloquear:",
  resShowPage: "Pantalla de desbloqueo consciente (30s)",
  resCloseTab: "Cerrar pestaña inmediatamente",
  showCounterLabel: "¿Mostrar contador?",
  counterPeriodLabel: "Período del contador:",
  historyHeading: "Historial y estadísticas",
  clearHistoryBtn: "Borrar historial",
  resetCountersBtn: "Reiniciar contadores",
  historyEmpty: "No hay visitas desbloqueadas en este período.",
  settingsChangeBadge: "Cambio de ajustes",
  settingsPanelLabel: "Panel de opciones",
  confirmClearHistory: "¿Seguro que quieres borrar todo el historial?",
  confirmResetCounters: "¿Seguro que quieres reiniciar los contadores?",
  deleteEntryTooltip: "Eliminar entrada",
};

const fr: Translations = {
  locale: "fr-FR",
  blockedTitle: "Prends une pause — Unruminate",
  breatheLabel: "respire calmement",
  stillWantLabel: "toujours envie d'y aller ?",
  pausedHint: "décompte en pause — reste sur cet onglet",
  enterReasonToggle: "indiquer la raison",
  reasonPlaceholder: "Pourquoi visites-tu ce site maintenant ? (enregistré)",
  charsMin: (len, min) => `${len} / ${min} caractères`,
  charsOk: (len) => `${len} caractères ✓`,
  codePlaceholder: "Code IA (XXXX-XXXX)",
  waitBtn: "Patiente",
  unlockForBtn: (mins) => `Débloquer ${mins} min`,
  unlockingBtn: "Déblocage...",
  closeTabTooltip: "Fermer l'onglet",
  historyTooltip: "Historique",
  settingsTooltip: "Paramètres",
  thisWeekPrefix: "Cette semaine",
  errWait: (sec) => `Patiente encore ${sec} s.`,
  errCategory: "Choisis une catégorie pour cette visite.",
  errReasonMin: (min) => `Décris la raison (minimum ${min} caractères).`,
  errCodeUsed: "Ce code a déjà été utilisé.",
  errCodeInvalid: "Code d'autorisation invalide.",
  errCodeEmpty: "Saisis un code à usage unique.",
  categories: {
    NEED: "Besoin",
    BOREDOM: "Ennui",
    RUMINATION: "Rumination",
    OTHER: "Autre",
  },
  categoriesFull: {
    NEED: "Besoin / Objectif",
    BOREDOM: "Ennui / Procrastination",
    RUMINATION: "Rumination / Impulsion",
    OTHER: "Autre",
  },
  periods: {
    ALL_TIME: "au total",
    THIS_MONTH: "ce mois-ci",
    THIS_WEEK: "cette semaine",
    TODAY: "aujourd'hui",
  },
  periodsTitle: {
    ALL_TIME: "Tout le temps",
    THIS_MONTH: "Ce mois-ci",
    THIS_WEEK: "Cette semaine",
    TODAY: "Aujourd'hui",
  },
  optionsTitle: "Unruminate — Paramètres et historique",
  lockTitle: "Paramètres protégés par code",
  lockDesc: "Tu peux ajouter de nouveaux sites ci-dessous librement. Pour désactiver le blocage, changer de mode ou supprimer des sites/l'historique, déverrouille avec un code.",
  unlockedTitle: (min) => `Paramètres déverrouillés (~${min} min)`,
  unlockedDesc: "Tu peux maintenant modifier la liste, changer de mode, désactiver le blocage ou effacer l'historique.",
  unlockSettingsBtn: "Déverrouiller (5 min)",
  relockSettingsBtn: "Verrouiller",
  settingsReasonPlaceholder: "Raison de la modification (min. 10 caractères)...",
  confirmBtn: "Confirmer",
  enabledLabel: "Blocage actif ?",
  yes: "Oui",
  no: "Non",
  unlockModeLabel: "Mode de déblocage :",
  modeStandard: "Standard (pause 30s + raison enregistrée)",
  modeWithCode: "Avec code (pause 30s + raison + code unique IA / partenaire)",
  languageLabel: "Langue :",
  themeLabel: "Thème :",
  themeLight: "Clair (blanc)",
  themeDark: "Sombre",
  codesPoolLabel: "Réserve de codes :",
  codesRemaining: (rem, total) => `${rem} / ${total} restants`,
  generateCodesBtn: "Générer 50 nouveaux codes",
  generatedTitle: "50 nouveaux codes à usage unique générés",
  generatedDesc: "Copie-les et transmets-les à ton IA ou partenaire. L'extension ne conserve que leurs empreintes SHA-256.",
  copyCodesBtn: "Copier tous les codes",
  copiedBtn: "Copié ✓",
  hideCodesBtn: "C'est transmis — masquer",
  contextMenuLabel: "Menu contextuel ?",
  quickAddPlaceholder: "Ajout rapide d'un site (ex. reddit.com, youtube.com)...",
  addSiteBtn: "Ajouter",
  blockedSitesHeading: "Sites bloqués",
  resolutionLabel: "Lors du blocage :",
  resShowPage: "Écran de déblocage conscient (30s)",
  resCloseTab: "Fermer l'onglet immédiatement",
  showCounterLabel: "Afficher le compteur ?",
  counterPeriodLabel: "Période du compteur :",
  historyHeading: "Historique et statistiques",
  clearHistoryBtn: "Effacer l'historique",
  resetCountersBtn: "Réinitialiser compteurs",
  historyEmpty: "Aucun déblocage enregistré sur cette période.",
  settingsChangeBadge: "Modification",
  settingsPanelLabel: "Paramètres",
  confirmClearHistory: "Voulez-vous vraiment effacer tout l'historique ?",
  confirmResetCounters: "Voulez-vous vraiment réinitialiser les compteurs ?",
  deleteEntryTooltip: "Supprimer l'entrée",
};

const de: Translations = {
  locale: "de-DE",
  blockedTitle: "Kurz durchatmen — Unruminate",
  breatheLabel: "atme ruhig durch",
  stillWantLabel: "möchtest du noch hinein?",
  pausedHint: "Countdown pausiert — bleib auf diesem Tab",
  enterReasonToggle: "Grund eingeben",
  reasonPlaceholder: "Warum öffnest du diese Seite gerade? (wird gespeichert)",
  charsMin: (len, min) => `${len} / ${min} Zeichen`,
  charsOk: (len) => `${len} Zeichen ✓`,
  codePlaceholder: "KI-Code (XXXX-XXXX)",
  waitBtn: "Warte",
  unlockForBtn: (mins) => `Für ${mins} Min. freigeben`,
  unlockingBtn: "Wird freigegeben...",
  closeTabTooltip: "Tab schließen",
  historyTooltip: "Verlauf",
  settingsTooltip: "Einstellungen",
  thisWeekPrefix: "Diese Woche",
  errWait: (sec) => `Bitte warte noch ${sec} s.`,
  errCategory: "Wähle eine Kategorie für diesen Besuch.",
  errReasonMin: (min) => `Nenne einen Grund (mind. ${min} Zeichen).`,
  errCodeUsed: "Dieser Code wurde bereits verwendet.",
  errCodeInvalid: "Ungültiger Freigabecode.",
  errCodeEmpty: "Gib einen Einmalcode ein.",
  categories: {
    NEED: "Bedarf",
    BOREDOM: "Langeweile",
    RUMINATION: "Grübeln",
    OTHER: "Sonstiges",
  },
  categoriesFull: {
    NEED: "Bedarf / Ziel",
    BOREDOM: "Langeweile / Prokrastination",
    RUMINATION: "Grübeln / Impuls",
    OTHER: "Sonstiges",
  },
  periods: {
    ALL_TIME: "gesamt",
    THIS_MONTH: "diesen Monat",
    THIS_WEEK: "diese Woche",
    TODAY: "heute",
  },
  periodsTitle: {
    ALL_TIME: "Gesamt",
    THIS_MONTH: "Dieser Monat",
    THIS_WEEK: "Diese Woche",
    TODAY: "Heute",
  },
  optionsTitle: "Unruminate — Einstellungen & Verlauf",
  lockTitle: "Einstellungen sind mit Code geschützt",
  lockDesc: "Neue Seiten kannst du unten jederzeit hinzufügen. Zum Deaktivieren, Moduswechsel oder Löschen von Seiten/Verlauf bitte mit Code entsperren.",
  unlockedTitle: (min) => `Einstellungen temporär entsperrt (~${min} Min.)`,
  unlockedDesc: "Du kannst jetzt die Liste bearbeiten, den Modus wechseln, die Sperre ausschalten oder den Verlauf löschen.",
  unlockSettingsBtn: "Einstellungen entsperren (5 Min.)",
  relockSettingsBtn: "Jetzt sperren",
  settingsReasonPlaceholder: "Grund für die Änderung (mind. 10 Zeichen)...",
  confirmBtn: "Bestätigen",
  enabledLabel: "Sperre aktiv?",
  yes: "Ja",
  no: "Nein",
  unlockModeLabel: "Entsperrmodus:",
  modeStandard: "Standard (30s Pause + Grund speichern)",
  modeWithCode: "Mit Code (30s Pause + Grund + Einmalcode von KI / Partner)",
  languageLabel: "Sprache:",
  themeLabel: "Design:",
  themeLight: "Hell (Weiß)",
  themeDark: "Dunkel",
  codesPoolLabel: "Code-Vorrat:",
  codesRemaining: (rem, total) => `${rem} / ${total} übrig`,
  generateCodesBtn: "50 neue Codes generieren",
  generatedTitle: "50 neue Einmalcodes generiert",
  generatedDesc: "Kopiere sie und gib sie deiner KI oder einem Partner. Die Erweiterung speichert nur die SHA-256-Hashes.",
  copyCodesBtn: "Alle Codes kopieren",
  copiedBtn: "Kopiert ✓",
  hideCodesBtn: "Weitergegeben — ausblenden",
  contextMenuLabel: "Kontextmenü?",
  quickAddPlaceholder: "Seite schnell sperren (z. B. reddit.com, youtube.com)...",
  addSiteBtn: "Hinzufügen",
  blockedSitesHeading: "Gesperrte Seiten",
  resolutionLabel: "Bei Sperre:",
  resShowPage: "Bewusstes Entsperren (30s)",
  resCloseTab: "Tab sofort schließen",
  showCounterLabel: "Sperrzähler anzeigen?",
  counterPeriodLabel: "Zähler-Zeitraum:",
  historyHeading: "Verlauf & Statistiken",
  clearHistoryBtn: "Verlauf löschen",
  resetCountersBtn: "Zähler zurücksetzen",
  historyEmpty: "Keine entsperrten Besuche in diesem Zeitraum.",
  settingsChangeBadge: "Einstellungsänderung",
  settingsPanelLabel: "Optionen",
  confirmClearHistory: "Möchtest du wirklich den gesamten Verlauf löschen?",
  confirmResetCounters: "Möchtest du wirklich alle Sperrzähler zurücksetzen?",
  deleteEntryTooltip: "Eintrag löschen",
};

const DICTIONARIES: Record<Language, Translations> = {
  pl,
  en,
  es,
  fr,
  de,
};

export const getTranslations = (lang?: Language): Translations =>
  DICTIONARIES[lang || "pl"] || pl;
