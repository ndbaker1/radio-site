# Music Radio Site
A site build with `NextJS` and server hosted using `expressjs` and `localtunnel` in order to sync up listeners to the same active songs loaded from a Google Drive.

## Setup
Install node modules, build NextJS static files, start express and localtunnel with a preferred subdomain ( which may not be guarenteed ).
```
npm install
npm run build
npm run start SUBDOMAIN
```

#### Know Problems:
> if the `sharp` module is missing from the require stack then first attempt installing it with `npm i sharp`. if not successfully, then diagnose the errors based on your OS and configurations.

    npm ERR! gyp info spawn args [ 'BUILDTYPE=Release', '-C', 'build' ]
    npm ERR! ../src/common.cc:24:10: fatal error: vips/vips8: No such file or directory

*Make sure that your system has libvips-dev, vips-dev, or the corresponding lib and that you have updated its core SDKs*