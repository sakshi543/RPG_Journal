export type Category =
  | "Health"
  | "Knowledge"
  | "Social"
  | "Adventure"
  | "Creativity"
  | "Wealth";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Legendary";

export type QuestType = "one_time" | "repeatable" | "progress";

export type User = {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  total_xp: number;
  level: number;
};

export type Quest = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: Category;
  difficulty: Difficulty;
  xp_reward: number;
  quest_type: QuestType;
  progress_target: number | null;
  progress_current: number;
  is_active: boolean;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QuestLog = {
  id: string;
  quest_id: string;
  user_id: string;
  date: string;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  notes: string | null;
  mood: number;
  xp_earned: number;
  tags: string[];
  is_capsule: boolean;
  capsule_open_date: string | null;
  capsule_opened: boolean;
  created_at: string;
};

export type CharacterStat = {
  id: string;
  user_id: string;
  category: Category;
  total_xp: number;
  level: number;
  streak_count: number;
  longest_streak: number;
  last_active_date: string | null;
  streak_freeze_count: number;
  created_at: string;
};

export type CharacterOverview = {
  user_total_xp: number;
  user_level: number;
  stats: CharacterStat[];
};

export type JournalLayoutTemplate = "grid" | "polaroid" | "freeform";

export type JournalPage = {
  id: string;
  quest_log_id: string;
  layout_template: JournalLayoutTemplate;
  sticker_data: Record<string, unknown>[];
  text_blocks: Record<string, unknown>[];
  background_color: string;
  exported_image_url: string | null;
  created_at: string;
  updated_at: string;
};

