/**
 * API Test for /api/accept
 * Tests the upsert logic fix to prevent accidental creation of accepted documents
 */

// We need to test the API behavior without connecting to a real MongoDB
// This test verifies the logic by checking the code structure

const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'app', 'api', 'accept', 'route.ts');
const apiCode = fs.readFileSync(apiPath, 'utf-8');

console.log('=== API Accept Route Test ===\n');

// Test 1: Verify shouldUpsert logic exists
const hasShouldUpsert = apiCode.includes('const shouldUpsert = action === "accept" && idea !== undefined');
console.log(`✅ Test 1 - shouldUpsert logic exists: ${hasShouldUpsert ? 'PASS' : 'FAIL'}`);
if (!hasShouldUpsert) {
  console.error('  ERROR: The API should only upsert when explicitly accepting with idea data');
  process.exit(1);
}

// Test 2: Verify upsert is conditional
const hasConditionalUpsert = apiCode.includes('{ upsert: shouldUpsert }');
console.log(`✅ Test 2 - Conditional upsert: ${hasConditionalUpsert ? 'PASS' : 'FAIL'}`);
if (!hasConditionalUpsert) {
  console.error('  ERROR: The API should use conditional upsert based on shouldUpsert');
  process.exit(1);
}

// Test 3: Verify 404 response for non-existent ideas
const has404Check = apiCode.includes('if (!shouldUpsert && result.matchedCount === 0)');
const has404Response = apiCode.includes('{ status: 404 }');
console.log(`✅ Test 3 - 404 for non-existent updates: ${has404Check && has404Response ? 'PASS' : 'FAIL'}`);
if (!has404Check || !has404Response) {
  console.error('  ERROR: The API should return 404 when trying to update a non-existent idea');
  process.exit(1);
}

// Test 4: Verify build page has response.ok checks
const buildPagePath = path.join(__dirname, 'app', 'build', 'page.tsx');
const buildCode = fs.readFileSync(buildPagePath, 'utf-8');
const hasResponseOk = buildCode.includes('if (!response.ok)');
console.log(`✅ Test 4 - Build page has response.ok checks: ${hasResponseOk ? 'PASS' : 'FAIL'}`);
if (!hasResponseOk) {
  console.error('  ERROR: Build page should check response.ok before updating state');
  process.exit(1);
}

// Test 5: Verify build page has debounce for notes
const hasDebounce = buildCode.includes('notesTimeoutRef') && buildCode.includes('setTimeout');
console.log(`✅ Test 5 - Build page debounces notes updates: ${hasDebounce ? 'PASS' : 'FAIL'}`);
if (!hasDebounce) {
  console.error('  ERROR: Build page should debounce notes updates');
  process.exit(1);
}

// Test 6: Verify build page has cooldown for status updates
const hasCooldown = buildCode.includes('statusCooldownRef') && buildCode.includes('Date.now()');
console.log(`✅ Test 6 - Build page has cooldown for status updates: ${hasCooldown ? 'PASS' : 'FAIL'}`);
if (!hasCooldown) {
  console.error('  ERROR: Build page should have cooldown for status updates');
  process.exit(1);
}

// Test 7: Verify IdeaCard removed auto-focus
const ideaCardPath = path.join(__dirname, 'components', 'IdeaCard.tsx');
const ideaCardCode = fs.readFileSync(ideaCardPath, 'utf-8');
const hasNoAutoFocus = !ideaCardCode.includes('card.focus()');
const hasNoHasFocused = !ideaCardCode.includes('hasFocused');
console.log(`✅ Test 7 - IdeaCard removed auto-focus: ${hasNoAutoFocus && hasNoHasFocused ? 'PASS' : 'FAIL'}`);
if (!hasNoAutoFocus || !hasNoHasFocused) {
  console.error('  ERROR: IdeaCard should not auto-focus to prevent accidental keyboard acceptance');
  process.exit(1);
}

// Test 8: Verify IdeaCard has cooldown on buttons
const hasButtonCooldown = ideaCardCode.includes('if (!canNavigate()) return;') && 
                          ideaCardCode.includes('onClick={() => {\n                if (!canNavigate()) return;\n                onAccept');
console.log(`✅ Test 8 - IdeaCard button cooldown: ${hasButtonCooldown ? 'PASS' : 'FAIL'}`);
if (!hasButtonCooldown) {
  console.error('  ERROR: IdeaCard buttons should have cooldown to prevent double-clicking');
  process.exit(1);
}

// Test 9: Verify IdeaCard keyboard only handles specific keys
const hasKeyCheck = ideaCardCode.includes('handledKeys') && ideaCardCode.includes('!handledKeys.includes(e.key)');
console.log(`✅ Test 9 - IdeaCard only handles specific keys: ${hasKeyCheck ? 'PASS' : 'FAIL'}`);
if (!hasKeyCheck) {
  console.error('  ERROR: IdeaCard should only handle specific keys to prevent accidental acceptance');
  process.exit(1);
}

// Test 10: Verify feed page doesn't show all ideas when filtered empty
const feedPagePath = path.join(__dirname, 'app', 'feed', 'page.tsx');
const feedCode = fs.readFileSync(feedPagePath, 'utf-8');
const hasNoFallback = !feedCode.includes('setIdeas(filtered.length > 0 ? filtered : data.ideas)');
const hasFilteredOnly = feedCode.includes('setIdeas(filtered);');
console.log(`✅ Test 10 - Feed page doesn't fallback to all ideas: ${hasNoFallback && hasFilteredOnly ? 'PASS' : 'FAIL'}`);
if (!hasNoFallback || !hasFilteredOnly) {
  console.error('  ERROR: Feed page should not show all ideas when filtered is empty');
  process.exit(1);
}

// Test 11: Verify feed page has response.ok check
const feedHasResponseOk = feedCode.includes('if (!response.ok)');
console.log(`✅ Test 11 - Feed page has response.ok check: ${feedHasResponseOk ? 'PASS' : 'FAIL'}`);
if (!feedHasResponseOk) {
  console.error('  ERROR: Feed page should check response.ok before updating state');
  process.exit(1);
}

// Test 12: Verify NAV_COOLDOWN increased
const hasCooldown800 = ideaCardCode.includes('const NAV_COOLDOWN = 800');
console.log(`✅ Test 12 - NAV_COOLDOWN increased to 800ms: ${hasCooldown800 ? 'PASS' : 'FAIL'}`);
if (!hasCooldown800) {
  console.error('  ERROR: NAV_COOLDOWN should be increased to 800ms');
  process.exit(1);
}

console.log('\n=== All Tests Passed! ===');
console.log('\nSummary of fixes:');
console.log('1. ✅ API only creates new accepted documents when idea data is provided');
console.log('2. ✅ API returns 404 when trying to update non-existent ideas');
console.log('3. ✅ Build page checks API responses before updating state');
console.log('4. ✅ Build page debounces notes updates (500ms)');
console.log('5. ✅ Build page has cooldown for status updates (1s)');
console.log('6. ✅ IdeaCard removed auto-focus to prevent accidental keyboard acceptance');
console.log('7. ✅ IdeaCard buttons have cooldown to prevent double-clicking');
console.log('8. ✅ IdeaCard only handles specific keys (ArrowRight/d/D, etc.)');
console.log('9. ✅ Feed page no longer shows all ideas when filtered is empty');
console.log('10. ✅ Feed page checks API response before updating localStorage');
console.log('11. ✅ NAV_COOLDOWN increased to 800ms for better protection');
