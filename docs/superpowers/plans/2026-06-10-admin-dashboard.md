# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visual analytics dashboard (4 KPI cards + 3 charts) to `pages/admin.html`, above the filters panel, that re-draws whenever filters change or new Firestore data arrives.

**Architecture:** All changes are confined to `pages/admin.html`. Chart.js is loaded via CDN in `<head>`. Three chart instances are created once on load and updated in-place via `chart.update()` on every `render()` call — no destroy/recreate. `render()` already runs on filter change and Firestore snapshot, so the dashboard stays in sync automatically.

**Tech Stack:** Chart.js 4.4.4 (CDN), Tailwind CSS (CDN), Firebase Firestore compat SDK (already loaded)

---

### Task 1: Add Chart.js CDN and dashboard HTML

**Files:**
- Modify: `pages/admin.html` — `<head>` block and inside `<main>` before the filters div

- [ ] **Step 1: Add Chart.js script tag to `<head>`**

In `pages/admin.html`, add this line in `<head>` after the existing Firebase compat scripts:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
```

The `<head>` block should end with:
```html
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
  <script>
    firebase.initializeApp({ ... });
    const db = firebase.firestore();
  </script>
</head>
```

- [ ] **Step 2: Add dashboard HTML between the page header and the filters panel**

In `pages/admin.html`, locate this existing block:
```html
    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow p-5 mb-6">
```

Insert the following HTML **immediately before** that filters comment:

```html
    <!-- Dashboard -->
    <div class="mb-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div class="bg-white rounded-2xl shadow p-4 text-center">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Feedbacks</p>
          <p id="kpiTotal" class="text-3xl font-bold text-gray-800">–</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 text-center">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Avg Rating</p>
          <p id="kpiAvg" class="text-3xl font-bold text-gray-800">–</p>
        </div>
        <div class="bg-green-50 rounded-2xl shadow p-4 text-center">
          <p class="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Positive</p>
          <p id="kpiPositive" class="text-3xl font-bold text-green-700">–</p>
        </div>
        <div class="bg-red-50 rounded-2xl shadow p-4 text-center">
          <p class="text-xs font-medium text-red-700 uppercase tracking-wide mb-1">Negative</p>
          <p id="kpiNegative" class="text-3xl font-bold text-red-700">–</p>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl shadow p-4">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Rating Distribution</p>
          <div style="position:relative;height:180px;">
            <canvas id="chartRating"></canvas>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow p-4">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">By Location</p>
          <div style="position:relative;height:180px;">
            <canvas id="chartLocation"></canvas>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow p-4">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Sentiment</p>
          <div style="position:relative;height:180px;">
            <canvas id="chartSentiment"></canvas>
          </div>
        </div>
      </div>
    </div>

```

- [ ] **Step 3: Verify HTML structure is correct**

Open `pages/admin.html` in a browser (or on Vercel preview). The page should show:
- A row of 4 grey placeholder cards with `–` values
- Three empty white chart panels
- Then the filters panel
- Then the table

No JS errors in the browser console at this point (Chart.js is loaded but charts not yet initialized).

---

### Task 2: Initialize charts and add updateKPICards()

**Files:**
- Modify: `pages/admin.html` — the `<script>` block at the bottom of `<body>`

- [ ] **Step 1: Add chart instance variables and `initCharts()` at the top of the script block**

At the very top of the main `<script>` block (before `let allEntries = []`), add:

```js
let ratingChart, locationChart, sentimentChart;

