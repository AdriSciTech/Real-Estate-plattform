# Setup script for Rental Platform development environment (Windows)

Write-Host "🏠 Setting up Rental Platform for Students..." -ForegroundColor Green

# Check if pnpm is installed
try {
    pnpm --version | Out-Null
    Write-Host "✅ pnpm is already installed" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Create .env.local file in root
Write-Host "🔐 Setting up environment file..." -ForegroundColor Yellow

$envFile = ".env.local"

if (Test-Path $envFile) {
    Write-Host "✅ $envFile already exists" -ForegroundColor Green
} else {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" $envFile
        Write-Host "📝 Created $envFile from .env.example" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  No .env.example found. Please create .env.local manually" -ForegroundColor Red
    }
    Write-Host "⚠️  Please update $envFile with your credentials" -ForegroundColor Magenta
}

# Success message
Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n🚀 To start development:" -ForegroundColor Cyan
Write-Host "   pnpm dev              # Run all apps" -ForegroundColor White
Write-Host "   pnpm dev:listings     # Run listings site only" -ForegroundColor White
Write-Host "   pnpm dev:upload       # Run upload dashboard only" -ForegroundColor White
Write-Host "   pnpm dev:reservations # Run reservations only" -ForegroundColor White
Write-Host "`n📚 For more information, see README.md" -ForegroundColor Gray
