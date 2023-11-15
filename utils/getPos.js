const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const apikey = process.env.YANDEX_API_KEY;
const axios = require("axios");
module.exports = async (location) => {
  return await axios
    .get(
      `https://geocode-maps.yandex.ru/1.x/?apikey=${apikey}&geocode=${location}&format=json`
    )
    .then((res) =>
      res.data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos
        .split(" ")
        .reverse()
    );
};
