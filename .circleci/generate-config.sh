#!/bin/bash
set -euo pipefail

BASE="${NX_BASE:?NX_BASE is not set - nx/set-shas must run first}"
if [ "$CIRCLE_BRANCH" = develop ] || [ "$CIRCLE_BRANCH" = master ]; then
  if [ -z "${CIRCLE_API_TOKEN:-}" ]; then
    echo "WARNING: CIRCLE_API_TOKEN is not set, so nx/set-shas can't read previous workflows (see README)"
  fi

  if [ -n "${BASE_REVISION:-}" ] && git cat-file -e "${BASE_REVISION}^{commit}" 2>/dev/null; then
    BASE=$(git merge-base "$BASE" "$BASE_REVISION" || echo "$BASE")
  fi
fi
export TURBO_SCM_BASE="$BASE"
export TURBO_SCM_HEAD="${NX_HEAD:-HEAD}"
echo "Comparing $TURBO_SCM_BASE...$TURBO_SCM_HEAD"

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
