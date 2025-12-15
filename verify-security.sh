#!/bin/bash

echo "🔒 Security Verification Script for Web3 Todo Repository"
echo "========================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for issues
ISSUES=0

echo "1️⃣  Checking for tracked .env files..."
if git ls-files | grep -E "\.env$|\.env\.local|\.env\.production" > /dev/null; then
    echo -e "${RED}❌ WARNING: .env files are tracked in git!${NC}"
    git ls-files | grep -E "\.env"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ No .env files tracked${NC}"
fi
echo ""

echo "2️⃣  Checking for private keys in code..."
if grep -r "privateKey\s*=\s*['\"]0x" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git . 2>/dev/null | grep -v ".example" > /dev/null; then
    echo -e "${RED}❌ WARNING: Private keys found in code!${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ No hardcoded private keys found${NC}"
fi
echo ""

echo "3️⃣  Checking for API keys in code..."
if grep -r -E "(api_key|apiKey)\s*:\s*['\"][^']" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git . 2>/dev/null | grep -v "your_" | grep -v ".example" > /dev/null; then
    echo -e "${YELLOW}⚠️  Potential API keys found - please review${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ No hardcoded API keys found${NC}"
fi
echo ""

echo "4️⃣  Verifying .gitignore exists..."
if [ -f ".gitignore" ] && [ -f "frontend/.gitignore" ]; then
    echo -e "${GREEN}✅ .gitignore files present${NC}"
else
    echo -e "${RED}❌ Missing .gitignore files!${NC}"
    ISSUES=$((ISSUES + 1))
fi
echo ""

echo "5️⃣  Verifying .env.example files exist..."
if [ -f ".env.example" ] && [ -f "frontend/.env.example" ]; then
    echo -e "${GREEN}✅ .env.example files present${NC}"
else
    echo -e "${RED}❌ Missing .env.example files!${NC}"
    ISSUES=$((ISSUES + 1))
fi
echo ""

echo "6️⃣  Checking for node_modules in git..."
if git ls-files | grep "node_modules/" > /dev/null; then
    echo -e "${RED}❌ node_modules is tracked!${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ node_modules not tracked${NC}"
fi
echo ""

echo "7️⃣  Checking for build artifacts in git..."
if git ls-files | grep -E "\.next/|dist/|build/|artifacts/|cache/" > /dev/null; then
    echo -e "${RED}❌ Build artifacts are tracked!${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ Build artifacts not tracked${NC}"
fi
echo ""

echo "========================================================"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 All security checks passed! Repository is safe to publish.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Found $ISSUES potential security issues. Please review before publishing.${NC}"
    exit 1
fi
