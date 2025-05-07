const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://feyekepbasnfmdoqnktc.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZleWVrZXBiYXNuZm1kb3Fua3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2OTE4OTUsImV4cCI6MjA1MDI2Nzg5NX0._pijwGhgZYbGX-zkRESjif3N5hv1SfAUjIrrGdso3DA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
