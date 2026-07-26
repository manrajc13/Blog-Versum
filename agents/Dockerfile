# AWS Lambda container image for the BlogVerse author workflow.
# Build context MUST be the repo root so `agents/` is a package under
# LAMBDA_TASK_ROOT and `from agents.main import run_author` resolves:
#     docker build -f agents/Dockerfile -t blogverse-agents .
FROM public.ecr.aws/lambda/python:3.12

# Deps first for layer caching. LAMBDA_TASK_ROOT is the function code root.
COPY agents/requirements.txt ${LAMBDA_TASK_ROOT}/agents/requirements.txt
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/agents/requirements.txt

# App code. Keep the package importable as `agents.*` (matches current imports).
COPY agents/ ${LAMBDA_TASK_ROOT}/agents/

# handler = <module path>.<function>
CMD ["agents.lambda_handler.handler"]
