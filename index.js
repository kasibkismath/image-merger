const { writeFile } = require("fs");
const { join } = require("path");
const request = require("request-promise"); // used request promise to use promises without having to use another promisify lib
const mergeImg = require("merge-img");
const argv = require("minimist")(process.argv.slice(2));
const configs = require("./configs");

const {
  baseUrl,
  imageDefaults: {
    greetings: greetingsFallback,
    who: whoFallback,
    width: widthFallback,
    height: heightFallback,
    color: colorFallback,
    size: sizeFallback,
  },
} = configs;

let {
  greetings = greetingsFallback,
  who = whoFallback,
  width = widthFallback,
  height = heightFallback,
  color = colorFallback,
  size = sizeFallback,
} = argv;

// sets to default value if the env args are empty
greetings = greetings || greetingsFallback;
who = who || whoFallback;
width = Number(width) || widthFallback;
height = Number(height) || heightFallback;
color = color || colorFallback;
size = Number(size) || sizeFallback;

async function mergeImages() {
  const images = [];
  try {
    const urls = [
      `${baseUrl}/${greetings}?width=${width}&height=${height}&color=${color}&s=${size}`,
      `${baseUrl}/${who}?width=${width}&height=${height}&color=${color}&s=${size}`,
    ];

    const requests = urls.map((url) => request({ uri: url, encoding: null }));
    const responses = await Promise.all(requests);

    responses.forEach((image) => {
      images.push({ src: image, x: 0, y: 0 });
    });

    mergeImg(images).then((img) => {
      img.getBuffer("image/jpeg", (err, buffer) => {
        if (err) {
          console.error(err);
          return;
        }
        const fileOut = join(process.cwd(), "cat-card.jpg");
        writeFile(fileOut, buffer, (writeErr) => {
          if (writeErr) {
            console.error(writeErr);
            return;
          }
          console.log("The file was saved!");
        });
      });
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

mergeImages();
