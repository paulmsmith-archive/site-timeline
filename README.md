# Site Timeline

_Takes screenshots to create a timeline of site changes._

## Deployment
`cf push`

## Configuration
To change the paths to be screenshoted. Edit `paths` in `manifest.yml`

## Running locally
Made up of 2 apps:

### screenshot-maker
Takes screenshots using Puppeteer. Runs on a schedule to generate them daily.

- `cd screenshot-maker`
- `yarn install`
- `node run.js`

By default it will write the screenshots locally. However, if you set the environment variable `S3` it will write them to S3 (note this requires [getting AWS credentials](#getting-aws-credentials)).

### frontend
Frontend to browse screenshots available in S3

- [Get AWS credentials](#getting-aws-credentials)
- `cd frontend`
- `yarn install`
- `node bin/www`

#### Getting AWS Credentials
Get credentials for service name `nlhf-screenshots` following the steps in https://docs.cloud.service.gov.uk/deploying_services/s3/#connect-to-an-s3-bucket-from-outside-of-the-gov-uk-paas and add the credentials in using the AWS CLI as per https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html#cli-quick-configuration