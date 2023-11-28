import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses"; // ES Modules import
import { getConfigOptions } from "./config";
import ImageGeneratorService from "./components/image/ImageGeneratorService";
import CreateImageMessage from "./components/image/CreateImageMessage";

const run = async () => {
  const bedrockClient = new BedrockRuntimeClient();
  const s3Client = new S3Client();
  const sesClient = new SESClient();

  // TODO get config values from SSM
  const config = getConfigOptions();
  const service = new ImageGeneratorService(
    config,
    bedrockClient,
    s3Client,
    sesClient
  );

  const message: CreateImageMessage = {
    imageId: "cf3dd937-d292-40aa-b782-1741dc9e8b11",
    prompt: `Bird flying over small new england town, in the style of Hopper`,
    userId: "12a9e338-3d23-47eb-8804-78f7e723d81d",
    email: "ikenley6@gmail.com",
  };
  await service.generate(message);
};

run();
