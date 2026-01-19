# Backfill Mechanic Performance Data

This script will populate the `mechanic_performance` table with data from existing transactions that have mechanics assigned.

## How to Run

1. Open your browser console (F12 → Console tab)
2. Go to http://localhost:3000/api/backfill-mechanic-performance
3. Wait for the script to complete
4. Check the console for results

OR use the button below if you create a UI page for it.

## What it does

- Finds all transactions with mechanics assigned
- Calculates commissions for each mechanic
- Inserts records into `mechanic_performance` table
- Skips transactions that already have performance records
