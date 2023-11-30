import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
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
import { useDocument } from "@automerge/automerge-repo-react-hooks"
import { AutomergeUrl } from "@automerge/automerge-repo"
import { UsersDoc } from "~/types"

// TODO: reimplement this
/*
export function OnlineSwitch({ provider }: { provider: WebsocketProvider }) {
  const [connected, setConnected] = useState(provider.wsconnected)
  useEffect(() => {
    function listen(event) {
      console.log(`switch`, event) // logs "connected" or "disconnected"
      if (event.status === `disconnected`) {
        setConnected(false)
      } else {
        setConnected(true)
      }
    }
    provider.on("status", listen)

    return () => {
      provider.off(`status`, listen)
    }
  })
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="online-mode"
        checked={connected}
        onCheckedChange={() => {
          if (connected) {
            provider.disconnect()
          } else {
            provider.connect()
          }
        }}
      />
      <Label htmlFor="online-mode">{connected ? `Online` : `Offline`}</Label>
    </div>
  )
} */

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(20),
})

function NameForm({ trpc }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    await trpc.userCreate.mutate({ name: values.name })
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

function CallRow({ callUrl }) {
  const [call] = useDocument(callUrl)

  return <TableRow key={call.id}>
            <TableCell className="font-medium">{call.path}</TableCell>
            <TableCell>{JSON.stringify(call.input)}</TableCell>
            <TableCell>{call.elapsedMs}</TableCell>
            <TableCell>{call.state}</TableCell>
          </TableRow>
}

function RecentCallsTable({ queueDocUrl }) {
  const [queueDoc, changeQueueDoc] = useDocument<CallsDoc>(queueDocUrl)
  const queue = queueDoc?.queue || []

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">path</TableHead>
          <TableHead>input</TableHead>
          <TableHead>elapsedMs</TableHead>
          <TableHead>done</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        { queue.map((callUrl) => CallRow({ callUrl })) }
      </TableBody>
    </Table>
  )
}

export default function Index() {
  const hash = window.location.hash
  let usersDoc: UsersDoc | undefined
  [usersDoc] = useDocument<UsersDoc>(hash ? hash.slice(1) as AutomergeUrl : undefined)
  
  // TODO subscribe to users & render in table
  // recreate trpc-yjs here
  // refactor so isolated to route
  // build trpc-electric-sql
  // build in example as well

//  <OnlineSwitch provider={provider} />

  const users = Object.values(usersDoc?.users || {})

  return (
    <div className="container relative mt-8">
      <div className="flex flex-row items-center mb-4 ">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
          trpc-yjs
        </h1>
        <div className="ml-4">
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
                {users.slice(-10, users.length).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
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
            <NameForm trpc={trpc} />
          </div>
        </div>
      </div>
      <h2 className="text-3xl font-bold">tRPC call log</h2>
      <RecentCallsTable queueDocUrl={queueDocUrl} />
    </div>
  )
}
