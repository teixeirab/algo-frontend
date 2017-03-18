#!/bin/bash
gulp build --mode=$NODE_ENV

nginx -g 'daemon off;'
