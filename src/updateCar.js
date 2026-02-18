const AWS = require('aws-sdk')

const updateCar = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  let body = {};
  try {
    body = typeof event?.body === 'string' ? JSON.parse(event.body) : (event?.body || {});
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }
  const { name, description } = body;
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing id in path' }),
    };
  }

  try {
    const result = await dynamoDb.update({
      TableName: 'CarsTable',
      Key: { id },
      UpdateExpression: 'set #name = :name, description = :description, updatedAt = :updatedAt',
      ExpressionAttributeNames: { '#name': 'name' },
      ExpressionAttributeValues: {
        ':name': name,
        ':description': description,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error('DynamoDB error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

module.exports = {
  updateCar,
};
