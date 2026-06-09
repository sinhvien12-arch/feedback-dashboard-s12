/* shared/navbar.js — Injects the shared navigation bar */
(function () {
  const currentPath = window.location.pathname;

  function isActive(href) {
    return currentPath.endsWith(href) ? 'font-semibold text-indigo-600 underline underline-offset-4' : 'text-gray-600 hover:text-indigo-600';
  }

  const navbar = `
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
        <span class="text-indigo-700 font-bold text-lg tracking-tight mr-4">FeedbackBoard</span>
        <a href="submit.html" class="text-sm transition-colors ${isActive('submit.html')}">Submit Feedback</a>
        <a href="admin.html" class="text-sm transition-colors ${isActive('admin.html')}">Admin View</a>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', navbar);
})();
