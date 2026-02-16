import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { upperFirst, useToggle } from '@mantine/hooks'

export function AuthenticationForm(props: PaperProps) {
  const [type, toggle] = useToggle(['login', 'register'])
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  })

  return (
    <Paper
      radius='md'
      p='lg'
      withBorder
      style={{
        backgroundColor: 'var(--mantine-color-body)',
        borderColor: 'var(--mantine-color-border)',
      }}
      {...props}
    >
      <Text size='lg' fw={500}>
        Welcome to Mantine, {type} with
      </Text>

      <Group grow mb='md' mt='md'>
        <Button radius='xl' variant='outline'>
          Google
        </Button>
        <Button radius='xl' variant='outline'>
          Twitter
        </Button>
      </Group>

      <Divider label='Or continue with email' labelPosition='center' my='lg' />

      <form onSubmit={form.onSubmit(() => {})}>
        <Stack>
          {type === 'register' && (
            <TextInput
              label='Name'
              placeholder='Your name'
              value={form.values.name}
              onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
              radius='md'
              styles={{
                input: {
                  backgroundColor: 'var(--mantine-color-body)',
                  borderColor: 'var(--mantine-color-border)',
                },
              }}
            />
          )}

          <TextInput
            required
            label='Email'
            placeholder='hello@mantine.dev'
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email && 'Invalid email'}
            radius='md'
            styles={{
              input: {
                backgroundColor: 'var(--mantine-color-body)',
                borderColor: 'var(--mantine-color-border)',
              },
              error: {
                color: 'var(--mantine-color-error)',
              },
            }}
          />

          <PasswordInput
            required
            label='Password'
            placeholder='Your password'
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password && 'Password should include at least 6 characters'}
            radius='md'
            styles={{
              input: {
                backgroundColor: 'var(--mantine-color-body)',
                borderColor: 'var(--mantine-color-border)',
              },
              error: {
                color: 'var(--mantine-color-error)',
              },
            }}
          />

          {type === 'register' && (
            <Checkbox
              label='I accept terms and conditions'
              checked={form.values.terms}
              onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
              styles={{
                input: {
                  backgroundColor: 'var(--mantine-color-body)',
                  borderColor: 'var(--mantine-color-border)',
                },
              }}
            />
          )}
        </Stack>

        <Group justify='space-between' mt='xl'>
          <Anchor component='button' type='button' c='dimmed' onClick={() => toggle()} size='xs'>
            {type === 'register'
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Button type='submit' radius='xl'>
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  )
}
