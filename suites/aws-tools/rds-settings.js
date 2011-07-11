module.exports = {
	/**
	 * Your AWS credentials
	 */
	accessKeyId: '',
	secretAccessKey: '',
	/**
	 * Place here the RDS regions where to operate
	 */
	regions: ['us-east-1'],
	/**
	 * Number of snapshots per RDS instance to keep
	 */
	rotate: 25
};
