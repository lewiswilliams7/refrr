#!/bin/bash
set -e
npm install -g serve
cd "$(dirname "$0")"
node ./node_modules/serve/bin/serve.js -s build 