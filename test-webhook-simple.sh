#!/bin/bash

# Simple test script for n8n webhook
# Usage: ./test-webhook-simple.sh [email] [webhook-url]

# Configuration
TEST_EMAIL=${1:-"test@example.com"}
WEBHOOK_URL=${2:-"http://localhost:5678/webhook/send-email"}

echo "🧪 Testing n8n Email Webhook"
echo "=============================="
echo "📧 Test Email: $TEST_EMAIL"
echo "🔗 Webhook URL: $WEBHOOK_URL"
echo ""

# Test data for invitation email
TEST_DATA='{
  "type": "invitation",
  "to": "'$TEST_EMAIL'",
  "metadata": {
    "organizationName": "Test Organization",
    "inviterName": "Test Admin",
    "inviteUrl": "http://localhost:3000/invite/test-token-123",
    "expiresAt": "'$(date -d "+7 days" "+%m/%d/%Y")'"
  }
}'

echo "📦 Sending test data:"
echo "$TEST_DATA" | jq .
echo ""

# Send the request
echo "🚀 Sending request..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  "$WEBHOOK_URL")

# Split response and status code
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

echo "📊 Response:"
echo "Status Code: $HTTP_CODE"
echo "Response Body: $RESPONSE_BODY"
echo ""

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo "✅ SUCCESS! Webhook responded with status $HTTP_CODE"
    echo "📧 Check your email at $TEST_EMAIL"
    echo "📋 Check your n8n workflow logs for processing details"
else
    echo "❌ FAILED! Webhook responded with status $HTTP_CODE"
    echo "🔍 Check your n8n workflow is running and accessible"
fi
