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
	rotate: 25,
	/**
	 * Instances to exclude. Must be in format:
	 * 'instanceName': null (the null is optional as the only relevant bit is
	 * 	the instance name)
	 */
	exclude: {}
};
