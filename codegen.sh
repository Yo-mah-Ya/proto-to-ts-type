protoc \
    --plugin="./build/src/protoc-gen-index" \
    --index_out=. \
    --index_opt=useJsonName=true,enumValueAsString=true \
    $1
