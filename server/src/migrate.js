import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.ts'; 

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runMigration() {
    try {
        console.log("Generating database...")

        // Read the file
        const sqlPath = path.join(__dirname,'migrations/001_init.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        // Query a database creation
        await db.query(sql)

        process.exit(0)
    }
    catch (e) {
        console.error("Migration failed!",e)
        process.exit(1)
    }
}

runMigration()