# Supabase Demo

A minimal browser-based demo covering Supabase Auth (email + password sign-up / sign-in / sign-out), CRUD on a per-user `notes` table, and Realtime subscription to INSERT / UPDATE / DELETE events on that table. No build step — runs directly in the browser via a CDN ESM import.

## Prerequisites

- A free [Supabase](https://supabase.com) account.

## Setup

### 1. Create a Supabase project

1. Log in to [app.supabase.com](https://app.supabase.com).
2. Click **New project**, choose an organisation, enter a project name and database password, then click **Create new project**.
3. Wait for the project to finish provisioning (about 1 minute).

### 2. Get your project URL and anon key

1. In the project dashboard, go to **Project Settings → API**.
2. Copy the **Project URL** (looks like `https://<ref>.supabase.co`).
3. Copy the **anon / public** key under **Project API keys**.

### 3. Create the `notes` table and enable Row Level Security

Open the **SQL Editor** in the Supabase dashboard and run the following SQL:

```sql
-- Create the notes table
CREATE TABLE notes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users,
  content    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read their own notes
CREATE POLICY "select own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: users can only insert their own notes
CREATE POLICY "insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: users can only update their own notes
CREATE POLICY "update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: users can only delete their own notes
CREATE POLICY "delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Configure `main.js`

Open `main.js` and replace the two placeholder values at the top of the file with the URL and anon key you copied in step 2:

```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';      // e.g. https://<ref>.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

## Run

Open `index.html` in a browser. No build step or local server is required — the Supabase client is loaded directly from the ESM CDN (`esm.sh`).

> Tip: if your browser blocks ES module imports from `file://`, serve the directory with any static server, for example `npx serve .` from the monorepo root, then navigate to `http://localhost:3000/database/supabase/`.
