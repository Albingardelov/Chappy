import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
const accessKey = process.env.ACCESS_KEY || '';
const secret = process.env.SECRET_ACCESS_KEY || '';
const client = new DynamoDBClient({
    region: "eu-north-1", // se till att använda den region som du använder för DynamoDB
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secret,
    },
});
const db = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME || 'ChappyData';
export { db, tableName };
