@echo off
setlocal
cd /d "D:\myproject"

echo ==========================================================
echo  backend ke mobile-both repo er vitore merge kora hocche
echo ==========================================================

echo.
echo [1/5] backend er alada .git soranor kaj...
if exist "backend\.git" (
  if exist "D:\myproject-backend-git-backup" (
    echo      ERROR: D:\myproject-backend-git-backup age thekei ache.
    echo      Oi folder rename/delete kore abar chalan.
    goto :end
  )
  move "backend\.git" "D:\myproject-backend-git-backup" >nul
  if errorlevel 1 (
    echo      ERROR: move fail holo. Explorer diye backend\.git folder ta
    echo      D:\myproject-backend-git-backup e niye jan, tarpor abar chalan.
    goto :end
  )
  echo      OK - backend\.git -^> D:\myproject-backend-git-backup
) else (
  echo      backend\.git nei - skip
)

echo.
echo [2/5] purono gitlink ^(khali submodule^) entry remove...
git rm --cached backend >nul 2>&1
git rm --cached -r backend >nul 2>&1
echo      OK

echo.
echo [3/5] backend er shob file add...
git add backend
echo      OK

echo.
echo [4/5] Ki ki add holo dekhun:
echo ----------------------------------------------------------
git status --short
echo ----------------------------------------------------------
echo.
echo  !! Upore jodi  .env  ba  env.NEW.txt  dekhen, tahole
echo     Ctrl+C chepe thamun - oigulo te password ache.
echo     Na dekhle kono key chapun.
pause

echo.
echo [5/5] commit + push...
git commit -m "fix: track backend files directly (backend was a nested git repo)"
git push origin main

echo.
echo ==========================================================
echo  Sesh. Ekhon Render dashboard e giye Manual Deploy din.
echo  Settings: Root Directory = backend
echo            Build Command  = npm install
echo            Start Command  = npm start
echo ==========================================================

:end
echo.
pause
