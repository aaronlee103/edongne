export type UserRole = 'super' | 'editor' | 'business' | 'user'
export type AvatarAnimal = 'bear' | 'rabbit' | 'fox' | 'cat' | 'dog' | 'owl' | 'penguin' | 'deer'
export type PostType = 'magazine' | 'notice' | 'community'
export type PostCategory = 'free' | 'qna' | 'info' | 'buysell' | 'jobs' | 'housing' | 'topic' | 'editor'
export type BusinessType = 'realtor' | 'builder' | 'lawyer' | 'mortgage'
export type BusinessPlan = 'basic' | 'pro' | 'premium'
export type ReportStatus = 'pending' | 'resolved' | 'dismissed'

export interface User {
  id: string
  email: string
  phone: string | null
  nickname: string
  role: UserRole
  region: string | null
  avatar_type: string
  avatar_animal: AvatarAnimal
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  type: PostType
  category: PostCategory
  title: string
  content: string
  town: string | null
  region: string | null
  views: number
  created_at: string
  // joined
  user?: User
  comment_count?: number
  vote_score?: number
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  content: string
  created_at: string
  user?: User
}

export interface Vote {
  id: string
  user_id: string
  post_id: string
  value: number // 1 or -1
}

export interface Business {
  id: string
  user_id: string | null
  type: BusinessType
  kor_name: string
  eng_name: string | null
  address: string | null
  phone1: string | null
  phone2: string | null
  region: string | null
  area: string | null
  specialty: string | null
  plan: BusinessPlan
  created_at: string
  // joined
  review_avg?: number
  review_count?: number
}

export interface Review {
  id: string
  business_id: string
  user_id: string
  score: number
  text: string | null
  created_at: string
  user?: User
}

export interface Report {
  id: string
  reporter_id: string
  target_type: 'post' | 'comment' | 'review'
  target_id: string
  reason: string
  status: ReportStatus
  created_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  post_id: string
  created_at: string
}
