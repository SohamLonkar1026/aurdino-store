#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'parking.db');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

console.log('Setting up parking system database...');

// Create database and run schema
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database');
});

// Read and execute schema
const schema = readFileSync(SCHEMA_PATH, 'utf8');
const statements = schema.split(';').filter(stmt => stmt.trim());

// Execute statements sequentially to handle dependencies
async function executeStatements() {
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
            try {
                await new Promise((resolve, reject) => {
                    db.run(statement, (err) => {
                        if (err) {
                            console.error(`Error executing statement ${i + 1}:`, err.message);
                            console.error('Statement:', statement);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            } catch (err) {
                // Continue with other statements even if one fails
                continue;
            }
        }
    }
    
    console.log('Database setup completed successfully!');
    console.log(`Database created at: ${DB_PATH}`);
    
    // Verify setup by counting records
    db.get("SELECT COUNT(*) as count FROM vehicles", (err, row) => {
        if (!err) {
            console.log(`Sample vehicles loaded: ${row.count}`);
        }
        db.close();
    });
}

executeStatements();