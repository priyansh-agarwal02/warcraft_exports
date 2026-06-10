const http = require("http");

http.get("http://localhost:3000/sale", (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log("Response status code:", res.statusCode);
    console.log("Includes 'CHRISTMAS SALE 2026':", data.includes("CHRISTMAS SALE 2026"));
    console.log("Includes 'SaleBanner':", data.includes("SaleBanner") || data.includes("bgColor"));
    // Print a portion of the response around key elements
    const index = data.indexOf("SALE");
    if (index !== -1) {
      console.log("Snippet around 'SALE':", data.substring(index - 200, index + 300));
    } else {
      console.log("Could not find 'SALE' in html. First 500 chars of HTML:");
      console.log(data.substring(0, 500));
    }
  });
}).on("error", (err) => {
  console.error("Error fetching /sale:", err.message);
});
