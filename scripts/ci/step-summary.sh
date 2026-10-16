#!/usr/bin/env bash
# Append stdin Markdown to the Forgejo Actions job summary.
#
# Forgejo (server >= 17.0, runner >= 13.2) renders everything a step appends to
# $GITHUB_STEP_SUMMARY as a Markdown block above the job logs, in step order.
# $GITHUB_STEP_SUMMARY is used instead of $FORGEJO_STEP_SUMMARY because it is
# the portable name: older act-based runners set it too (content is silently
# discarded there) and GitHub Actions understands it as well.
# No-op when unset, so exotic runner setups keep CI green.
[ -n "${GITHUB_STEP_SUMMARY:-}" ] || exit 0
cat >> "$GITHUB_STEP_SUMMARY"
