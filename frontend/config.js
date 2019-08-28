const getBucketName = () => {
    if (process.env.VCAP_SERVICES) {
        const vcap = process.env.VCAP_SERVICES
        const vcapJson = JSON.parse(vcap)
        return vcapJson['aws-s3-bucket'][0].credentials.bucket_name
    } else {
        return process.env.bucket_name
    }
}

const config = {
    widths: [320, 480, 600, 800, 768, 1024, 1280],
    pages: ['homepage', 'funding', 'funding/outcomes'],
    host: `https://${getBucketName()}.s3.amazonaws.com`
}

module.exports = config