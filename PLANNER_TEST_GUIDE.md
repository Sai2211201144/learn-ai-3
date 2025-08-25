# 🧪 Enhanced Planner - End-to-End Testing Guide

## 🌐 Access the Application
**URL**: `http://localhost:5175/`

---

## 📋 Test Plan Overview

### **Phase 1: Authentication & Initial Setup**
### **Phase 2: Learning Plan Management** 
### **Phase 3: Daily Goals System**
### **Phase 4: Profile Management**
### **Phase 5: Integration Testing**

---

## 🔐 **Phase 1: Authentication & Initial Setup**

### **Test 1.1: Unauthenticated State**
✅ **Expected Behavior:**
- Navigate to `http://localhost:5175/`
- Should see "Sign in to access your learning planner" message
- Google sign-in button should be visible in bottom-left corner
- Sidebar should show "Guest" user

✅ **Test Steps:**
1. Open browser to `http://localhost:5175/`
2. Verify planner shows sign-in prompt
3. Check sidebar shows guest state
4. Verify no personal data is visible

### **Test 1.2: Google Authentication**
✅ **Expected Behavior:**
- Click Google sign-in button
- Complete Google OAuth flow
- User profile should appear in sidebar
- Planner should show personalized content

✅ **Test Steps:**
1. Click "Sign in with Google" button
2. Complete Google authentication
3. Verify user name appears in sidebar (not "Guest")
4. Verify planner shows personalized greeting
5. Check that Google sign-in button disappears

---

## 📅 **Phase 2: Learning Plan Management**

### **Test 2.1: First-Time Plan Creation**
✅ **Expected Behavior:**
- After signing in, should see "Create Your First Learning Plan" prompt
- Click "Create Your First Plan" or "New Plan" button
- Modal should open with plan creation form

✅ **Test Steps:**
1. Click "Create Your First Plan" button
2. Verify modal opens with:
   - Topic input field
   - Duration selection (AI Optimal/Custom)
   - Create Plan button
3. Enter test topic (e.g., "Learn React Hooks")
4. Select duration option
5. Click "Create Plan"
6. Verify modal closes and plan appears

### **Test 2.2: Multiple Plan Management**
✅ **Expected Behavior:**
- Create multiple learning plans
- Plan selector dropdown should appear
- Can switch between active plans
- Each plan shows correct details

✅ **Test Steps:**
1. Create 2-3 different learning plans:
   - "Learn TypeScript" (7 days)
   - "Master CSS Grid" (14 days)  
   - "Python Fundamentals" (21 days)
2. Verify plan selector dropdown appears
3. Click plan selector and switch between plans
4. Verify correct plan details show for each selection
5. Test "No active plan" option

### **Test 2.3: Plan Details & Status**
✅ **Expected Behavior:**
- Plan shows title, duration, start date
- Status indicators work correctly
- Edit functionality (if implemented)

✅ **Test Steps:**
1. Select an active plan
2. Verify plan details display:
   - Correct title
   - Duration in days
   - Start date
   - Status (Active/Completed/etc.)
3. Check for edit button functionality

---

## 🎯 **Phase 3: Daily Goals System**

### **Test 3.1: Goal Creation**
✅ **Expected Behavior:**
- "Today's Goals" section visible
- "Add Goal" button works
- Goals can be created and saved
- Goals persist after page refresh

✅ **Test Steps:**
1. Locate "Today's Goals" section
2. Click "Add Goal" button
3. Enter goal text (e.g., "Complete React tutorial")
4. Click "Add" to save goal
5. Verify goal appears in list
6. Refresh page and verify goal persists

### **Test 3.2: Goal Completion**
✅ **Expected Behavior:**
- Goals have checkboxes
- Clicking checkbox marks goal complete
- Completed goals show different styling
- Completion status persists

✅ **Test Steps:**
1. Create 2-3 daily goals
2. Click checkbox on first goal
3. Verify goal shows as completed (different styling)
4. Refresh page and verify completion status persists
5. Click checkbox again to mark incomplete
6. Verify goal returns to normal state

