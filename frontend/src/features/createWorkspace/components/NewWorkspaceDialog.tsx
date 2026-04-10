import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useNewWorkspaceForm } from '../hooks/useNewWorkspaceForm'

export function NewWorkspaceDialog() {
  const { form, serverError } = useNewWorkspaceForm()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">+ New Workspace</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form
          id="new-workspace-form"
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
            {/* errore server — mostrato sotto il campo, fuori da form.Field */}
            {serverError && (
              <p className="text-sm text-red-500 mt-1">{serverError}</p>
            )}
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit">Create Workspace</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
