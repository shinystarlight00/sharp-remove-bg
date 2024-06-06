const sharp = require("sharp");

async function removeBackground(inputPath, outputPath) {
  try {
    // Read the image
    const image = sharp(inputPath);

    // Get metadata
    const { width, height } = await image.metadata();

    // Extract raw pixel data
    const { data: buffer, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Determine the background color (assuming top-left corner pixel)
    const backgroundColor = {
      r: buffer[0],
      g: buffer[1],
      b: buffer[2],
    };

    // Tolerance for background color matching
    const tolerance = 30;

    // Create a new buffer with alpha channel
    const newBuffer = Buffer.alloc(info.size * 4);

    for (let i = 0; i < info.size; i++) {
      const r = buffer[i * 3];
      const g = buffer[i * 3 + 1];
      const b = buffer[i * 3 + 2];

      // Check if the pixel color matches the background color
      if (
        Math.abs(r - backgroundColor.r) < tolerance &&
        Math.abs(g - backgroundColor.g) < tolerance &&
        Math.abs(b - backgroundColor.b) < tolerance
      ) {
        newBuffer[i * 4 + 3] = 0; // Set alpha to 0 (transparent)
      } else {
        newBuffer[i * 4] = r;
        newBuffer[i * 4 + 1] = g;
        newBuffer[i * 4 + 2] = b;
        newBuffer[i * 4 + 3] = 255; // Set alpha to 255 (opaque)
      }
    }

    // Create a new image with transparency
    await sharp(newBuffer, { raw: { width, height, channels: 4 } }).toFile(
      outputPath
    );

    console.log("Background removed successfully");
  } catch (error) {
    console.error("Error removing background:", error);
  }
}

// Example usage
const inputImagePath = "input.jpg"; // Replace with your input image path
const outputImagePath = "output.png"; // Replace with your desired output path
removeBackground(inputImagePath, outputImagePath);
