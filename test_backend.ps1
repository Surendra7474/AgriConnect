$ErrorActionPreference = "Stop"

Write-Host "=== Testing Registration ===" -ForegroundColor Cyan
try {
    $regBody = @{
        fullName = "Test User"
        email = "testuser@example.com"
        password = "Test@12345"
        phone = "9876543210"
        role = "FARMER"
    } | ConvertTo-Json

    $regResponse = Invoke-RestMethod -Uri "https://agriconnect-2-lpgo.onrender.com/api/auth/register" -Method Post -ContentType "application/json" -Body $regBody
    Write-Host "Registration SUCCESS:" -ForegroundColor Green
    $regResponse | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Registration FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Testing Login (Admin) ===" -ForegroundColor Cyan
try {
    $loginBody = @{
        email = "admin@agriconnect.local"
        password = "Admin@12345"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "https://agriconnect-2-lpgo.onrender.com/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    Write-Host "Login SUCCESS:" -ForegroundColor Green
    $loginResponse | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Login FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    }
