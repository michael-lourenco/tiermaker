export interface UserPreferences {
  user_id: string
  show_item_names: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserPreferencesInput {
  user_id: string
  show_item_names?: boolean
}

export interface UpdateUserPreferencesInput {
  show_item_names?: boolean
}
