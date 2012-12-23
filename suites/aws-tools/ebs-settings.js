module.exports = {
	/**
	 * Your AWS credentials
	 */
	accessKeyId: process.env.AWS_ACCEESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	/**
	 * Place here the EC2 regions where to operate
	 */
	regions: ['us-east-1'],
	/**
	 * Number of snapshots per volume to keep
	 */
	rotate: 30
};
