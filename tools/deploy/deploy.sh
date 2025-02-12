#!/usr/bin/env bash

yarn build

aws s3 sync build/ s3://weplan.my --delete
