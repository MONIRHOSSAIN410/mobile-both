@echo off
set "LOG=D:\myproject\fix-log.txt"
set "BK=D:\myproject-backend-git-backup"
cd /d "D:\myproject"

echo ==== fix-backend-git v2 START ==== > "%LOG%" 2>&1

where git >nul 2>&1
if errorlevel 1 set "PATH=%PATH%;C:\Program Files\Git\cmd"
git --version >> "%LOG%" 2>&1

echo. >> "%LOG%" 2>&1
echo --- STEP 1: move nested backend\.git out --- >> "%LOG%" 2>&1
if not exist "backend\.git\" goto :nonested

attrib -h -s -r "backend\.git" >> "%LOG%" 2>&1
move "backend\.git" "%BK%" >> "%LOG%" 2>&1
if not exist "backend\.git\" goto :moved

echo move failed, trying robocopy... >> "%LOG%" 2>&1
robocopy "backend\.git" "%BK%" /E /MOVE /NFL /NDL /NJH /NJS >> "%LOG%" 2>&1
if not exist "backend\.git\" goto :moved

echo RESULT: FAIL-COULD-NOT-MOVE-NESTED-GIT >> "%LOG%" 2>&1
goto :end

:moved
echo moved backend\.git to %BK% >> "%LOG%" 2>&1
goto :step2

:nonested
echo no nested backend\.git found >> "%LOG%" 2>&1

:step2
echo. >> "%LOG%" 2>&1
echo --- STEP 2: drop the empty gitlink entry --- >> "%LOG%" 2>&1
git rm --cached backend >> "%LOG%" 2>&1
git rm --cached -r backend >> "%LOG%" 2>&1

echo. >> "%LOG%" 2>&1
echo --- STEP 3: stage backend files --- >> "%LOG%" 2>&1
git add backend >> "%LOG%" 2>&1

echo. >> "%LOG%" 2>&1
echo --- STEP 4: secret safety check --- >> "%LOG%" 2>&1
git diff --cached --name-only > "D:\myproject\staged-files.txt" 2>&1
findstr /i /c:"env.NEW" /c:"backend/.env" "D:\myproject\staged-files.txt" >nul 2>&1
if not errorlevel 1 (
  echo RESULT: ABORT-SECRET-FILE-WOULD-BE-COMMITTED >> "%LOG%" 2>&1
  type "D:\myproject\staged-files.txt" >> "%LOG%" 2>&1
  git reset >> "%LOG%" 2>&1
  goto :end
)
echo safety check OK - no secret files staged >> "%LOG%" 2>&1
git diff --cached --name-only --stat >> "%LOG%" 2>&1

echo. >> "%LOG%" 2>&1
echo --- STEP 5: commit --- >> "%LOG%" 2>&1
git commit -m "fix(deploy): track backend files directly - backend was a nested git repo so Render cloned an empty folder" >> "%LOG%" 2>&1

echo. >> "%LOG%" 2>&1
echo --- STEP 6: push --- >> "%LOG%" 2>&1
git push origin main >> "%LOG%" 2>&1
if errorlevel 1 (
  echo RESULT: PUSH-FAILED >> "%LOG%" 2>&1
  goto :verify
)
echo RESULT: PUSH-OK >> "%LOG%" 2>&1

:verify
echo. >> "%LOG%" 2>&1
echo --- STEP 7: verify backend/server.js in HEAD --- >> "%LOG%" 2>&1
git ls-tree -r --name-only HEAD backend >> "%LOG%" 2>&1

:end
echo. >> "%LOG%" 2>&1
echo ==== fix-backend-git v2 DONE ==== >> "%LOG%" 2>&1
exit
