/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics_queries from "../analytics/queries.js";
import type * as chat_mutations from "../chat/mutations.js";
import type * as chat_queries from "../chat/queries.js";
import type * as customers_mutations from "../customers/mutations.js";
import type * as customers_queries from "../customers/queries.js";
import type * as dependants_mutations from "../dependants/mutations.js";
import type * as dependants_queries from "../dependants/queries.js";
import type * as fabrics_mutations from "../fabrics/mutations.js";
import type * as fabrics_queries from "../fabrics/queries.js";
import type * as helpers_auth from "../helpers/auth.js";
import type * as helpers_utils from "../helpers/utils.js";
import type * as http from "../http.js";
import type * as materials_mutations from "../materials/mutations.js";
import type * as materials_queries from "../materials/queries.js";
import type * as measurements_mutations from "../measurements/mutations.js";
import type * as measurements_queries from "../measurements/queries.js";
import type * as members_mutations from "../members/mutations.js";
import type * as members_queries from "../members/queries.js";
import type * as orders_mutations from "../orders/mutations.js";
import type * as orders_queries from "../orders/queries.js";
import type * as organizations_mutations from "../organizations/mutations.js";
import type * as organizations_queries from "../organizations/queries.js";
import type * as styles_mutations from "../styles/mutations.js";
import type * as styles_queries from "../styles/queries.js";
import type * as tasks_mutations from "../tasks/mutations.js";
import type * as tasks_queries from "../tasks/queries.js";
import type * as users_helpers from "../users/helpers.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "analytics/queries": typeof analytics_queries;
  "chat/mutations": typeof chat_mutations;
  "chat/queries": typeof chat_queries;
  "customers/mutations": typeof customers_mutations;
  "customers/queries": typeof customers_queries;
  "dependants/mutations": typeof dependants_mutations;
  "dependants/queries": typeof dependants_queries;
  "fabrics/mutations": typeof fabrics_mutations;
  "fabrics/queries": typeof fabrics_queries;
  "helpers/auth": typeof helpers_auth;
  "helpers/utils": typeof helpers_utils;
  http: typeof http;
  "materials/mutations": typeof materials_mutations;
  "materials/queries": typeof materials_queries;
  "measurements/mutations": typeof measurements_mutations;
  "measurements/queries": typeof measurements_queries;
  "members/mutations": typeof members_mutations;
  "members/queries": typeof members_queries;
  "orders/mutations": typeof orders_mutations;
  "orders/queries": typeof orders_queries;
  "organizations/mutations": typeof organizations_mutations;
  "organizations/queries": typeof organizations_queries;
  "styles/mutations": typeof styles_mutations;
  "styles/queries": typeof styles_queries;
  "tasks/mutations": typeof tasks_mutations;
  "tasks/queries": typeof tasks_queries;
  "users/helpers": typeof users_helpers;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
