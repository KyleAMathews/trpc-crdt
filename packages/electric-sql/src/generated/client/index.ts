import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TableSchema, DbSchema, Relation, ElectricClient, HKT } from 'electric-sql/client/model';
import migrations from './migrations';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const QueryModeSchema = z.enum(['default','insensitive']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const TrpcCallsScalarFieldEnumSchema = z.enum(['id','createdat','elapsedms','path','input','type','error','done','clientid','response']);

export const UsersScalarFieldEnumSchema = z.enum(['id','name']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// TRPC CALLS SCHEMA
/////////////////////////////////////////

export const TrpcCallsSchema = z.object({
  id: z.string(),
  createdat: z.string(),
  elapsedms: z.number().int().nullable(),
  path: z.string(),
  input: z.string().nullable(),
  type: z.string(),
  error: z.number().int(),
  done: z.number().int(),
  clientid: z.string(),
  response: z.string().nullable(),
})

export type TrpcCalls = z.infer<typeof TrpcCallsSchema>

/////////////////////////////////////////
// USERS SCHEMA
/////////////////////////////////////////

export const UsersSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type Users = z.infer<typeof UsersSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// TRPC CALLS
//------------------------------------------------------

export const TrpcCallsSelectSchema: z.ZodType<Prisma.TrpcCallsSelect> = z.object({
  id: z.boolean().optional(),
  createdat: z.boolean().optional(),
  elapsedms: z.boolean().optional(),
  path: z.boolean().optional(),
  input: z.boolean().optional(),
  type: z.boolean().optional(),
  error: z.boolean().optional(),
  done: z.boolean().optional(),
  clientid: z.boolean().optional(),
  response: z.boolean().optional(),
}).strict()

// USERS
//------------------------------------------------------

export const UsersSelectSchema: z.ZodType<Prisma.UsersSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const TrpcCallsWhereInputSchema: z.ZodType<Prisma.TrpcCallsWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TrpcCallsWhereInputSchema),z.lazy(() => TrpcCallsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TrpcCallsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TrpcCallsWhereInputSchema),z.lazy(() => TrpcCallsWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdat: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  elapsedms: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  path: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  input: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  error: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  done: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  clientid: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  response: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const TrpcCallsOrderByWithRelationInputSchema: z.ZodType<Prisma.TrpcCallsOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdat: z.lazy(() => SortOrderSchema).optional(),
  elapsedms: z.lazy(() => SortOrderSchema).optional(),
  path: z.lazy(() => SortOrderSchema).optional(),
  input: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  error: z.lazy(() => SortOrderSchema).optional(),
  done: z.lazy(() => SortOrderSchema).optional(),
  clientid: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TrpcCallsWhereUniqueInputSchema: z.ZodType<Prisma.TrpcCallsWhereUniqueInput> = z.object({
  id: z.string().optional()
}).strict();

export const TrpcCallsOrderByWithAggregationInputSchema: z.ZodType<Prisma.TrpcCallsOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdat: z.lazy(() => SortOrderSchema).optional(),
  elapsedms: z.lazy(() => SortOrderSchema).optional(),
  path: z.lazy(() => SortOrderSchema).optional(),
  input: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  error: z.lazy(() => SortOrderSchema).optional(),
  done: z.lazy(() => SortOrderSchema).optional(),
  clientid: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TrpcCallsCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => TrpcCallsAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TrpcCallsMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TrpcCallsMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => TrpcCallsSumOrderByAggregateInputSchema).optional()
}).strict();

export const TrpcCallsScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TrpcCallsScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TrpcCallsScalarWhereWithAggregatesInputSchema),z.lazy(() => TrpcCallsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TrpcCallsScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TrpcCallsScalarWhereWithAggregatesInputSchema),z.lazy(() => TrpcCallsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdat: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  elapsedms: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  path: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  input: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  error: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  done: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  clientid: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  response: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const UsersWhereInputSchema: z.ZodType<Prisma.UsersWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UsersWhereInputSchema),z.lazy(() => UsersWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UsersWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UsersWhereInputSchema),z.lazy(() => UsersWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const UsersOrderByWithRelationInputSchema: z.ZodType<Prisma.UsersOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UsersWhereUniqueInputSchema: z.ZodType<Prisma.UsersWhereUniqueInput> = z.object({
  id: z.string().optional()
}).strict();

export const UsersOrderByWithAggregationInputSchema: z.ZodType<Prisma.UsersOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UsersCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UsersMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UsersMinOrderByAggregateInputSchema).optional()
}).strict();

