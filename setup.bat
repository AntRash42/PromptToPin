@echo off
REM ───────────────────────────────────────────────────────────────────
REM create-structure.bat — scaffold cookbook/backend and cookbook/frontend
REM Place this .bat where you want the top-level repo folder.
REM ───────────────────────────────────────────────────────────────────

set /p projectName=Enter your project name: 
echo Creating project folder "%projectName%"
mkdir "%projectName%"
cd "%projectName%"

@REM REM --- 1) Root folder ---
@REM mkdir "cookbook"

REM --- 2) Backend folders ---
mkdir "backend"
mkdir "backend\config"
mkdir "backend\models"
mkdir "backend\middleware"
mkdir "backend\controllers"
mkdir "backend\routes"

echo { > "backend\package.json"
  echo "name": "my-backend", >> "backend\package.json"
  echo "version": "1.0.0", >> "backend\package.json"
  echo "scripts": { >> "backend\package.json"
    echo "dev": "node server.js" >> "backend\package.json"
  echo } >> "backend\package.json"
echo } >> "backend\package.json"

REM --- 3) Frontend folders ---
mkdir "frontend"
mkdir "frontend\public"
mkdir "frontend\src"
mkdir "frontend\src\api"
mkdir "frontend\src\contexts"
mkdir "frontend\src\components"
mkdir "frontend\src\pages"

REM --- 4) Backend files ---
echo console.log("Hello World") > "backend\server.js"
type nul > "backend\.env"
type nul > "backend\config\db.js"

type nul > "backend\models\User.js"
type nul > "backend\models\Recipe.js"
type nul > "backend\models\Review.js"
type nul > "backend\models\Collection.js"

type nul > "backend\middleware\auth.js"

type nul > "backend\controllers\userController.js"
type nul > "backend\controllers\recipeController.js"
type nul > "backend\controllers\reviewController.js"
type nul > "backend\controllers\collectionController.js"

type nul > "backend\routes\userRoutes.js"
type nul > "backend\routes\recipeRoutes.js"
type nul > "backend\routes\reviewRoutes.js"
type nul > "backend\routes\collectionRoutes.js"

REM --- 5) Frontend files ---
echo {"name":"cookbook","version":"1.0.0","private":true,"scripts":{"dev":"vite","build":"vite build","preview":"vite preview"},"dependencies":{"react":"^18.2.0","react-dom":"^18.2.0"},"devDependencies":{"vite":"^4.0.0","@vitejs/plugin-react":"^4.0.0"}} > "frontend\package.json"


echo import React from "react"; > "frontend\src\HelloWorld.jsx"
echo. >> "frontend\src\HelloWorld.jsx"
echo export default function HelloWorld() { >> "frontend\src\HelloWorld.jsx"
echo.    return ^<h1^>Hello World^</h1^>; >> "frontend\src\HelloWorld.jsx"
echo } >> "frontend\src\HelloWorld.jsx"



echo import React from "react"; > "frontend\src\index.jsx"
echo import ReactDOM from "react-dom/client"; >> "frontend\src\index.jsx"
echo import App from "./App"; >> "frontend\src\index.jsx"
echo. >> "frontend\src\index.jsx"
echo ReactDOM.createRoot(document.getElementById("root")).render( >> "frontend\src\index.jsx"
echo.    ^<React.StrictMode^> >> "frontend\src\index.jsx"
echo.        ^<App /^> >> "frontend\src\index.jsx"
echo.    ^</React.StrictMode^> >> "frontend\src\index.jsx"
echo ); >> "frontend\src\index.jsx"

echo import React from "react"; > "frontend\src\App.jsx"
echo import HelloWorld from "./HelloWorld"; >> "frontend\src\App.jsx"
echo. >> "frontend\src\App.jsx"
echo export default function App() { >> "frontend\src\App.jsx"
echo.    return ( >> "frontend\src\App.jsx"
echo.        ^<div^> >> "frontend\src\App.jsx"
echo.            ^<HelloWorld /^> >> "frontend\src\App.jsx"
echo.        ^</div^> >> "frontend\src\App.jsx"
echo.    ); >> "frontend\src\App.jsx"
echo } >> "frontend\src\App.jsx"


type nul > "frontend\src\index.js"

echo ^<!DOCTYPE html^> > "frontend\index.html"
echo ^<html lang="en"^> >> "frontend\index.html"
echo ^<head^> >> "frontend\index.html"
echo ^<meta charset="UTF-8" /^> >> "frontend\index.html"
echo ^<meta name="viewport" content="width=device-width, initial-scale=1" /^> >> "frontend\index.html"
echo ^<title^>React Hello World^</title^> >> "frontend\index.html"
echo ^</head^> >> "frontend\index.html"
echo ^<body^> >> "frontend\index.html"
echo ^<div id="root"^>^</div^> >> "frontend\index.html"
echo ^<script type="module" src="/src/index.jsx"^>^</script^> >> "frontend\index.html"
echo ^</body^> >> "frontend\index.html"
echo ^</html^> >> "frontend\index.html"


echo.
echo ================================================
echo   Scaffold complete! Your cookbook folder is ready.
echo ================================================
pause
