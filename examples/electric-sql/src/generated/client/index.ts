import { z } from 'zod';
import type { Prisma } from './prismaClient';
import { type TableSchema, DbSchema, Relation, ElectricClient, type HKT } from 'electric-sql/client/model';
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

export const Trpc_callsScalarFieldEnumSchema = z.enum(['id','createdat','elapsedms','path','input','type','state','clientid','response']);

export const UsersScalarFieldEnumSchema = z.enum(['id','created_at','name']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// TRPC CALLS SCHEMA
/////////////////////////////////////////

export const Trpc_callsSchema = z.object({
  id: z.string().uuid(),
  createdat: z.coerce.date(),
  elapsedms: z.number().int().gte(-2147483648).lte(2147483647).nullable(),
  path: z.string(),
  input: z.string().nullable(),
  type: z.string(),
  state: z.string(),
  clientid: z.string(),
  response: z.string().nullable(),
})

export type Trpc_calls = z.infer<typeof Trpc_callsSchema>

/////////////////////////////////////////
// USERS SCHEMA
/////////////////////////////////////////

export const UsersSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  name: z.string(),
})

export type Users = z.infer<typeof UsersSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// TRPC CALLS
//------------------------------------------------------

export const Trpc_callsSelectSchema: z.ZodType<Prisma.Trpc_callsSelect> = z.object({
  id: z.boolean().optional(),
  createdat: z.boolean().optional(),
  elapsedms: z.boolean().optional(),
  path: z.boolean().optional(),
  input: z.boolean().optional(),
  type: z.boolean().optional(),
  state: z.boolean().optional(),
  clientid: z.boolean().optional(),
  response: z.boolean().optional(),
}).strict()

// USERS
//------------------------------------------------------

