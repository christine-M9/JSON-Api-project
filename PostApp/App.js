const postsPerPage = 10;
let currentPage = 1;
let allPosts = [];

// Fetch and display posts with pagination
function fetchPosts() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then((response) => response.json())
    .then((posts) => {
      allPosts = posts;
      displayPage(currentPage);
    })
    .catch((error) => console.error("Error fetching posts:", error));
}

// Display posts for a specific page
function displayPage(page) {
  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;
  const postsToDisplay = allPosts.slice(start, end);

  const postsContainer = document.getElementById("posts");
  postsContainer.innerHTML = "";

  postsToDisplay.forEach((post) => {
    fetchAuthor(post);
  });

  // Update pagination controls
  updatePaginationControls();
}

// Fetch author details and add a row to the table
function fetchAuthor(post) {
  fetch(`https://jsonplaceholder.typicode.com/users/${post.userId}`)
    .then((response) => response.json())
    .then((user) => {
      const postsContainer = document.getElementById("posts");

      const row = document.createElement("tr");
      row.id = `post-row-${post.id}`;  // Set unique ID for each row
      row.innerHTML = `
        <td><a href="post.html?id=${post.id}">${post.title}</a></td>
        <td>${truncateDescription(post.body)}</td>
        <td>${post.body.split(" ").length}</td>
        <td>${user.name}</td>
        <td>
          <div class="action-container">
            <button class="action-button" onclick="toggleOptions(this)">...</button>
            <div class="options" style="display:none;">
              <button onclick="editPost(this, ${post.id}, \`${post.title}\`, \`${post.body}\`, \`${user.name}\`)">Edit</button>
              <button onclick="deletePost(${post.id})">Delete</button>
            </div>
          </div>
        </td>
      `;
      postsContainer.appendChild(row);
    })
    .catch((error) => console.error("Error fetching author:", error));
}

// Truncate description to 100 characters
function truncateDescription(description) {
  const maxLength = 100;
  return description.length > maxLength
    ? description.slice(0, maxLength) + "..."
    : description;
}

// Update pagination controls
function updatePaginationControls() {
  const pageControls = document.getElementById("pageControls");
  pageControls.innerHTML = "";

  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  // Prev button
  const prevButton = document.createElement("button");
  prevButton.textContent = "Prev";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayPage(currentPage);
    }
  });
  pageControls.appendChild(prevButton);

  // Page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.classList.toggle("active", i === currentPage);
    pageButton.addEventListener("click", () => {
      currentPage = i;
      displayPage(currentPage);
    });
    pageControls.appendChild(pageButton);
  }

  // Next button
  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayPage(currentPage);
    }
  });
  pageControls.appendChild(nextButton);
}

// Edit post with inline editing
function editPost(button, id, currentTitle, currentBody, currentAuthor) {
  const row = document.getElementById(`post-row-${id}`);

  row.innerHTML = `
    <td><input type="text" value="${currentTitle}" id="edit-title-${id}" /></td>
    <td><textarea id="edit-body-${id}">${currentBody}</textarea></td>
    <td><input type="number" value="${currentBody.split(" ").length}" id="edit-words-${id}" disabled /></td>
    <td><input type="text" value="${currentAuthor}" id="edit-author-${id}" /></td>
    <td>
      <div class="action-container">
        <button onclick="saveEdit(${id})">Save</button>
        <button onclick="cancelEdit(${id}, \`${currentTitle}\`, \`${currentBody}\`, \`${currentAuthor}\`)">Cancel</button>
      </div>
    </td>
  `;
}

// Save action to apply changes
function saveEdit(id) {
  const newTitle = document.getElementById(`edit-title-${id}`).value;
  const newBody = document.getElementById(`edit-body-${id}`).value;
  const newAuthor = document.getElementById(`edit-author-${id}`).value;

  updatePost(id, newTitle, newBody)
    .then(() => {
      const row = document.getElementById(`post-row-${id}`);
      row.innerHTML = `
        <td><a href="post.html?id=${id}">${newTitle}</a></td>
        <td>${truncateDescription(newBody)}</td>
        <td>${newBody.split(" ").length}</td>
        <td>${newAuthor}</td>
        <td>
          <div class="action-container">
            <button class="action-button" onclick="toggleOptions(this)">...</button>
            <div class="options" style="display:none;">
              <button onclick="editPost(this, ${id}, \`${newTitle}\`, \`${newBody}\`, \`${newAuthor}\`)">Edit</button>
              <button onclick="deletePost(${id})">Delete</button>
            </div>
          </div>
        </td>
      `;
    })
    .catch((error) => console.error("Error updating post:", error));
}

// Cancel action to revert changes
function cancelEdit(id, originalTitle, originalBody, originalAuthor) {
  const row = document.getElementById(`post-row-${id}`);

  row.innerHTML = `
    <td><a href="post.html?id=${id}">${originalTitle}</a></td>
    <td>${truncateDescription(originalBody)}</td>
    <td>${originalBody.split(" ").length}</td>
    <td>${originalAuthor}</td>
    <td>
      <div class="action-container">
        <button class="action-button" onclick="toggleOptions(this)">...</button>
        <div class="options" style="display:none;">
          <button onclick="editPost(this, ${id}, \`${originalTitle}\`, \`${originalBody}\`, \`${originalAuthor}\`)">Edit</button>
          <button onclick="deletePost(${id})">Delete</button>
        </div>
      </div>
    </td>
  `;
}

// Update a post using PATCH
function updatePost(id, title, body) {
  return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
      title: title,
      body: body,
      userId: 1,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Post updated:", data);
    });
}

// Toggle visibility of options
function toggleOptions(button) {
  const options = button.nextElementSibling;
  options.style.display = options.style.display === "none" ? "block" : "none";
}

// Initial fetch to populate posts
fetchPosts();
