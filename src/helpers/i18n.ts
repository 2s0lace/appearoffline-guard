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
  codesPoolDesc: string
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
  showLastBatchBtn: string
  emergencyTitle: string
  emergencyDesc: string
  emergencyRequestBtn: string
  emergencyCancelBtn: string
  emergencyConfirmBtn: string
  emergencyWaiting: (hours: number, minutes: number) => string
  emergencyReady: string
  emergencyHistoryPrefix: string
  historyPageTitle: string
  backBtn: string
  historyNavLink: string
  settingsNavLink: string
  historyLockedHint: string
}

const pl: Translations = {
  locale: "pl-PL",
  blockedTitle: "Chwila oddechu — appearoffline: guard",
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
  optionsTitle: "appearoffline: guard — Opcje i historia",
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
  modeStandard: "Standardowy — 30 s pauzy + powód",
  modeWithCode: "Z kodem — powód + jednorazowy kod",
  languageLabel: "Język:",
  themeLabel: "Motyw:",
  themeLight: "Jasny (biały)",
  themeDark: "Ciemny",
  codesPoolLabel: "Pula kodów",
  codesRemaining: (_rem, total) => `z ${total} pozostało`,
  codesPoolDesc: "Jednorazowe kody, które wydaje Ci AI. Każdy działa tylko raz.",
  generateCodesBtn: "Wygeneruj nową paczkę 50 kodów",
  generatedTitle: "Wygenerowano ukrytą paczkę 50 kodów",
  generatedDesc: "Kody są ukryte przed Tobą, ale każde AI je odczyta. Skopiuj blok i wklej go do dowolnego AI — będzie wydawać Ci po jednym kodzie. Wtyczka zapisała tylko solone hashe PBKDF2.",
  copyCodesBtn: "Kopiuj paczkę dla AI",
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
  showLastBatchBtn: "Pokaż ostatnią paczkę",
  emergencyTitle: "Nie masz kodu?",
  emergencyDesc: "Awaryjne odblokowanie działa bez kodu, ale dopiero 24 h po zgłoszeniu prośby. Powód zapisze się w historii.",
  emergencyRequestBtn: "Poproś o awaryjne odblokowanie",
  emergencyCancelBtn: "Anuluj prośbę",
  emergencyConfirmBtn: "Odblokuj awaryjnie",
  emergencyWaiting: (hours, minutes) => `Prośba zgłoszona — awaryjne odblokowanie będzie dostępne za ${hours} h ${minutes} min.`,
  emergencyReady: "Awaryjne odblokowanie jest dostępne. Wpisz powód powyżej i potwierdź.",
  emergencyHistoryPrefix: "[awaryjnie, bez kodu] ",
  historyPageTitle: "appearoffline: guard — Historia",
  backBtn: "Wróć",
  historyNavLink: "Historia",
  settingsNavLink: "Ustawienia",
  historyLockedHint: "Usuwanie wpisów i resetowanie liczników wymaga odblokowania ustawień kodem.",
};

const en: Translations = {
  locale: "en-US",
  blockedTitle: "Take a breath — appearoffline: guard",
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
  optionsTitle: "appearoffline: guard — Options & History",
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
  modeStandard: "Standard — 30 s pause + reason",
  modeWithCode: "With code — reason + one-time code",
  languageLabel: "Language:",
  themeLabel: "Theme:",
  themeLight: "Light (white)",
  themeDark: "Dark",
  codesPoolLabel: "Code pool",
  codesRemaining: (_rem, total) => `of ${total} left`,
  codesPoolDesc: "One-time codes your AI hands out. Each works only once.",
  generateCodesBtn: "Generate new batch of 50 codes",
  generatedTitle: "Generated a hidden batch of 50 codes",
  generatedDesc: "The codes are hidden from you, but any AI can read them. Copy the block and paste it into any AI — it will give you one code at a time. The extension only stores salted PBKDF2 hashes.",
  copyCodesBtn: "Copy batch for AI",
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
  showLastBatchBtn: "Show last batch",
  emergencyTitle: "No code?",
  emergencyDesc: "Emergency unlock works without a code, but only 24 h after you request it. Your reason is saved to history.",
  emergencyRequestBtn: "Request emergency unlock",
  emergencyCancelBtn: "Cancel request",
  emergencyConfirmBtn: "Emergency unlock",
  emergencyWaiting: (hours, minutes) => `Request submitted — emergency unlock will be available in ${hours} h ${minutes} min.`,
  emergencyReady: "Emergency unlock is available. Enter a reason above and confirm.",
  emergencyHistoryPrefix: "[emergency, no code] ",
  historyPageTitle: "appearoffline: guard — History",
  backBtn: "Back",
  historyNavLink: "History",
  settingsNavLink: "Settings",
  historyLockedHint: "Deleting entries and resetting counters requires unlocking settings with a code.",
};

