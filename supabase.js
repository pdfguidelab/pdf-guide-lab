import { createClient } from '@supabase/supabase-js'

// The publishable key is safe to expose in the browser —
// data access is protected by Row Level Security in the database.
const SUPABASE_URL = 'https://jszsrbtnnefgrjaghlrw.supabase.co'
const SUPABASE_KEY = 'sb_publishable_xF4k-QxfEUBqGn7pv88_3A_rVMPFk0K'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const NICHES = [
  'Pets', 'Parenting', 'Health & Wellness', 'Fitness', 'Personal Finance',
  'Productivity', 'Relationships & Dating', 'Self-Improvement',
  'Beauty & Skincare', 'Home & Organization', 'Food & Nutrition',
  'Career & Business', 'Travel', 'Hobbies & Crafts',
]
