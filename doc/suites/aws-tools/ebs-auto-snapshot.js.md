## Usage mode

Add your AWS credentials (accessKeyId + secretAccessKey) into the ebs-settings.js script. Place the scripts to your server machine. Install the dependencies. Add it to the crontab.

You may edit the regions where it operates (by default it operates only in us-east-1). You may change the number of snapshots to keep per volume. By default it keeps 30 snapshots per volume.

## Dependencies

 * node.js (developed under v0.4.8)
 * npm
 * aws2js (+ its dependencies)

> cd /path/to/aws-tools && npm install

The aws-tools directory has a package.json file, therefore npm should handle the depdendencies.

## Notes

This script is intended to be used as a cron job. The info messages go to STDOUT while the errors go to STDERR, therefore you may configure the job to send you an email just in case of error. For example:

> 0 0 * * * * /path/to/node /path/to/ebs-auto-snapshot.js > /dev/null

Runs every day at 12 AM while it sends all the info messages to the bit bucket. The errors go to your email if you configured the crontab to have a proper email address (such as the MAILTO environment variable).

## IAM Policy

You may want to use a IAM restricted user for this specific task. This is a IAM policy with the required privileges in order to run this script:

<pre>
{
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "EC2:DescribeImages",
        "EC2:DescribeVolumes",
        "EC2:DescribeSnapshots",
        "EC2:CreateSnapshot",
        "EC2:DeleteSnapshot"
      ],
      "Resource": "*"
    }
  ]
}
</pre>
