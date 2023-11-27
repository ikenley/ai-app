import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import ImageGeneratorService from "./components/image/ImageGeneratorService";

const run = async () => {
  const client = new BedrockRuntimeClient();
  const service = new ImageGeneratorService(client);
  await service.generate();
};

run();
