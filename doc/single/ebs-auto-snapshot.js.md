## Usage mode

Add your AWS credentials (accessKeyId + secretAccessKey) at the top of the ebs-auto-snapshot.js script, into the settings object. Place the script to your server machine. Install the dependencies. Add it to the crontab.

## Dependencies

 * node.js (developed under v0.4.8)
 * aws-lib (https://github.com/livelycode/aws-lib)
 * npm (you may manually install the xml2js and sax with enough git fu)
 * xml2js (aws-lib dependency, https://github.com/Leonidas-from-XIV/node-xml2js)
 * sax (aws-lib dependency, https://github.com/isaacs/sax-js)

## Notes

This script is intended to be used as a cron job. The info messages go to STDOUT while the errors go to STDERR, therefore you may configure the job to send you an email just in case of error. For example:

> 0 0 * * * * /path/to/node /path/to/ebs-auto-snapshot.js > /dev/null

Runs every day at 12 AM while it sends all the info messages to the bit bucket. The errors go to your email if you configured the crontab to have a proper email address (such as the MAILTO environment variable).

Since aws-lib kinda blows at error reporting, or should I say, it has *NO* error reporting, this script wasn't tested with a faulty EC2 API. Anyway, your mileage may vary. I have plans to roll out my own aws-lib proper implementation, but till then, this script may work as expected.

Since the aws-lib isn't published to the npm registry, this one liner fixes all the dependecy issues:

> mkdir -p node_modules && cd node_modules && git clone https://github.com/livelycode/aws-lib.git && cd aws-lib && npm install

Run it into the same directory as the ebs-auto-snapshot.js location. Enjoy.

PS: you may want to use a IAM restricted user for this specific task. This is a IAM policy with the required privileges in order to run this script:

{
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "EC2:DescribeVolumes",
        "EC2:DescribeSnapshots",
        "EC2:CreateSnapshot",
        "EC2:DeleteSnapshot"
      ],
      "Resource": "*"
    }
  ]
}

