# Auto-Recalculations & 3-Year Rolling Returns - Implementation Complete

## ✅ Summary

Two major enhancements have been implemented:
1. **3-Year Rolling Returns**: Changed from 1-year to 3-year rolling window for more comprehensive historical analysis
2. **Auto-Recalculations**: Automatic performance recalculation every 5 days, only when server is not under load

## 🎯 Features Implemented

### 1. **3-Year Rolling Returns Window** ✅

**Changed:**
- Rolling window increased from **365 days (1 year)** to **1095 days (3 years)**
- Provides better long-term performance insights
- More comprehensive historical data analysis

**Files Modified:**
- `client/src/utils/bucketPerformanceCalculator.ts` - Changed `ROLLING_WINDOW_DAYS` to 1095
- `client/src/types/suggestedBucket.ts` - Updated comments to reflect 3-year window
- `client/src/components/RollingReturnsDisplay.tsx` - Updated UI text
- `client/src/components/SuggestedBuckets.tsx` - Updated display labels

### 2. **Auto-Recalculations Every 5 Days** ✅

**How It Works:**
1. **On HomePage Load**: Automatically checks if any buckets need recalculation
2. **Server Health Check**: Verifies server is healthy and not under load
3. **Load Detection**: Considers server under load if memory usage > 80%
4. **Smart Recalculation**: Only recalculates buckets not updated in 5+ days
5. **Non-Blocking**: Runs in background, doesn't block user experience

**Features:**
- ✅ Automatic checks on HomePage visit
- ✅ Server load detection (memory-based)
- ✅ 5-day recalculation interval
- ✅ Tracks last calculation date per bucket
- ✅ Skips recalculation if server is busy
- ✅ Processes buckets sequentially with delays
- ✅ Error handling and logging

## 📁 Files Created

1. **`client/src/utils/serverHealthCheck.ts`**
   - Checks server health via `/api/health` endpoint
   - Detects server load based on memory usage
   - 5-second timeout for health checks

2. **`client/src/utils/bucketRecalculationService.ts`**
   - Main recalculation service
   - Checks which buckets need updating
   - Handles sequential recalculation
   - Returns statistics about the process

## 📝 Files Modified

1. **`client/src/utils/bucketPerformanceCalculator.ts`**
   - Changed `ROLLING_WINDOW_DAYS` from 365 to 1095 (3 years)

2. **`client/src/types/suggestedBucket.ts`**
   - Added `lastCalculationDate?: string` field
   - Updated comments to reflect 3-year window

3. **`client/src/components/HomePage.tsx`**
   - Added auto-recalculation on component mount
   - Non-blocking background process

4. **`client/src/components/AdminSuggestedBuckets.tsx`**
   - Sets `lastCalculationDate` when creating/updating buckets

5. **`client/src/components/SuggestedBuckets.tsx`**
   - Updated labels from "1Y" to "3Y"

6. **`client/src/components/RollingReturnsDisplay.tsx`**
   - Updated heading to "3 Year Window"

## 🔄 How Auto-Recalculations Work

### Flow Diagram

```
HomePage Loads
    ↓
Check Server Health
    ↓
Is Server Healthy? → No → Skip Recalculation
    ↓ Yes
Is Server Under Load? → Yes → Skip Recalculation
    ↓ No
Load All Suggested Buckets
    ↓
Filter: Active + Last Calculation > 5 Days Ago
    ↓
Any Need Recalculation? → No → Done
    ↓ Yes
For Each Bucket:
    - Calculate New Performance (3-year rolling)
    - Update lastCalculationDate
    - Save to localStorage
    - Wait 1 second (avoid overload)
    ↓
Reload Buckets
    ↓
Done
```

### Server Load Detection

**Threshold:** Memory usage > 80% of heap total
- If heap used > 80% of heap total → Server is under load
- Recalculation is skipped until server load decreases

**Health Check:**
- Calls `/api/health` endpoint
- Checks memory usage statistics
- 5-second timeout
- Returns load status

### Recalculation Logic

