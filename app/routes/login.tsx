import type { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import { authenticator } from "~/.server/auth";
import { useForm } from "@conform-to/react";
import { getZodConstraint } from "@conform-to/zod";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.authenticate("form", request, {
    failureRedirect: "/login",
    successRedirect: "/",
  });
}

export default function Login() {
  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    // This not only syncs the error from the server
    // But is also used as the default value of the form
    // in case the document is reloaded for progressive enhancement
    lastResult,
    // To derive all validation attributes
    constraint: getZodConstraint(AuthSchema),
  });

  return (
    <div className="flex w-full justify-center">
      <Card className="max-w-full w-[340px] mt-[100px]">
        <CardContent className="overflow-hidden">
          <Tabs aria-label="Tabs form" defaultValue="login" className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login" title="Login">
              <Form
                id={form.id}
                aria-invalid={form.errors ? true : undefined}
                aria-describedby={form.errors ? form.errorId : undefined}
                method="post"
                action="/login"
              >
                <Input
                  id={fields.email.id}
                  name={fields.email.name}
                  defaultValue={fields.email.initialValue as string}
                  required={fields.email.required}
                  placeholder="Enter your email"
                  type="email"
                  className="mb-3"
                  aria-invalid={fields.email.errors ? true : undefined}
                  aria-describedby={
                    fields.email.errors ? fields.email.errorId : undefined
                  }
                />
                <Input
                  id={fields.password.id}
                  name={fields.password.name}
                  defaultValue={fields.password.initialValue as string}
                  required={fields.password.required}
                  aria-invalid={fields.password.errors ? true : undefined}
                  aria-describedby={
                    fields.password.errors ? fields.password.errorId : undefined
                  }
                  placeholder="Enter your password"
                  type="password"
                  className="mb-3"
                />
                <Button className="w-full" color="primary" type="submit">
                  Login
                </Button>
              </Form>
            </TabsContent>
            <TabsContent value="register" title="Register">
              <Form method="post" action="/resources/user/register">
                <Input
                  id={fields.email.id}
                  name={fields.email.name}
                  defaultValue={fields.email.initialValue as string}
                  required={fields.email.required}
                  placeholder="Enter your email"
                  type="email"
                  className="mb-3"
                  aria-invalid={fields.email.errors ? true : undefined}
                  aria-describedby={
                    fields.email.errors ? fields.email.errorId : undefined
                  }
                />
                <Input
                  id={fields.password.id}
                  name={fields.password.name}
                  defaultValue={fields.password.initialValue as string}
                  required={fields.password.required}
                  aria-invalid={fields.password.errors ? true : undefined}
                  aria-describedby={
                    fields.password.errors ? fields.password.errorId : undefined
                  }
                  placeholder="Enter your password"
                  type="password"
                  className="mb-3"
                />
                <Button className="w-full" color="primary" type="submit">
                  Register
                </Button>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
