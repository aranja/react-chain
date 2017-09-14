#!/usr/bin/env bash

tslint -c './tslint.json' \
  -e './node_modules/**/*' \
  -e './es/**/*'\
  -e './lib/**/*' \
  './src/**/*.{ts,tsx}';
