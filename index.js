// import fetch from "node-fetch";
// import fs from "fs";

// const appId = "9448215788640413";
// const limit = 50;
// let offset = 0;
// let allReviews = [];

// async function fetchReviews() {
//   while (true) {
//     const url = `https://vrdb.app/api/reviews?appId=${appId}&limit=${limit}&offset=${offset}&sortBy=newest&score=null`;
    
//     const res = await fetch(url, {
//       headers: {
//         "Referer": "https://vrdb.app/game/" + appId,
//         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115 Safari/537.36",
//         "Accept": "application/json",
//       },
//     });

//     const text = await res.text();
//     if (text.includes("Direct access not allowed")) {
//       console.log("⚠️ Access blocked by VRDB. You need proper headers or a session cookie.");
//       break;
//     }

//     const data = JSON.parse(text);

//     if (!data.reviews || data.reviews.length === 0) break;

//     // Map only the needed fields
//     const filtered = data.reviews.map(r => ({
//       score: r.score,
//       review_description: r.review_description
//     }));

//     allReviews.push(...filtered);
//     offset += limit;
//   }

//   fs.writeFileSync("vr_reviews.json", JSON.stringify(allReviews, null, 2));
//   console.log(`✅ Fetched ${allReviews.length} reviews (score + review_description)`);
// }

// fetchReviews();



import express from "express";
import fetch from "node-fetch";

const app = express();
// const PORT = 3000;

const LIMIT = 50;

// Serve public folder
app.use(express.static("public"));

// API endpoint
app.get("/api/reviews", async (req, res) => {
  const appId = req.query.appId;
  if (!appId) return res.status(400).json({ error: "appId is required" });

  let offset = 0;
  let allReviews = [];

  try {
    while (true) {
      const url = `https://vrdb.app/api/reviews?appId=${appId}&limit=${LIMIT}&offset=${offset}&sortBy=newest&score=null`;

      const response = await fetch(url, {
        headers: {
          "Referer": `https://vrdb.app/game/${appId}`,
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        },
      });

      const text = await response.text();
      if (text.includes("Direct access not allowed")) {
        return res.status(403).json({ error: "Access blocked by VRDB" });
      }

      const data = JSON.parse(text);
      if (!data.reviews || data.reviews.length === 0) break;

      const filtered = data.reviews.map(r => ({
        score: r.score,
        review_description: r.review_description,
      }));

      allReviews.push(...filtered);
      offset += LIMIT;
    }

    res.json({ total: allReviews.length, reviews: allReviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

