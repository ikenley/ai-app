# ai-app

This is a personal test client for interacting with [OpenAI's ChatGPT](https://platform.openai.com/docs/overview)

This is also a test of the "dollar full stack app". The goal is to:
1. Have an app that can be hosted for close to zero marginal cost:
    - Data layer: Existing reserved RDS PostgreSQL instance
    - API layer: Express.js app hosted in a Lambda function behind an ALB listener rule
    - Front-end: Static React app on an S3 bucket behind a CloudFront CDN
2. Maintain the option value to convert it to an enterprise-ready Docker-based hosting strategy with minimal refactoring.



[Live demo](https://ai.ikenley.com/)

## IaC

See [https://github.com/ikenley/template-infrastructure](https://github.com/ikenley/template-infrastructure)

---

## Git Submodules

For local development, this project uses the prediction-app repo as a submodule. 

```
git submodule add https://github.com/ikenley/prediction-app.git
```

## Getting Started

```
# Install aws ecr cli helper
# https://github.com/awslabs/amazon-ecr-credential-helper

# Configure env vars
cp ./.env.example ./.env

# Start docker dependencies
make deps

# Run API service
cd ./api
npm i
npm run start

# Run front-end service
cd ./front-end
npm i
npm run start
```

---

- figure out ideal way to host on cloudfront w/ react-router
    - https://dev.to/santisbon/serving-a-react-router-app-through-cloudfront-1h28
