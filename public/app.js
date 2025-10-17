const fetchBtn = document.getElementById("fetchBtn");
const downloadBtn = document.getElementById("downloadBtn");
const appIdInput = document.getElementById("appId");
const reviewsContainer = document.getElementById("reviews");

let currentReviews = [];

fetchBtn.addEventListener("click", () => {
  const appId = appIdInput.value.trim();
  if (!appId) return alert("Please enter App ID");

  reviewsContainer.innerHTML = "<p>Loading reviews...</p>";
  downloadBtn.disabled = true;
  currentReviews = [];

  fetch(`/api/reviews?appId=${appId}`)
    .then(res => res.json())
    .then(data => {
      reviewsContainer.innerHTML = "";
      currentReviews = data.reviews || [];

      if (currentReviews.length === 0) {
        reviewsContainer.innerHTML = "<p>No reviews found.</p>";
        return;
      }

      currentReviews.forEach(r => {
        const div = document.createElement("div");
        div.className = "review";
        div.innerHTML = `
          <div class="score">Score: ${r.score} ⭐</div>
          <div class="desc">${r.review_description}</div>
        `;
        reviewsContainer.appendChild(div);
      });

      downloadBtn.disabled = false;
    })
    .catch(err => {
      console.error(err);
      reviewsContainer.innerHTML = "<p>Failed to load reviews.</p>";
    });
});

downloadBtn.addEventListener("click", () => {
  if (currentReviews.length === 0) return;

  const blob = new Blob([JSON.stringify(currentReviews, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vr_reviews_${appIdInput.value}.json`;
  a.click();
  URL.revokeObjectURL(url);
});
