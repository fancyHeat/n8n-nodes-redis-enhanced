import set from 'lodash/set';
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

import type { RedisCredential } from './types';
import {
	setupRedisClient,
	redisConnectionTest,
	convertInfoToObject,
	getValue,
	setValue,
} from './utils';

export class RedisEnhanced implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Redis Enhanced',
		name: 'redisEnhanced',
		icon: 'file:redisEnhanced.svg',
		group: ['input'],
		version: 1,
		description: 'Get, send and update data in Redis with enhanced operations',
		defaults: {
			name: 'Redis Enhanced',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'redis',
				required: true,
				testedBy: 'redisConnectionTest',
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Append',
						value: 'append',
						description: 'Append a value to a string',
						action: 'Append value to string',
					},
					{
						name: 'Blocking Pop Left',
						value: 'blpop',
						description: 'Blocking pop from the left of a list',
						action: 'Blocking pop from left of list',
					},
					{
						name: 'Blocking Pop Right',
						value: 'brpop',
						description: 'Blocking pop from the right of a list',
						action: 'Blocking pop from right of list',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a key from Redis',
						action: 'Delete a key from redis',
					},
					{
						name: 'Eval',
						value: 'eval',
						description: 'Execute a Lua script',
						action: 'Execute lua script',
					},
					{
						name: 'Exists',
						value: 'exists',
						description: 'Check if one or more keys exist',
						action: 'Check if keys exist in redis',
					},
					{
						name: 'Expire At',
						value: 'expireat',
						description: 'Set a key to expire at a specific timestamp',
						action: 'Set key to expire at timestamp',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get the value of a key from Redis',
						action: 'Get the value of a key from redis',
					},
					{
						name: 'Get Set',
						value: 'getset',
						description: 'Set a key and return its old value',
						action: 'Set key and return old value',
					},
					{
						name: 'Hash Exists',
						value: 'hexists',
						description: 'Check if a hash field exists',
						action: 'Check if hash field exists',
					},
					{
						name: 'Hash Keys',
						value: 'hkeys',
						description: 'Get all field names in a hash',
						action: 'Get hash field names',
					},
					{
						name: 'Hash Length',
						value: 'hlen',
						description: 'Get the number of fields in a hash',
						action: 'Get hash length',
					},
					{
						name: 'Hash Values',
						value: 'hvals',
						description: 'Get all values in a hash',
						action: 'Get hash values',
					},
					{
						name: 'Increment',
						value: 'incr',
						description: 'Atomically increments a key by 1. Creates the key if it does not exist.',
						action: 'Atomically increment a key by 1 creates the key if it does not exist',
					},
					{
						name: 'Info',
						value: 'info',
						description: 'Returns generic information about the Redis instance',
						action: 'Return generic information about the redis instance',
					},
					{
						name: 'Keys',
						value: 'keys',
						description: 'Returns all the keys matching a pattern',
						action: 'Return all keys matching a pattern',
					},
					{
						name: 'List Length',
						value: 'llen',
						description: 'Get the length of a list',
						action: 'Get list length',
					},
					{
						name: 'Multi Get',
						value: 'mget',
						description: 'Get multiple keys at once',
						action: 'Get multiple keys at once from redis',
					},
					{
						name: 'Multi Set',
						value: 'mset',
						description: 'Set multiple keys at once',
						action: 'Set multiple keys at once in redis',
					},
					{
						name: 'Persist',
						value: 'persist',
						description: 'Remove the expiration from a key',
						action: 'Remove expiration from a key',
					},
					{
						name: 'Pop',
						value: 'pop',
						description: 'Pop data from a redis list',
						action: 'Pop data from a redis list',
					},
					{
						name: 'Publish',
						value: 'publish',
						description: 'Publish message to redis channel',
						action: 'Publish message to redis channel',
					},
					{
						name: 'Push',
						value: 'push',
						description: 'Push data to a redis list',
						action: 'Push data to a redis list',
					},
					{
						name: 'Scan',
						value: 'scan',
						description: 'Incrementally iterate over keys (production-safe)',
						action: 'Scan keys incrementally in redis',
					},
					{
						name: 'Set',
						value: 'set',
						description: 'Set the value of a key in redis',
						action: 'Set the value of a key in redis',
					},
					{
						name: 'Set Add',
						value: 'sadd',
						description: 'Add members to a set',
						action: 'Add members to set',
					},
					{
						name: 'Set Cardinality',
						value: 'scard',
						description: 'Get the number of members in a set',
						action: 'Get set cardinality',
					},
					{
						name: 'Set Is Member',
						value: 'sismember',
						description: 'Check if value is a member of a set',
						action: 'Check set membership',
					},
					{
						name: 'Set Members',
						value: 'smembers',
						description: 'Get all members of a set',
						action: 'Get all set members',
					},
					{
						name: 'Set Remove',
						value: 'srem',
						description: 'Remove members from a set',
						action: 'Remove members from set',
					},
					{
						name: 'Sorted Set Add',
						value: 'zadd',
						description: 'Add members to a sorted set',
						action: 'Add members to sorted set',
					},
					{
						name: 'Sorted Set Cardinality',
						value: 'zcard',
						description: 'Get the number of members in a sorted set',
						action: 'Get sorted set cardinality',
					},
					{
						name: 'Sorted Set Range',
						value: 'zrange',
						description: 'Get a range of members from a sorted set',
						action: 'Get range from sorted set',
					},
					{
						name: 'Sorted Set Remove',
						value: 'zrem',
						description: 'Remove members from a sorted set',
						action: 'Remove members from sorted set',
					},
					{
						name: 'String Length',
						value: 'strlen',
						description: 'Get the length of a string',
						action: 'Get string length',
					},
					{
						name: 'TTL',
						value: 'ttl',
						description: 'Get the time to live for a key',
						action: 'Get time to live for a key',
					},
				],
				default: 'info',
			},

			// ----------------------------------
			//         delete
			// ----------------------------------
			{
				displayName: 'Key',
				name: 'key',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['delete'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the key to delete from Redis',
			},

			// ----------------------------------
			//         get
			// ----------------------------------
			{
				displayName: 'Name',
				name: 'propertyName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: 'propertyName',
				required: true,
				description:
					'Name of the property to write received data to. Supports dot-notation. Example: "data.person[0].name".',
			},
			{
				displayName: 'Key',
				name: 'key',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the key to get from Redis',
			},
			{
				displayName: 'Key Type',
				name: 'keyType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				options: [
					{
						name: 'Automatic',
						value: 'automatic',
						description: 'Requests the type before requesting the data (slower)',
					},
					{
						name: 'Hash',
						value: 'hash',
						description: "Data in key is of type 'hash'",
					},
					{
						name: 'List',
						value: 'list',
						description: "Data in key is of type 'lists'",
					},
					{
						name: 'Sets',
						value: 'sets',
						description: "Data in key is of type 'sets'",
					},
					{
						name: 'String',
						value: 'string',
						description: "Data in key is of type 'string'",
					},
				],
				default: 'automatic',
				description: 'The type of the key to get',
			},

			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				placeholder: 'Add option',
				default: {},
				options: [
					{
						displayName: 'Dot Notation',
						name: 'dotNotation',
						type: 'boolean',
						default: true,
						// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
						description:
							'<p>By default, dot-notation is used in property names. This means that "a.b" will set the property "b" underneath "a" so { "a": { "b": value} }.<p></p>If that is not intended this can be deactivated, it will then set { "a.b": value } instead.</p>.',
					},
				],
			},

			// ----------------------------------
			//         incr
			// ----------------------------------
			{
				displayName: 'Key',
				name: 'key',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['incr'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the key to increment',
			},
			{
				displayName: 'Expire',
				name: 'expire',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['incr'],
					},
				},
				default: false,
				description: 'Whether to set a timeout on key',
			},
			{
				displayName: 'TTL',
				name: 'ttl',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						operation: ['incr'],
						expire: [true],
					},
				},
				default: 60,
				description: 'Number of seconds before key expiration',
			},

			// ----------------------------------
			//         keys
			// ----------------------------------
			{
				displayName: 'Key Pattern',
				name: 'keyPattern',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['keys'],
					},
				},
				default: '',
				required: true,
				description: 'The key pattern for the keys to return',
			},
			{
				displayName: 'Get Values',
				name: 'getValues',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['keys'],
					},
				},
				default: true,
				description: 'Whether to get the value of matching keys',
			},
			// ----------------------------------
			//         set
			// ----------------------------------
			{
				displayName: 'Key',
				name: 'key',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['set'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the key to set in Redis',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['set'],
					},
				},
				default: '',
				description: 'The value to write in Redis',
			},
			{
				displayName: 'Key Type',
				name: 'keyType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['set'],
					},
				},
				options: [
					{
						name: 'Automatic',
						value: 'automatic',
						description: 'Tries to figure out the type automatically depending on the data',
					},
					{
						name: 'Hash',
						value: 'hash',
						description: "Data in key is of type 'hash'",
					},
					{
						name: 'List',
						value: 'list',
						description: "Data in key is of type 'lists'",
					},
					{
						name: 'Sets',
						value: 'sets',
						description: "Data in key is of type 'sets'",
					},
					{
						name: 'String',
						value: 'string',
						description: "Data in key is of type 'string'",
					},
				],
				default: 'automatic',
				description: 'The type of the key to set',
			},
			{
				displayName: 'Value Is JSON',
				name: 'valueIsJSON',
				type: 'boolean',
				displayOptions: {
					show: {
						keyType: ['hash'],
					},
				},
				default: true,
				description: 'Whether the value is JSON or key value pairs',
			},
			{
				displayName: 'Expire',
				name: 'expire',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['set'],
					},
				},
				default: false,
				description: 'Whether to set a timeout on key',
			},

			{
				displayName: 'TTL',
				name: 'ttl',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						operation: ['set'],
						expire: [true],
					},
				},
				default: 60,
				description: 'Number of seconds before key expiration',
			},
			{
				displayName: 'Set Mode',
				name: 'setMode',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['set'],
						keyType: ['string', 'automatic'],
					},
				},
				options: [
					{
						name: 'Always Set',
						value: 'always',
						description: 'Set the key regardless of whether it exists (default Redis SET behavior)',
					},
					{
						name: 'Set If Not Exists (NX)',
						value: 'nx',
						description: 'Only set the key if it does not exist (atomic lock behavior)',
					},
					{
						name: 'Set If Exists (XX)',
						value: 'xx',
						description: 'Only set the key if it already exists',
					},
				],
				default: 'always',
				description: 'Controls when the key should be set - useful for atomic locks and conditional updates',
			},
			// ----------------------------------
			//         publish
			// ----------------------------------
			{
				displayName: 'Channel',
				name: 'channel',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['publish'],
					},
				},
				default: '',
				required: true,
				description: 'Channel name',
			},
			{
				displayName: 'Data',
				name: 'messageData',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['publish'],
					},
				},
				default: '',
				required: true,
				description: 'Data to publish',
			},
			// ----------------------------------
			//         push/pop
			// ----------------------------------
			{
				displayName: 'List',
				name: 'list',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['push', 'pop'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the list in Redis',
			},
			{
				displayName: 'Data',
				name: 'messageData',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['push'],
					},
				},
				default: '',
				required: true,
				description: 'Data to push',
			},
			{
				displayName: 'Tail',
				name: 'tail',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['push', 'pop'],
					},
				},
				default: false,
				description: 'Whether to push or pop data from the end of the list',
			},
			{
				displayName: 'Name',
				name: 'propertyName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['pop'],
					},
				},
				default: 'propertyName',
				description:
					'Optional name of the property to write received data to. Supports dot-notation. Example: "data.person[0].name".',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				displayOptions: {
					show: {
						operation: ['pop'],
					},
				},
				placeholder: 'Add option',
				default: {},
				options: [
					{
						displayName: 'Dot Notation',
						name: 'dotNotation',
						type: 'boolean',
						default: true,
						// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
						description:
							'<p>By default, dot-notation is used in property names. This means that "a.b" will set the property "b" underneath "a" so { "a": { "b": value} }.<p></p>If that is not intended this can be deactivated, it will then set { "a.b": value } instead.</p>.',
					},
				],
			},

			// ----------------------------------
			//         exists
			// ----------------------------------
			{
				displayName: 'Keys',
				name: 'keys',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['exists'],
					},
				},
				default: '',
				required: true,
				description: 'Key names to check (space-separated)',
				placeholder: 'key1 key2 key3',
			},

			// ----------------------------------
			//         mget
			// ----------------------------------
			{
				displayName: 'Keys',
				name: 'keys',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['mget'],
					},
				},
				default: '',
				required: true,
				description: 'Key names to get (space-separated)',
				placeholder: 'key1 key2 key3',
			},

			// ----------------------------------
			//         mset
			// ----------------------------------
			{
				displayName: 'Key-Value Pairs',
				name: 'keyValuePairs',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['mset'],
					},
				},
				default: '',
				required: true,
				description: 'Key-value pairs in format: key1 value1 key2 value2',
				placeholder: 'key1 value1 key2 value2',
			},

			// ----------------------------------
			//         scan
			// ----------------------------------
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['scan'],
					},
				},
				default: 0,
				description: 'Cursor position for scanning (0 to start)',
			},
			{
				displayName: 'Pattern',
				name: 'pattern',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['scan'],
					},
				},
				default: '*',
				description: 'Pattern to match keys against',
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['scan'],
					},
				},
				default: 10,
				description: 'Approximate number of keys to return',
			},

			// ----------------------------------
			//         ttl/persist/expireat
			// ----------------------------------
			{
				displayName: 'Key',
				name: 'key',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['ttl', 'persist'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the key',
			},
			{
				displayName: 'Key',
				name: 'key',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['expireat'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the key to expire',
			},
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['expireat'],
					},
				},
				default: 0,
				required: true,
				description: 'Unix timestamp when the key should expire',
			},

			// ----------------------------------
			//         getset/append/strlen
			// ----------------------------------
			{
				displayName: 'Key',
				name: 'key',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getset', 'append', 'strlen'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the key',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getset', 'append'],
					},
				},
				default: '',
				required: true,
				description: 'Value to set or append',
			},
			{
				displayName: 'Name',
				name: 'propertyName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getset'],
					},
				},
				default: 'propertyName',
				description: 'Name of the property to write the old value to',
			},

			// ----------------------------------
			//         blocking operations
			// ----------------------------------
			{
				displayName: 'List',
				name: 'list',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['blpop', 'brpop'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the list in Redis',
			},
			{
				displayName: 'Timeout',
				name: 'timeout',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['blpop', 'brpop'],
					},
				},
				default: 0,
				description: 'Timeout in seconds (0 = wait indefinitely)',
			},
			{
				displayName: 'Name',
				name: 'propertyName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['blpop', 'brpop'],
					},
				},
				default: 'propertyName',
				description: 'Name of the property to write received data to',
			},

			// ----------------------------------
			//         list length
			// ----------------------------------
			{
				displayName: 'List',
				name: 'list',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['llen'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the list',
			},

			// ----------------------------------
			//         set operations
			// ----------------------------------
			{
				displayName: 'Set',
				name: 'set',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sadd', 'srem', 'sismember', 'scard', 'smembers'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the set',
			},
			{
				displayName: 'Members',
				name: 'members',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sadd', 'srem'],
					},
				},
				default: '',
				required: true,
				description: 'Set members (space-separated)',
				placeholder: 'member1 member2 member3',
			},
			{
				displayName: 'Member',
				name: 'member',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sismember'],
					},
				},
				default: '',
				required: true,
				description: 'Member to check',
			},

			// ----------------------------------
			//         sorted set operations
			// ----------------------------------
			{
				displayName: 'Sorted Set',
				name: 'sortedSet',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['zadd', 'zrange', 'zrem', 'zcard'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the sorted set',
			},
			{
				displayName: 'Score-Member Pairs',
				name: 'scoreMembers',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['zadd'],
					},
				},
				default: '',
				required: true,
				description: 'Score-member pairs in format: score1 member1 score2 member2',
				placeholder: '1.0 member1 2.0 member2',
			},
			{
				displayName: 'Start',
				name: 'start',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['zrange'],
					},
				},
				default: 0,
				description: 'Start index (inclusive)',
			},
			{
				displayName: 'Stop',
				name: 'stop',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['zrange'],
					},
				},
				default: -1,
				description: 'Stop index (inclusive, -1 for end)',
			},
			{
				displayName: 'With Scores',
				name: 'withScores',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['zrange'],
					},
				},
				default: false,
				description: 'Whether to include scores in the result',
			},
			{
				displayName: 'Members',
				name: 'members',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['zrem'],
					},
				},
				default: '',
				required: true,
				description: 'Members to remove (space-separated)',
				placeholder: 'member1 member2 member3',
			},

			// ----------------------------------
			//         hash operations
			// ----------------------------------
			{
				displayName: 'Hash',
				name: 'hash',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['hlen', 'hkeys', 'hvals', 'hexists'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the hash',
			},
			{
				displayName: 'Field',
				name: 'field',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['hexists'],
					},
				},
				default: '',
				required: true,
				description: 'Field name to check',
			},

			// ----------------------------------
			//         eval operation
			// ----------------------------------
			{
				displayName: 'Script',
				name: 'script',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['eval'],
					},
				},
				default: '',
				required: true,
				description: 'Lua script to execute',
				typeOptions: {
					rows: 4,
				},
			},
			{
				displayName: 'Keys',
				name: 'keys',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['eval'],
					},
				},
				default: '',
				description: 'Keys to pass to script (space-separated)',
			},
			{
				displayName: 'Arguments',
				name: 'args',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['eval'],
					},
				},
				default: '',
				description: 'Arguments to pass to script (space-separated)',
			},
		],
	};

	methods = {
		credentialTest: { redisConnectionTest },
	};

	async execute(this: IExecuteFunctions) {
		// TODO: For array and object fields it should not have a "value" field it should
		//       have a parameter field for a path. Because it is not possible to set
		//       array, object via parameter directly (should maybe be possible?!?!)
		//       Should maybe have a parameter which is JSON.
		const credentials = await this.getCredentials<RedisCredential>('redis');

		const client = setupRedisClient(credentials);
		await client.connect();
		await client.ping();

		const operation = this.getNodeParameter('operation', 0);
		const returnItems: INodeExecutionData[] = [];

		if (operation === 'info') {
			try {
				const result = await client.info();
				returnItems.push({ json: convertInfoToObject(result) });
			} catch (error) {
				if (this.continueOnFail()) {
					returnItems.push({
						json: {
							error: error.message,
						},
					});
				} else {
					await client.quit();
					throw new NodeOperationError(this.getNode(), error);
				}
			}
		} else if (
			[
				'delete', 'get', 'keys', 'set', 'incr', 'publish', 'push', 'pop',
				'exists', 'mget', 'mset', 'scan', 'ttl', 'persist', 'expireat',
				'getset', 'append', 'strlen', 'blpop', 'brpop', 'llen',
				'sadd', 'srem', 'sismember', 'scard', 'smembers',
				'zadd', 'zrange', 'zrem', 'zcard',
				'hlen', 'hkeys', 'hvals', 'hexists', 'eval'
			].includes(operation)
		) {
			const items = this.getInputData();

			let item: INodeExecutionData;
			for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
				try {
					item = { json: {}, pairedItem: { item: itemIndex } };

					if (operation === 'delete') {
						const keyDelete = this.getNodeParameter('key', itemIndex) as string;

						await client.del(keyDelete);
						returnItems.push(items[itemIndex]);
					} else if (operation === 'get') {
						const propertyName = this.getNodeParameter('propertyName', itemIndex) as string;
						const keyGet = this.getNodeParameter('key', itemIndex) as string;
						const keyType = this.getNodeParameter('keyType', itemIndex) as string;

						const value = (await getValue(client, keyGet, keyType)) ?? null;

						const options = this.getNodeParameter('options', itemIndex, {});

						if (options.dotNotation === false) {
							item.json[propertyName] = value;
						} else {
							set(item.json, propertyName, value);
						}

						returnItems.push(item);
					} else if (operation === 'keys') {
						const keyPattern = this.getNodeParameter('keyPattern', itemIndex) as string;
						const getValues = this.getNodeParameter('getValues', itemIndex, true) as boolean;

						const keys = await client.keys(keyPattern);

						if (!getValues) {
							returnItems.push({ json: { keys } });
							continue;
						}

						for (const keyName of keys) {
							item.json[keyName] = await getValue(client, keyName);
						}
						returnItems.push(item);
					} else if (operation === 'set') {
						const keySet = this.getNodeParameter('key', itemIndex) as string;
						const value = this.getNodeParameter('value', itemIndex) as string;
						const keyType = this.getNodeParameter('keyType', itemIndex) as string;
						const valueIsJSON = this.getNodeParameter('valueIsJSON', itemIndex, true) as boolean;
						const expire = this.getNodeParameter('expire', itemIndex, false) as boolean;
						const ttl = this.getNodeParameter('ttl', itemIndex, -1) as number;
						const setMode = this.getNodeParameter('setMode', itemIndex, 'always') as 'always' | 'nx' | 'xx';

						const setResult = await setValue.call(this, client, keySet, value, expire, ttl, keyType, valueIsJSON, setMode);
						
						// Add the result to the item JSON so it can be used in conditional nodes
						item.json = { ...items[itemIndex].json, redis_result: setResult };
						returnItems.push(item);
					} else if (operation === 'incr') {
						const keyIncr = this.getNodeParameter('key', itemIndex) as string;
						const expire = this.getNodeParameter('expire', itemIndex, false) as boolean;
						const ttl = this.getNodeParameter('ttl', itemIndex, -1) as number;
						const incrementVal = await client.incr(keyIncr);
						if (expire && ttl > 0) {
							await client.expire(keyIncr, ttl);
						}
						returnItems.push({ json: { [keyIncr]: incrementVal } });
					} else if (operation === 'publish') {
						const channel = this.getNodeParameter('channel', itemIndex) as string;
						const messageData = this.getNodeParameter('messageData', itemIndex) as string;
						await client.publish(channel, messageData);
						returnItems.push(items[itemIndex]);
					} else if (operation === 'push') {
						const redisList = this.getNodeParameter('list', itemIndex) as string;
						const messageData = this.getNodeParameter('messageData', itemIndex) as string;
						const tail = this.getNodeParameter('tail', itemIndex, false) as boolean;
						await client[tail ? 'rPush' : 'lPush'](redisList, messageData);
						returnItems.push(items[itemIndex]);
					} else if (operation === 'pop') {
						const redisList = this.getNodeParameter('list', itemIndex) as string;
						const tail = this.getNodeParameter('tail', itemIndex, false) as boolean;
						const propertyName = this.getNodeParameter(
							'propertyName',
							itemIndex,
							'propertyName',
						) as string;

						const value = await client[tail ? 'rPop' : 'lPop'](redisList);

						let outputValue;
						try {
							outputValue = value && JSON.parse(value);
						} catch {
							outputValue = value;
						}
						const options = this.getNodeParameter('options', itemIndex, {});
						if (options.dotNotation === false) {
							item.json[propertyName] = outputValue;
						} else {
							set(item.json, propertyName, outputValue);
						}
						returnItems.push(item);
					} else if (operation === 'exists') {
						const keys = this.getNodeParameter('keys', itemIndex) as string;
						const keyArray = keys.split(/\s+/).filter(k => k.length > 0);
						const existsCount = await client.exists(keyArray);
						returnItems.push({ json: { exists: existsCount, keys: keyArray } });
					} else if (operation === 'mget') {
						const keys = this.getNodeParameter('keys', itemIndex) as string;
						const keyArray = keys.split(/\s+/).filter(k => k.length > 0);
						const values = await client.mGet(keyArray);
						const result: any = {};
						keyArray.forEach((key, index) => {
							result[key] = values[index];
						});
						returnItems.push({ json: result });
					} else if (operation === 'mset') {
						const keyValuePairs = this.getNodeParameter('keyValuePairs', itemIndex) as string;
						const pairs = keyValuePairs.split(/\s+/).filter(p => p.length > 0);
						if (pairs.length % 2 !== 0) {
							throw new NodeOperationError(this.getNode(), 'Key-value pairs must be even number of arguments');
						}
						const msetObj: any = {};
						for (let i = 0; i < pairs.length; i += 2) {
							msetObj[pairs[i]] = pairs[i + 1];
						}
						await client.mSet(msetObj);
						returnItems.push(items[itemIndex]);
					} else if (operation === 'scan') {
						const cursor = this.getNodeParameter('cursor', itemIndex) as number;
						const pattern = this.getNodeParameter('pattern', itemIndex) as string;
						const count = this.getNodeParameter('count', itemIndex) as number;
						const result = await client.scan(cursor, { MATCH: pattern, COUNT: count });
						returnItems.push({ json: { cursor: result.cursor, keys: result.keys } });
					} else if (operation === 'ttl') {
						const key = this.getNodeParameter('key', itemIndex) as string;
						const ttl = await client.ttl(key);
						returnItems.push({ json: { key, ttl } });
					} else if (operation === 'persist') {
						const key = this.getNodeParameter('key', itemIndex) as string;
						const result = await client.persist(key);
						returnItems.push({ json: { key, persisted: result } });
					} else if (operation === 'expireat') {
						const key = this.getNodeParameter('key', itemIndex) as string;
						const timestamp = this.getNodeParameter('timestamp', itemIndex) as number;
						const result = await client.expireAt(key, timestamp);
						returnItems.push({ json: { key, set: result } });
					} else if (operation === 'getset') {
						const key = this.getNodeParameter('key', itemIndex) as string;
						const value = this.getNodeParameter('value', itemIndex) as string;
						const propertyName = this.getNodeParameter('propertyName', itemIndex) as string;
						const oldValue = await client.getSet(key, value);
						item.json[propertyName] = oldValue;
						returnItems.push(item);
					} else if (operation === 'append') {
						const key = this.getNodeParameter('key', itemIndex) as string;
						const value = this.getNodeParameter('value', itemIndex) as string;
						const newLength = await client.append(key, value);
						returnItems.push({ json: { key, newLength } });
					} else if (operation === 'strlen') {
						const key = this.getNodeParameter('key', itemIndex) as string;
						const length = await client.strLen(key);
						returnItems.push({ json: { key, length } });
					} else if (operation === 'blpop') {
						const list = this.getNodeParameter('list', itemIndex) as string;
						const timeout = this.getNodeParameter('timeout', itemIndex) as number;
						const propertyName = this.getNodeParameter('propertyName', itemIndex) as string;
						const result = await client.blPop(list, timeout);
						if (result) {
							let outputValue;
							try {
								outputValue = JSON.parse(result.element);
							} catch {
								outputValue = result.element;
							}
							item.json[propertyName] = outputValue;
							item.json.list = result.key;
						} else {
							item.json[propertyName] = null;
						}
						returnItems.push(item);
					} else if (operation === 'brpop') {
						const list = this.getNodeParameter('list', itemIndex) as string;
						const timeout = this.getNodeParameter('timeout', itemIndex) as number;
						const propertyName = this.getNodeParameter('propertyName', itemIndex) as string;
						const result = await client.brPop(list, timeout);
						if (result) {
							let outputValue;
							try {
								outputValue = JSON.parse(result.element);
							} catch {
								outputValue = result.element;
							}
							item.json[propertyName] = outputValue;
							item.json.list = result.key;
						} else {
							item.json[propertyName] = null;
						}
						returnItems.push(item);
					} else if (operation === 'llen') {
						const list = this.getNodeParameter('list', itemIndex) as string;
						const length = await client.lLen(list);
						returnItems.push({ json: { list, length } });
					} else if (operation === 'sadd') {
						const set = this.getNodeParameter('set', itemIndex) as string;
						const members = this.getNodeParameter('members', itemIndex) as string;
						const memberArray = members.split(/\s+/).filter(m => m.length > 0);
						const added = await client.sAdd(set, memberArray);
						returnItems.push({ json: { set, added, members: memberArray } });
					} else if (operation === 'srem') {
						const set = this.getNodeParameter('set', itemIndex) as string;
						const members = this.getNodeParameter('members', itemIndex) as string;
						const memberArray = members.split(/\s+/).filter(m => m.length > 0);
						const removed = await client.sRem(set, memberArray);
						returnItems.push({ json: { set, removed, members: memberArray } });
					} else if (operation === 'sismember') {
						const set = this.getNodeParameter('set', itemIndex) as string;
						const member = this.getNodeParameter('member', itemIndex) as string;
						const isMember = await client.sIsMember(set, member);
						returnItems.push({ json: { set, member, isMember } });
					} else if (operation === 'scard') {
						const set = this.getNodeParameter('set', itemIndex) as string;
						const cardinality = await client.sCard(set);
						returnItems.push({ json: { set, cardinality } });
					} else if (operation === 'smembers') {
						const set = this.getNodeParameter('set', itemIndex) as string;
						const members = await client.sMembers(set);
						returnItems.push({ json: { set, members } });
					} else if (operation === 'zadd') {
						const sortedSet = this.getNodeParameter('sortedSet', itemIndex) as string;
						const scoreMembers = this.getNodeParameter('scoreMembers', itemIndex) as string;
						const pairs = scoreMembers.split(/\s+/).filter(p => p.length > 0);
						if (pairs.length % 2 !== 0) {
							throw new NodeOperationError(this.getNode(), 'Score-member pairs must be even number of arguments');
						}
						const members = [];
						for (let i = 0; i < pairs.length; i += 2) {
							members.push({ score: parseFloat(pairs[i]), value: pairs[i + 1] });
						}
						const added = await client.zAdd(sortedSet, members);
						returnItems.push({ json: { sortedSet, added, members } });
					} else if (operation === 'zrange') {
						const sortedSet = this.getNodeParameter('sortedSet', itemIndex) as string;
						const start = this.getNodeParameter('start', itemIndex) as number;
						const stop = this.getNodeParameter('stop', itemIndex) as number;
						const withScores = this.getNodeParameter('withScores', itemIndex) as boolean;
						let result;
						if (withScores) {
							result = await client.zRangeWithScores(sortedSet, start, stop);
						} else {
							result = await client.zRange(sortedSet, start, stop);
						}
						returnItems.push({ json: { sortedSet, result } });
					} else if (operation === 'zrem') {
						const sortedSet = this.getNodeParameter('sortedSet', itemIndex) as string;
						const members = this.getNodeParameter('members', itemIndex) as string;
						const memberArray = members.split(/\s+/).filter(m => m.length > 0);
						const removed = await client.zRem(sortedSet, memberArray);
						returnItems.push({ json: { sortedSet, removed, members: memberArray } });
					} else if (operation === 'zcard') {
						const sortedSet = this.getNodeParameter('sortedSet', itemIndex) as string;
						const cardinality = await client.zCard(sortedSet);
						returnItems.push({ json: { sortedSet, cardinality } });
					} else if (operation === 'hlen') {
						const hash = this.getNodeParameter('hash', itemIndex) as string;
						const length = await client.hLen(hash);
						returnItems.push({ json: { hash, length } });
					} else if (operation === 'hkeys') {
						const hash = this.getNodeParameter('hash', itemIndex) as string;
						const keys = await client.hKeys(hash);
						returnItems.push({ json: { hash, keys } });
					} else if (operation === 'hvals') {
						const hash = this.getNodeParameter('hash', itemIndex) as string;
						const values = await client.hVals(hash);
						returnItems.push({ json: { hash, values } });
					} else if (operation === 'hexists') {
						const hash = this.getNodeParameter('hash', itemIndex) as string;
						const field = this.getNodeParameter('field', itemIndex) as string;
						const exists = await client.hExists(hash, field);
						returnItems.push({ json: { hash, field, exists } });
					} else if (operation === 'eval') {
						const script = this.getNodeParameter('script', itemIndex) as string;
						const keys = this.getNodeParameter('keys', itemIndex, '') as string;
						const args = this.getNodeParameter('args', itemIndex, '') as string;
						const keyArray = keys ? keys.split(/\s+/).filter(k => k.length > 0) : [];
						const argArray = args ? args.split(/\s+/).filter(a => a.length > 0) : [];
						const result = await client.eval(script, { keys: keyArray, arguments: argArray });
						const serializedResult = typeof result === 'bigint' ? Number(result) : result;
						returnItems.push({ json: { result: serializedResult } });
					}
				} catch (error) {
					if (this.continueOnFail()) {
						returnItems.push({
							json: {
								error: error.message,
							},
							pairedItem: {
								item: itemIndex,
							},
						});
						continue;
					}
					await client.quit();
					throw new NodeOperationError(this.getNode(), error, { itemIndex });
				}
			}
		}
		await client.quit();
		return [returnItems];
	}
}
