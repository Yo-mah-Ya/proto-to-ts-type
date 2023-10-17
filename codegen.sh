protoc \
    --plugin="./build/src/protoc-gen-index" \
    --index_out=. \
    $1