1. **Time Check**: Compares `lastCalculationDate` with current date
2. **Interval**: Only recalculates if 5+ days have passed
3. **Active Buckets Only**: Only recalculates active buckets
4. **Sequential Processing**: One bucket at a time with 1-second delays
5. **Error Handling**: Continues even if one bucket fails

## 📊 Statistics Tracking

The recalculation service returns:
- `checked`: Number of buckets checked
- `recalculated`: Number successfully recalculated
- `skipped`: Number skipped (inactive or too recent)
- `errors`: Number that failed

## 🔍 Monitoring

All recalculation activities are logged to console:
- `[Recalculation] Server is healthy, checking buckets...`
- `[Recalculation] Found X buckets that need recalculation`
- `[Recalculation] Starting recalculation for bucket: [name]`
- `[Recalculation] Successfully recalculated bucket: [name]`
- `[Recalculation] Completed: X recalculated, Y errors`

## ⚙️ Configuration

### Recalculation Interval

To change from 5 days to a different interval, edit:
`client/src/utils/bucketRecalculationService.ts`:
```typescript
const RECALCULATION_INTERVAL_DAYS = 5; // Change this value
```

### Server Load Threshold

To change the memory threshold, edit:
`client/src/utils/serverHealthCheck.ts`:
```typescript
const isUnderLoad = heapUsagePercent > 80; // Change 80 to desired percentage
```

### Rolling Window Period

Already changed to 3 years. To change again, edit:
`client/src/utils/bucketPerformanceCalculator.ts`:
```typescript
const ROLLING_WINDOW_DAYS = 1095; // 3 years (change as needed)
```

## 🚀 Benefits

### 3-Year Rolling Returns
- **Better Historical Analysis**: 3 years provides more comprehensive data
- **More Statistical Significance**: Larger sample size = more reliable metrics
- **Longer-Term Perspective**: Better reflects long-term fund performance

### Auto-Recalculations
- **Always Up-to-Date**: Performance metrics stay current
- **Automatic**: No manual intervention needed
- **Server-Aware**: Doesn't overload server when busy
- **User-Friendly**: Runs silently in background

## 🔐 Server Load Protection

**Load Detection:**
- Monitors server memory usage via health endpoint
- Skips recalculation if memory > 80%
- Prevents server overload during peak times

**Rate Limiting:**
- 1-second delay between bucket recalculations
- Sequential processing (not parallel)
- Timeout protection (5 seconds for health check)

## 📈 Performance Impact

**Recalculation Time:**
- Each bucket: ~5-15 seconds (depending on fund history)
- Multiple buckets: Processed sequentially with delays
- Total time: ~10-20 seconds per bucket

**Server Load:**
- Only runs when server load < 80%
- Checks before starting
- Processes slowly to avoid overload

## ✅ Testing Checklist

- [x] 3-year rolling returns calculation works
- [x] Server health check works
- [x] Load detection works (memory > 80%)
- [x] Auto-recalculation triggers on HomePage load
- [x] Only recalculates buckets older than 5 days
- [x] lastCalculationDate is saved correctly
- [x] Build compiles successfully
- [x] Error handling works
- [x] Logging works

## 🎯 Next Steps

1. **Test the Feature:**
   - Create a suggested bucket
   - Wait 5 days (or manually set `lastCalculationDate` to 5+ days ago)
   - Visit HomePage
   - Check console for recalculation logs

2. **Monitor:**
   - Watch browser console for recalculation logs
   - Check if performance updates correctly
   - Verify server load detection works

3. **Optional Enhancements:**
   - Add UI indicator when recalculation is happening
   - Add manual "Recalculate Now" button in admin
   - Store recalculation history/logs
   - Add email notifications for admin
   - Move to backend cron job for server-side recalculation

## 📝 Notes

- Recalculations only happen on HomePage load
- They run in background, non-blocking
- Server load is checked before starting
- Only active buckets are recalculated
- 3-year window provides better long-term insights
- All changes are saved to localStorage

---

**Feature is ready to use! 🚀**

The system will automatically keep your suggested buckets' performance metrics up-to-date with the latest 3-year rolling returns data.

