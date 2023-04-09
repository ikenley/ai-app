import "reflect-metadata";
import { Express } from "express";
import expressLoader from "./express";
import loadGlobalDependencies from "./loadGlobalDependencies";
// import mongooseLoader from "./mongoose";
import Logger from "./logger";
//We have to import at least all the events once so they can be triggered
//import "./events";

type Props = {
  expressApp: Express;
};

export default async ({ expressApp }: Props) => {
  await loadGlobalDependencies();
  Logger.info("Dependency Injector loaded");

  await expressLoader({ app: expressApp });
  Logger.info("Express loaded");
};
