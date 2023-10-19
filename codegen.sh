protoc \
    --plugin="./build/src/protoc-gen-ts-type" \
    --ts-type_out=. \
    $1
