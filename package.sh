#!/bin/bash
project="radio-site"
builddir=".$project"

echo 'Install and Build Static Files...'
npm install
npm run build

echo 'Create builddir Folder...'
mkdir -p $builddir

echo 'Build Server and Move Static Files...'
npx tsc --project tsconfig.server.json --outDir $builddir
cp -a ./out ./$builddir/out 

echo 'tar folder...'
tar cvf $project.tar $builddir

echo 'Cleanup builddir Folder...'
rm -rf ./$builddir