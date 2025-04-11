## ai-frontend

Create-react-app static frontend. Can run in an S3 bucket behind a CDN or in a Docker container with ann nginx base image.

---

## Commands

```
# deployment
cd frontend
npm ci
npm run build
aws s3 rm s3://ai.ikenley.com/ai --recursive
aws s3 cp ./build/ s3://ai.ikenley.com/ai --recursive
aws cloudfront create-invalidation --distribution-id E2RJG6697RQHDN --paths "/*"
```
