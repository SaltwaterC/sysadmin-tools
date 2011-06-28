## How to

Refer to the ebs-auto-snapshot.js.md document for details about installation and usage mode. It follows the same design and usage mode as the ebs-auto-snapshot.js script.

## Notes

The RDS API currently restricts the number of snapshots to 25. This is retarded, I know, but currently there's no way past that limit. For more instances you have to decrease the rotate value in order to have a total number of snapshots below 25.

## IAM Policy

The only notable difference between rds-auto-snapshot.js and ebs-auto-snapshot.js is the required IAM policy with the minimal required privileges for this script to run:
<pre>

</pre>
