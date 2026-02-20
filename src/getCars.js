const AWS = require('aws-sdk');
const { withCors } = require('./utils/cors');

const getCars = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const result = await dynamoDb.scan({
    TableName: 'CarsTable',
  }).promise();
  return {
    statusCode: 200,
    headers: withCors({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(result.Items),
  };
};

module.exports = {
  getCars,
};