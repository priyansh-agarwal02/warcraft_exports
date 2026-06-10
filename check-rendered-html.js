const http = require("http");

http.get("http://localhost:3000/sale", (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    const markupOnly = data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    console.log("In markup (no script tags):", markupOnly.includes("RLS TEST BANNER"));
    
    const index = markupOnly.indexOf("RLS TEST BANNER");
    if (index !== -1) {
      console.log("Markup snippet around 'RLS TEST BANNER':");
      console.log(markupOnly.substring(index - 100, index + 200));
    } else {
      console.log("Could not find 'RLS TEST BANNER' in non-script markup!");
      console.log("Does it contain background-color: #00ff00?", markupOnly.includes("#00ff00"));
      // Let's print the entire body tag
      const bodyStart = markupOnly.indexOf("<body");
      if (bodyStart !== -1) {
        console.log("Body snippet:", markupOnly.substring(bodyStart, bodyStart + 1000));
      }
    }
  });
});
