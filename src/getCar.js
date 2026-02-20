const AWS = require('aws-sdk');
const { withCors } = require('./utils/cors');

const getCar = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const result = await dynamoDb.get({
    TableName: 'CarsTable',
    Key: {
      id: event.pathParameters?.id,
    },
  }).promise();
  return result.Item ? {
    statusCode: 200,
    headers: withCors({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(result.Item),
  } : {
    statusCode: 404,
    headers: withCors({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ error: 'Car not found - Please check the ID' }),
  };
};

module.exports = {
  getCar,
};