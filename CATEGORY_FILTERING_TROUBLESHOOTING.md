# Category Filtering Troubleshooting Guide

## Issue
When clicking on a category from "Shop by Category", all products are shown instead of only products from that specific category.

## Root Cause
This happens when products in the database don't have the correct `category_id` assigned, or the `category_id` is NULL.

## How to Diagnose

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Click on a category
4. Look for these log messages:
   ```
   Fetching products for category: [Category Name] with ID: [UUID]
   Found products: [Number]
   ```

### Step 2: Check the Page
Look at the category page - it now shows:
```
[X] products found
```

If it shows "0 products found" but you see products, those products don't belong to that category.

### Step 3: Check Database
Run the diagnostic SQL queries in `check_category_products.sql`:

1. **List all categories:**
   ```sql
   SELECT id, name, slug FROM categories ORDER BY name;
   ```

2. **Count products per category:**
   ```sql
   SELECT 
       c.name as category_name,
       COUNT(p.id) as product_count
   FROM categories c
   LEFT JOIN products p ON p.category_id = c.id
   GROUP BY c.id, c.name
   ORDER BY c.name;
   ```

3. **Find products without categories:**
   ```sql
   SELECT id, title, category_id
   FROM products
   WHERE category_id IS NULL;
   ```

## How to Fix

### Option 1: Using SQL (Recommended)

1. **Get your category IDs:**
   ```sql
   SELECT id, name, slug FROM categories ORDER BY name;
   ```

2. **Assign products to categories based on title:**
   ```sql
   -- Earrings
   UPDATE products 
   SET category_id = 'YOUR_EARRINGS_CATEGORY_ID'
   WHERE LOWER(title) LIKE '%earring%';

   -- Rings
   UPDATE products 
   SET category_id = 'YOUR_RINGS_CATEGORY_ID'
   WHERE LOWER(title) LIKE '%ring%' 
   AND LOWER(title) NOT LIKE '%earring%';

   -- Necklaces
   UPDATE products 
   SET category_id = 'YOUR_NECKLACES_CATEGORY_ID'
   WHERE LOWER(title) LIKE '%necklace%';

   -- Bracelets
   UPDATE products 
   SET category_id = 'YOUR_BRACELETS_CATEGORY_ID'
   WHERE LOWER(title) LIKE '%bracelet%';
   ```

3. **Verify the fix:**
   ```sql
   SELECT 
       c.name as category_name,
       COUNT(p.id) as product_count
   FROM categories c
   LEFT JOIN products p ON p.category_id = c.id
   GROUP BY c.id, c.name
   ORDER BY c.name;
   ```

### Option 2: Using Admin Panel

If you have an admin panel for managing products:

1. Go to Admin → Products
2. Edit each product
3. Assign the correct category
4. Save

### Option 3: Manual Assignment

For specific products:
```sql
UPDATE products 
SET category_id = 'CATEGORY_ID_HERE'
WHERE id = 'PRODUCT_ID_HERE';
```

For multiple products:
```sql
UPDATE products 
SET category_id = 'CATEGORY_ID_HERE'
WHERE id IN ('PRODUCT_ID_1', 'PRODUCT_ID_2', 'PRODUCT_ID_3');
```

## Database Schema Check

Make sure your database has the correct structure:

### Categories Table:
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Products Table:
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    -- other fields...
);
```

### Foreign Key Constraint:
```sql
ALTER TABLE products
ADD CONSTRAINT products_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES categories(id)
ON DELETE SET NULL;
```

## Testing After Fix

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Refresh the page** (Ctrl+F5)
3. **Click on a category** from "Shop by Category"
4. **Check the console** for the log messages
5. **Verify the product count** matches what you expect
6. **Check that only products from that category** are displayed

## Expected Behavior

### When clicking "Earrings":
- URL: `/collections/earrings`
- Console: `Fetching products for category: Earrings with ID: [UUID]`
- Console: `Found products: [X]`
- Page shows: "[X] products found"
- Only earring products are displayed

### When clicking "Rings":
- URL: `/collections/rings`
- Console: `Fetching products for category: Rings with ID: [UUID]`
- Console: `Found products: [X]`
- Page shows: "[X] products found"
- Only ring products are displayed

## Common Issues

### Issue 1: Products show "0 products found" but products appear
**Cause:** Products don't have `category_id` set
**Fix:** Assign products to categories using SQL

### Issue 2: Wrong products appear in category
**Cause:** Products have wrong `category_id`
**Fix:** Update products with correct `category_id`

### Issue 3: Category page shows 404
**Cause:** Category slug doesn't match URL
**Fix:** Check category slugs in database match the URLs

### Issue 4: All products appear in every category
**Cause:** Products have NULL `category_id`
**Fix:** Assign all products to appropriate categories

## Files Modified

- `src/app/collections/[slug]/page.tsx` - Added console logs and product count display

## SQL Files Created

- `check_category_products.sql` - Diagnostic queries
- `fix_category_assignments.sql` - Fix queries with examples

## Next Steps

1. Run `check_category_products.sql` to diagnose
2. Use `fix_category_assignments.sql` to fix assignments
3. Test each category to verify it works
4. Remove console.log statements once fixed (optional)

## Support

If products still don't filter correctly after following this guide:

1. Check that `category_id` in products table matches `id` in categories table
2. Verify the foreign key constraint exists
3. Check for any RLS (Row Level Security) policies that might interfere
4. Ensure the Supabase client has proper permissions

The category filtering should work correctly once all products have valid `category_id` values assigned!
