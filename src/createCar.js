const { v4: uuidv4 } = require('uuid')
const AWS = require('aws-sdk')
const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')

const addCar = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const { name, description } = event.body || {};
  const car = {
    id: uuidv4(),
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await dynamoDb.put({
      TableName: 'CarsTable',
      Item: car,
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car),
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
  addCar: middy(addCar).use(jsonBodyParser()),
};