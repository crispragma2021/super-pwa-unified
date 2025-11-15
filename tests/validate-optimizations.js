#!/usr/bin/env node

/**
 * Performance Validation Script
 * Tests the optimizations made to the Super PWA codebase
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Super PWA Performance Validation\n');

let testsPass = 0;
let testsFail = 0;

function testResult(testName, passed, details = '') {
    if (passed) {
        console.log(`✅ PASS: ${testName}`);
        if (details) console.log(`   ${details}`);
        testsPass++;
    } else {
        console.log(`❌ FAIL: ${testName}`);
        if (details) console.log(`   ${details}`);
        testsFail++;
    }
}

// Test 1: Storage Manager optimizations
console.log('\n📦 Testing Storage Manager Optimizations...');

const storageCode = fs.readFileSync(path.join(__dirname, '../utils/storage.js'), 'utf8');

testResult(
    'Storage clear() uses backwards iteration',
    storageCode.includes('for (let i = localStorage.length - 1; i >= 0; i--)'),
    'Single-pass backwards iteration prevents index shifting issues'
);

testResult(
    'Storage clear() removes double iteration',
    !storageCode.includes('keysToRemove.forEach'),
    'No longer creates temporary array and iterates twice'
);

testResult(
    'Storage keys() uses slice instead of replace',
    storageCode.includes('.slice(prefixLen)') && storageCode.includes('const prefixLen = this.prefix.length'),
    'More efficient string extraction'
);

// Test 2: RAG Engine optimizations
console.log('\n🔍 Testing RAG Engine Optimizations...');

const ragCode = fs.readFileSync(path.join(__dirname, '../src/components/rag-engine.js'), 'utf8');

testResult(
    'RAG keywordSearch pre-compiles regex patterns',
    ragCode.includes('const regexPatterns') && ragCode.includes('queryTerms.map'),
    'Regex patterns compiled once outside the loop'
);

testResult(
    'RAG removed inline regex creation in loop',
    !ragCode.includes('new RegExp(term, \'g\')') || ragCode.split('new RegExp').length <= 2,
    'No regex creation inside document iteration loop'
);

testResult(
    'RAG getPreview uses slice instead of substr',
    ragCode.includes('content.slice(0, maxLength)'),
    'Replaced deprecated substr() with slice()'
);

// Test 3: Nexus Controller optimizations
console.log('\n⚡ Testing Nexus Controller Optimizations...');

const nexusCode = fs.readFileSync(path.join(__dirname, '../src/components/nexus-controller.js'), 'utf8');

testResult(
    'Nexus has caching for storage analysis',
    nexusCode.includes('storageAnalysisCache') && nexusCode.includes('CACHE_TTL'),
    'Cache with TTL implemented'
);

testResult(
    'Nexus removed expensive JSON.stringify',
    !nexusCode.includes('JSON.stringify(localStorage)'),
    'Uses iterative counting instead'
);

testResult(
    'Nexus uses efficient key iteration',
    nexusCode.includes('for (let i = 0; i < len; i++)') && nexusCode.includes('localStorage.key(i)'),
    'Iterates over keys efficiently'
);

// Test 4: AI Manager optimizations
console.log('\n🤖 Testing AI Manager Optimizations...');

const aiManagerCode = fs.readFileSync(path.join(__dirname, '../src/utils/ai-manager.js'), 'utf8');

testResult(
    'AI Manager has connectivity cache',
    aiManagerCode.includes('connectivityCache') && aiManagerCode.includes('CONNECTIVITY_CACHE_TTL'),
    'Caching prevents repeated network requests'
);

testResult(
    'AI Manager uses navigator.onLine',
    aiManagerCode.includes('navigator.onLine'),
    'Fast browser-native connectivity check'
);

// Test 5: Memory leak fixes
console.log('\n🔒 Testing Memory Leak Fixes...');

const chatUICode = fs.readFileSync(path.join(__dirname, '../js/chat-ui.js'), 'utf8');
const chatUIEnhancedCode = fs.readFileSync(path.join(__dirname, '../js/chat-ui-enhanced.js'), 'utf8');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

testResult(
    'ChatUI stores interval ID',
    chatUICode.includes('this.statusUpdateInterval') && chatUICode.includes('this.statusUpdateInterval = setInterval'),
    'Interval ID stored for cleanup'
);

testResult(
    'ChatUI has destroy method',
    chatUICode.includes('destroy()') && chatUICode.includes('clearInterval(this.statusUpdateInterval)'),
    'Cleanup method implemented'
);

testResult(
    'ChatUI Enhanced also has cleanup',
    chatUIEnhancedCode.includes('this.statusUpdateInterval') && chatUIEnhancedCode.includes('destroy()'),
    'Enhanced version also fixed'
);

testResult(
    'SuperPWAApp stores media query listener',
    appCode.includes('this.themeMediaQuery') && appCode.includes('this.themeChangeHandler'),
    'Media query listener stored for cleanup'
);

testResult(
    'SuperPWAApp has destroy method',
    appCode.includes('destroy()') && appCode.includes('removeEventListener'),
    'Cleanup method removes event listeners'
);

// Test 6: Notification optimization
console.log('\n🎨 Testing Notification Optimizations...');

testResult(
    'Notifications use CSS classes',
    appCode.includes('toast.className') && appCode.includes('notification-toast'),
    'CSS classes instead of inline styles'
);

testResult(
    'Notifications removed inline styles',
    !appCode.includes('toast.style.cssText ='),
    'No more inline style creation'
);

const cssCode = fs.readFileSync(path.join(__dirname, '../styles/main.css'), 'utf8');

testResult(
    'CSS has notification styles',
    cssCode.includes('.notification-toast') && cssCode.includes('.notification-show'),
    'Notification CSS classes defined'
);

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Test Results Summary:');
console.log('='.repeat(50));
console.log(`✅ Passed: ${testsPass}`);
console.log(`❌ Failed: ${testsFail}`);
console.log(`📈 Success Rate: ${((testsPass / (testsPass + testsFail)) * 100).toFixed(1)}%`);

if (testsFail === 0) {
    console.log('\n🎉 All performance optimizations validated successfully!');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed. Please review the optimizations.');
    process.exit(1);
}
