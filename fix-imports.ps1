# List of files to fix
$files = @(
    "backend/src/controllers/admin.controller.ts",
    "backend/src/controllers/business.controller.ts",
    "backend/src/controllers/customer.controller.ts",
    "backend/src/controllers/dashboard.controller.ts",
    "backend/src/__tests__/campaign.test.ts",
    "backend/src/__tests__/referral.test.ts",
    "backend/src/migrations/addRewardDescription.ts"
)

# Fix each file
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace 'import Campaign, { ICampaign } from ''\.\./models/campaign\.model''', 'import { Campaign, ICampaign } from ''../models/campaign'''
        Set-Content $file $content
        Write-Host "Fixed imports in $file"
    } else {
        Write-Host "File not found: $file"
    }
} 