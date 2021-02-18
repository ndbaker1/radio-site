#!/bin/bash
project="radio-site"

# create folder for package
mkdir -p $project
# build server.js and move static files 
cp -a ./out ./$project/out 
mv server.js ./$project/server.js
# tar folder
tar cvf $project.tar $project
rm -rf ./$project