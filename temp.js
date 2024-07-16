// write a program to fetch data from an api and show it as json
const prisma = require("./prisma/index.ts");

// take a productLink as input

(async () => {
  const productLink = process.argv[2];
  if (!productLink) {
    console.error("Please provide a productLink as argument");
    process.exit(1);
  }
  const url = new URL(productLink);
  let productId = url.pathname.split("/")[2];
  productId = productId.replace(".html", "");
  console.log("🚀 ~ productId:", productId);
  let response = await fetch(
    `https://feedback.aliexpress.com/pc/searchEvaluation.do?productId=${productId}&pageSize=1`
  );
  let { data } = await response.json();
  console.log(data.totalNum);
  console.log(data.productEvaluationStatistic.evarageStar);
  const averageStar = parseFloat(data.productEvaluationStatistic.evarageStar);
  const reviews = [];
  let pageNumber = 1;
  const totalReviews = data.totalNum;
  let currentReviews = 0;
  do {
    response = await fetch(
      `https://feedback.aliexpress.com/pc/searchEvaluation.do?productId=${productId}&page=${pageNumber}`
    );
    data = await response.json();
    // console.log(data.data.evaViewList[0].buyerFeedback);
    reviews.push(
      ...data.data.evaViewList
        .filter((review) => review.buyerFeedback !== undefined)
        .map((review) => review.buyerFeedback)
    );
    pageNumber++;
    currentReviews += 20;
  } while (currentReviews < totalReviews);

  response = await fetch(
    `https://www.aliexpress.com/aeglodetailweb/api/seo/seodata?productId=${productId}&channel=detail&device=pc`,
    {
      headers: {
        authority: "www.aliexpress.com",
        method: "GET",
        path: `/aeglodetailweb/api/seo/seodata?productId=${productId}&subject=${encodeURIComponent(
          data.subject
        )}&channel=detail&device=pc`,
        scheme: "https",
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9,bn;q=0.8",
        "bx-v": "2.5.13",
        cookie: `ali_apache_id=33.1.91.130.172062708646.511361.4; intl_locale=en_US; acs_usuc_t=x_csrf=16q5fkr_bhdds&acs_rt=a7434e7b769a43a9a89fa326015bbfe9; lwrid=AgGQnV3kEdfpxq9fckRy2RpuI%2BYr; join_status=; ali_apache_track=; ali_apache_tracktmp=; e_id=pt100; cna=rZ0VHxYVj0oCAWdML84ZYXde; XSRF-TOKEN=e5ef2521-bfec-41dd-b794-4b0e9d6d471d; lzd_cid=9160782c-bc85-4218-b73c-a47a2a5c197b; AB_DATA_TRACK=569528_743703.472051_617388; AB_ALG=; AB_STG=st_SE_1719820173540%23stg_2592%2Cst_StrategyExp_1694492533501%23stg_687; x_source=aliexpress_detailpage; xman_us_t=x_lid=bd2705678079tifae&sign=y&rmb_pp=tahmidkabiraddin@gmail.com&x_user=PX/rs7rIX46ctMDih64wLO+wB1/9b49wF4/8h5obPhk=&ctoken=262z569q0ign&l_source=aliexpress; sgcookie=E100HWsjXf4rBSeDBXhMxGvd8pTMnrSPn8OibHNUvjDW0GyGi2L5P6SctkI3mf5s+bz3UbJ1OhXz3zU8zN7onktzVHOucRYOeCoVLFUZfHfwbAw=; aep_common_f=site=glo&c_tp=BDT&x_alimid=4307485057&re_sns=google&isb=y&region=BD&b_locale=en_US&ae_u_p_s=2`,
        priority: "u=1, i",
        referer: `https://www.aliexpress.com/item/${productId}.html`,
        "sec-ch-ua":
          '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
    }
  );
  data = await response.json();
  console.log(JSON.stringify(data.body.title, null, 2));
  console.log(JSON.stringify(data.body.description, null, 2));
  const title = data.body.title;
  const description = data.body.description;

  // Create a product with reviews in Prisma
  const product = await prisma.product.create({
    data: {
      title,
      description,
      itemId: productId,
      averageStar,
      reviews: {
        create: reviews.map((content) => ({ content: content })),
      },
    },
    include: { reviews: true },
  });
  // console.log(product);
})();
