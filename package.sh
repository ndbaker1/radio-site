#!/bin/bash
project="radio-site"
builddir=$project

echo 'Install and Build Static Files...'
npm install
npm run build

echo 'Create builddir Folder...'
mkdir -p $builddir

echo 'Build Server and Move Static Files...'
cp -a ./out ./$builddir/out 
npx tsc --project tsconfig.server.json --outDir $builddir

echo "Required Modules Script..."
echo '
  {
    "dependencies": {
		  "cli-spinner": "^0.2.10",
		  "cors": "^2.8.5",
		  "express": "^4.17.1",
		  "googleapis": "^67.0.0",
		  "inquirer": "^7.3.3",
		  "localtunnel": "^2.0.1",
		  "socket.io": "^3.1.1"
	  }
  }' > $builddir/package.json

echo 'tar folder...'
tar cvf $project.tar $builddir

echo 'Cleanup builddir Folder...'
rm -rf ./$builddir