import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { writeFile } from "fs";
import * as path from "path";

export default class ImageGeneratorService {
  constructor(protected bedrockRuntimeClient: BedrockRuntimeClient) {}

  public async generate() {
    const input = {
      // InvokeModelRequest
      body: '{"text_prompts":[{"text":"Bird flying over small new england town, in the style of Hopper\\n"}],"cfg_scale":10,"seed":0,"steps":50}',
      contentType: "application/json",
      accept: "*/*",
      modelId: "stability.stable-diffusion-xl-v0",
    };
    const command = new InvokeModelCommand(input);
    const response = await this.bedrockRuntimeClient.send(command);

    const blobAdapter = response.body;
    const textDecoder = new TextDecoder("utf-8");
    const jsonString = textDecoder.decode(blobAdapter.buffer);

    try {
      const parsedData = JSON.parse(jsonString);
      const base64Data = parsedData.artifacts[0].base64;
      const outputPath = path.join("/tmp", "out.png");
      await writeFile(
        outputPath,
        base64Data,
        { encoding: "base64" },
        function (err: any) {
          if (err) {
            console.error(err);
          } else {
            console.log("File created");
          }
        }
      );
      return "Success";
      //console.log("parsedData", parsedData.artifacts[0].base64);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return "TextError";
    }
  }
}
