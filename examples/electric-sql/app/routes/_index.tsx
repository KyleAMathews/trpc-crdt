import React, { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { useLiveQuery, useConnectivityState } from "electric-sql/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { useElectric } from "~/context"
import { genUUID } from "electric-sql/util"
import { trpc } from "../trpc"

export function OnlineSwitch() {
  const { connectivityState, toggleConnectivityState } = useConnectivityState()

  const connectivityConnected = connectivityState !== `disconnected`
  const connectivityStateDisplay =
    connectivityState[0].toUpperCase() + connectivityState.slice(1)
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="online-mode"
        checked={connectivityConnected}
        onCheckedChange={() => {
          toggleConnectivityState()
        }}
      />
      <Label htmlFor="online-mode">{connectivityStateDisplay}</Label>
    </div>
  )
}

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: `Name must be at least 2 characters.`,
    })
    .max(20),
})

function NameForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ``,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO handle server errors.
    await trpc.userCreate.mutate({
      id: genUUID(),
      created_at: new Date().toJSON(),
      name: values.name,
    })
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={form.formState.isSubmitting} type="submit">
          Submit
        </Button>
      </form>
    </Form>
  )
}

function RecentCallsTable() {
  const { db } = useElectric()!
  const { results: trpcCalls } = useLiveQuery(
    db.trpc_calls.liveMany({ take: 10, orderBy: { createdat: `desc` } })
  )

  const calls = trpcCalls || []

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">path</TableHead>
          <TableHead>input</TableHead>
          <TableHead>elapsedMs</TableHead>
          <TableHead className="w-[150px]">state</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.map((call) => (
          <TableRow key={call.id}>
            <TableCell className="font-medium">{call.path}</TableCell>
            <TableCell>{JSON.stringify(call.input)}</TableCell>
            <TableCell>{call.elapsedms}</TableCell>
            <TableCell>{JSON.stringify(call.state)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function Index() {
  const electric = useElectric()!
  const { db } = electric

  const { results: users } = useLiveQuery(
    db.users.liveMany({
      orderBy: {
        created_at: `desc`,
      },
      take: 10,
    })
  )

  return (
    <div className="container relative mt-8">
      <div className="flex flex-row items-center mb-4 ">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
          trpc-electric-sql
        </h1>
        <div className="ml-4">
          <OnlineSwitch />
        </div>
      </div>
      <div className="flex flex-row mb-6">
        <div className="basis-1/2 p-2">
          <h2 className="text-xl font-bold mb-1">Users (last 10)</h2>
          <div className="overflow-hidden p-2 rounded-[0.5rem] border bg-background shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="basis-1/2 p-2 pl-4">
          <h2 className="text-xl font-bold">Add New User</h2>
          <div className="flex flex-col">
            <NameForm />
          </div>
        </div>
      </div>
      <h2 className="text-3xl font-bold">tRPC call log</h2>
      <RecentCallsTable />
    </div>
  )
}
