import { useEffect } from "react"
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
import { useYjs } from "~/context"
import { useSubscribeYjs } from "~/use-yjs-data"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(20),
})

export function ProfileForm({ trpc }) {
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

export default function Index() {
  const { trpc, provider, doc } = useYjs()
  const users = useSubscribeYjs(doc?.getArray(`users`))

  // TODO subscribe to users & render in table
  // recreate trpc-yjs here
  // refactor so isolated to route
  // build trpc-electric-sql
  // build in example as well

  return (
    <div className="container relative mt-8">
      <h1 className="text-3xl mb-4 font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
        tRPC for CRDTs
      </h1>
      <div className="flex flex-row">
        <div className="basis-1/2 p-2">
          <h2 className="text-xl font-bold mb-1">Users</h2>
          <div className="overflow-hidden p-2 rounded-[0.5rem] border bg-background shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
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
            <ProfileForm trpc={trpc} />
          </div>
        </div>
      </div>
    </div>
  )
}
