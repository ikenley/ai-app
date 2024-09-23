import { inject, injectable } from "tsyringe";
import winston from "winston";
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  InvokeAgentCommandOutput,
} from "@aws-sdk/client-bedrock-agent-runtime";
import LoggerProvider from "../../utils/LoggerProvider";
import { ConfigOptions } from "../../config";
import User from "../../auth/User";
import { RequestIdToken } from "../../middleware/dependencyInjectionMiddleware";
import { SendChatParams, SendChatResponse } from "../../types";

/** Service for managing interactions with AI chat agent. */
@injectable()
export default class ChatService {
  private logger: winston.Logger;

  constructor(
    protected loggerProvider: LoggerProvider,
    protected config: ConfigOptions,
    protected user: User,
    @inject(RequestIdToken) protected requestId: string,
    protected bedrockAgentClient: BedrockAgentRuntimeClient
  ) {
    this.logger = loggerProvider.provide("ChatService");
  }

  /** Generate an image based on a prompt, save it to S3, and send image link. */
  public async sendPrompt(params: SendChatParams): Promise<SendChatResponse> {
    const { sessionId, prompt } = params;
    this.logger.info(`sendPrompt`, { sessionId, prompt });

    const response = await this.promptBedrockAgent(sessionId, prompt);
    return response;
  }

  /**
   * Invokes a Bedrock agent to run an inference using the input
   * provided in the request body.
   *
   * @param {string} sessionId - An arbitrary identifier for the session.
   * @param {string} prompt - The prompt that you want the Agent to complete.
   */
  private async promptBedrockAgent(
    sessionId: string,
    prompt: string
  ): Promise<SendChatResponse> {
    this.logger.info("promptBedrockAgent:begin", { sessionId });
    const { agentId, agentAliasId } = this.config.bedrockAgent;

    const command = new InvokeAgentCommand({
      agentId,
      agentAliasId,
      sessionId,
      inputText: prompt,
    });

    try {
      const response = await this.bedrockAgentClient.send(command);

      return await this.handleAgentResponse(sessionId, response);
    } catch (err) {
      this.logger.error(err);
      throw new Error("An error occurred");
    }
  }

  /** Process the BedrockAgent response */
  private async handleAgentResponse(
    sessionId: string,
    response: InvokeAgentCommandOutput
  ): Promise<SendChatResponse> {
    let agentReply = "";
    if (response.completion === undefined) {
      throw new Error("Completion is undefined");
    }

    for await (let chunkEvent of response.completion) {
      //If response is of type "return control" handle ActionGroup on behalf of Agent
      if (chunkEvent.returnControl !== undefined) {
        console.log("chunkEvent", JSON.stringify(chunkEvent));
        throw new Error("MethodNotImplemented");
        // return await returnControlBedrockAgent(
        //   client,
        //   sessionId,
        //   chunkEvent.returnControl
        // );
      }

      // Else collect message chunks
      const chunk = chunkEvent.chunk;
      if (chunk) {
        const decodedResponse = new TextDecoder("utf-8").decode(chunk.bytes);
        agentReply += decodedResponse;
      }
    }

    const chatResponse: SendChatResponse = { sessionId, agentReply };
    return chatResponse;
  }

  // TODO handle "RETURN_CONTROL" ActionGroups
  // returnControlBedrockAgent = async (client, sessionId, returnControl) => {
  //   console.log(
  //     "returnControlBedrockAgent:begin",
  //     JSON.stringify(returnControl)
  //   );
  //   const agentId = process.env.AGENT_ID;
  //   const agentAliasId = process.env.AGENT_ALIAS_ID;

  //   const { invocationId, invocationInputs } = returnControl;
  //   const invocationInput = invocationInputs[0].functionInvocationInput;

  //   const command = new InvokeAgentCommand({
  //     agentId,
  //     agentAliasId,
  //     sessionId,
  //     sessionState: {
  //       invocationId,
  //       returnControlInvocationResults: [
  //         {
  //           functionResult: {
  //             actionGroup: invocationInput.actionGroup,
  //             function: invocationInput.function,
  //             confirmationState: "CONFIRM",
  //           },
  //         },
  //       ],
  //     },
  //   });

  //   try {
  //     const response = await client.send(command);

  //     return await handleAgentResponse(client, sessionId, response);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
}
