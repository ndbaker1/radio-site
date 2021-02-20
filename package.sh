#!/bin/bash
project="radio-site"

echo 'Install and Build Static Files...'
npm install
npm run build

echo 'Create Project Folder...'
mkdir -p $project

echo 'Build Server and Move Static Files...'
npx tsc --project tsconfig.server.json --outDir $project
cp -a ./out ./$project/out 

echo 'tar folder...'
tar cvf $project.tar $project

echo 'Cleanup Project Folder...'
rm -rf ./$project