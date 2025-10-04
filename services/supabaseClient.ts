import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fzgujmwjchqimcrggkec.supabase.co';

// CẢNH BÁO: Nên sử dụng biến môi trường để bảo mật.
// Tuy nhiên, đây là khóa "anon" (ẩn danh), an toàn để lộ ra trong môi trường trình duyệt.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6Z3VqbXdqY2hxaW1jcmdna2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODYyMzksImV4cCI6MjA3NTA2MjIzOX0.aQjXK39hsvKX0G_kkcpSEzO2rvSYT0WoY9QzIFius4c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
