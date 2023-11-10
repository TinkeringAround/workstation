# Trigger Get-Samples Workflow
curl -L -X POST \ 
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Authorization: Bearer TOKEN" \
  https://api.github.com/repos/tinkeringaround/song-creation-pipeline/actions/workflows/75556103/dispatches \
  -d '{"ref":"main","inputs":{"search_query": "SEARCH"}}'
