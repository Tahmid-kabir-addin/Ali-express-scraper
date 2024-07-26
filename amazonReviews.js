import cheerio from "cheerio";
import fs from "fs";
import fetch from "node-fetch";
const fetchData = async (headers, productId, options) => {
  let page = 1;
  let hasReviews = true;
  let allReviews = [];
  try {
    while (hasReviews) {
      const url = `https://www.amazon.com/product-reviews/${productId}/ref=cm_cr_arp_d_paging_btm_next_${page}?sortBy=${options.sortBy}&pageNumber=${page}&reviewerType=${options.reviewerType}&filterByStar=${options.filterByStar}&formatType=${options.formatType}&mediaType=${options.mediaType}`;
      let formData = new URLSearchParams({
        ...options,
        pageNumber: page,
        shouldAppend: "undefined",
        deviceType: "desktop",
        canShowIntHeader: "undefined",
        reftag: `cm_cr_arp_d_paging_btm_next_${page}`,
        pageSize: 10,
        asin: productId,
        scope: "reviewsAjax0",
      });
      try {
        console.log("Trying... with page " + page);
        const response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.text();
        const $ = cheerio.load(data);
        const infoSectionText = $('div[data-hook="cr-filter-info-section"]')
          .text()
          .trim();
        const reviewCountMatch = infoSectionText.match(/(\d+)\s+with reviews/);
        const reviewCount = reviewCountMatch
          ? parseInt(reviewCountMatch[1])
          : 0;

        console.log(`Page ${page} - Review Count: ${reviewCount}`);

        if (!reviewCount) {
          hasReviews = false;
        } else {
          const reviewListSpan = $('span[data-hook="review-body"]');
          reviewListSpan.each((index, element) => {
            const reviewText = $(element).text().trim();
            allReviews.push(reviewText);
            console.log(`Review ${allReviews.length}: ${reviewText}`);
          });
          page++; // Increment the page number for the next iteration
        }
      } catch (error) {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    }
  } catch (error) {
    console.log(error.message);
    return allReviews;
  }
  // write allReviews to a file

  return allReviews;
};

const productLink = process.argv[2];
if (!productLink) {
  console.error("Please provide a productLink as argument");
  process.exit(1);
}
const url = new URL(productLink);
const productId = url.pathname.match(/\/dp\/([^/]+)/i)[1];
console.log("🚀 ~ fetchData ~ productId:", productId);

let allReviews = [];

const headers = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-Language": "en-US,en;q=0.9,bn;q=0.8",
  "Cache-Control": "no-cache",
  Cookie:
    'aws_lang=en; AMCVS_7742037254C95E840A4C98A6%40AdobeOrg=1; aws-target-data=%7B%22support%22%3A%221%22%7D; s_cc=true; aws-mkto-trk=id%3A112-TZM-766%26token%3A_mch-aws.amazon.com-1708867318727-69378; aws-ubid-main=844-3068172-2410234; regStatus=registered; s_campaign=ps%7C14a4002d-4936-4343-8211-b5a150ca592b; s_eVar60=14a4002d-4936-4343-8211-b5a150ca592b; remember-account=true; aws-target-visitor-id=1708867318406-159558.45_0; s_sq=%5B%5BB%5D%5D; aws-userInfo=%7B%22arn%22%3A%22arn%3Aaws%3Asts%3A%3A334241658153%3Aassumed-role%2Fvoclabs%2Fuser3135881%5Cu003dmirmd16%40student.sust.edu%22%2C%22alias%22%3A%22334241658153%22%2C%22username%22%3A%22assumed-role%252Fvoclabs%252Fuser3135881%253Dmirmd16%2540student.sust.edu%22%2C%22keybase%22%3A%22WCSeuSWFQP7w7aTQUgilN25VPPvMCAeKDmlGd3icrg0%5Cu003d%22%2C%22issuer%22%3A%22https%3A%2F%2Flabs.vocareum.com%22%2C%22signinType%22%3A%22PUBLIC%22%7D; aws-userInfo-signed=eyJ0eXAiOiJKV1MiLCJrZXlSZWdpb24iOiJ1cy1lYXN0LTEiLCJhbGciOiJFUzM4NCIsImtpZCI6IjhhNjg0OThjLTYxZjEtNDMxNy04MmYxLTAxZDAwOTViYzFlMCJ9.eyJzdWIiOiIzMzQyNDE2NTgxNTMiLCJzaWduaW5UeXBlIjoiUFVCTElDIiwiaXNzIjoiaHR0cHM6XC9cL2xhYnMudm9jYXJldW0uY29tIiwia2V5YmFzZSI6IldDU2V1U1dGUVA3dzdhVFFVZ2lsTjI1VlBQdk1DQWVLRG1sR2QzaWNyZzA9IiwiYXJuIjoiYXJuOmF3czpzdHM6OjMzNDI0MTY1ODE1Mzphc3N1bWVkLXJvbGVcL3ZvY2xhYnNcL3VzZXIzMTM1ODgxPW1pcm1kMTZAc3R1ZGVudC5zdXN0LmVkdSIsInVzZXJuYW1lIjoiYXNzdW1lZC1yb2xlJTJGdm9jbGFicyUyRnVzZXIzMTM1ODgxJTNEbWlybWQxNiU0MHN0dWRlbnQuc3VzdC5lZHUifQ.T5gN_TNhCPTpmBX8cD6gLEHXMKywU33aqCFE3_SdP-6JLXm6SkBUpUIx2NLlq-PefTSprSLcIDM-R04WNzos9VmPz81hfZxTS8qsruQJp0OydItqAiUuMz1KwwiiVviO; AMCV_7742037254C95E840A4C98A6%40AdobeOrg=1585540135%7CMCIDTS%7C19919%7CMCMID%7C50457486043274755702160118452926247427%7CMCAAMLH-1717692803%7C9%7CMCAAMB-1720939397%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1720947227s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C4.4.0; session-id=132-0085167-6880050; session-id-time=2082787201l; i18n-prefs=USD; skin=noskin; ubid-main=133-7782095-3103146; lc-main=en_US; sp-cdn="L5Z9:NL"; appstore-devportal-locale=en_US; session-token=975gGDPcPgNlJqxUXKoS8F14d+M7F5fKzxmjp3Ole06xJJ40y1weqp7FucqvVB+x2SPo7/asNldNboWcwJL0K4R7+ju6ZxAQ2BnfALmgJ8J6/fbSPMLr98DbA6tP0qZNHFqERYRC0FoB8ZEdaoqdeD7Nr66eVSsiwWGyj2SuBEaIz2G+s42RS9DE6rqYzHYW29B3h8Y7B/ZRXH5UtsFloZmVuA+aA6AkyGZBNc45qdkXqTgw/yXmYykjxuIatmmvkw+v+fycOLdFCoo5egwt15L4X0Wwl9zQTrC9maqqot1+Wum664iZ6Um9eBbnrjdHpwPw/CFHtfT8Vhz4IdmAtJrsKRzX7X; csm-hit=adb:adblk_yes&t:1721922135391&tb:SC70NGP1GR987XWHEX0T+s-4Z9W0F5T4YP3G7XB70NM|1721922135391',
  "Device-Memory": "8",
  Downlink: "0.75",
  Dpr: "1",
  Ect: "3g",
  Pragma: "no-cache",
  Priority: "u=0, i",
  Rtt: "850",
  "Sec-Ch-Device-Memory": "8",
  "Sec-Ch-Dpr": "1",
  "Sec-Ch-Ua":
    '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Linux"',
  "Sec-Ch-Viewport-Width": "158",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Viewport-Width": "158",
};

