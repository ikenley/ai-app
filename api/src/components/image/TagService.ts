import { injectable } from "tsyringe";
import winston from "winston";
import LoggerProvider from "../../utils/LoggerProvider";
import { ConfigOptions } from "../../config";

export default class TagService {
  async getTags(s3Key: string) {
    const client = new RekognitionClient({});
    const input = {
      Image: {
        S3Object: {
          Bucket: "ai.ikenley.com",
          Name: "img/e8172df9-e5e1-48aa-8c6c-6fca2c7d005e.png",
        },
      },
      MaxLabels: 50,
      MinConfidence: 50,
      Features: ["GENERAL_LABELS"],
    };
    const command = new DetectLabelsCommand(input);
    const response = await client.send(command);
    const labelNames =
      response.Labels?.map((lbl) => {
        return { [lbl.Name]: lbl.Confidence };
      }) || [];
    console.log("labelNames", labelNames);
  }
}
