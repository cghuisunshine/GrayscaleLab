const fs = require("fs/promises");
const { createWriteStream } = require('fs'); 
const PNG = require("pngjs").PNG;
const path = require("path");

const yauzl = require('yauzl-promise');
const {pipeline} = require("stream/promises");


/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = async (pathIn, pathOut) => {
  const zip = await yauzl.open(pathIn);


  try {
      await fs.access(pathOut);
    } catch {
        await fs.mkdir(pathOut, { recursive: true });
    }



  try {
    for await (const entry of zip) {
      if (entry.filename.endsWith('.png') && !entry.filename.includes('/'))  {

        const fullName = path.join(pathOut, entry.filename);
        const readStream = await entry.openReadStream();
        const writeStream = createWriteStream(fullName);
        console.log(fullName);
        await pipeline(readStream, writeStream);
      } 
    }

    return "Extraction operation complete";
  } 
  catch (error) {
      throw error;
  }
  finally {
    await zip.close();
  }
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = async (dir) => {

    try {
      let files = await fs.readdir(dir, { withFileTypes: true }); 
      files = files.filter(file => file.isFile())
                .map(file => path.join(dir, file.name));

      return files;

    } catch(error) {
      console.log("Error reading directory:", error);
      throw(error);
    }

};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */



const parsePng = (buffer) => {
    return new Promise((resolve, reject) => {
        new PNG().parse(buffer, (error, data) => {
            if (error) reject(error);
            else resolve(data);
        });
    });
};

const grayScale = async (pathIn, pathOut) => {
    try {
       
        const data = await fs.readFile(pathIn);

        
        const png = await parsePng(data);

      
        const pixelData = png.data;
        for (let i = 0; i < pixelData.length; i += 4) {
            const r = pixelData[i];       
            const g = pixelData[i + 1];   
            const b = pixelData[i + 2];   
            
            const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

            
            pixelData[i] = gray;       
            pixelData[i + 1] = gray;   
            pixelData[i + 2] = gray;   
            
        }
      
        const outputStream = createWriteStream(pathOut);
        await pipeline(png.pack(), outputStream);

        console.log(`Grayscaled image saved to ${pathOut}`);
    } catch (error) {
        console.error(`Error processing the image: ${error.message}`);
    }
};



module.exports = {
  unzip,
  readDir,
  grayScale,
};
