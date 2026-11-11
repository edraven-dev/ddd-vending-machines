#!/bin/bash
set -euo pipefail

# nx/set-shas (see config.yml) exported NX_BASE/NX_HEAD via $BASH_ENV: the commit of the last successful
# build-lint-test-deploy workflow on master/develop, or the merge-base with origin/develop on other branches.
export TURBO_SCM_BASE="${NX_BASE:?NX_BASE is not set - nx/set-shas must run first}"
export TURBO_SCM_HEAD="${NX_HEAD:-HEAD}"
echo "Comparing $TURBO_SCM_BASE...$TURBO_SCM_HEAD"

TURBO_VERSION=$(jq -r '.devDependencies.turbo' package.json)
EJS_VERSION=$(jq -r '.devDependencies.ejs' package.json)

# Packages affected for a task that actually define a script for it: [{ id, name, dir }]
affected() {
  npx -y "turbo@${TURBO_VERSION}" run "$1" --affected --dry=json |
    jq --arg task "$1" '[.tasks[] | select(.task == $task and .command != "<NONEXISTENT>")
      | { id: (.directory | split("/") | last), name: .package, dir: .directory }]'
}

BUILDABLE_PROJECTS=$(affected build | jq '{buildable_projects: .}')
LINTABLE_PROJECTS=$(affected lint | jq '{lintable_projects: .}')
TESTABLE_PROJECTS=$(affected test:ci | jq '{testable_projects: .}')
PARAMETERS=$(cat ./.circleci/parameters.json)
NODE_VERSION=$(tr -d '[:space:]' < ./.nvmrc | sed 's/^v//')

MERGED_JSON=$(echo "${BUILDABLE_PROJECTS}${LINTABLE_PROJECTS}${TESTABLE_PROJECTS}${PARAMETERS}" | jq -s add | jq --arg branch "$CIRCLE_BRANCH" --arg node_version "$NODE_VERSION" '. + {branch: $branch, node_version: $node_version}')
echo "${MERGED_JSON}" > ./.circleci/affected-projects.json
cat ./.circleci/affected-projects.json

npx -y "ejs@${EJS_VERSION}" ./.circleci/generated-config-template.ejs -f ./.circleci/affected-projects.json -o ./.circleci/generated-config.yml
