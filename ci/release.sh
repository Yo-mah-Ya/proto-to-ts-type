#!/usr/bin/env bash

SOURCE_DIR=$(cd $(dirname ${BASH_SOURCE:-$0}) && pwd)

cd ${SOURCE_DIR}

new_tag=$(. tag/bump_version.sh)
git tag -a ${new_tag} -m "${new_tag}"

package_json="../package.json"
new_tag_without_v=$(echo ${new_tag} | sed s/v//)
(rm ${package_json} && jq ".version|=\"${new_tag_without_v}\"" > ${package_json}) < ${package_json}