let options = {
  sortBy: "helpful",
  reviewerType: "all_reviews",
  formatType: "all_formats",
  mediaType: "all_contents",
  filterByStar: "all_stars",
  filterByAge: "",
};

let reviews = [];
reviews = await fetchData(headers, productId, options);
allReviews = [...allReviews, ...reviews];
console.log("🚀 ~ allReviews-length:", allReviews.length);

await new Promise((resolve) => setTimeout(resolve, 30000));

options = {
  ...options,
  sortBy: "recent",
};

reviews = await fetchData(headers, productId, options);
// Create a Set to track existing reviews
const existingReviewsSet = new Set(allReviews);

// Check for unique reviews and add them to allReviews
for (const review of reviews) {
  if (!existingReviewsSet.has(review)) {
    allReviews.push(review);
    existingReviewsSet.add(review); // Add the new review to the Set
  }
}

console.log("🚀 ~ allReviews-length after recent fetch:", allReviews.length);

fs.writeFile("reviews.txt", allReviews.join("\n"), (err) => {
  if (err) {
    console.error("Failed to write reviews to file:", err);
  } else {
    console.log("Reviews written to file successfully.");
  }
});

// i have formData options given below:
// sortBy: helpful, recent
// reviewerType: avp_only_reviews, all_reviews
// filterByStar=five_star,four_star,three_star,two_star,one_star,positive,critical,all_stars
// formatType=current_format,all_formats
// mediaType=media_reviews_only,all_contents
