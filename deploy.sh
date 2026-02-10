#!/bin/bash

# Safe bash flags
set -euxo pipefail

# Check for required GH_TOKEN
if [ -z "${GH_TOKEN:-}" ]; then
  echo "Error: GH_TOKEN environment variable is required"
  exit 1
fi

# Default values
REPO="${REPO:-munnificent/salary-kz}"
BRANCH="${BRANCH:-gh-pages}"

# Navigate to dist directory (build artifacts from Travis CI script phase)
cd dist

# Create .nojekyll file (if it doesn't exist)
if [ ! -f .nojekyll ]; then
  touch .nojekyll
fi

# Initialize git repository
git init

# Configure git user
git config user.name "Travis CI"
git config user.email "travis@travis-ci.org"

# Add all files and commit
git add -A
git commit -m "Deploy to GitHub Pages from Travis CI"

# Set remote with GH_TOKEN
git remote add origin "https://${GH_TOKEN}@github.com/${REPO}.git"

# Force push to gh-pages branch
git push -f origin HEAD:${BRANCH}

echo "Successfully deployed to ${BRANCH} branch"