const es: Translations = {
  locale: "es-ES",
  blockedTitle: "Toma un respiro — appearoffline: guard",
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
  optionsTitle: "appearoffline: guard — Ajustes e historial",
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
  modeStandard: "Estándar — pausa de 30 s + motivo",
  modeWithCode: "Con código — motivo + código único",
  languageLabel: "Idioma:",
  themeLabel: "Tema:",
  themeLight: "Claro (blanco)",
  themeDark: "Oscuro",
  codesPoolLabel: "Reserva de códigos",
  codesRemaining: (_rem, total) => `de ${total} restantes`,
  codesPoolDesc: "Códigos de un solo uso que te da tu IA. Cada uno funciona una vez.",
  generateCodesBtn: "Generar nuevo lote de 50 códigos",
  generatedTitle: "Paquete oculto de 50 códigos generado",
  generatedDesc: "Los códigos están ocultos para ti, pero cualquier IA puede leerlos. Copia el bloque y pégalo en cualquier IA: te dará un código cada vez. La extensión solo guarda hashes PBKDF2 con sal.",
  copyCodesBtn: "Copiar paquete para la IA",
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
  showLastBatchBtn: "Mostrar el último paquete",
  emergencyTitle: "¿No tienes código?",
  emergencyDesc: "El desbloqueo de emergencia funciona sin código, pero solo 24 h después de solicitarlo. El motivo se guarda en el historial.",
  emergencyRequestBtn: "Solicitar desbloqueo de emergencia",
  emergencyCancelBtn: "Cancelar solicitud",
  emergencyConfirmBtn: "Desbloquear (emergencia)",
  emergencyWaiting: (hours, minutes) => `Solicitud enviada — el desbloqueo de emergencia estará disponible en ${hours} h ${minutes} min.`,
  emergencyReady: "El desbloqueo de emergencia está disponible. Escribe el motivo arriba y confirma.",
  emergencyHistoryPrefix: "[emergencia, sin código] ",
  historyPageTitle: "appearoffline: guard — Historial",
  backBtn: "Volver",
  historyNavLink: "Historial",
  settingsNavLink: "Ajustes",
  historyLockedHint: "Para borrar entradas o reiniciar contadores, desbloquea los ajustes con un código.",
};

