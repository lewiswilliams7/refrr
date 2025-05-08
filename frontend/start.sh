#!/bin/bash
set -e
npm install -g serve
cd build && serve -s . 