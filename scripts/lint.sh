#!/usr/bin/env bash

tslint -c './tslint.json' \
  -e './packages/**/node_modules/**/*' \
  -e './packages/**/es/**/*'\
  -e './packages/**/lib/**/*' \
  './packages/**/*.{ts,tsx}';
