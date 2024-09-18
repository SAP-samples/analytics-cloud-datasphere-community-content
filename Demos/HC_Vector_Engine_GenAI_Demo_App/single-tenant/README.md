# Steps to run the application in hybrid mode
## the following commands in the mtaext directory might not be required
### 1. Steps required for deploying to CF
Running "npm run build:mbt" seems to execute a lot of things all over the "single-tenant" directory, we are not sure whether these are also required for running the app locally in hybrid mode.
Execute the commands in the next steps 2 and 3 below, first. If these don't work, come back here to Step 1, execute them, and then continue with Step 3.
- in /deploy/cf/mtaext, copy the file free-tier.mtaext, and rename it to free-tier-private.mtaext
- in /deploy/cf/mtaext, run "node install mbt"
- in /deploy/cf/mtaext, run "node install mbt"
- in /deploy/cf/mtaext, execute "npm run build:mbt"
## these commands are required, roughly in this order
### 2: Bindings (only required to be executed once)
- cds bind -2 btp-cap-genai-rag-single-tenant-ai-destination,btp-cap-genai-rag-single-tenant-ai-uaa,btp-cap-genai-rag-single-tenant-ai-hdi-container --for hybrid
- cds bind html5-apps-repo -2 btp-cap-genai-rag-single-tenant-ai-html5-repo-runtime --kind html5-apps-repo --for hybrid-router
- cds bind html5-apps-repo -2 btp-cap-genai-rag-single-tenant-ai-html5-repo-host --kind html5-apps-repo --for hybrid-html5
- add the file /code/.env, add content from btp-cap-genai-rag/multi-tenant/code/.env.sample and remove the line with TENANT_HOST_PATTERN
### 3: Preparing and running hybrid mode locally
- in /code, run "npm install ts-node"
- [maybe not required] in /code, run "npm install curl"
- [maybe not required] in /code, run "npm install @swc/core@1.3.107"
- in /code, run "npm run build"
- in /code, run "npm run hybrid"