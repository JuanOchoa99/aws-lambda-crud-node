const AWS = require('aws-sdk')
const { withCors } = require('./utils/cors')

const deleteCar = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      headers: withCors({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ error: 'Missing id in path' }),
    };
  }

  try {
    await dynamoDb.delete({
      TableName: 'CarsTable',
      Key: { id },
    }).promise();

    return {
      statusCode: 200,
      headers: withCors({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ message: 'Car deleted successfully' }),
    };
  } catch (error) {
    console.error('DynamoDB error:', error);
    return {
      statusCode: 400,
      headers: withCors({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ error: error.message }),
    };
  }
};

module.exports = {
  deleteCar,
};
