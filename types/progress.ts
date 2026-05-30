
export interface QuestProgress {
  questId: string;
  completedAt: string;
  highscore: number;
  xpEarned: number;
  attempts: number;
}

export interface TopicMastery {
  topicId: string;
  masteryPips: number; // 0 to 5
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  unlockedAt: string;
}

export interface StudentProgress {
  uid: string;
  completedQuests: Record<string, QuestProgress>;
  topicMastery: Record<string, TopicMastery>;
  badges: Badge[];
}
