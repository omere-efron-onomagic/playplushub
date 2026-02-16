#!/bin/bash
# Test admin image upload. Requires backend running on port 3000 and ADMIN_SECRET in .env
set -e
API="${API_URL:-http://localhost:3000}"
ADMIN_SECRET="${ADMIN_SECRET:-playplushub-admin-secret}"
TEST_IMG="scripts/test-image.png"

# Create minimal valid PNG (1x1 pixel) if missing
if [[ ! -f "$TEST_IMG" ]]; then
  echo "Creating test image..."
  printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82' > "$TEST_IMG"
fi

echo "Uploading to $API/admin/uploads/images..."
RESP=$(curl -s -w "\n%{http_code}" -X POST "$API/admin/uploads/images" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -F "image=@$TEST_IMG;type=image/png")
CODE=$(echo "$RESP" | tail -n1)
BODY=$(echo "$RESP" | sed '$d')

if [[ "$CODE" != "201" ]]; then
  echo "FAIL: Expected 201, got $CODE"
  echo "$BODY"
  exit 1
fi

URL=$(echo "$BODY" | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')
if [[ -z "$URL" ]]; then
  echo "FAIL: No url in response"
  echo "$BODY"
  exit 1
fi

# Resolve full URL if relative
if [[ "$URL" != http* ]]; then
  URL="${API}${URL}"
fi

echo "Upload OK. URL: $URL"
echo "Fetching image..."
FETCH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
if [[ "$FETCH_CODE" != "200" ]]; then
  echo "FAIL: Image fetch returned $FETCH_CODE (expected 200)"
  exit 1
fi
echo "Image fetch OK (200)"
