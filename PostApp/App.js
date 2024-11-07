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

  updatePaginationControls();
}

// Fetch author details and add a row to the table
function fetchAuthor(post) {
  fetch(`https://jsonplaceholder.typicode.com/users/${post.userId}`)
    .then((response) => response.json())
    .then((user) => {
      const postsContainer = document.getElementById("posts");

      const row = document.createElement("tr");
      row.id = `post-row-${post.id}`;
      row.innerHTML = `
        <td><a href="post.html?id=${post.id}">${post.title}</a></td>
        <td>${truncateDescription(post.body)}</td>
        <td>${post.body.split(" ").length}</td>
        <td>${user.name}</td>
        <td>
          <div class="action-container">
            <button class="action-button" onclick="toggleOptions(this)">...</button>
            <div class="options" style="display:none;">
              <button onclick="editPost(this, ${post.id}, \`${
        post.title
      }\`, \`${post.body}\`, \`${user.name}\`)">Edit</button>
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

// Toggle display of the add post form
function togglePostForm() {
  const formContainer = document.getElementById("postFormContainer");
  formContainer.style.display =
    formContainer.style.display === "none" ? "block" : "none";
}

// Update word count in the form
function updateWordCount() {
  const body = document.getElementById("postBody").value;
  const wordCount = body
    .split(" ")
    .filter((word) => word.trim().length > 0).length;
  document.getElementById("postWords").value = wordCount;
}

// Add a new post with dynamic author lookup
function addPost() {
  const title = document.getElementById("postTitle").value;
  const body = document.getElementById("postBody").value;
  const authorName = document.getElementById("postAuthor").value;
  const wordCount = body
    .split(" ")
    .filter((word) => word.trim().length > 0).length;

  // Find the user ID based on the entered author name
  fetch(`https://jsonplaceholder.typicode.com/users`)
    .then((response) => response.json())
    .then((users) => {
      const user = users.find(
        (u) => u.name.toLowerCase() === authorName.toLowerCase()
      );

      if (!user) {
        alert("Author not found. Please enter a valid author name.");
        return;
      }

      const newPost = {
        id: allPosts.length + 1,
        title,
        body,
        userId: user.id,
        author: user.name,
        wordCount,
      };

      allPosts.unshift(newPost);
      displayPage(currentPage);

      document.getElementById("postForm").reset();
      togglePostForm();
    })
    .catch((error) => console.error("Error fetching user data:", error));
}

// Initialize fetching posts
fetchPosts();
