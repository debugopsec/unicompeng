@echo off
cd /d "%~dp0"
node scripts\telegram-watcher.mjs
if errorlevel 1 pause
