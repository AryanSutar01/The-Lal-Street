# 🔧 Rolling Calculator Update Plan

## Current Status
Started updating Rolling Calculator to use real NAV data instead of mock data.

## Changes Made So Far:
1. ✅ Added imports for fetchNAVData, calculateXIRR, getNextAvailableNAV, addMonths
2. ✅ Removed mock NAV generation function
3. ✅ Removed duplicate XIRR calculation (using shared utility)
4. ✅ Added minAvailableDate state management
5. ✅ Added isLoading and error state
6. ✅ Started rewriting calculateRolling to be async and fetch real NAV data

## Still To Do:
1. Complete the calculateRolling function to:
   - Use real NAV data from navResponses
   - Implement proper SIP investment logic (same day each month, handle holidays)
   - Calculate rolling returns for each window
   - Calculate bucket returns
2. Add error handling and loading states to UI
3. Update date inputs to respect minAvailableDate
4. Test with real funds

## Key Logic Changes Needed:
- Replace `fundNAVData.get().get()` pattern with `navResponses.find().navData` array lookups
- Use `getNextAvailableNAV()` instead of fixed day-of-month checks
- Handle date properly like SIP calculator (reset to same day each month)

## Note:
The file is partially updated. The calculation logic needs to be completed in the next step.
User requested this update and is waiting for completion.

