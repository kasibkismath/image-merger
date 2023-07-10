import mergeImg, { MergeImgResult } from "merge-img";
import { promises as fs } from "fs";
import { join } from "path";
import axios, { AxiosResponse } from "axios";
import loadConfigs from "./configs/utils/config-loader";

const configs = loadConfigs();

const {
  baseUrl,
  file,
  imageDefaults: { greetings, who, width, height, color, size },
} = configs;

interface Image {
  src: Buffer;
  x: number;
  y: number;
}

async function fetchImages(urls: string[]): Promise<Image[]> {
  try {
    const responses: AxiosResponse<Buffer>[] = await Promise.all(
      urls.map(async (url) => {
        const response = await axios.get<Buffer>(url, {
          responseType: "arraybuffer",
        });
        return response;
      })
    );

    const images = responses.map((response) => {
      return { src: Buffer.from(response.data), x: 0, y: 0 };
    });

    return images;
  } catch (error) {
    console.error("Error occurred while fetching the images : ", error);
  }
}

async function mergeImages(urls: string[]): Promise<MergeImgResult> {
  try {
    const image: MergeImgResult = await mergeImg(await fetchImages(urls));
    return image;
  } catch (error) {
    console.error("Error occurred while merging images : ", error);
  }
}

async function saveImageToDisk(urls: string[]): Promise<void> {
  try {
    const image: MergeImgResult = await mergeImages(urls);
    const buffer: Buffer = await new Promise<Buffer>((resolve, reject) => {
      image.getBuffer("image/jpeg", (err: Error | null, buffer: Buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });

    const fileOut: string = join(
      process.cwd(),
      `${file.name}.${file.extension}`
    );
    await fs.writeFile(fileOut, buffer);
    console.log("The file was saved!");
  } catch (error) {
    console.error(
      "Error occurred while saving to the image to the disk : ",
      error
    );
  }
}

async function fetchMergeSaveImage() {
  try {
    const urls: string[] = [
      `${baseUrl}/${greetings}?width=${width}&height=${height}&color=${color}&s=${size}`,
      `${baseUrl}/${who}?width=${width}&height=${height}&color=${color}&s=${size}`,
    ];
    await saveImageToDisk(urls);
  } catch (error) {
    console.error("Error occurred : ", error);
  }
}

fetchMergeSaveImage();
