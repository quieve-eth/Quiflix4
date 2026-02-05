# Filmmaker Film Hosting Workflow

## Overview

Quiflix uses a hybrid hosting model where filmmakers host their full film on external cloud services (Google Drive, Dropbox, etc.) while uploading trailers to Quiflix for distributor preview. This approach minimizes costs and maximizes filmmaker control over their content.

## Workflow Steps

### 1. Filmmaker Application (`/apply/filmmaker`)

When applying, filmmakers provide:
- **Film Hosting Link** - Public URL to their film on Google Drive, Dropbox, OneDrive, or custom hosting
- **Film Hosting Provider** - Selection of where the film is hosted
- **Selling Price (USD)** - Cost for buyers (e.g., $9.99)
- **Trailer URL** - Initial trailer link (can be updated later)

**Example Hosted Links:**
- Google Drive: `https://drive.google.com/file/d/1abc123def456/view`
- Dropbox: `https://www.dropbox.com/s/abc123def456/film.mp4?dl=0`
- Custom: Any publicly accessible URL

### 2. Application Review & Approval

When admin approves a filmmaker:
1. Film record created in database with hosting details
2. DDT pool of 500 tokens created for the film (initially held by Goodflix)
3. Filmmaker receives approval email with next steps

### 3. Filmmaker Dashboard (`/filmmaker-dashboard`)

After approval, filmmakers can:

#### Upload Trailer
- Click "Upload Trailer" on their film card
- Upload video file (MP4, WebM up to 500MB)
- Trailer stored on Vercel Blob storage
- Trailer URL updated in film record

#### Track Earnings
- See total sales revenue from all distributors
- View active distributors selling their film
- Monitor sales in real-time

#### Manage Films
- Update film details and pricing
- Edit hosted film link if needed
- View distributor performance metrics

### 4. Distributor Onboarding

When a distributor is approved for a film:
1. They receive approval email with personalized DDT link
2. DDT link includes:
   - Film trailer preview
   - Distributor's unique referral code
   - "Buy Now" button linking to filmmaker's hosted film
3. Distributor gets personalized link with their referral code embedded

### 5. Customer Purchase Flow

1. **Customer finds film** via distributor's marketing/link
2. **Watches trailer** on Quiflix distributor page
3. **Clicks "Buy Film"** button
4. **Redirected to filmmaker's hosted film** (Google Drive/Dropbox direct link)
5. **Purchase recorded** on Quiflix backend with distributor attribution
6. **Revenue split executed**:
   - Filmmaker: 70%
   - Distributor: 20%
   - Goodflix: 10%

### 6. Revenue Attribution & Payouts

**Sales Recording:**
- When "Buy" is clicked, `/api/sales/record-sale` is called with:
  - Film ID
  - Distributor ID (DDT holder)
  - Referral code
  - Price
  - Timestamp

**Automatic Payout:**
- Smart contract on Base blockchain records sale
- Revenue automatically split to:
  - Filmmaker wallet (70%)
  - Distributor wallet (20%)
  - Goodflix treasury (10%)
- Payments are instant on-chain

## File Structure

```
/app/apply/filmmaker/page.tsx          # Filmmaker application form
/app/filmmaker-dashboard/page.tsx      # Filmmaker management dashboard
/app/distributor/[id]/[filmId]/        # Distributor film page with trailer
/app/api/upload-trailer/route.ts       # Trailer upload endpoint
/app/api/sales/record-sale/route.ts    # Purchase attribution & revenue split
/scripts/003_add_film_links.sql        # Database schema for hosting fields
```

## Database Schema

### Films Table (Extensions)
```sql
-- Hosting fields
film_hosted_link TEXT          -- URL to hosted film (Google Drive, Dropbox, etc)
film_hosted_provider TEXT      -- 'google_drive', 'dropbox', 'onedrive', 'custom'
trailer_url TEXT               -- URL to trailer video
price_usd NUMERIC              -- Selling price
poster_url TEXT                -- Film poster image
```

### Trailers Table
```sql
id UUID PRIMARY KEY
film_id UUID REFERENCES films(id)
file_url TEXT                  -- Vercel Blob URL
file_size INT
duration_seconds INT
uploaded_by TEXT
storage_provider TEXT          -- 'vercel_blob'
file_key TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

## Revenue Split Logic

When purchase is made:
```
Total Sale: $9.99

Filmmaker (70%):     $6.99
Distributor (20%):   $1.99
Goodflix (10%):      $1.00
```

Each party receives their share instantly via smart contract on Base blockchain.

## Security Considerations

1. **Filmmaker Hosted Link**
   - Must be publicly accessible
   - Filmmakers responsible for sharing/revoking access
   - Quiflix never downloads or stores full film

2. **Trailer Storage**
   - Stored on Vercel Blob (secure CDN)
   - Public access for distributor preview
   - Filmmaker can replace anytime

3. **Purchase Attribution**
   - Distributor referral code embedded in link
   - Purchase recorded when redirect clicked
   - Prevents fraud via referral tracking

## Best Practices for Filmmakers

1. **Hosting Setup**
   - Use Google Drive, Dropbox, or OneDrive for reliability
   - Keep link active and accessible throughout distribution period
   - Use sharing settings to make link publicly accessible
   - Do NOT share direct download link in application (use viewer URL)

2. **Pricing**
   - Research competitive pricing: $4.99 - $19.99 typical range
   - Consider film length, production value, distribution scope
   - Can adjust price by updating application

3. **Trailer Quality**
   - 1-3 minutes optimal length
   - 1080p or 4K resolution recommended
   - MP4 format for broad compatibility
   - File size under 500MB for fast upload

4. **Marketing**
   - Share distributor links across social media
   - Include film summary and key visuals
   - Target relevant film communities
   - Track which distributors drive most sales

## Troubleshooting

### Hosted Link Not Working
- Verify link is publicly accessible (not restricted to email domain)
- Test link in incognito mode
- Check Google Drive/Dropbox sharing settings
- Use viewer link, not editor link

### Trailer Not Playing
- Ensure video format is MP4 or WebM
- Check file is under 500MB
- Verify upload completed (no interruptions)
- Try re-uploading if still failing

### Sales Not Recording
- Confirm purchase button was clicked
- Check referral code is present in URL
- Verify distributor DDT assignment completed
- Check smart contract deployment on Base

## Future Enhancements

- IPFS hosting for decentralized film storage
- Automatic Google Drive/Dropbox integration via OAuth
- Multi-format support (4K, HDR, different codecs)
- Geographic delivery restrictions
- Exclusive distribution windows per distributor
