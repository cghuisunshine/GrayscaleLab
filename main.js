const path = require("path");

const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");

const  main = async () => {

    try{

       await IOhandler.unzip(zipFilePath, pathUnzipped);

       let files = await IOhandler.readDir(pathUnzipped);
        files.forEach(async inputFilename => {

            const baseName = path.basename(inputFilename);
            const outputFilename = path.join(pathProcessed, baseName);

            await IOhandler.grayScale(inputFilename, outputFilename);
            
        });

        console.log(`Grayscaled images saved to ${pathProcessed}`);

    }
    catch(error) {
        console.error(`Error processing the image: ${error.message}`);
    }
    
};

main();