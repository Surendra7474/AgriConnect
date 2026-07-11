@echo off
echo === Testing AgriConnect Backend API ===
echo.

echo [1] Registering test user...
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"fullName\":\"Test Farmer\",\"email\":\"test@test.com\",\"password\":\"Test@12345\",\"phone\":\"+1234567890\",\"role\":\"FARMER\"}"
echo.
echo.

echo [2] Logging in as admin...
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@agriconnect.local\",\"password\":\"Admin@12345\"}"
echo.
echo.

pause
