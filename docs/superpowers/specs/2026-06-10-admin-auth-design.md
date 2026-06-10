# Admin Authentication Design — 2026-06-10

## Overview

Protect `pages/admin.html` with Firebase Google Sign-In, restricted to `@hsb.edu.vn` email accounts only. Unauthenticated users are redirected to a dedicated login page. Users with non-`@hsb.edu.vn` Google accounts are immediately signed out with a Vietnamese error message.

## Files

| File | Change |
|---|---|
| `pages/login.html` | **New** — Google Sign-In page |
| `pages/admin.html` | **Modify** — add auth guard + sign-out button |

No other files change.

## Auth Flow

```
User visits admin.html
  → Firebase checks onAuthStateChanged
  → No user: redirect to login.html
  → User present but not @hsb.edu.vn: signOut() + redirect to login.html

User on login.html clicks "Sign in with Google"
  → firebase.auth().signInWithPopup(GoogleAuthProvider)
  → Check user.email.endsWith('@hsb.edu.vn')
  → Valid:   redirect to admin.html
  → Invalid: firebase.auth().signOut()
             show error: "Chỉ tài khoản @hsb.edu.vn mới được phép truy cập."
```

## pages/login.html

**Layout:** Full-screen centered card (matches existing Tailwind style — `bg-gray-50`, `bg-white rounded-2xl shadow`).

**Contents:**
- App name heading: "Feedback Dashboard"
- Subtitle: "Admin Access"
- Google Sign-In button (styled, with Google logo SVG inline)
- Error message div (hidden by default, shown on domain mismatch): red text `"Chỉ tài khoản @hsb.edu.vn mới được phép truy cập."`
- Loading state: button disabled + text "Đang đăng nhập…" while popup is open

**Script:**
- Load Firebase Auth compat SDK alongside App + Firestore compat SDKs
- `firebase.initializeApp(...)` with the same config as admin.html
- `onAuthStateChanged`: if user already signed in with valid domain → redirect to `admin.html` immediately (handles back-button case)
- Sign-in button click → `signInWithPopup(new firebase.auth.GoogleAuthProvider())`
- On success: check domain, redirect or sign out + show error

## pages/admin.html

**Auth guard** — replaces the bare `initCharts()` + `onSnapshot` calls at the bottom of the script. A `chartsReady` flag prevents double-initialization if `onAuthStateChanged` fires more than once:

```js
var chartsReady = false;

firebase.auth().onAuthStateChanged(function(user) {
  if (!user || !user.email.endsWith('@hsb.edu.vn')) {
    firebase.auth().signOut();
    window.location.href = 'login.html';
    return;
  }
  // show signed-in user email in header
  document.getElementById('userEmail').textContent = user.email;

  if (!chartsReady) {
    chartsReady = true;
    initCharts();
    db.collection('feedbackEntries').orderBy('date', 'desc').onSnapshot(
      function(snapshot) {
        allEntries = snapshot.docs.map(function(doc) {
          return Object.assign({ id: doc.id }, doc.data());
        });
        render();
      },
      function(err) {
        console.error('Firestore error:', err);
        document.getElementById('countLine').textContent = 'Failed to load: ' + err.message;
      }
    );
  }
});
```

The existing bare `initCharts()` and `onSnapshot` calls at the bottom of the script are **removed** and replaced by this block.

**Sign-out button** — added to the page header, next to the Export CSV button:

```html
<button id="signOutBtn" class="text-sm text-gray-500 hover:text-gray-700 underline">
  Sign out
</button>
```

Clicking it calls `firebase.auth().signOut()` then redirects to `login.html`.

**User display** — small text showing signed-in email in the header (e.g. `nguyenvana@hsb.edu.vn`).

## Firebase Console Setup (manual, one-time)

The developer must do this in Firebase Console before the feature works:

1. **Authentication → Sign-in method → Google** → Enable → Save
2. **Authentication → Settings → Authorized domains** → Add `feedback-dashboard-s12.vercel.app`

`localhost` is already in the authorized domains list by default.

## Security Notes

- Domain check (`endsWith('@hsb.edu.vn')`) runs client-side — sufficient for a classroom project. Firestore security rules remain `allow read, write: if true` (not changed in this scope).
- The submit form (`pages/submit.html`) remains public — no auth required.
- `navbar.js` links are not changed.

## Non-goals

- No Firestore security rules update (out of scope)
- No role-based access (one level: `@hsb.edu.vn` = full admin)
- No "remember me" toggle (Firebase persists by default)
- No email/password auth path
