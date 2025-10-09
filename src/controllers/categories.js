'use strict';

const nconf = require('nconf');
const _ = require('lodash');

const categories = require('../categories');
const meta = require('../meta');
const pagination = require('../pagination');
const helpers = require('./helpers');
const privileges = require('../privileges');
const db = require('../database');
const topics = require('../topics');

const categoriesController = module.exports;

categoriesController.list = async function (req, res) {
	res.locals.metaTags = [{
		name: 'title',
		content: String(meta.config.title || 'NodeBB'),
	}, {
		property: 'og:type',
		content: 'website',
	}];

	const allRootCids = await categories.getAllCidsFromSet('cid:0:children');
	const rootCids = await privileges.categories.filterCids('find', allRootCids, req.uid);
	const pageCount = Math.max(1, Math.ceil(rootCids.length / meta.config.categoriesPerPage));
	const page = Math.min(parseInt(req.query.page, 10) || 1, pageCount);
	const start = Math.max(0, (page - 1) * meta.config.categoriesPerPage);
	const stop = start + meta.config.categoriesPerPage - 1;
	const pageCids = rootCids.slice(start, stop + 1);

	const allChildCids = _.flatten(await Promise.all(pageCids.map(categories.getChildrenCids)));
	const childCids = await privileges.categories.filterCids('find', allChildCids, req.uid);
	const categoryData = await categories.getCategories(pageCids.concat(childCids));
	const tree = categories.getTree(categoryData, 0);
	await Promise.all([
		categories.getRecentTopicReplies(categoryData, req.uid, req.query),
		categories.setUnread(tree, pageCids.concat(childCids), req.uid),
	]);

	const data = {
		title: meta.config.homePageTitle || '[[pages:home]]',
		selectCategoryLabel: '[[pages:categories]]',
		categories: tree,
		pagination: pagination.create(page, pageCount, req.query),
	};

	// Add urgent topics count only for categories list page
	if (req.originalUrl.includes('/categories')) {
		await getUrgentTopicsCount(tree);
	}

	data.categories.forEach((category) => {
		if (category) {
			helpers.trimChildren(category);
			helpers.setCategoryTeaser(category);
		}
	});

	if (req.originalUrl.startsWith(`${nconf.get('relative_path')}/api/categories`) || req.originalUrl.startsWith(`${nconf.get('relative_path')}/categories`)) {
		data.title = '[[pages:categories]]';
		data.breadcrumbs = helpers.buildBreadcrumbs([{ text: data.title }]);
		res.locals.metaTags.push({
			property: 'og:title',
			content: '[[pages:categories]]',
		});
	}

	res.render('categories', data);
};

async function getUrgentTopicsCount(tree) {
	try {
		// Get all category IDs from the tree
		const allCids = [];
		function extractCids(categories) {
			categories.forEach((category) => {
				if (category && category.cid) {
					allCids.push(category.cid);
					if (category.children) {
						extractCids(category.children);
					}
				}
			});
		}
		extractCids(tree);

		// Get urgent topics count for each category
		const urgentCounts = {};
		await Promise.all(allCids.map(async (cid) => {
			try {
				// Get all topics in this category
				const topicIds = await db.getSortedSetRevRange(`cid:${cid}:tids`, 0, -1);

				if (topicIds.length === 0) {
					urgentCounts[cid] = 0;
					return;
				}

				// Get topic data to check urgent status
				const topicData = await topics.getTopicsByTids(topicIds);
				const urgentCount = topicData.filter(topic => topic && topic.urgent === true).length;
				urgentCounts[cid] = urgentCount;
			} catch (err) {
				urgentCounts[cid] = 0;
			}
		}));

		// Add urgent count to each category in the tree
		function addUrgentCount(categories) {
			categories.forEach((category) => {
				if (category && category.cid) {
					category.urgentCount = urgentCounts[category.cid] || 0;
					if (category.children) {
						addUrgentCount(category.children);
					}
				}
			});
		}
		addUrgentCount(tree);

	} catch (err) {
		// If there's an error, just continue without urgent counts
		console.error('Error getting urgent topics count:', err);
	}
}
