var rds = require('aws2js').load('rds');
var settings = require('./rds-settings.js');

rds.setCredentials(settings.accessKeyId, settings.secretAccessKey);

var ebs = {
	
	fetch: function (region) {
		console.log('Taking snapshots for region: ' + region);
		rds.setRegion(region);
		rds.request('DescribeDBInstances', function (error, response) {
			if ( ! error) {
				if (response.DescribeDBInstancesResult) {
					for (var i in response.DescribeDBInstancesResult.DBInstances.DBInstance) {
						var instance = response.DescribeDBInstancesResult.DBInstances.DBInstance[i];
						if ( ! (instance.DBInstanceIdentifier in settings.exclude)) {
							console.log('Sending to process instance: %s.', instance.DBInstanceIdentifier);
							ebs.process(region, instance.DBInstanceIdentifier);
						} else {
							console.log('Excluding from processing: %s.', instance.DBInstanceIdentifier);
						}
					}
				} else {
					console.error('ERROR: no instances returned.');
				}
			} else {
				console.error(error);
			}
		});
	},
	
	process: function (region, instanceId) {
		rds.setRegion(region);
		rds.request('DescribeDBSnapshots', {DBInstanceIdentifier: instanceId}, function (error, response)  {
			if ( ! error) {
				if (response.DescribeDBSnapshotsResult) {
					if (response.DescribeDBSnapshotsResult.DBSnapshots.DBSnapshot) {
						var i, timestamp, count = 0, snaps = {}, delay = false;
						var snapshots = response.DescribeDBSnapshotsResult.DBSnapshots.DBSnapshot;
						for (i in snapshots) {
							if (snapshots[i].Status == 'available' && snapshots[i].SnapshotType == 'manual') {
								timestamp = new Date(snapshots[i].SnapshotCreateTime).getTime();
								snaps[timestamp] = snapshots[i].DBSnapshotIdentifier;
								count++;
							}
						}
						/**
						 * Unlike the EC2 case, the RDS API is idiotic enough to return a
						 * totally unordered list of snapshots. This is the retarded child
						 * of the EC2 API.
						 */
						snaps = ebs.sort(snaps);
						if (count >= settings.rotate) {
							var counter = count - settings.rotate + 1;
							for (var i in snaps) {
								ebs.delete_snap(region, snaps[i]);
								counter--;
								if (counter == 0) {
									break;
								}
							}
						}
						if (count == settings.rotate) {
							delay = true;
						}
						
						if ( ! delay) {
							ebs.take_snap(region, instanceId);
						} else {
							/**
							 * Due to API limitation, tries to avoid SnapshotQuotaExceeded errors
							 */
							setTimeout(function () {
								ebs.take_snap(region, instanceId);
							}, 60000);
						}
					} else {
						ebs.take_snap(region, instanceId);
					}
				} else {
					console.error('ERROR: no snapshots returned.');
				}
			} else {
				console.error(error);
			}
		});
	},
	
	sort: function (o) {
		var sorted = {},
		key, a = [];
		for (key in o) {
			if (o.hasOwnProperty(key)) {
				a.push(key);
			}
		}
		a.sort();
		for (key = 0; key < a.length; key++) {
			sorted[a[key]] = o[a[key]];
		}
		return sorted;
	},
	
	delete_snap: function (region, snapshotId) {
		console.log('Delete snapshot: ' + snapshotId);
		rds.setRegion(region);
		rds.request('DeleteDBSnapshot', {DBSnapshotIdentifier: snapshotId}, function (error, result) {
			if (error) {
				console.error(error);
			}
		});
	},
	
	take_snap: function (region, instanceId) {
		var snapshotId = 'rds-auto-snapshot-js-' + new Date().getTime().toString(16);
		console.log('Take snapshot for instance-id: ' + instanceId + '; using snapshot-id: ' + snapshotId);
		var query = {
			DBInstanceIdentifier: instanceId,
			DBSnapshotIdentifier: snapshotId
		};
		rds.setRegion(region);
		rds.request('CreateDBSnapshot', query, function (error, result) {
			if (error) {
				console.error(error);
			}
		});
	}
	
};

for (var i in settings.regions) {
	ebs.fetch(settings.regions[i]);
}
