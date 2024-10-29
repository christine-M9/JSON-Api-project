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

      // Create row for post details
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><a href="post.html?id=${post.id}">${post.title}</a></td>
        <td>${truncateDescription(post.body)}</td>
        <td>${post.body.split(' ').length}</td>
        <td>${user.name}</td>
        <td>
          <div class="action-container">
            <button class="action-button" onclick="toggleOptions(this)">...</button>
            <div class="options" style="display:none;">
              <button onclick="editPost(this, ${post.id}, '${post.title.replace(/'/g, "\\'")}', '${post.body.replace(/'/g, "\\'")}', '${user.name.replace(/'/g, "\\'")}')">Edit</button>
              <button onclick="deletePost(${post.id})">Delete</button>
            </div>
          </div>
        </td>
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

// Function to handle the edit action
function editPost(button, id, currentTitle, currentBody, currentAuthor) {
  // Prompt user for new details
  const newTitle = prompt("Edit Title:", currentTitle);
  const newBody = prompt("Edit Description:", currentBody);

  // Find the row of the post being edited
  const row = button.closest('tr');

  // Call the update function
  updatePost(id, newTitle || currentTitle, newBody || currentBody)
    .then(() => {
      // Update the row's content
      row.innerHTML = `
        <td><a href="post.html?id=${id}">${newTitle || currentTitle}</a></td>
        <td>${truncateDescription(newBody || currentBody)}</td>
        <td>${(newBody || currentBody).split(' ').length}</td>
        <td>${currentAuthor}</td>
        <td>
          <div class="action-container">
            <button class="action-button" onclick="toggleOptions(this)">...</button>
            <div class="options" style="display:none;">
              <button onclick="editPost(this, ${id}, '${newTitle || currentTitle}', '${newBody || currentBody}', '${currentAuthor}')">Edit</button>
              <button onclick="deletePost(${id})">Delete</button>
            </div>
          </div>
        </td>
      `;
    })
    .catch(error => console.error('Error updating post:', error));
}

// Function to update a post using PATCH or PUT
function updatePost(id, title, body) {
  return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: id,
      title: title,
      body: body,
      userId: 1 // Assuming userId is 1 for this mock API
    }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Post updated:', data);
  });
}

// Function to handle the delete action
function deletePost(id) {
  if (confirm(`Are you sure you want to delete post ${id}?`)) {
    // Logic for removing the post from the DOM
    const postsContainer = document.getElementById('posts');
    const postRow = [...postsContainer.getElementsByTagName('tr')].find(row => {
      return row.querySelector('a').href.includes(`post.html?id=${id}`);
    });
    postsContainer.removeChild(postRow);
    
    // Mock delete function
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log(`Post ${id} deleted.`);
    })
    .catch(error => console.error('Error deleting post:', error));
  }
}

// Function to toggle the visibility of options
function toggleOptions(button) {
  const optionsDiv = button.nextElementSibling;
  optionsDiv.style.display = optionsDiv.style.display === 'none' ? 'block' : 'none';
}

// Initial fetch of posts on page load
fetchPosts();
