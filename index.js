const request = require('request');
const cheerio = require('cheerio');

const pttCrawler = () => {
  request(
    {
      url: 'https://www.foodpanda.com.tw/restaurants/new?lat=22.6394924&lng=120.302583&vertical=restaurants',
      method: 'GET',
    },
    (error, res, body) => {
      // 如果有錯誤訊息，或沒有 body(內容)，就 return
      if (error || !body) {
        console.log(error);
        return;
      }

      const data = [];
      const $ = cheerio.load(body); // 載入 body
      const list = $('.vendor-lane .vendor-tile');
      for (let i = 0; i < list.length; i++) {
        const title = list.eq(i).find('.name  span').text();
        const author = list.eq(i).find('.meta .author').text();
        const date = list.eq(i).find('.meta .date').text();
        const link = list.eq(i).find('.title a').attr('href');

        data.push({ title, author, date, link });
      }

      console.log(data);
    }
  );
};

pttCrawler();
