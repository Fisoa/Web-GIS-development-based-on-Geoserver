const GeoTIFF = require('geotiff');
const fs = require('fs');

async function saveUpdatedTiff(updatedRaster, originalImage, outputPath) {
  const geoKeys = originalImage.getGeoKeys();
  const origin = originalImage.getOrigin();

  const tiff = GeoTIFF.write({
    values: updatedRaster,
    width: originalImage.getWidth(),
    height: originalImage.getHeight(),
    geoKeys,
    origin,
  });

  fs.writeFileSync(outputPath, tiff);
}

module.exports = { saveUpdatedTiff };
