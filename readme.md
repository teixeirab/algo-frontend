## Build
The front end needs to connect to a backend API in order to access to render the interfaces with data. It requires it to have a API host config. The file  `client/js/configs/index.js` is a configuration template, and the `local.js` file is an example config file. Basically, it pass on the values from `local.js` to the template config file.

To build the front end with config files, make sure it have gulp tool
```
npm install -g gulp-cli
```

Under the front end code folder
```
npm install
```

Build using local.js config file.
```
gulp build --mode=local
```
Similarly, if want to build with other config file other than local.js, simply change the `--mode={{filename}}` option

## Serving
After build the front end code to point to a proper backend API url, the front end files should be ready to serve under any web server.
