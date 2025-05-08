#!/bin/bash

# List of files to fix
files=(
  "backend/src/controllers/admin.controller.ts"
  "backend/src/controllers/business.controller.ts"
  "backend/src/controllers/customer.controller.ts"
  "backend/src/controllers/dashboard.controller.ts"
  "backend/src/__tests__/campaign.test.ts"
  "backend/src/__tests__/referral.test.ts"
  "backend/src/migrations/addRewardDescription.ts"
)

# Fix each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Replace incorrect imports
    sed -i 's/import Campaign, { ICampaign } from '\''\.\.\/models\/campaign\.model'\''/import { Campaign, ICampaign } from '\''\.\.\/models\/campaign'\''/g' "$file"
    echo "Fixed imports in $file"
  else
    echo "File not found: $file"
  fi
done 