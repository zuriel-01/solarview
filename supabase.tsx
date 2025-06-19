// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nbnnsxlylvuncnxccjdb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ibm5zeGx5bHZ1bmNueGNjamRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODUxMTksImV4cCI6MjA2NTc2MTExOX0.DWgo6elPxzVEm3wipUly4TYEQkZh9myXyYD8YYL_tls'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)