export const UsersScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UsersScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UsersScalarWhereWithAggregatesInputSchema),z.lazy(() => UsersScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UsersScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UsersScalarWhereWithAggregatesInputSchema),z.lazy(() => UsersScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const TrpcCallsCreateInputSchema: z.ZodType<Prisma.TrpcCallsCreateInput> = z.object({
  id: z.string(),
  createdat: z.string(),
  elapsedms: z.number().int().optional().nullable(),
  path: z.string(),
  input: z.string().optional().nullable(),
  type: z.string(),
  error: z.number().int(),
  done: z.number().int(),
  clientid: z.string(),
  response: z.string().optional().nullable()
}).strict();

export const TrpcCallsUncheckedCreateInputSchema: z.ZodType<Prisma.TrpcCallsUncheckedCreateInput> = z.object({
  id: z.string(),
  createdat: z.string(),
  elapsedms: z.number().int().optional().nullable(),
  path: z.string(),
  input: z.string().optional().nullable(),
  type: z.string(),
  error: z.number().int(),
  done: z.number().int(),
  clientid: z.string(),
  response: z.string().optional().nullable()
}).strict();

export const TrpcCallsUpdateInputSchema: z.ZodType<Prisma.TrpcCallsUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdat: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  elapsedms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  path: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  input: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  done: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  clientid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const TrpcCallsUncheckedUpdateInputSchema: z.ZodType<Prisma.TrpcCallsUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdat: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  elapsedms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  path: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  input: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  done: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  clientid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const TrpcCallsCreateManyInputSchema: z.ZodType<Prisma.TrpcCallsCreateManyInput> = z.object({
  id: z.string(),
  createdat: z.string(),
  elapsedms: z.number().int().optional().nullable(),
  path: z.string(),
  input: z.string().optional().nullable(),
  type: z.string(),
  error: z.number().int(),
  done: z.number().int(),
  clientid: z.string(),
  response: z.string().optional().nullable()
}).strict();

export const TrpcCallsUpdateManyMutationInputSchema: z.ZodType<Prisma.TrpcCallsUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdat: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  elapsedms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  path: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  input: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  done: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  clientid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const TrpcCallsUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TrpcCallsUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdat: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  elapsedms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  path: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  input: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  done: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  clientid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UsersCreateInputSchema: z.ZodType<Prisma.UsersCreateInput> = z.object({
  id: z.string(),
  name: z.string()
}).strict();

export const UsersUncheckedCreateInputSchema: z.ZodType<Prisma.UsersUncheckedCreateInput> = z.object({
  id: z.string(),
  name: z.string()
}).strict();

export const UsersUpdateInputSchema: z.ZodType<Prisma.UsersUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UsersUncheckedUpdateInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UsersCreateManyInputSchema: z.ZodType<Prisma.UsersCreateManyInput> = z.object({
  id: z.string(),
  name: z.string()
}).strict();

export const UsersUpdateManyMutationInputSchema: z.ZodType<Prisma.UsersUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UsersUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const IntNullableFilterSchema: z.ZodType<Prisma.IntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const TrpcCallsCountOrderByAggregateInputSchema: z.ZodType<Prisma.TrpcCallsCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdat: z.lazy(() => SortOrderSchema).optional(),
  elapsedms: z.lazy(() => SortOrderSchema).optional(),
  path: z.lazy(() => SortOrderSchema).optional(),
  input: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  error: z.lazy(() => SortOrderSchema).optional(),
  done: z.lazy(() => SortOrderSchema).optional(),
  clientid: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TrpcCallsAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TrpcCallsAvgOrderByAggregateInput> = z.object({
  elapsedms: z.lazy(() => SortOrderSchema).optional(),
  error: z.lazy(() => SortOrderSchema).optional(),
  done: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TrpcCallsMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TrpcCallsMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdat: z.lazy(() => SortOrderSchema).optional(),
  elapsedms: z.lazy(() => SortOrderSchema).optional(),
  path: z.lazy(() => SortOrderSchema).optional(),
  input: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  error: z.lazy(() => SortOrderSchema).optional(),
  done: z.lazy(() => SortOrderSchema).optional(),
  clientid: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TrpcCallsMinOrderByAggregateInputSchema: z.ZodType<Prisma.TrpcCallsMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdat: z.lazy(() => SortOrderSchema).optional(),
  elapsedms: z.lazy(() => SortOrderSchema).optional(),
  path: z.lazy(() => SortOrderSchema).optional(),
  input: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  error: z.lazy(() => SortOrderSchema).optional(),
  done: z.lazy(() => SortOrderSchema).optional(),
  clientid: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TrpcCallsSumOrderByAggregateInputSchema: z.ZodType<Prisma.TrpcCallsSumOrderByAggregateInput> = z.object({
  elapsedms: z.lazy(() => SortOrderSchema).optional(),
  error: z.lazy(() => SortOrderSchema).optional(),
  done: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const IntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const UsersCountOrderByAggregateInputSchema: z.ZodType<Prisma.UsersCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UsersMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UsersMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UsersMinOrderByAggregateInputSchema: z.ZodType<Prisma.UsersMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const NullableIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedIntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const TrpcCallsFindFirstArgsSchema: z.ZodType<Prisma.TrpcCallsFindFirstArgs> = z.object({
  select: TrpcCallsSelectSchema.optional(),
  where: TrpcCallsWhereInputSchema.optional(),
  orderBy: z.union([ TrpcCallsOrderByWithRelationInputSchema.array(),TrpcCallsOrderByWithRelationInputSchema ]).optional(),
  cursor: TrpcCallsWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: TrpcCallsScalarFieldEnumSchema.array().optional(),
}).strict()

export const TrpcCallsFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TrpcCallsFindFirstOrThrowArgs> = z.object({
  select: TrpcCallsSelectSchema.optional(),
  where: TrpcCallsWhereInputSchema.optional(),
  orderBy: z.union([ TrpcCallsOrderByWithRelationInputSchema.array(),TrpcCallsOrderByWithRelationInputSchema ]).optional(),
  cursor: TrpcCallsWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: TrpcCallsScalarFieldEnumSchema.array().optional(),
}).strict()

export const TrpcCallsFindManyArgsSchema: z.ZodType<Prisma.TrpcCallsFindManyArgs> = z.object({
  select: TrpcCallsSelectSchema.optional(),
  where: TrpcCallsWhereInputSchema.optional(),
  orderBy: z.union([ TrpcCallsOrderByWithRelationInputSchema.array(),TrpcCallsOrderByWithRelationInputSchema ]).optional(),
  cursor: TrpcCallsWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: TrpcCallsScalarFieldEnumSchema.array().optional(),
}).strict()

export const TrpcCallsAggregateArgsSchema: z.ZodType<Prisma.TrpcCallsAggregateArgs> = z.object({
  where: TrpcCallsWhereInputSchema.optional(),
  orderBy: z.union([ TrpcCallsOrderByWithRelationInputSchema.array(),TrpcCallsOrderByWithRelationInputSchema ]).optional(),
  cursor: TrpcCallsWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const TrpcCallsGroupByArgsSchema: z.ZodType<Prisma.TrpcCallsGroupByArgs> = z.object({
  where: TrpcCallsWhereInputSchema.optional(),
  orderBy: z.union([ TrpcCallsOrderByWithAggregationInputSchema.array(),TrpcCallsOrderByWithAggregationInputSchema ]).optional(),
  by: TrpcCallsScalarFieldEnumSchema.array(),
  having: TrpcCallsScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const TrpcCallsFindUniqueArgsSchema: z.ZodType<Prisma.TrpcCallsFindUniqueArgs> = z.object({
  select: TrpcCallsSelectSchema.optional(),
  where: TrpcCallsWhereUniqueInputSchema,
}).strict()

export const TrpcCallsFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TrpcCallsFindUniqueOrThrowArgs> = z.object({
  select: TrpcCallsSelectSchema.optional(),
  where: TrpcCallsWhereUniqueInputSchema,
}).strict()

export const UsersFindFirstArgsSchema: z.ZodType<Prisma.UsersFindFirstArgs> = z.object({
  select: UsersSelectSchema.optional(),
  where: UsersWhereInputSchema.optional(),
  orderBy: z.union([ UsersOrderByWithRelationInputSchema.array(),UsersOrderByWithRelationInputSchema ]).optional(),
  cursor: UsersWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: UsersScalarFieldEnumSchema.array().optional(),
}).strict()

export const UsersFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UsersFindFirstOrThrowArgs> = z.object({
  select: UsersSelectSchema.optional(),
  where: UsersWhereInputSchema.optional(),
  orderBy: z.union([ UsersOrderByWithRelationInputSchema.array(),UsersOrderByWithRelationInputSchema ]).optional(),
  cursor: UsersWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: UsersScalarFieldEnumSchema.array().optional(),
}).strict()

export const UsersFindManyArgsSchema: z.ZodType<Prisma.UsersFindManyArgs> = z.object({
  select: UsersSelectSchema.optional(),
  where: UsersWhereInputSchema.optional(),
  orderBy: z.union([ UsersOrderByWithRelationInputSchema.array(),UsersOrderByWithRelationInputSchema ]).optional(),
  cursor: UsersWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: UsersScalarFieldEnumSchema.array().optional(),
}).strict()

export const UsersAggregateArgsSchema: z.ZodType<Prisma.UsersAggregateArgs> = z.object({
  where: UsersWhereInputSchema.optional(),
  orderBy: z.union([ UsersOrderByWithRelationInputSchema.array(),UsersOrderByWithRelationInputSchema ]).optional(),
  cursor: UsersWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UsersGroupByArgsSchema: z.ZodType<Prisma.UsersGroupByArgs> = z.object({
  where: UsersWhereInputSchema.optional(),
  orderBy: z.union([ UsersOrderByWithAggregationInputSchema.array(),UsersOrderByWithAggregationInputSchema ]).optional(),
  by: UsersScalarFieldEnumSchema.array(),
  having: UsersScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UsersFindUniqueArgsSchema: z.ZodType<Prisma.UsersFindUniqueArgs> = z.object({
  select: UsersSelectSchema.optional(),
  where: UsersWhereUniqueInputSchema,
}).strict()

export const UsersFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UsersFindUniqueOrThrowArgs> = z.object({
  select: UsersSelectSchema.optional(),
  where: UsersWhereUniqueInputSchema,
}).strict()

export const TrpcCallsCreateArgsSchema: z.ZodType<Prisma.TrpcCallsCreateArgs> = z.object({
  select: TrpcCallsSelectSchema.optional(),
  data: z.union([ TrpcCallsCreateInputSchema,TrpcCallsUncheckedCreateInputSchema ]),
}).strict()

export const TrpcCallsUpsertArgsSchema: z.ZodType<Prisma.TrpcCallsUpsertArgs> = z.object({
  select: TrpcCallsSelectSchema.optional(),
  where: TrpcCallsWhereUniqueInputSchema,
  create: z.union([ TrpcCallsCreateInputSchema,TrpcCallsUncheckedCreateInputSchema ]),
  update: z.union([ TrpcCallsUpdateInputSchema,TrpcCallsUncheckedUpdateInputSchema ]),
}).strict()

export const TrpcCallsCreateManyArgsSchema: z.ZodType<Prisma.TrpcCallsCreateManyArgs> = z.object({
  data: TrpcCallsCreateManyInputSchema.array(),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const TrpcCallsDeleteArgsSchema: z.ZodType<Prisma.TrpcCallsDeleteArgs> = z.object({
  select: TrpcCallsSelectSchema.optional(),
  where: TrpcCallsWhereUniqueInputSchema,
}).strict()

export const TrpcCallsUpdateArgsSchema: z.ZodType<Prisma.TrpcCallsUpdateArgs> = z.object({
  select: TrpcCallsSelectSchema.optional(),
  data: z.union([ TrpcCallsUpdateInputSchema,TrpcCallsUncheckedUpdateInputSchema ]),
  where: TrpcCallsWhereUniqueInputSchema,
}).strict()

export const TrpcCallsUpdateManyArgsSchema: z.ZodType<Prisma.TrpcCallsUpdateManyArgs> = z.object({
  data: z.union([ TrpcCallsUpdateManyMutationInputSchema,TrpcCallsUncheckedUpdateManyInputSchema ]),
  where: TrpcCallsWhereInputSchema.optional(),
}).strict()

export const TrpcCallsDeleteManyArgsSchema: z.ZodType<Prisma.TrpcCallsDeleteManyArgs> = z.object({
  where: TrpcCallsWhereInputSchema.optional(),
}).strict()

export const UsersCreateArgsSchema: z.ZodType<Prisma.UsersCreateArgs> = z.object({
  select: UsersSelectSchema.optional(),
  data: z.union([ UsersCreateInputSchema,UsersUncheckedCreateInputSchema ]),
}).strict()

export const UsersUpsertArgsSchema: z.ZodType<Prisma.UsersUpsertArgs> = z.object({
  select: UsersSelectSchema.optional(),
  where: UsersWhereUniqueInputSchema,
  create: z.union([ UsersCreateInputSchema,UsersUncheckedCreateInputSchema ]),
  update: z.union([ UsersUpdateInputSchema,UsersUncheckedUpdateInputSchema ]),
}).strict()

export const UsersCreateManyArgsSchema: z.ZodType<Prisma.UsersCreateManyArgs> = z.object({
  data: UsersCreateManyInputSchema.array(),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const UsersDeleteArgsSchema: z.ZodType<Prisma.UsersDeleteArgs> = z.object({
  select: UsersSelectSchema.optional(),
  where: UsersWhereUniqueInputSchema,
}).strict()

export const UsersUpdateArgsSchema: z.ZodType<Prisma.UsersUpdateArgs> = z.object({
  select: UsersSelectSchema.optional(),
  data: z.union([ UsersUpdateInputSchema,UsersUncheckedUpdateInputSchema ]),
  where: UsersWhereUniqueInputSchema,
}).strict()

export const UsersUpdateManyArgsSchema: z.ZodType<Prisma.UsersUpdateManyArgs> = z.object({
  data: z.union([ UsersUpdateManyMutationInputSchema,UsersUncheckedUpdateManyInputSchema ]),
  where: UsersWhereInputSchema.optional(),
}).strict()

export const UsersDeleteManyArgsSchema: z.ZodType<Prisma.UsersDeleteManyArgs> = z.object({
  where: UsersWhereInputSchema.optional(),
}).strict()

interface TrpcCallsGetPayload extends HKT {
  readonly _A?: boolean | null | undefined | Prisma.TrpcCallsArgs
  readonly type: Prisma.TrpcCallsGetPayload<this['_A']>
}

interface UsersGetPayload extends HKT {
  readonly _A?: boolean | null | undefined | Prisma.UsersArgs
  readonly type: Prisma.UsersGetPayload<this['_A']>
}

export const tableSchemas = {
  trpc_calls: {
    fields: ["id","createdat","elapsedms","path","input","type","error","done","clientid","response"],
    relations: [
    ],
    modelSchema: (TrpcCallsCreateInputSchema as any)
      .partial()
      .or((TrpcCallsUncheckedCreateInputSchema as any).partial()),
    createSchema: TrpcCallsCreateArgsSchema,
    createManySchema: TrpcCallsCreateManyArgsSchema,
    findUniqueSchema: TrpcCallsFindUniqueArgsSchema,
    findSchema: TrpcCallsFindFirstArgsSchema,
    updateSchema: TrpcCallsUpdateArgsSchema,
    updateManySchema: TrpcCallsUpdateManyArgsSchema,
    upsertSchema: TrpcCallsUpsertArgsSchema,
    deleteSchema: TrpcCallsDeleteArgsSchema,
    deleteManySchema: TrpcCallsDeleteManyArgsSchema
  } as TableSchema<
    z.infer<typeof TrpcCallsCreateInputSchema>,
    Prisma.TrpcCallsCreateArgs['data'],
    Prisma.TrpcCallsUpdateArgs['data'],
    Prisma.TrpcCallsFindFirstArgs['select'],
    Prisma.TrpcCallsFindFirstArgs['where'],
    Prisma.TrpcCallsFindUniqueArgs['where'],
    never,
    Prisma.TrpcCallsFindFirstArgs['orderBy'],
    Prisma.TrpcCallsScalarFieldEnum,
    TrpcCallsGetPayload
  >,
  users: {
    fields: ["id","name"],
    relations: [
    ],
    modelSchema: (UsersCreateInputSchema as any)
      .partial()
      .or((UsersUncheckedCreateInputSchema as any).partial()),
    createSchema: UsersCreateArgsSchema,
    createManySchema: UsersCreateManyArgsSchema,
    findUniqueSchema: UsersFindUniqueArgsSchema,
    findSchema: UsersFindFirstArgsSchema,
    updateSchema: UsersUpdateArgsSchema,
    updateManySchema: UsersUpdateManyArgsSchema,
    upsertSchema: UsersUpsertArgsSchema,
    deleteSchema: UsersDeleteArgsSchema,
    deleteManySchema: UsersDeleteManyArgsSchema
  } as TableSchema<
    z.infer<typeof UsersCreateInputSchema>,
    Prisma.UsersCreateArgs['data'],
    Prisma.UsersUpdateArgs['data'],
    Prisma.UsersFindFirstArgs['select'],
    Prisma.UsersFindFirstArgs['where'],
    Prisma.UsersFindUniqueArgs['where'],
    never,
    Prisma.UsersFindFirstArgs['orderBy'],
    Prisma.UsersScalarFieldEnum,
    UsersGetPayload
  >,
}

export const schema = new DbSchema(tableSchemas, migrations)
export type Electric = ElectricClient<typeof schema>
