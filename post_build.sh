#!/bin/sh

index_js='build/src/index.js'
if [ -f ${index_js} ] ; then
    mv build/src/index.js build/src/protoc-gen-index
    chmod 700 build/src/protoc-gen-index
fi
