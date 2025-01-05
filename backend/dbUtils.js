const { Client } = require('pg');

async function saveToDatabase(config, geoJson, overlap) {
  const client = new Client(config);
  await client.connect();

  const insertQuery = `
    INSERT INTO processed_polygons (geometry, overlap_area)
    VALUES (ST_GeomFromGeoJSON($1), $2)
  `;

  const overlapArea = JSON.stringify(overlap);
  await client.query(insertQuery, [JSON.stringify(geoJson), overlapArea]);

  await client.end();
}

module.exports = { saveToDatabase };
