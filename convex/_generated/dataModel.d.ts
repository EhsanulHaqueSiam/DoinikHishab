/* eslint-disable */
/**
 * Generated data model types — run `npx convex dev` to regenerate.
 */
import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  TableNamesInDataModel,
} from "convex/server";
import type schema from "../schema";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;

export type Doc<TableName extends TableNamesInDataModel<DataModel>> =
  DocumentByName<DataModel, TableName>;

export type Id<TableName extends TableNamesInDataModel<DataModel>> =
  import("convex/values").GenericId<TableName>;