function initCharts() {
  ratingChart = new Chart(
    document.getElementById('chartRating').getContext('2d'),
    {
      type: 'bar',
      data: {
        labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'],
        datasets: [{
          data: [0, 0, 0, 0, 0],
          backgroundColor: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'],
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    }
  );

  locationChart = new Chart(
    document.getElementById('chartLocation').getContext('2d'),
    {
      type: 'bar',
      data: {
        labels: ['District 1', 'District 3', 'Thao Dien'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: '#6366f1',
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    }
  );

  sentimentChart = new Chart(
    document.getElementById('chartSentiment').getContext('2d'),
    {
      type: 'doughnut',
      data: {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 11 } }
          }
        }
      }
    }
  );
}
```

- [ ] **Step 2: Add `updateKPICards()` after `initCharts()`**

```js
function updateKPICards(filtered) {
  const total = filtered.length;
  document.getElementById('kpiTotal').textContent = total;

  if (total === 0) {
    document.getElementById('kpiAvg').textContent = '–';
    document.getElementById('kpiPositive').textContent = '0 (0%)';
    document.getElementById('kpiNegative').textContent = '0 (0%)';
    return;
  }

  const avg = (filtered.reduce(function(s, e) { return s + e.rating; }, 0) / total).toFixed(1);
  document.getElementById('kpiAvg').textContent = avg + ' ★';

  const positive = filtered.filter(function(e) { return e.rating >= 4; }).length;
  const negative = filtered.filter(function(e) { return e.rating <= 2; }).length;
  document.getElementById('kpiPositive').textContent = positive + ' (' + Math.round(positive / total * 100) + '%)';
  document.getElementById('kpiNegative').textContent = negative + ' (' + Math.round(negative / total * 100) + '%)';
}
```

- [ ] **Step 3: Add `updateCharts()` after `updateKPICards()`**

```js
function updateCharts(filtered) {
  ratingChart.data.datasets[0].data = [1, 2, 3, 4, 5].map(function(r) {
    return filtered.filter(function(e) { return e.rating === r; }).length;
  });
  ratingChart.update();

  var locs = ['District 1', 'District 3', 'Thao Dien'];
  locationChart.data.datasets[0].data = locs.map(function(loc) {
    return filtered.filter(function(e) { return e.location === loc; }).length;
  });
  locationChart.update();

  sentimentChart.data.datasets[0].data = [
    filtered.filter(function(e) { return e.rating >= 4; }).length,
    filtered.filter(function(e) { return e.rating === 3; }).length,
    filtered.filter(function(e) { return e.rating <= 2; }).length,
  ];
  sentimentChart.update();
}
```

---

### Task 3: Wire into render() and initialize on load

**Files:**
- Modify: `pages/admin.html` — `render()` function and end of script block

- [ ] **Step 1: Add calls to `updateKPICards` and `updateCharts` inside `render()`**

Find the existing `render()` function. It starts with:
```js
function render() {
  const sorted = [...allEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filtered = applyFilters(sorted);

  const tbody = document.getElementById('tableBody');
  const countLine = document.getElementById('countLine');
```

Add two lines immediately after `const filtered = applyFilters(sorted);`:
```js
  updateKPICards(filtered);
  updateCharts(filtered);
```

The top of `render()` should now read:
```js
function render() {
  const sorted = [...allEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filtered = applyFilters(sorted);

  updateKPICards(filtered);
  updateCharts(filtered);

  const tbody = document.getElementById('tableBody');
  const countLine = document.getElementById('countLine');
```

- [ ] **Step 2: Call `initCharts()` at the bottom of the script block**

At the very end of the `<script>` block, just before `</script>`, add:
```js
initCharts();
```

The end of the script should look like:
```js
    // Real-time listener from Firestore
    db.collection('feedbackEntries')
      .orderBy('date', 'desc')
      .onSnapshot( ... );

    initCharts();
  </script>
```

- [ ] **Step 3: Manual verification**

Open the admin page (locally or on Vercel preview). Verify:
1. KPI cards show real numbers once Firestore data loads
2. All 3 charts render with data
3. Changing the Location filter updates KPI cards and all 3 charts
4. Changing Min Rating filter updates KPI cards and all 3 charts
5. Changing date range updates KPI cards and all 3 charts
6. With no data / all filtered out: KPI cards show `0` / `–`, charts show empty state

Check the browser console — there should be zero errors.

---

### Task 4: Commit and deploy

**Files:**
- Modify: `pages/admin.html` (already modified above)

- [ ] **Step 1: Stage and commit**

```bash
git add pages/admin.html
git commit -m "feat: thêm dashboard trực quan vào trang admin"
```

- [ ] **Step 2: Deploy to production**

```bash
vercel --prod
```

Expected output ends with:
```
▲ Aliased     https://feedback-dashboard-s12.vercel.app
```

- [ ] **Step 3: Smoke test on production URL**

Open `https://feedback-dashboard-s12.vercel.app/pages/admin.html` and verify:
- Dashboard renders above filters
- Charts load with Firestore data
- Filters affect both charts and table
