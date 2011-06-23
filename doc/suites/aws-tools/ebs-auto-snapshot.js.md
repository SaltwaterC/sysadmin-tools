## Usage mode

Add your AWS credentials (accessKeyId + secretAccessKey) at the top of the ebs-auto-snapshot.js script, into the settings object. Place the script to your server machine. Install the dependencies. Add it to the crontab.

You may edit the regions where it operates (by default it operates only in us-east-1). You may change the number of snapshots to keep per volume. By default it keeps 30 snapshots per volume.

## Dependencies

 * node.js (developed under v0.4.8)
 * aws-js (https://github.com/SaltwaterC/aws-js)
 * xml2js (aws-js dependency, my fork that includes a specific patch, https://github.com/SaltwaterC/node-xml2js)
 * sax (xml2js dependency, https://github.com/isaacs/sax-js)

The dependencies are added as git submodules into the node_modules directory that you can find next to ebs-auto-snapshot.js. You may want to install this via git since 2/3 of those dependencies aren't publish to the npm registry.

## Notes

This script is intended to be used as a cron job. The info messages go to STDOUT while the errors go to STDERR, therefore you may configure the job to send you an email just in case of error. For example:

> 0 0 * * * * /path/to/node /path/to/ebs-auto-snapshot.js > /dev/null

Runs every day at 12 AM while it sends all the info messages to the bit bucket. The errors go to your email if you configured the crontab to have a proper email address (such as the MAILTO environment variable).

For this new version, I rolled out my own aws-js implementation that has error reporting, but you may want to keep an eye onto the log messages.

This one liner fixes all the dependecy issues, if you don't want to clone my sysadmin-tools repository:

> mkdir -p node_modules && cd node_modules && git clone https://github.com/SaltwaterC/aws-js && git clone https://github.com/SaltwaterC/node-xml2js && git clone https://github.com/isaacs/sax-js

Run it into the same directory as the ebs-auto-snapshot.js location. Enjoy.

PS: you may want to use a IAM restricted user for this specific task. This is a IAM policy with the required privileges in order to run this script:

<pre>{
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
}</pre>
