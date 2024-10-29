// Get the post ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// Fetch post details
function fetchPostDetails() {
    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            const postDetails = document.getElementById('postDetails');
            postDetails.innerHTML = `
                <h2>${post.title}</h2>
                <p>${post.body}</p>
            `;
        })
        .catch(error => console.error('Error fetching post details:', error));
}

// Fetch comments for the post
function fetchComments() {
    fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`)
        .then(response => response.json())
        .then(comments => {
            const commentsContainer = document.getElementById('comments');
            commentsContainer.innerHTML = ''; // Clear previous comments

            comments.forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
                commentDiv.innerHTML = `
                    <strong>${comment.name}</strong>
                    <p>${comment.body}</p>
                `;
                commentsContainer.appendChild(commentDiv);
            });
        })
        .catch(error => console.error('Error fetching comments:', error));
}

// Initial fetch on page load
fetchPostDetails();
fetchComments();
