#!/bin/bash
set -euo pipefail

case "$CIRCLE_BRANCH" in
  develop) BASE=$(git describe --tags --abbrev=0 --match 'release-dev-*' HEAD 2>/dev/null || true) ;;
  master) BASE=$(git describe --tags --abbrev=0 --match 'release-[0-9]*' HEAD 2>/dev/null || true) ;;
  *) BASE=$(git merge-base origin/develop HEAD) ;;
esac
if [ -z "$BASE" ]; then
  if [ -n "${BASE_REVISION:-}" ] && git cat-file -e "${BASE_REVISION}^{commit}" 2>/dev/null; then
    BASE=$BASE_REVISION
  else
    BASE=HEAD~1
  fi
fi
TURBO_SCM_BASE=$(git rev-parse "${BASE}^{commit}")
export TURBO_SCM_BASE
export TURBO_SCM_HEAD=HEAD
echo "Comparing $BASE ($TURBO_SCM_BASE)...HEAD"

TURBO_VERSION=$(jq -r '.devDependencies.turbo' package.json)
EJS_VERSION=$(jq -r '.devDependencies.ejs' package.json)

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
