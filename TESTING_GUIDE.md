# 🧪 Testing Guide - SIP Calculator

## 🚀 **Quick Start**

### **1. Restart Servers**
```bash
# Stop any running servers (Ctrl+C)
# Then restart both:
npm run dev2
```

**Wait for:**
- ✅ `Server is running on http://localhost:5000`
- ✅ `VITE ready in XXX ms`
- ✅ `Local: http://localhost:XXXX/`

---

## 📋 **Test Scenario 1: Basic SIP Calculation**

### **Steps:**
1. Open `http://localhost:5176` (or whichever port Vite shows)
2. Open **Browser Console** (F12 → Console tab)
3. **Search** for "hdfc balanced"
4. **Select** "HDFC Balanced Advantage Fund - Direct Plan - Growth"
5. **Check** weightage is 100%
6. **Set Parameters:**
   - Monthly Investment: `10000`
   - Start Date: `2020-01-01`
   - End Date: `2024-10-26`
7. **Click** "Calculate SIP"

### **Expected Console Output:**
```
[navService] Fetching NAV data for: ['120549']
[navService] Parsed data before filtering: [{ code: '120549', navCount: 2500, firstDate: '2024-10-26', lastDate: '2018-05-14' }]
[navService] Filtered data: [{ code: '120549', navCount: 1750 }]
SIP Dates generated: 58 months
Portfolio Metrics: { invested: 580000, value: XXXX, profit: XXXX, cagr: X.XX, xirr: X.XX }
```

### **Expected UI Results:**
- ✅ 5 performance cards with values
- ✅ Chart showing growth curve
- ✅ Table with fund details
- ✅ No error messages

---

## 📋 **Test Scenario 2: Multi-Fund Portfolio**

### **Steps:**
1. **Search & Add:**
   - "hdfc balanced" → Select one fund
   - "sbi bluechip" → Select one fund
2. **Adjust Weights:**
   - Fund 1: 60%
   - Fund 2: 40%
   - **Verify** total = 100%
3. **Set Parameters:**
   - Monthly Investment: `20000`
   - Start Date: `2021-01-01`
   - End Date: `2024-10-26`
4. **Calculate**

### **Expected:**
- ✅ Both funds processed
- ✅ Weightage-based investment distribution
- ✅ Combined portfolio metrics
- ✅ Individual fund performance in table

---

## 📋 **Test Scenario 3: Edge Cases**

### **A. Weekend/Holiday Handling**
**Purpose:** Verify next available NAV logic

**Steps:**
1. Select any fund
2. Set Start Date: `2024-08-15` (Thursday - Independence Day holiday in India)
3. **Check Console:** 
   - Actual investment date should be Aug 16 or next available working day

### **B. Short Duration SIP**
**Purpose:** Test with minimal data points

**Steps:**
1. Select fund
2. Set:
   - Start: `2024-07-01`
   - End: `2024-10-26`
3. **Verify:** 
   - Should work with ~4 months of data
   - XIRR/CAGR should be calculated

### **C. Long Duration SIP**
**Purpose:** Test with maximum history

**Steps:**
1. Select fund with long history
2. Set:
   - Start: `2015-01-01`
   - End: `2024-10-26`
3. **Verify:**
   - Should handle 100+ months
   - Performance over ~10 years

---

## 🔍 **Debugging Checklist**

### **If "No NAV Data Available" Error:**

1. **Check Console Logs:**
   ```
   [navService] Filtered data: [{ code: 'XXXXX', navCount: 0 }]
   ```
   ❌ **If navCount = 0:** Date range issue

2. **Verify Date Format:**
   - Console should show: `"2024-10-26"` ✅
   - NOT: `"26-10-2024"` ❌

3. **Check Fund Launch Date:**
   - Selected start date must be AFTER fund launch
   - Try selecting a later start date

4. **Backend Logs:**
   ```
   [navApi.service] Normalized 2500 NAV entries for 120549
   [navApi.service] Date range: 2024-10-26 to 2018-05-14
   ```
   ✅ Should see normalization happening

---

## ✅ **Success Criteria**

### **Visual Confirmation:**
- [ ] Search returns results
- [ ] Selected funds appear in bucket
- [ ] Weightage slider/input works
- [ ] Total allocation shows 100%
- [ ] Calculate button enabled
- [ ] Loading state shows while calculating
- [ ] Results display after calculation

### **Console Confirmation:**
- [ ] No error messages in red
- [ ] See `[navService]` logs
- [ ] See `[navApi.service]` backend logs
- [ ] Date format is YYYY-MM-DD
- [ ] navCount > 0 after filtering
- [ ] Portfolio metrics logged

### **Data Accuracy:**
- [ ] Total Invested = Monthly × Months
- [ ] Current Value > 0
- [ ] Profit = Current - Invested
- [ ] CAGR is reasonable (typically 8-15% for equity)
- [ ] XIRR is close to CAGR
- [ ] Chart shows growth trend

---

## 🐛 **Common Issues & Fixes**

### **Issue 1: Port Already in Use**
```
Port 5173 is in use, trying another one...
```
**Fix:** Note the actual port shown and use that URL

### **Issue 2: CORS Error**
```
Access to fetch at 'http://localhost:5000' blocked by CORS
```
**Fix:** Backend not running. Start with `npm run dev2`

### **Issue 3: Invalid Date**
```
Invalid Date in console
```
**Fix:** Backend not returning normalized dates. Restart backend.

### **Issue 4: Zero Units Calculated**
```
Portfolio Metrics: { invested: 580000, value: 0 }
```
**Fix:** NAV values are strings. Check backend normalization.

---

## 📊 **Sample Expected Results**

### **For HDFC Balanced Advantage (2020-2024):**
```
Total Invested: ₹5,80,000
Current Value: ₹7,50,000 - ₹8,50,000 (approximate)
Profit: ₹1,70,000 - ₹2,70,000
CAGR: 6% - 9%
XIRR: 6.5% - 9.5%
```

**Note:** Actual values depend on real market performance.

---

## 🎯 **Test Completion Checklist**

- [ ] Tested single fund SIP
- [ ] Tested multi-fund portfolio
- [ ] Verified weightage distribution
- [ ] Tested different date ranges
- [ ] Checked edge cases (holidays, short/long duration)
- [ ] Confirmed console logs show normalized dates
- [ ] Verified navCount > 0
- [ ] Confirmed calculations are accurate
- [ ] Tested UI responsiveness
- [ ] Verified chart displays correctly
- [ ] Checked fund table data

---

## 📝 **Report Format**

When reporting issues, please include:

1. **Browser Console Logs** (full output)
2. **Backend Terminal Logs** (relevant portion)
3. **Fund Code(s)** used
4. **Date Range** tested
5. **Expected Result** vs **Actual Result**
6. **Screenshot** of error (if applicable)

---

## 🎉 **Next Steps After Testing**

Once SIP Calculator is verified:
1. Proceed to **Lumpsum Calculator** implementation
2. Then **Rolling Returns Calculator**
3. Finally **SWP Calculator**
4. Add advanced features (export, comparison, etc.)

---

**Happy Testing! 🚀**