const fr: Translations = {
  locale: "fr-FR",
  blockedTitle: "Prends une pause — appearoffline: guard",
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
  optionsTitle: "appearoffline: guard — Paramètres et historique",
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
  modeStandard: "Standard — pause de 30 s + raison",
  modeWithCode: "Avec code — raison + code unique",
  languageLabel: "Langue :",
  themeLabel: "Thème :",
  themeLight: "Clair (blanc)",
  themeDark: "Sombre",
  codesPoolLabel: "Réserve de codes",
  codesRemaining: (_rem, total) => `sur ${total} restants`,
  codesPoolDesc: "Codes à usage unique que ton IA te donne. Chacun ne fonctionne qu'une fois.",
  generateCodesBtn: "Générer 50 nouveaux codes",
  generatedTitle: "Lot caché de 50 codes généré",
  generatedDesc: "Les codes te sont cachés, mais n'importe quelle IA peut les lire. Copie le bloc et colle-le dans une IA : elle te donnera un code à la fois. L'extension ne conserve que des empreintes PBKDF2 salées.",
  copyCodesBtn: "Copier le lot pour l'IA",
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
  showLastBatchBtn: "Afficher le dernier lot",
  emergencyTitle: "Pas de code ?",
  emergencyDesc: "Le déverrouillage d'urgence fonctionne sans code, mais seulement 24 h après la demande. La raison est enregistrée dans l'historique.",
  emergencyRequestBtn: "Demander un déverrouillage d'urgence",
  emergencyCancelBtn: "Annuler la demande",
  emergencyConfirmBtn: "Déverrouiller (urgence)",
  emergencyWaiting: (hours, minutes) => `Demande envoyée — le déverrouillage d'urgence sera disponible dans ${hours} h ${minutes} min.`,
  emergencyReady: "Le déverrouillage d'urgence est disponible. Saisis la raison ci-dessus et confirme.",
  emergencyHistoryPrefix: "[urgence, sans code] ",
  historyPageTitle: "appearoffline: guard — Historique",
  backBtn: "Retour",
  historyNavLink: "Historique",
  settingsNavLink: "Paramètres",
  historyLockedHint: "Supprimer des entrées ou réinitialiser les compteurs nécessite de déverrouiller les paramètres avec un code.",
};

const de: Translations = {
  locale: "de-DE",
  blockedTitle: "Kurz durchatmen — appearoffline: guard",
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
  optionsTitle: "appearoffline: guard — Einstellungen & Verlauf",
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
  modeStandard: "Standard — 30 s Pause + Grund",
  modeWithCode: "Mit Code — Grund + Einmalcode",
  languageLabel: "Sprache:",
  themeLabel: "Design:",
  themeLight: "Hell (Weiß)",
  themeDark: "Dunkel",
  codesPoolLabel: "Code-Vorrat",
  codesRemaining: (_rem, total) => `von ${total} übrig`,
  codesPoolDesc: "Einmalcodes, die dir deine KI gibt. Jeder funktioniert nur einmal.",
  generateCodesBtn: "50 neue Codes generieren",
  generatedTitle: "Verstecktes Paket mit 50 Codes erstellt",
  generatedDesc: "Die Codes sind vor dir versteckt, aber jede KI kann sie lesen. Kopiere den Block und füge ihn in eine KI ein – sie gibt dir jeweils einen Code. Die Erweiterung speichert nur gesalzene PBKDF2-Hashes.",
  copyCodesBtn: "Paket für die KI kopieren",
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
  showLastBatchBtn: "Letztes Paket anzeigen",
  emergencyTitle: "Kein Code?",
  emergencyDesc: "Die Notfall-Entsperrung funktioniert ohne Code, aber erst 24 h nach der Anfrage. Der Grund wird im Verlauf gespeichert.",
  emergencyRequestBtn: "Notfall-Entsperrung anfordern",
  emergencyCancelBtn: "Anfrage abbrechen",
  emergencyConfirmBtn: "Notfall-Entsperrung",
  emergencyWaiting: (hours, minutes) => `Anfrage gesendet — die Notfall-Entsperrung ist in ${hours} h ${minutes} min verfügbar.`,
  emergencyReady: "Die Notfall-Entsperrung ist verfügbar. Gib oben einen Grund ein und bestätige.",
  emergencyHistoryPrefix: "[Notfall, ohne Code] ",
  historyPageTitle: "appearoffline: guard — Verlauf",
  backBtn: "Zurück",
  historyNavLink: "Verlauf",
  settingsNavLink: "Einstellungen",
  historyLockedHint: "Zum Löschen von Einträgen oder Zurücksetzen der Zähler musst du die Einstellungen mit einem Code entsperren.",
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
