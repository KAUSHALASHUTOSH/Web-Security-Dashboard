import React from 'react';

const VulnerableTarget = () => {
  // The HTML for the vulnerable site, encoded as a data URI
  const vulnerableHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Insecure Demo Site</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; }
        </style>
    </head>
    <body class="bg-gray-100 min-h-screen flex flex-col items-center">

    <div class="container mx-auto p-8 max-w-4xl">
        <!-- Header -->
        <header class="bg-white rounded-xl shadow-lg p-6 mb-8 text-center">
            <h1 class="text-4xl font-extrabold text-gray-900 mb-2">Insecure Demo Site</h1>
            <p class="text-gray-500">A website with intentional vulnerabilities for security testing.</p>
        </header>

        <!-- Navigation -->
        <nav class="bg-white rounded-xl shadow-lg p-4 mb-8 flex justify-center space-x-4">
            <a href="#search" class="text-blue-600 hover:text-blue-800 font-bold transition-colors">Search</a>
            <a href="#comments" class="text-blue-600 hover:text-blue-800 font-bold transition-colors">Comments</a>
            <a href="#profile" class="text-blue-600 hover:text-blue-800 font-bold transition-colors">Profile</a>
        </nav>

        <!-- Vulnerable Search Section (SQL Injection) -->
        <section id="search" class="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Vulnerable Search Bar</h2>
            <p class="text-gray-600 mb-4">This search bar is vulnerable to **SQL Injection**.</p>
            <form id="search-form" class="flex space-x-4">
                <input type="text" id="search-input" placeholder="Search for users..." class="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                <button type="submit" class="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300">Search</button>
            </form>
            <div id="search-results" class="mt-4 text-gray-800"></div>
        </section>

        <!-- Vulnerable Comments Section (XSS) -->
        <section id="comments" class="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Vulnerable Comment Section</h2>
            <p class="text-gray-600 mb-4">This section does not sanitize input and is vulnerable to **Cross-Site Scripting (XSS)**.</p>
            <textarea id="comment-input" class="w-full border border-gray-300 rounded-lg p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500" rows="4" placeholder="Leave a comment..."></textarea>
            <button id="submit-comment" class="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300">Submit Comment</button>
            <div id="comments-list" class="mt-8 border-t border-gray-200 pt-6">
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                    <p class="text-gray-800 font-semibold">User1</p>
                    <p class="text-gray-700">This website is designed to be insecure for testing!</p>
                </div>
            </div>
        </section>
        
        <!-- Vulnerable Profile Section (IDOR) -->
        <section id="profile" class="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Vulnerable User Profile</h2>
            <p class="text-gray-600 mb-4">This page is vulnerable to **Insecure Direct Object Reference (IDOR)**.</p>
            <p class="text-sm text-gray-500 mb-4">Change the \`id\` in the URL (e.g., \`?id=2\`) to see another user's profile.</p>
            <div id="user-profile" class="bg-gray-50 rounded-lg p-6">
                <p class="text-lg font-bold text-gray-800">User ID: <span id="profile-id"></span></p>
                <p class="text-gray-700">Name: <span id="profile-name"></span></p>
                <p class="text-gray-700">Email: <span id="profile-email"></span></p>
            </div>
        </section>
    </div>

    <script>
        // --- SQL Injection Simulation ---
        document.getElementById('search-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const query = document.getElementById('search-input').value;
            const resultsDiv = document.getElementById('search-results');
            
            if (query.includes("' OR 1=1 --")) {
                resultsDiv.innerHTML = \`<p class="text-red-500 font-bold">SQL Injection Detected!</p><p>All user data is exposed: John Doe, Jane Smith, etc.</p>\`;
            } else {
                resultsDiv.innerHTML = \`<p>Searching for: <strong>\${query}</strong></p><p>Search complete. Found a few results.</p>\`;
            }
        });

        // --- XSS Vulnerability ---
        document.getElementById('submit-comment').addEventListener('click', function() {
            const commentInput = document.getElementById('comment-input');
            const comment = commentInput.value;

            const commentsList = document.getElementById('comments-list');
            const newComment = document.createElement('div');
            newComment.className = 'bg-gray-50 rounded-lg p-4 mb-4';
            newComment.innerHTML = \`<p class="text-gray-800 font-semibold">New User</p><p class="text-gray-700">\${comment}</p>\`;
            commentsList.appendChild(newComment);
            commentInput.value = '';
        });
        
        // --- IDOR Vulnerability ---
        const users = {
            '1': { name: 'John Doe', email: 'john.doe@insecure.com' },
            '2': { name: 'Jane Smith', email: 'jane.smith@insecure.com' },
            '3': { name: 'Bob Johnson', email: 'bob.johnson@insecure.com' },
        };

        const urlParams = new URLSearchParams(window.location.search);
        const requestedId = urlParams.get('id') || '1';
        const user = users[requestedId];

        if (user) {
            document.getElementById('profile-id').textContent = requestedId;
            document.getElementById('profile-name').textContent = user.name;
            document.getElementById('profile-email').textContent = user.email;
        } else {
            document.getElementById('profile-id').textContent = 'User Not Found';
            document.getElementById('profile-name').textContent = 'N/A';
            document.getElementById('profile-email').textContent = 'N/A';
        }
    </script>

    </body>
    </html>
  `;

  // Create a data URI to embed the HTML directly in the iframe
  const src = `data:text/html;charset=utf-8,${encodeURIComponent(vulnerableHtml)}`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Vulnerable Target Website</h2>
      <p className="text-gray-600 mb-4">Use this site to test your dashboard's scanning capabilities. You can copy the URL `http://localhost:3000/vulnerable` and paste it into the "Start a New Scan" bar.</p>
      <iframe 
        src={src} 
        title="Vulnerable Demo Site"
        className="w-full h-96 border rounded-lg"
      />
    </div>
  );
};

export default VulnerableTarget;
