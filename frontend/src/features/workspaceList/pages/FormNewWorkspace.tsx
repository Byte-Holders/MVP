"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {Card,CardContent,CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Field,FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { useNavigate } from "@tanstack/react-router"
import { fetchAuthSession } from 'aws-amplify/auth'
import { getCurrentUser } from 'aws-amplify/auth'

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Workspace name must be at least 2 characters.")
    .max(30, "Workspace name must be at most 30 characters."),
})

export function NewWorkspaceDialog() {
    const navigate = useNavigate()
    
    const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    /*onSubmit: async ({ value }) => {
      toast("You submitted the following values:", {
        description: (
          <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        ),
        position: "bottom-right",
        classNames: {
          content: "flex flex-col gap-2",
        },
        style: {
          "--border-radius": "calc(var(--radius)  + 4px)",
        } as React.CSSProperties,
      })
    },*/
    onSubmit: async ({ value }) => {
      try {
        const { username } = await getCurrentUser()  // prende username da Cognito

        const response = await fetch("/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: value.name,
            createdBy: username,
          }),
        })

        if (!response.ok) throw new Error("Errore nella creazione del workspace")

        const newWorkspace = await response.json()
        navigate({ to: "/workspaces"})

        // Redirect alla pagina del nuovo workspace
        // Adatta il path alla struttura dei tuoi route
        //navigate({ to: "/workspaces/$workspaceId", params: { workspaceId: newWorkspace.id } })

      } catch (error) {
        console.error(error)
        // qui puoi aggiungere un toast di errore
      }
    },
  })
  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">+ New Workspace</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
        <form id="new-workspace-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your projects and tasks.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Workspace Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="My New Workspace"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create Workspace</Button>
          </DialogFooter>
        </form>
        </DialogContent>
    </Dialog>
  )
}