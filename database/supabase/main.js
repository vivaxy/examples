import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://racynwbvubhfmyusgdgr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Clghhv6BoYVlyh3O5hVesg_-Q1omlnr';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── DOM scaffold ──────────────────────────────────────────────────────────────

document.body.innerHTML = `
  <h1>Supabase Demo</h1>

  <section id="auth-section">
    <h2>Auth</h2>

    <div id="auth-forms">
      <form id="signup-form">
        <h3>Sign Up</h3>
        <input id="signup-email" type="email" placeholder="Email" required />
        <input id="signup-password" type="password" placeholder="Password (≥6 chars)" required />
        <button type="submit">Sign Up</button>
        <p id="signup-msg" class="msg"></p>
      </form>

      <form id="signin-form">
        <h3>Sign In</h3>
        <input id="signin-email" type="email" placeholder="Email" required />
        <input id="signin-password" type="password" placeholder="Password" required />
        <button type="submit">Sign In</button>
        <p id="signin-msg" class="msg"></p>
      </form>
    </div>

    <div id="user-info" style="display:none">
      <p>Signed in as <strong id="user-email"></strong></p>
      <button id="signout-btn">Sign Out</button>
    </div>
  </section>

  <section id="notes-section" style="display:none">
    <h2>Notes</h2>
    <form id="create-note-form">
      <input id="note-input" type="text" placeholder="New note…" required />
      <button type="submit">Add</button>
    </form>
    <ul id="notes-list"></ul>
  </section>
`;

// ── Element refs ──────────────────────────────────────────────────────────────

const authForms = document.getElementById('auth-forms');
const userInfo = document.getElementById('user-info');
const userEmailEl = document.getElementById('user-email');

const signupForm = document.getElementById('signup-form');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupMsg = document.getElementById('signup-msg');

const signinForm = document.getElementById('signin-form');
const signinEmail = document.getElementById('signin-email');
const signinPassword = document.getElementById('signin-password');
const signinMsg = document.getElementById('signin-msg');

const signoutBtn = document.getElementById('signout-btn');

const notesSection = document.getElementById('notes-section');
const createNoteForm = document.getElementById('create-note-form');
const noteInput = document.getElementById('note-input');
const notesList = document.getElementById('notes-list');

// ── Auth state ────────────────────────────────────────────────────────────────

let currentUser = null;
let realtimeChannel = null;

function showAuthed(user) {
  currentUser = user;
  authForms.style.display = 'none';
  userInfo.style.display = 'block';
  userEmailEl.textContent = user.email;
  notesSection.style.display = 'block';
  loadNotes();
  subscribeRealtime();
}

function showAnon() {
  currentUser = null;
  authForms.style.display = 'block';
  userInfo.style.display = 'none';
  notesSection.style.display = 'none';
  notesList.innerHTML = '';
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    showAuthed(session.user);
  } else {
    showAnon();
  }
});

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    showAuthed(session.user);
  } else {
    showAnon();
  }
});

// ── Auth handlers ─────────────────────────────────────────────────────────────

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupMsg.textContent = '';
  const { error } = await supabase.auth.signUp({
    email: signupEmail.value.trim(),
    password: signupPassword.value,
  });
  if (error) {
    signupMsg.textContent = error.message;
  } else {
    signupMsg.textContent = 'Check your email to confirm sign-up.';
    signupForm.reset();
  }
});

signinForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signinMsg.textContent = '';
  const { error } = await supabase.auth.signInWithPassword({
    email: signinEmail.value.trim(),
    password: signinPassword.value,
  });
  if (error) {
    signinMsg.textContent = error.message;
  } else {
    signinForm.reset();
  }
});

signoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
});

// ── Notes CRUD ────────────────────────────────────────────────────────────────

async function loadNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    const li = document.createElement('li');
    li.textContent = `Error: ${error.message}`;
    notesList.replaceChildren(li);
    return;
  }
  notesList.innerHTML = '';
  data.forEach((note) => notesList.appendChild(buildNoteItem(note)));
}

function buildNoteItem(note) {
  const li = document.createElement('li');
  li.dataset.id = note.id;

  const span = document.createElement('span');
  span.textContent = note.content;

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => startEdit(li, note));

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteNote(note.id));

  li.append(span, ' ', editBtn, ' ', deleteBtn);
  return li;
}

function startEdit(li, note) {
  li.innerHTML = '';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = note.content;

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', async () => {
    const newContent = input.value.trim();
    if (!newContent) return;
    const { error } = await supabase
      .from('notes')
      .update({ content: newContent })
      .eq('id', note.id);
    if (error) {
      alert(error.message);
    } else {
      li.replaceWith(buildNoteItem({ ...note, content: newContent }));
    }
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    const updated = buildNoteItem(note);
    li.replaceWith(updated);
  });

  li.append(input, ' ', saveBtn, ' ', cancelBtn);
}

async function deleteNote(id) {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) {
    alert(error.message);
  } else {
    const el = notesList.querySelector(`li[data-id="${id}"]`);
    if (el) el.remove();
  }
}

createNoteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = noteInput.value.trim();
  if (!content) return;
  const { data: inserted, error } = await supabase
    .from('notes')
    .insert({ content, user_id: currentUser.id })
    .select()
    .single();
  if (error) {
    alert(error.message);
  } else {
    noteInput.value = '';
    if (!realtimeChannel) notesList.prepend(buildNoteItem(inserted));
  }
});

// ── Realtime subscription ─────────────────────────────────────────────────────

function subscribeRealtime() {
  if (realtimeChannel) return;

  realtimeChannel = supabase
    .channel('notes-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notes',
        filter: `user_id=eq.${currentUser.id}`,
      },
      (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;

        if (eventType === 'INSERT') {
          // Prepend so newest is first
          notesList.prepend(buildNoteItem(newRow));
        } else if (eventType === 'UPDATE') {
          const li = notesList.querySelector(`li[data-id="${newRow.id}"]`);
          if (li) li.replaceWith(buildNoteItem(newRow));
        } else if (eventType === 'DELETE') {
          const li = notesList.querySelector(`li[data-id="${oldRow.id}"]`);
          if (li) li.remove();
        }
      },
    )
    .subscribe();
}
