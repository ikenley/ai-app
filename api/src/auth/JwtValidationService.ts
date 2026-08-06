import type { CognitoJwtVerifier } from "aws-jwt-verify";
import type winston from "winston";
import type { ApiCradle } from "../container/Cradle.ts";
import UnauthorizedException from "../middleware/UnauthorizedException.ts";
import User from "./User.ts";

export default class JwtValidationService {
  private logger: winston.Logger;
  protected jwtVerifier: CognitoJwtVerifier<any, any, any>;

  constructor({ loggerProvider, jwtVerifier }: ApiCradle) {
    this.jwtVerifier = jwtVerifier;
    this.logger = loggerProvider.provide("JwtValidationService");
  }

  /** Validates the authorization header*/
  public async validate(authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const headerParts = authHeader.split(" ");
    if (headerParts.length < 2) {
      throw new UnauthorizedException();
    }

    const idToken = headerParts[1];

    try {
      const decodedIdToken = await this.jwtVerifier.verify(idToken);
      const user = User.fromIdToken(decodedIdToken);
      return user;
    } catch (e: any) {
      this.logger.info("Invalid jwt", { e });
      throw new UnauthorizedException();
    }
  }
}
