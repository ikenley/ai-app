import { SQSEvent, Context } from "aws-lambda";
import { handler } from "./index-job-runner";

const sqsRecord: any = {
  messageId: "f7262c2a-08b4-47c6-b540-e072bdc25e53",
  receiptHandle: "",
  body: `{"imageId":"3179eb1e-8441-499d-96a5-4ac5d5983132","prompt":"A man teaching grade school math, in the style of a New Deal poster","userId":"12a9e338-3d23-47eb-8804-78f7e723d81d","email":"ikenley6@gmail.com"}`,
  attributes: {},
  messageAttributes: undefined,
  md5OfBody: "",
  eventSource: "test",
  eventSourceARN: "test",
  awsRegion: "us-east-1",
};
const event: SQSEvent = {
  Records: [sqsRecord],
};

const context: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: "",
  functionVersion: "",
  invokedFunctionArn: "",
  memoryLimitInMB: "",
  awsRequestId: "",
  logGroupName: "",
  logStreamName: "",
  getRemainingTimeInMillis: () => 1000,
  done: (_error?: Error | undefined, _result?: any) => {},
  fail: () => {
    throw new Error("Function not implemented.");
  },
  succeed: () => {},
};

const invoke = async () => {
  const res = await handler(event, context);
  console.log("res", res);
};

console.log("test-job-runner");
invoke();
