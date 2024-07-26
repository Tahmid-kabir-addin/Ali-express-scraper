const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const fetchData = async () => {
  const productLink = process.argv[2];
  if (!productLink) {
    console.error("Please provide a productLink as argument");
    process.exit(1);
  }
  const url = new URL(productLink);
  const productId = url.pathname.match(/\/dp\/([^/]+)/i)[1];
  console.log("🚀 ~ fetchData ~ productId:", productId);

  try {
    let page = 1;
    const productPageResponse = await axios.get(
      `https://www.amazon.com/dp/${productId}`
    );

    if (productPageResponse.status !== 200) {
      console.error("Failed to fetch product page");
    }
    console.log("success");
    let html = productPageResponse.data;
    let $ = cheerio.load(html);
    let productTitle = $("#titleSection").text();
    // trim the text
    productTitle = productTitle.replace(/^\s+|\s+$/g, "");
    console.log("🚀 ~ fetchData ~ productTitle:", productTitle);

    const averageRating = $("span[data-hook='rating-out-of-text']")
      .text()
      .split(" ")[0];
    console.log("🚀 ~ fetchData ~ averageRating:", averageRating);
  } catch (error) {
    console.log(error.message);
  }
};

fetchData();