export const UsersSelectSchema: z.ZodType<Prisma.UsersSelect> = z.object({
  id: z.boolean().optional(),
  created_at: z.boolean().optional(),
  name: z.boolean().optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const Trpc_callsWhereInputSchema: z.ZodType<Prisma.Trpc_callsWhereInput> = z.object({
  AND: z.union([ z.lazy(() => Trpc_callsWhereInputSchema),z.lazy(() => Trpc_callsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Trpc_callsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Trpc_callsWhereInputSchema),z.lazy(() => Trpc_callsWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema),z.string() ]).optional(),
  createdat: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  elapsedms: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  path: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  input: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  state: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  clientid: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  response: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const Trpc_callsOrderByWithRelationInputSchema: z.ZodType<Prisma.Trpc_callsOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdat: z.lazy(() => SortOrderSchema).optional(),
  elapsedms: z.lazy(() => SortOrderSchema).optional(),
  path: z.lazy(() => SortOrderSchema).optional(),
  input: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  state: z.lazy(() => SortOrderSchema).optional(),
  clientid: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const Trpc_callsWhereUniqueInputSchema: z.ZodType<Prisma.Trpc_callsWhereUniqueInput> = z.object({
  id: z.string().uuid().optional()
}).strict();

export const Trpc_callsOrderByWithAggregationInputSchema: z.ZodType<Prisma.Trpc_callsOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdat: z.lazy(() => SortOrderSchema).optional(),
  elapsedms: z.lazy(() => SortOrderSchema).optional(),
  path: z.lazy(() => SortOrderSchema).optional(),
  input: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  state: z.lazy(() => SortOrderSchema).optional(),
  clientid: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => Trpc_callsCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => Trpc_callsAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => Trpc_callsMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => Trpc_callsMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => Trpc_callsSumOrderByAggregateInputSchema).optional()
}).strict();

export const Trpc_callsScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.Trpc_callsScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => Trpc_callsScalarWhereWithAggregatesInputSchema),z.lazy(() => Trpc_callsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => Trpc_callsScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Trpc_callsScalarWhereWithAggregatesInputSchema),z.lazy(() => Trpc_callsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema),z.string() ]).optional(),
  createdat: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  elapsedms: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  path: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  input: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  state: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  clientid: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  response: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const UsersWhereInputSchema: z.ZodType<Prisma.UsersWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UsersWhereInputSchema),z.lazy(() => UsersWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UsersWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UsersWhereInputSchema),z.lazy(() => UsersWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const UsersOrderByWithRelationInputSchema: z.ZodType<Prisma.UsersOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UsersWhereUniqueInputSchema: z.ZodType<Prisma.UsersWhereUniqueInput> = z.object({
  id: z.string().optional()
}).strict();

export const UsersOrderByWithAggregationInputSchema: z.ZodType<Prisma.UsersOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
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
  created_at: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const Trpc_callsCreateInputSchema: z.ZodType<Prisma.Trpc_callsCreateInput> = z.object({
  id: z.string().uuid(),
  createdat: z.coerce.date(),
  elapsedms: z.number().int().gte(-2147483648).lte(2147483647).optional().nullable(),
  path: z.string(),
  input: z.string().optional().nullable(),
  type: z.string(),
  state: z.string(),
  clientid: z.string(),
  response: z.string().optional().nullable()
}).strict();

export const Trpc_callsUncheckedCreateInputSchema: z.ZodType<Prisma.Trpc_callsUncheckedCreateInput> = z.object({
  id: z.string().uuid(),
  createdat: z.coerce.date(),
  elapsedms: z.number().int().gte(-2147483648).lte(2147483647).optional().nullable(),
  path: z.string(),
  input: z.string().optional().nullable(),
  type: z.string(),
  state: z.string(),
  clientid: z.string(),
  response: z.string().optional().nullable()
}).strict();

export const Trpc_callsUpdateInputSchema: z.ZodType<Prisma.Trpc_callsUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdat: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  elapsedms: z.union([ z.number().int().gte(-2147483648).lte(2147483647),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  path: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  input: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  state: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  clientid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const Trpc_callsUncheckedUpdateInputSchema: z.ZodType<Prisma.Trpc_callsUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdat: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  elapsedms: z.union([ z.number().int().gte(-2147483648).lte(2147483647),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  path: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  input: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  state: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  clientid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const Trpc_callsCreateManyInputSchema: z.ZodType<Prisma.Trpc_callsCreateManyInput> = z.object({
  id: z.string().uuid(),
  createdat: z.coerce.date(),
  elapsedms: z.number().int().gte(-2147483648).lte(2147483647).optional().nullable(),
  path: z.string(),
  input: z.string().optional().nullable(),
  type: z.string(),
  state: z.string(),
  clientid: z.string(),
  response: z.string().optional().nullable()
}).strict();

export const Trpc_callsUpdateManyMutationInputSchema: z.ZodType<Prisma.Trpc_callsUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdat: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  elapsedms: z.union([ z.number().int().gte(-2147483648).lte(2147483647),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  path: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  input: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  state: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  clientid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const Trpc_callsUncheckedUpdateManyInputSchema: z.ZodType<Prisma.Trpc_callsUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdat: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  elapsedms: z.union([ z.number().int().gte(-2147483648).lte(2147483647),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  path: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  input: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  state: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  clientid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UsersCreateInputSchema: z.ZodType<Prisma.UsersCreateInput> = z.object({
  id: z.string(),
  created_at: z.string(),
  name: z.string()
}).strict();

export const UsersUncheckedCreateInputSchema: z.ZodType<Prisma.UsersUncheckedCreateInput> = z.object({
  id: z.string(),
  created_at: z.string(),
  name: z.string()
}).strict();

export const UsersUpdateInputSchema: z.ZodType<Prisma.UsersUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UsersUncheckedUpdateInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UsersCreateManyInputSchema: z.ZodType<Prisma.UsersCreateManyInput> = z.object({
  id: z.string(),
  created_at: z.string(),
  name: z.string()
}).strict();

export const UsersUpdateManyMutationInputSchema: z.ZodType<Prisma.UsersUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UsersUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UuidFilterSchema: z.ZodType<Prisma.UuidFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidFilterSchema) ]).optional(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
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

export const Trpc_callsCountOrderByAggregateInputSchema: z.ZodType<Prisma.Trpc_callsCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdat: z.lazy(() => SortOrderSchema).optional(),
  elapsedms: z.lazy(() => SortOrderSchema).optional(),
  path: z.lazy(() => SortOrderSchema).optional(),
  input: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  state: z.lazy(() => SortOrderSchema).optional(),
  clientid: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const Trpc_callsAvgOrderByAggregateInputSchema: z.ZodType<Prisma.Trpc_callsAvgOrderByAggregateInput> = z.object({
  elapsedms: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const Trpc_callsMaxOrderByAggregateInputSchema: z.ZodType<Prisma.Trpc_callsMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdat: z.lazy(() => SortOrderSchema).optional(),
  elapsedms: z.lazy(() => SortOrderSchema).optional(),
  path: z.lazy(() => SortOrderSchema).optional(),
  input: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  state: z.lazy(() => SortOrderSchema).optional(),
  clientid: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const Trpc_callsMinOrderByAggregateInputSchema: z.ZodType<Prisma.Trpc_callsMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdat: z.lazy(() => SortOrderSchema).optional(),
  elapsedms: z.lazy(() => SortOrderSchema).optional(),
  path: z.lazy(() => SortOrderSchema).optional(),
  input: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  state: z.lazy(() => SortOrderSchema).optional(),
  clientid: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const Trpc_callsSumOrderByAggregateInputSchema: z.ZodType<Prisma.Trpc_callsSumOrderByAggregateInput> = z.object({
  elapsedms: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UuidWithAggregatesFilterSchema: z.ZodType<Prisma.UuidWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
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

export const UsersCountOrderByAggregateInputSchema: z.ZodType<Prisma.UsersCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UsersMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UsersMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UsersMinOrderByAggregateInputSchema: z.ZodType<Prisma.UsersMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
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

export const NestedUuidFilterSchema: z.ZodType<Prisma.NestedUuidFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
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

export const NestedUuidWithAggregatesFilterSchema: z.ZodType<Prisma.NestedUuidWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
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

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
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

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const Trpc_callsFindFirstArgsSchema: z.ZodType<Prisma.Trpc_callsFindFirstArgs> = z.object({
  select: Trpc_callsSelectSchema.optional(),
  where: Trpc_callsWhereInputSchema.optional(),
  orderBy: z.union([ Trpc_callsOrderByWithRelationInputSchema.array(),Trpc_callsOrderByWithRelationInputSchema ]).optional(),
  cursor: Trpc_callsWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: Trpc_callsScalarFieldEnumSchema.array().optional(),
}).strict() 

export const Trpc_callsFindFirstOrThrowArgsSchema: z.ZodType<Prisma.Trpc_callsFindFirstOrThrowArgs> = z.object({
  select: Trpc_callsSelectSchema.optional(),
  where: Trpc_callsWhereInputSchema.optional(),
  orderBy: z.union([ Trpc_callsOrderByWithRelationInputSchema.array(),Trpc_callsOrderByWithRelationInputSchema ]).optional(),
  cursor: Trpc_callsWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: Trpc_callsScalarFieldEnumSchema.array().optional(),
}).strict() 

export const Trpc_callsFindManyArgsSchema: z.ZodType<Prisma.Trpc_callsFindManyArgs> = z.object({
  select: Trpc_callsSelectSchema.optional(),
  where: Trpc_callsWhereInputSchema.optional(),
  orderBy: z.union([ Trpc_callsOrderByWithRelationInputSchema.array(),Trpc_callsOrderByWithRelationInputSchema ]).optional(),
  cursor: Trpc_callsWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: Trpc_callsScalarFieldEnumSchema.array().optional(),
}).strict() 

export const Trpc_callsAggregateArgsSchema: z.ZodType<Prisma.Trpc_callsAggregateArgs> = z.object({
  where: Trpc_callsWhereInputSchema.optional(),
  orderBy: z.union([ Trpc_callsOrderByWithRelationInputSchema.array(),Trpc_callsOrderByWithRelationInputSchema ]).optional(),
  cursor: Trpc_callsWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() 

export const Trpc_callsGroupByArgsSchema: z.ZodType<Prisma.Trpc_callsGroupByArgs> = z.object({
  where: Trpc_callsWhereInputSchema.optional(),
  orderBy: z.union([ Trpc_callsOrderByWithAggregationInputSchema.array(),Trpc_callsOrderByWithAggregationInputSchema ]).optional(),
  by: Trpc_callsScalarFieldEnumSchema.array(),
  having: Trpc_callsScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() 

export const Trpc_callsFindUniqueArgsSchema: z.ZodType<Prisma.Trpc_callsFindUniqueArgs> = z.object({
  select: Trpc_callsSelectSchema.optional(),
  where: Trpc_callsWhereUniqueInputSchema,
}).strict() 

export const Trpc_callsFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.Trpc_callsFindUniqueOrThrowArgs> = z.object({
  select: Trpc_callsSelectSchema.optional(),
  where: Trpc_callsWhereUniqueInputSchema,
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

export const Trpc_callsCreateArgsSchema: z.ZodType<Prisma.Trpc_callsCreateArgs> = z.object({
  select: Trpc_callsSelectSchema.optional(),
  data: z.union([ Trpc_callsCreateInputSchema,Trpc_callsUncheckedCreateInputSchema ]),
}).strict() 

export const Trpc_callsUpsertArgsSchema: z.ZodType<Prisma.Trpc_callsUpsertArgs> = z.object({
  select: Trpc_callsSelectSchema.optional(),
  where: Trpc_callsWhereUniqueInputSchema,
  create: z.union([ Trpc_callsCreateInputSchema,Trpc_callsUncheckedCreateInputSchema ]),
  update: z.union([ Trpc_callsUpdateInputSchema,Trpc_callsUncheckedUpdateInputSchema ]),
}).strict() 

export const Trpc_callsCreateManyArgsSchema: z.ZodType<Prisma.Trpc_callsCreateManyArgs> = z.object({
  data: Trpc_callsCreateManyInputSchema.array(),
  skipDuplicates: z.boolean().optional(),
}).strict() 

export const Trpc_callsDeleteArgsSchema: z.ZodType<Prisma.Trpc_callsDeleteArgs> = z.object({
  select: Trpc_callsSelectSchema.optional(),
  where: Trpc_callsWhereUniqueInputSchema,
}).strict() 

export const Trpc_callsUpdateArgsSchema: z.ZodType<Prisma.Trpc_callsUpdateArgs> = z.object({
  select: Trpc_callsSelectSchema.optional(),
  data: z.union([ Trpc_callsUpdateInputSchema,Trpc_callsUncheckedUpdateInputSchema ]),
  where: Trpc_callsWhereUniqueInputSchema,
}).strict() 

export const Trpc_callsUpdateManyArgsSchema: z.ZodType<Prisma.Trpc_callsUpdateManyArgs> = z.object({
  data: z.union([ Trpc_callsUpdateManyMutationInputSchema,Trpc_callsUncheckedUpdateManyInputSchema ]),
  where: Trpc_callsWhereInputSchema.optional(),
}).strict() 

export const Trpc_callsDeleteManyArgsSchema: z.ZodType<Prisma.Trpc_callsDeleteManyArgs> = z.object({
  where: Trpc_callsWhereInputSchema.optional(),
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

interface Trpc_callsGetPayload extends HKT {
  readonly _A?: boolean | null | undefined | Prisma.Trpc_callsArgs
  readonly type: Prisma.Trpc_callsGetPayload<this['_A']>
}

interface UsersGetPayload extends HKT {
  readonly _A?: boolean | null | undefined | Prisma.UsersArgs
  readonly type: Prisma.UsersGetPayload<this['_A']>
}

export const tableSchemas = {
  trpc_calls: {
    fields: new Map([
      [
        "id",
        "UUID"
      ],
      [
        "createdat",
        "TIMESTAMPTZ"
      ],
      [
        "elapsedms",
        "INT4"
      ],
      [
        "path",
        "TEXT"
      ],
      [
        "input",
        "TEXT"
      ],
      [
        "type",
        "TEXT"
      ],
      [
        "state",
        "TEXT"
      ],
      [
        "clientid",
        "TEXT"
      ],
      [
        "response",
        "TEXT"
      ]
    ]),
    relations: [
    ],
    modelSchema: (Trpc_callsCreateInputSchema as any)
      .partial()
      .or((Trpc_callsUncheckedCreateInputSchema as any).partial()),
    createSchema: Trpc_callsCreateArgsSchema,
    createManySchema: Trpc_callsCreateManyArgsSchema,
    findUniqueSchema: Trpc_callsFindUniqueArgsSchema,
    findSchema: Trpc_callsFindFirstArgsSchema,
    updateSchema: Trpc_callsUpdateArgsSchema,
    updateManySchema: Trpc_callsUpdateManyArgsSchema,
    upsertSchema: Trpc_callsUpsertArgsSchema,
    deleteSchema: Trpc_callsDeleteArgsSchema,
    deleteManySchema: Trpc_callsDeleteManyArgsSchema
  } as TableSchema<
    z.infer<typeof Trpc_callsCreateInputSchema>,
    Prisma.Trpc_callsCreateArgs['data'],
    Prisma.Trpc_callsUpdateArgs['data'],
    Prisma.Trpc_callsFindFirstArgs['select'],
    Prisma.Trpc_callsFindFirstArgs['where'],
    Prisma.Trpc_callsFindUniqueArgs['where'],
    never,
    Prisma.Trpc_callsFindFirstArgs['orderBy'],
    Prisma.Trpc_callsScalarFieldEnum,
    Trpc_callsGetPayload
  >,
  users: {
    fields: new Map([
      [
        "id",
        "TEXT"
      ],
      [
        "created_at",
        "TEXT"
      ],
      [
        "name",
        "TEXT"
      ]
    ]),
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
