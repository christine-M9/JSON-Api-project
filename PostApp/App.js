const postsPerPage = 10;
let currentPage = 1;
let allPosts = [];

// Fetch and display posts with pagination
function fetchPosts() {
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(posts => {
      allPosts = posts;
      displayPage(currentPage);
    })
    .catch(error => console.error('Error fetching posts:', error));
}

// Function to display a specific page of posts
function displayPage(page) {
  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;
  const postsToDisplay = allPosts.slice(start, end);

  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = '';

  // Display each post in the current page range
  postsToDisplay.forEach(post => {
    fetchAuthor(post);
  });

  // Update pagination controls
  updatePaginationControls();
}

// Function to fetch author details and add a row to the table
function fetchAuthor(post) {
  fetch(`https://jsonplaceholder.typicode.com/users/${post.userId}`)
    .then(response => response.json())
    .then(user => {
      const postsContainer = document.getElementById('posts');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><a href="post.html?id=${post.id}">${post.title}</a></td>
        <td>${truncateDescription(post.body)}</td>
        <td>${post.body.split(' ').length}</td>
        <td>${user.name}</td>
      `;
      postsContainer.appendChild(row);
    })
    .catch(error => console.error('Error fetching author:', error));
}

// Function to truncate description to 100 characters
function truncateDescription(description) {
  const maxLength = 100;
  return description.length > maxLength ? description.slice(0, maxLength) + '...' : description;
}

// Function to update pagination controls
function updatePaginationControls() {
  const pageControls = document.getElementById('pageControls');
  pageControls.innerHTML = '';

  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  // Prev button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Prev';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayPage(currentPage);
    }
  });
  pageControls.appendChild(prevButton);

  // Page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.classList.toggle('active', i === currentPage);
    pageButton.addEventListener('click', () => {
      currentPage = i;
      displayPage(currentPage);
    });
    pageControls.appendChild(pageButton);
  }

  // Next button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayPage(currentPage);
    }
  });
  pageControls.appendChild(nextButton);
}

// Initial fetch of posts on page load
fetchPosts();
