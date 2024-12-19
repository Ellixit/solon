const { MongoClient } = require('mongodb');
const fs = require('fs');

// Replace with the path to your GeoJSON file
const geojsonFilePath = '/home/patrick/school/SB-416/cavaliers-416-jeffrey-do-not-commit-node-modules/client/public/geojson/ct-features.geojson';

// MongoDB connection URI
const uri = 'mongodb://localhost:27017';

// Database and Collection names
const dbName = 'solon';
const collectionName = 'geoData';

// Read the GeoJSON file and parse it
const geojson = JSON.parse(fs.readFileSync(geojsonFilePath, 'utf-8'));
console.log(geojson);

// Main function to insert the data
async function insertGeoJSON() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        // Insert GeoJSON features into the collection
        const result = await collection.insertMany(geojson);
        
        console.log(`${result.insertedCount} documents were inserted.`);
    } catch (err) {
        console.error('Error inserting GeoJSON data:', err);
    } finally {
        // Close the connection
        await client.close();
        console.log('Connection closed');
    }
}

// Run the insert function
insertGeoJSON();
