export type Language = 'en' | 'pt'

export interface Translations {
  common: {
    appName: string
    loading: string
    error: string
    success: string
    cancel: string
    confirm: string
    save: string
    delete: string
    edit: string
    create: string
    back: string
    next: string
    previous: string
    close: string
  }
  nav: {
    home: string
    templates: string
    categories: string
    createTemplate: string
    myTemplates: string
    myTierLists: string
    signIn: string
    signUp: string
    signOut: string
    openMenu: string
    menuDescription: string
    browse: string
    myAccount: string
    account: string
  }
  home: {
    title: string
    subtitle: string
    browseTemplates: string
    createYourOwn: string
    popularTemplates: string
    noTemplates: string
    createFirstTemplate: string
  }
  templates: {
    title: string
    allTemplates: string
    browseDescription: string
    categoryFilter: string
    clearFilter: string
    browseCategories: string
    viewTemplate: string
    noTemplatesFound: string
    views: string
    likes: string
    myTemplates: string
    manageTemplates: string
    noTemplatesCreated: string
    editTemplate: string
    editTemplateDescription: string
    updateTemplate: string
    updatingTemplate: string
    confirmDelete: string
    confirmDeleteTitle: string
    confirmDeleteMessage: string
    deleteWarning: string
    deleteError: string
    deleting: string
    softDeleted: string
    hardDeleted: string
    activeTemplates: string
    archivedTemplates: string
    archived: string
    restore: string
    restoring: string
    restoreError: string
    restoreTemplateTooltip: string
    viewTemplateTooltip: string
    editTemplateTooltip: string
    deleteTemplateTooltip: string
  }
  categories: {
    title: string
    description: string
    noCategories: string
    template: string
    templates: string
  }
  template: {
    backToTemplates: string
    createTierList: string
    category: string
  }
  editor: {
    addTier: string
    saveTierList: string
    unassigned: string
    unassignedDescription: string
    tier: string
    dragItemsHere: string
    removeTier: string
    changeTierColor: string
    confirmDelete: string
    confirmDeleteMessage: string
    itemsWillBeMoved: string
    remove: string
  }
  createTemplate: {
    title: string
    subtitle: string
    coverImage: string
    coverImageDescription: string
    templateName: string
    templateNamePlaceholder: string
    description: string
    descriptionPlaceholder: string
    category: string
    selectCategory: string
    loadingCategories: string
    noCategories: string
    createNewCategory: string
    categoryName: string
    add: string
    isPublic: string
    templateItems: string
    templateItemsDescription: string
    clickToUpload: string
    dragAndDrop: string
    fileTypes: string
    creatingTemplate: string
    createTemplate: string
  }
  myTierLists: {
    title: string
    noTierLists: string
    createFirst: string
    manageDescription: string
    confirmDeleteTitle: string
    confirmDeleteMessage: string
    deleteError: string
    deleting: string
    viewTooltip: string
    deleteTooltip: string
  }
}

