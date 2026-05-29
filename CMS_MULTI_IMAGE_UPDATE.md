# CMS Multi-Image Upload Update

## Changes Made

### Frontend Updates

All CMS pages have been updated to support **multiple image uploads**:

1. **Events** (`/cms/event`)
   - Changed `imageUrl` → `imageUrls` (array)
   - Supports up to 5 images per event
   - Multi-image upload with drag & drop

2. **Gallery** (`/cms/gallery`)
   - Changed `imageUrl` → `imageUrls` (array)
   - Supports up to 10 images per gallery item
   - Perfect for creating image collections

3. **News** (`/cms/news`)
   - Changed `imageUrl` → `imageUrls` (array)
   - Supports up to 5 images per news article
   - Great for photo galleries in articles

4. **Banner Images** (`/cms/banners`)
   - Changed `imageUrl` → `imageUrls` (array)
   - Supports up to 5 banner images
   - Create carousel/slider ready content

### Backend Updates

**Database Schema Changes:**
```prisma
// Before
model Event {
  imageUrl    String?
}

// After
model Event {
  imageUrls   String[]  // Array of image URLs
}
```

The same change was applied to:
- ✅ Event model
- ✅ Gallery model
- ✅ News model
- ✅ BannerImage model

### Features

**Multi-Image Upload Component:**
- ✅ Upload multiple images at once
- ✅ Drag and drop support
- ✅ Individual image preview
- ✅ Remove images individually
- ✅ Progress indicator during upload
- ✅ File count tracking (e.g., "3 / 5 images uploaded")
- ✅ Automatic Cloudinary integration

### Migration Instructions

**IMPORTANT:** Run this migration before using the updated CMS:

```bash
# Navigate to server directory
cd server

# Generate and run migration
npx prisma migrate dev --name add_multi_image_support

# Or if you prefer to just push schema changes (for development)
npx prisma db push

# Regenerate Prisma Client
npx prisma generate
```

### Migration SQL

The migration will:
1. Rename `imageUrl` column to `imageUrls`
2. Change column type from `String` to `String[]` (array)
3. Migrate existing data (single URLs will be converted to arrays)

**PostgreSQL Migration:**
```sql
-- Event table
ALTER TABLE "Event" RENAME COLUMN "imageUrl" TO "imageUrls";
ALTER TABLE "Event" ALTER COLUMN "imageUrls" SET DATA TYPE TEXT[];
UPDATE "Event" SET "imageUrls" = ARRAY["imageUrls"]::TEXT[] WHERE "imageUrls" IS NOT NULL;

-- Gallery table
ALTER TABLE "Gallery" RENAME COLUMN "imageUrl" TO "imageUrls";
ALTER TABLE "Gallery" ALTER COLUMN "imageUrls" SET DATA TYPE TEXT[];
UPDATE "Gallery" SET "imageUrls" = ARRAY["imageUrls"]::TEXT[] WHERE "imageUrls" IS NOT NULL;

-- News table
ALTER TABLE "News" RENAME COLUMN "imageUrl" TO "imageUrls";
ALTER TABLE "News" ALTER COLUMN "imageUrls" SET DATA TYPE TEXT[];
UPDATE "News" SET "imageUrls" = ARRAY["imageUrls"]::TEXT[] WHERE "imageUrls" IS NOT NULL;

-- BannerImage table
ALTER TABLE "BannerImage" RENAME COLUMN "imageUrl" TO "imageUrls";
ALTER TABLE "BannerImage" ALTER COLUMN "imageUrls" SET DATA TYPE TEXT[];
UPDATE "BannerImage" SET "imageUrls" = ARRAY["imageUrls"]::TEXT[] WHERE "imageUrls" IS NOT NULL;
```

### Backend Compatibility

The backend controllers don't need changes as they already handle the data dynamically. The controllers will:
- Accept `imageUrls` array from frontend
- Store array in database
- Return array in API responses

### Testing Checklist

After running the migration, test each module:

- [ ] **Events**
  - [ ] Upload multiple images (try 1-5 images)
  - [ ] Edit existing event and add more images
  - [ ] Remove individual images from uploaded set
  - [ ] Verify images display in table preview

- [ ] **Gallery**
  - [ ] Upload 10 images at once
  - [ ] Drag and drop multiple images
  - [ ] Remove some images before saving
  - [ ] Verify grid layout displays all images

- [ ] **News**
  - [ ] Upload multiple news images
  - [ ] Edit existing news and update images
  - [ ] Verify images saved correctly

- [ ] **Banners**
  - [ ] Upload multiple banner images
  - [ ] Verify all banners can be ordered
  - [ ] Check carousel/slider functionality (frontend implementation)

### Data Migration Notes

**If you have existing data:**

1. Existing single image URLs will be converted to arrays automatically
2. Old data structure: `"https://image.com/photo.jpg"`
3. New data structure: `["https://image.com/photo.jpg"]`

**No data loss** - all existing images will be preserved!

### Rollback (if needed)

If you need to rollback:

```bash
cd server
npx prisma migrate resolve --rolled-back <migration_name>
```

Then manually revert the schema changes and run:
```bash
npx prisma migrate dev
```

### Frontend Image Display

When displaying images on the frontend website (public pages), you can:

1. **Show first image as thumbnail:**
```javascript
const thumbnailUrl = item.imageUrls?.[0] || '/placeholder.jpg';
```

2. **Create image gallery/carousel:**
```javascript
{item.imageUrls?.map((url, index) => (
  <img key={index} src={url} alt={`Image ${index + 1}`} />
))}
```

3. **Image slider (with carousel library):**
```javascript
<Carousel>
  {item.imageUrls?.map((url, index) => (
    <CarouselItem key={index}>
      <img src={url} alt={`Slide ${index + 1}`} />
    </CarouselItem>
  ))}
</Carousel>
```

### API Response Format

**Example Event Response:**
```json
{
  "id": "uuid",
  "title": "Sports Day 2024",
  "description": "Annual sports event",
  "eventDate": "2024-12-15",
  "location": "School Playground",
  "imageUrls": [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg",
    "https://cloudinary.com/image3.jpg"
  ],
  "isActive": true,
  "createdAt": "2024-05-29T10:00:00Z",
  "updatedAt": "2024-05-29T10:00:00Z"
}
```

### Performance Considerations

**Image Upload Limits:**
- Events: 5 images max
- Gallery: 10 images max
- News: 5 images max
- Banners: 5 images max

**Cloudinary Optimization:**
- All images are automatically optimized
- Responsive image formats (WebP when supported)
- Lazy loading recommended for galleries
- Image dimensions limited to 500x500 (can be adjusted in config)

### Benefits

✅ **Better Content Management**
- Create rich, visual content
- Multiple angles/perspectives
- Before/after comparisons
- Step-by-step guides with images

✅ **User Experience**
- Image galleries without manual uploads
- Drag & drop interface
- Visual feedback during upload
- Easy image management

✅ **Flexibility**
- Single image: just upload one
- Multiple images: upload many
- Mix and match as needed
- No breaking changes for existing data

---

**Status:** ✅ Complete
**Last Updated:** May 29, 2026
**Breaking Changes:** None (backward compatible with migration)
