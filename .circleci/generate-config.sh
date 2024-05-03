#!/bin/bash

BUILDABLE_PROJECTS=$(npx nx show projects --affected --base=$NX_BASE --head=$NX_HEAD -t build | jq -R . | jq -s '{buildable_projects: .}')
LINTABLE_PROJECTS=$(npx nx show projects --affected --base=$NX_BASE --head=$NX_HEAD -t lint | jq -R . | jq -s '{lintable_projects: .}')
TESTABLE_PROJECTS=$(npx nx show projects --affected --base=$NX_BASE --head=$NX_HEAD -t test | jq -R . | jq -s '{testable_projects: .}')
PARAMETERS=$(cat ./.circleci/parameters.json)

MERGED_JSON=$(echo "${BUILDABLE_PROJECTS}${LINTABLE_PROJECTS}${TESTABLE_PROJECTS}${PARAMETERS}" | jq -s add | jq --arg branch "$CIRCLE_BRANCH" '. + {branch: $branch}')
echo "${MERGED_JSON}" > ./.circleci/affected-projects.json
cat ./.circleci/affected-projects.json

npx -y --no ejs ./.circleci/generated-config-template.ejs -f ./.circleci/affected-projects.json -o ./.circleci/generated-config.yml