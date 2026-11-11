#!/bin/bash
set -euo pipefail

# What "affected" is measured against: feature branches compare to their merge-base with develop,
# develop/master to the commit the branch pointed at before this push (falling back to the previous commit).
if [ "$CIRCLE_BRANCH" = "develop" ] || [ "$CIRCLE_BRANCH" = "master" ]; then
  BASE="${BASE_REVISION:-}"
  if [ -z "$BASE" ] || ! git cat-file -e "${BASE}^{commit}" 2>/dev/null; then
    BASE=$(git rev-parse HEAD~1)
  fi
else
  git fetch --quiet origin develop
  BASE=$(git merge-base origin/develop HEAD)
fi
export TURBO_SCM_BASE="$BASE"
export TURBO_SCM_HEAD=HEAD
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
