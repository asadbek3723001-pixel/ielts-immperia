@echo off
echo Starting Build Process...

echo Building Backend...
cd backend
call npm install
call npx prisma generate
call npm run build
cd ..

echo Building Frontend...
cd frontend
call npm install
call npm run build
cd ..

echo Build Completed Successfully!
