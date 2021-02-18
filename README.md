# Music Radio Site
A site build with `NextJS` and server hosted using `expressjs` and `localtunnel` in order to sync up listeners to the same active songs loaded from a Google Drive.

## Precompiled Run
```
Grab Executables:
curl -L https://github.com/ndbaker1/radio-site/raw/master/radio-site.tar > radio-site.tar && tar xvf radio-site.tar && rm radio-site.tar

Install Node Modules:
npm install express localtunnel

Contruct a SongList JSON with the loader (this is just mine):
curl -L https://raw.githubusercontent.com/ndbaker1/radio-site/master/songlist.json > songlist.json

Run:
node server.js SUBDOMAIN
```

## Setup
Install node modules, build NextJS static files, start express and localtunnel with a preferred subdomain ( which may not be guarenteed ).
```
npm install
npm run build
npm run start SUBDOMAIN
```

#### Known Issues:
> if the `sharp` module is missing from the require stack then first attempt installing it with `npm i sharp`. if not successfully, then diagnose the errors based on your OS and configurations.

    npm ERR! gyp info spawn args [ 'BUILDTYPE=Release', '-C', 'build' ]
    npm ERR! ../src/common.cc:24:10: fatal error: vips/vips8: No such file or directory

*Make sure that your system has libvips-dev, vips-dev, or the corresponding lib and that you have updated its core SDKs*