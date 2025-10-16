import fs from "fs/promises";

const createHTML = async (pageNumber, code) => {
  try {
    const dirPath = `./output/gen-${pageNumber}`;
    await fs.mkdir(dirPath, {
      recursive: true,
    });
    await fs.writeFile(`${dirPath}/index.html`, code);
    return `${dirPath}/index.html`;
  } catch (error) {
    console.log("Error in creating HTML file:", error);
    return null;
  }
};
export { createHTML };