### **Test 3.3: Goal Management**
✅ **Expected Behavior:**
- Multiple goals can be managed
- Goals show today's date
- Completed vs. incomplete goals are visually distinct

✅ **Test Steps:**
1. Create 5+ goals with different text
2. Mark some as complete, leave others incomplete
3. Verify visual distinction between completed/incomplete
4. Test with longer goal text to check text wrapping
5. Verify goals are sorted or grouped appropriately

---

## 👤 **Phase 4: Profile Management**

### **Test 4.1: Profile Display**
✅ **Expected Behavior:**
- User's real name appears throughout app
- Profile picture shows in sidebar
- No "Guest" or "Person" text visible when signed in

✅ **Test Steps:**
1. Check sidebar for user profile section
2. Verify real name appears (from Google account)
3. Check profile picture displays
4. Navigate to different pages and verify name consistency
5. Look for any remaining "Guest" or "Person" text

### **Test 4.2: Settings Modal**
✅ **Expected Behavior:**
- Settings button opens profile management
- Can edit profile information
- Profile section shows in settings
- Sign out functionality works

✅ **Test Steps:**
1. Click Settings button in sidebar
2. Verify settings modal opens
3. Look for Profile section in settings
4. Test profile editing functionality:
   - Edit full name
   - Update preferences
   - Save changes
5. Test "Sign Out" button
6. Verify user is signed out and returns to guest state

---

## 🔗 **Phase 5: Integration Testing**

### **Test 5.1: Data Persistence**
✅ **Expected Behavior:**
- All data saves to Supabase
- Data persists across browser sessions
- Multiple browser tabs stay synchronized

✅ **Test Steps:**
1. Create learning plans and goals
2. Close browser completely
3. Reopen and navigate to app
4. Sign in again
5. Verify all data is still present
6. Open app in second browser tab
7. Make changes in one tab
8. Refresh other tab and verify changes appear

### **Test 5.2: Error Handling**
✅ **Expected Behavior:**
- Network errors show user-friendly messages
- Failed operations can be retried
- App doesn't crash on errors

✅ **Test Steps:**
1. Temporarily disconnect internet
2. Try creating plans/goals
3. Verify error messages appear
4. Reconnect internet
5. Retry failed operations
6. Verify data saves correctly

### **Test 5.3: Responsive Design**
✅ **Expected Behavior:**
- Works on mobile devices
- Touch interactions work properly
- Layout adapts to screen size

✅ **Test Steps:**
1. Test on mobile device or browser dev tools
2. Verify all buttons are touchable
3. Check modal responsiveness
4. Test form inputs on mobile
5. Verify text is readable at all sizes

---

## 🐛 **Common Issues & Fixes**

### **Issue: "Sign in to access planner" shows when signed in**
**Fix**: Check browser console for Firebase auth errors

### **Issue: Goals don't persist after refresh**
**Fix**: Check Supabase connection and network tab

### **Issue: User name shows as "Guest" when signed in**
**Fix**: Verify Firebase user data is loading correctly

### **Issue: Cannot create learning plans**
**Fix**: Check browser console for API errors

---

## 📊 **Success Criteria**

✅ **Authentication**: Users can sign in/out seamlessly  
✅ **Learning Plans**: Can create, view, and switch between plans  
✅ **Daily Goals**: Can create, complete, and manage daily goals  
✅ **Profile**: Real user names appear throughout app  
✅ **Persistence**: All data saves and loads correctly  
✅ **Responsive**: Works on desktop and mobile  
✅ **Error Handling**: Graceful error handling and recovery  

---

## 🎉 **Testing Complete!**

If all tests pass, the Enhanced Planner is ready for production use!

**Key Features Verified:**
- 🔐 Firebase Google Authentication
- 📊 Supabase Data Persistence  
- 📅 Learning Plan Management
- 🎯 Daily Goal Tracking
- 👤 Profile Management
- 📱 Responsive Design
- 🛡️ Error Handling

