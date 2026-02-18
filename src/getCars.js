const AWS = require('aws-sdk');

const getCars = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const result = await dynamoDb.scan({
    TableName: 'CarsTable',
  }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
};

module.exports = {
  getCars,
};