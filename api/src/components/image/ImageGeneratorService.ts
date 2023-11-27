import { readFileSync, writeFile } from "fs";
import * as path from "path";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ConfigOptions } from "../../config";
import CreateImageMessage from "./CreateImageMessage";

export default class ImageGeneratorService {
  constructor(
    protected config: ConfigOptions,
    protected bedrockRuntimeClient: BedrockRuntimeClient,
    protected s3Client: S3Client
  ) {}

  /** Generate an image based on a prompt, save it to S3, and send image link. */
  public async generate(message: CreateImageMessage) {
    const { imageId, prompt } = message;

    const filePath = await this.createImage(imageId, prompt);
    console.log("filePath", filePath);

    await this.uploadToS3(imageId, filePath);
  }

  /** Generate an image based on a prompt */
  private async createImage(imageId: string, prompt: string) {
    const input = {
      // InvokeModelRequest
      body: `{"text_prompts":[{"text":"${prompt}"}],"cfg_scale":10,"seed":0,"steps":50}`,
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
      const filePath = path.join("/tmp", "img", `${imageId}.png`);
      await writeFile(
        filePath,
        base64Data,
        { encoding: "base64" },
        function (err: any) {
          if (err) {
            console.error("Error writing file", err);
            throw new Error(err);
          } else {
            console.log("File created");
          }
        }
      );
      return filePath;
      //console.log("parsedData", parsedData.artifacts[0].base64);
    } catch (error: any) {
      console.error("Error parsing JSON:", error);
      throw new Error(error);
    }
  }

  private async uploadToS3(imageId: string, filePath: string) {
    const fileContent = readFileSync(filePath); // This is inefficient, but works for small images
    const input = {
      Body: fileContent,
      Bucket: this.config.imageS3BucketName,
      Key: `img/${imageId}.png`,
    };
    const command = new PutObjectCommand(input);
    const response = await this.s3Client.send(command);
    console.log("uploadToS3:response", response);
  }
}
