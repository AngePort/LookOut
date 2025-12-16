# Quick Start: Adding Social Media Events

## TL;DR - Best Approach

**Recommendation**: Add Eventbrite for 2-3x more events with minimal effort.

### Why Eventbrite?

- ✅ **Best for social events**: Community gatherings, meetups, workshops
- ✅ **Easy integration**: Very similar to Ticketmaster
- ✅ **Free**: 1,000 requests/day (more than enough)
- ✅ **No credit card**: Free tier doesn't require payment method
- ✅ **Great coverage**: Popular for grassroots/social events

### Alternative Sources Comparison

| Source | Best For | Free Tier | Ease | Social Focus |
|--------|----------|-----------|------|--------------|
| **Eventbrite** | Community events, workshops | 1,000/day | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Meetup** | Networking, hobby groups | Limited | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Facebook** | Public pages only | N/A | ⭐ | ⭐⭐ |
| **User-Created** | Your own platform | Unlimited | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 15-Minute Implementation

### Step 1: Get Eventbrite API Key (5 min)

1. Go to [eventbrite.com/platform](https://www.eventbrite.com/platform/)
2. Click "Get Started" or "API Keys"
3. Sign up/login (no credit card needed)
4. Create an app → Copy your "Private Token"

### Step 2: Add API Key to Backend (1 min)

```bash
# backend/.env
EVENTBRITE_API_KEY=YOUR_PRIVATE_TOKEN_HERE
```

### Step 3: Add Eventbrite Service (5 min)

```bash
cd backend/src/services
cp eventbrite.example.ts eventbrite.ts
```

The example file is ready to use - no changes needed!

### Step 4: Add Aggregator (2 min)

```bash
cd backend/src/services
cp eventAggregator.example.ts eventAggregator.ts
```

Uncomment the eventbrite import:
```typescript
import * as eventbrite from './eventbrite';
```

Uncomment the eventbrite source in SOURCES array.

### Step 5: Update Controller (2 min)

Edit `backend/src/controllers/eventController.ts`:

```typescript
// Change this:
import * as ticketmasterService from '../services/ticketmaster';

// To this:
import * as eventAggregator from '../services/eventAggregator';

// Update searchEvents function:
export async function searchEvents(req: Request, res: Response) {
  try {
    const filters: SearchFilters = req.body;
    const sources = req.body.sources; // Optional: allow source filtering

    const result = await eventAggregator.searchAllSources(filters, sources);

    res.json({
      events: result.events,
      count: result.totalCount,
      sources: result.sources, // Show which sources were used
    });
  } catch (error) {
    console.error('Error in searchEvents controller:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
}
```

### Done! Test It

```bash
# Restart backend
cd backend
npm run dev

# Search should now return Ticketmaster + Eventbrite events
```

## Expected Results

**Before** (Ticketmaster only):
- ~20-50 events in major cities
- Focused on concerts, sports, theater

**After** (Ticketmaster + Eventbrite):
- ~50-150 events in major cities
- Includes community events, workshops, meetups, social gatherings

## Frontend Enhancement (Optional)

### Show Event Source Badge

Add to `frontend/src/components/EventCard.tsx`:

```typescript
const sourceInfo = {
  ticketmaster: { name: 'Ticketmaster', color: '#026CDF' },
  eventbrite: { name: 'Eventbrite', color: '#F05537' },
};

// In the render:
{event.source && (
  <div style={{
    display: 'inline-block',
    backgroundColor: sourceInfo[event.source]?.color || '#666',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
    marginTop: '8px',
  }}>
    {sourceInfo[event.source]?.name || event.source}
  </div>
)}
```

## Troubleshooting

### "No events from Eventbrite"

Check:
1. API key is correct in `.env`
2. Backend restarted after adding key
3. Check backend logs for errors

### "Duplicate events showing"

The aggregator automatically deduplicates, but if you see duplicates:
- They might be legitimately different events with similar names
- Check the venue and exact date/time to confirm

### "Only seeing one source"

Make sure:
1. Both API keys are in `.env`
2. `eventAggregator.ts` has both sources uncommented
3. Controller is using aggregator, not ticketmaster directly

## Next Steps

### Level 2: Add Meetup

1. Get Meetup API key
2. Create `meetup.ts` service (similar pattern)
3. Add to aggregator SOURCES array

### Level 3: User-Generated Events

1. Add PostgreSQL database
2. Create events table
3. Add POST /api/events/create endpoint
4. Add moderation system

### Level 4: Advanced Features

- Event recommendations based on user preferences
- Social sharing integration
- Event reminders/notifications
- Collaborative event planning

## FAQ

**Q: Will this slow down my app?**
A: No! Sources are called in parallel. Adding Eventbrite adds ~0-200ms to response time.

**Q: Do I need to pay for Eventbrite?**
A: No! 1,000 requests/day is free forever. Most apps never exceed this.

**Q: Can I disable a source temporarily?**
A: Yes! Just comment out the source in `eventAggregator.ts` SOURCES array.

**Q: What about Instagram/TikTok events?**
A: They don't have public event APIs. You'd need to:
- Use hashtag scraping (against TOS)
- Partner with them directly (unlikely)
- Focus on platforms with APIs (Eventbrite, Meetup)

**Q: Should I add all sources at once?**
A: Start with Eventbrite. Test it. Then add more if needed.

## Real-World Impact

Adding Eventbrite typically gives you:
- **2-3x more events** in medium/large cities
- **Better social event coverage** (book clubs, networking, workshops)
- **More diverse event types** (educational, community, charity)
- **Still FREE** (no additional costs)

## File Structure After Integration

```
backend/src/services/
├── ticketmaster.ts          (✅ Already exists)
├── eventbrite.ts            (🆕 New)
├── eventAggregator.ts       (🆕 New)
├── eventbrite.example.ts    (📝 Template)
└── eventAggregator.example.ts (📝 Template)
```

## Estimated Time Investment

- **Setup Eventbrite**: 5 minutes
- **Integration**: 10 minutes
- **Testing**: 5 minutes
- **UI enhancements**: 15 minutes (optional)

**Total**: 20-35 minutes for 2-3x more events

---

**Ready to go?** Just follow Steps 1-5 above and you're done!
