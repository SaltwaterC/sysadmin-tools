#!/usr/bin/env node

var settings = require('./ebs-settings.js');
var ec2 = require('aws2js').load('ec2', settings.accessKeyId, settings.secretAccessKey);

var fetchAmiSnapshots = function (region) {
	ec2.setRegion(region);
	ec2.request('DescribeImages', {'Owner.1': 'self'}, function (err, res) {
		if ( ! err) {
			if (res && res.imagesSet && res.imagesSet.item) {
				var images = res.imagesSet.item;
				var snapBlacklist = {};
				
				if ( ! (images instanceof Array)) {
					images = [images];
				}
				
				for (var i in images) {
					var image = images[i];
					var snapshots = image.blockDeviceMapping.item;
					
					if ( ! (snapshots instanceof Array)) {
						snapshots = [snapshots];
					}
					
					for (var j in snapshots) {
						var snapshot = snapshots[j].ebs.snapshotId;
						snapBlacklist[snapshot] = null;
					}
				}
				
				fetchVolumes(region, snapBlacklist);
			} else {
				fetchVolumes(region, {});
			}
		} else {
			console.error(err);
		}
	});
};

var fetchVolumes = function (region, snapBlacklist) {
	ec2.setRegion(region);
	ec2.request('DescribeVolumes', function (err, res) {
		if ( ! err) {
			if (res && res.volumeSet && res.volumeSet.item) {
				var volumes = res.volumeSet.item;
				var volBlacklist = {};
				
				if ( ! (volumes instanceof Array)) {
					volumes = [volumes];
				}
				
				for (var i in volumes) {
					var volume = volumes[i];
					volBlacklist[volume.volumeId] = null;
				}
				
				fetchSnapshots(region, snapBlacklist, volBlacklist);
			} else {
				console.error(new Error('Unable to fetch the volume blacklist.'));
			}
		} else {
			console.error(err);
		}
	});
};

var fetchSnapshots = function (region, snapBlacklist, volBlacklist) {
	ec2.setRegion(region);
	ec2.request('DescribeSnapshots', {'Owner.1': 'self'}, function (err, res) {
		if ( ! err) {
			if (res && res.snapshotSet && res.snapshotSet.item) {
				var snapshots = res.snapshotSet.item;
				
				if ( ! (snapshots instanceof Array)) {
					snapshots = [snapshots];
				}
				
				var snapCount = 0;
				for (var i in snapBlacklist) {
					snapCount++;
				}
				
				var volCount = 0;
				for (var i in volBlacklist) {
					volCount++;
				}
				
				console.log('Blacklisted on %s: %d snapshots, and %d volumes.', region, snapCount, volCount);
				
				for (var i in snapshots) {
					var snapshot = snapshots[i];
					
					if ( ! (snapshot.snapshotId in snapBlacklist) && ! (snapshot.volumeId in volBlacklist)) {
						deleteSnapshot(region, snapshot.snapshotId, i);
					}
				}
			} else {
				console.error(new Error('Failed to fetch the existing snapshots.'));
			}
		} else {
			console.error(err);
		}
	});
};

var deleteSnapshot = function (region, snapshotId, idx) {
	setTimeout(function () { // defer the requests, one per second, so the EC2 API won't choke
		ec2.setRegion(region);
		ec2.request('DeleteSnapshot', {'SnapshotId': snapshotId}, function (err, res) {
			if ( ! err) {
				if (res && res['return'] == 'true') {
					console.log('Deleted: %s', snapshotId);
				} else {
					console.log('Unable to delete: %s', snapshotId);
				}
			} else {
				console.error(err);
			}
		});
	}, idx * 1000);
};

for (var i in settings.regions) {
	fetchAmiSnapshots(settings.regions[i]);
}
