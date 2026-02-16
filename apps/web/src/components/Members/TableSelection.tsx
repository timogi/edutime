import React, { useState, useMemo } from 'react'
import cx from 'clsx'
import {
  Table,
  Checkbox,
  ScrollArea,
  Button,
  TextInput,
  Stack,
  Menu,
  Card,
  Select,
  Pagination,
  Group,
  Textarea,
  Modal,
  Text,
  ActionIcon,
  Loader,
  Center,
  Badge,
  Tooltip,
} from '@mantine/core'
import {
  IconDots,
  IconRefresh,
  IconTrash,
  IconSearch,
  IconPlus,
  IconMessage,
  IconCopy,
  IconCheck,
  IconDownload,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery, useClipboard } from '@mantine/hooks'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOrganizationMembers,
  OrganizationMember as User,
  removeOrganizationMember,
  updateMembershipById,
  addOrganizationMember,
  updateMembership,
} from '@/utils/supabase/organizations'
import Progress from './Progress'
import InviteModal from './InviteModal'
import { useTranslations } from 'next-intl'
import { Organization } from '@/types/globals'
import classes from './TableSelection.module.css'

interface TableSelectionProps {
  organizations: Organization[]
  onMembersChanged: () => Promise<void>
  activePage: number
  setActivePage: (page: number) => void
  selectedOrg: string | null
  setSelectedOrg: (org: string | null) => void
}

type SortField = 'email' | 'status' | 'created_at' | 'comment'
type SortDirection = 'asc' | 'desc' | null

interface SortState {
  field: SortField | null
  direction: SortDirection
}

const TableSelection = ({
  organizations,
  onMembersChanged,
  activePage,
  setActivePage,
  selectedOrg,
  setSelectedOrg,
}: TableSelectionProps) => {
  const [selection, setSelection] = useState<string[]>([])
  const [searchEmail, setSearchEmail] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [sortState, setSortState] = useState<SortState>({ field: null, direction: null })
  const [opened, { open, close }] = useDisclosure(false)
  const [commentModalOpened, setCommentModalOpened] = useState(false)
  const [deleteConfirmModalOpened, setDeleteConfirmModalOpened] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [selectedMemberEmail, setSelectedMemberEmail] = useState<string>('')
  const [comment, setComment] = useState('')
  const clipboard = useClipboard()
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const t = useTranslations('Index')
  const isSmallScreen = useMediaQuery('(max-width: 768px)')
  const queryClient = useQueryClient()

  // Get current organization
  const currentOrg = useMemo(
    () => organizations.find((org) => org.name === selectedOrg),
    [organizations, selectedOrg],
  )

  // React Query: Fetch members
  const {
    data: users = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['organizationMembers', currentOrg?.id],
    queryFn: () => {
      if (!currentOrg?.id) return []
      return getOrganizationMembers(currentOrg.id)
    },
    enabled: !!currentOrg?.id,
  })

  // React Query: Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: ({ email, comment }: { email: string; comment?: string }) => {
      if (!currentOrg?.id) throw new Error('No organization selected')
      return addOrganizationMember(currentOrg.id, email, comment)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', currentOrg?.id] })
      onMembersChanged()
      setInviteEmail('')
      close()
    },
  })

  // React Query: Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) => {
      if (!currentOrg?.id) throw new Error('No organization selected')
      return removeOrganizationMember(currentOrg.id, memberId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', currentOrg?.id] })
      onMembersChanged()
      setSelection([])
    },
  })

  // React Query: Remove multiple members mutation
  const removeMultipleMembersMutation = useMutation({
    mutationFn: (memberIds: number[]) => {
      if (!currentOrg?.id) throw new Error('No organization selected')
      return Promise.all(memberIds.map((id) => removeOrganizationMember(currentOrg.id, id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', currentOrg?.id] })
      onMembersChanged()
      setSelection([])
    },
  })

  // React Query: Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({
      email,
      status,
      comment,
    }: {
      email: string
      status: string
      comment: string
    }) => {
      if (!currentOrg?.id) throw new Error('No organization selected')
      return updateMembership(currentOrg.id, email, status as any, comment)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', currentOrg?.id] })
      onMembersChanged()
      setCommentModalOpened(false)
      setComment('')
      setSelectedMemberId(null)
      setSelectedMemberEmail('')
    },
  })

  // React Query: Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: (membershipId: number) => updateMembershipById(membershipId, 'invited'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', currentOrg?.id] })
    },
  })

  const itemsPerPage = 10
  const takenSeats = users.length
  const totalSeats = currentOrg?.seats || 0

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users]

    // Filter by search
    if (searchEmail) {
      const searchLower = searchEmail.toLowerCase()
      result = result.filter((user) => user.email.toLowerCase().includes(searchLower))
    }

    // Sort
    if (sortState.field && sortState.direction) {
      result.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortState.field) {
          case 'email':
            aValue = a.email.toLowerCase()
            bValue = b.email.toLowerCase()
            break
          case 'status':
            aValue = a.status
            bValue = b.status
            break
          case 'created_at':
            aValue = a.created_at.getTime()
            bValue = b.created_at.getTime()
            break
          case 'comment':
            aValue = (a.comment || '').toLowerCase()
            bValue = (b.comment || '').toLowerCase()
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [users, searchEmail, sortState])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = filteredAndSortedUsers.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  )

  // Adjust pagination when data changes
  React.useEffect(() => {
    if (activePage > totalPages && totalPages > 0) {
      setActivePage(totalPages)
    } else if (filteredAndSortedUsers.length === 0 && activePage > 1) {
      setActivePage(1)
    }
  }, [filteredAndSortedUsers.length, totalPages, activePage, setActivePage])

  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortState((current) => {
      if (current.field === field) {
        // Cycle through: asc -> desc -> null
        if (current.direction === 'asc') {
          return { field, direction: 'desc' }
        } else if (current.direction === 'desc') {
          return { field: null, direction: null }
        }
      }
      return { field, direction: 'asc' }
    })
  }

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortState.field !== field) {
      return <IconArrowsSort size='0.875rem' />
    }
    return sortState.direction === 'asc' ? (
      <IconArrowUp size='0.875rem' />
    ) : (
      <IconArrowDown size='0.875rem' />
    )
  }

  const toggleRow = (id: string) =>
    setSelection((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )

  const toggleAll = () =>
    setSelection((current) =>
      current.length === users.length ? [] : users.map((item) => item.id.toString()),
    )

  const handleInvite = async (comment: string) => {
    if (takenSeats < totalSeats) {
      addMemberMutation.mutate({ email: inviteEmail, comment })
    }
  }

  const handleRemove = async () => {
    if (selection.length > 0) {
      setDeleteConfirmModalOpened(true)
    }
  }

  const confirmRemove = () => {
    if (selection.length > 0) {
      removeMultipleMembersMutation.mutate(selection.map((id) => Number(id)))
      setDeleteConfirmModalOpened(false)
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchEmail(event.currentTarget.value)
    setActivePage(1) // Reset to first page on search
  }

  const handleResendInvitation = (id: number) => {
    resendInvitationMutation.mutate(id)
  }

  const handleDelete = async (id: number) => {
    removeMemberMutation.mutate(id)
  }

  const handleAddComment = (id: number) => {
    const member = users.find((u) => u.id === id)
    if (member) {
      setSelectedMemberId(id)
      setSelectedMemberEmail(member.email)
      setComment(member.comment || '')
      setCommentModalOpened(true)
    }
  }

  const handleSaveComment = async () => {
    if (selectedMemberId) {
      const member = users.find((u) => u.id === selectedMemberId)
      if (member) {
        updateCommentMutation.mutate({
          email: member.email,
          status: member.status,
          comment,
        })
      }
    }
  }

  const handleCopy = (id: number, email: string) => {
    clipboard.copy(email)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const exportToCsv = () => {
    const escapeCsvValue = (value: string): string => {
      if (
        value.includes(',') ||
        value.includes('"') ||
        value.includes('\n') ||
        value.includes('\r')
      ) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    const headers = ['Email', 'Status', 'Created At', 'Comment']
    const csvData = users.map((user) => [
      escapeCsvValue(user.email),
      escapeCsvValue(user.status),
      escapeCsvValue(user.created_at.toLocaleDateString('de-DE')),
      escapeCsvValue(user.comment || ''),
    ])

    const csvContent = [
      headers.map(escapeCsvValue).join(','),
      ...csvData.map((row) => row.join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `members_${selectedOrg}_${new Date().toISOString()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    if (link.parentNode === document.body) {
      document.body.removeChild(link)
    }
    URL.revokeObjectURL(url)
  }

  const organizationOptions = organizations.map((org) => ({
    value: org.name,
    label: org.name,
  }))

  const rows = paginatedUsers.map((item) => {
    const selected = selection.includes(item.id.toString())
    return (
      <Table.Tr key={item.id} className={cx({ [classes.rowSelected]: selected })}>
        <Table.Td style={{ verticalAlign: 'middle' }}>
          <Checkbox
            checked={selection.includes(item.id.toString())}
            onChange={() => toggleRow(item.id.toString())}
          />
        </Table.Td>
        <Table.Td style={{ verticalAlign: 'middle' }}>
          <Group gap='sm' wrap='nowrap'>
            <Text size='sm' style={{ wordBreak: 'break-word' }}>
              {item.email}
            </Text>
            <ActionIcon
              size='sm'
              variant='transparent'
              color='gray'
              onClick={() => handleCopy(item.id, item.email)}
            >
              {copiedId === item.id ? <IconCheck size='0.875rem' /> : <IconCopy size='0.875rem' />}
            </ActionIcon>
          </Group>
        </Table.Td>
        <Table.Td style={{ verticalAlign: 'middle' }}>
          <Badge variant='light' size='sm'>
            {t(item.status)}
          </Badge>
        </Table.Td>
        <Table.Td style={{ verticalAlign: 'middle' }}>
          <Text size='sm'>
            {item.created_at.toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </Text>
        </Table.Td>
        <Table.Td style={{ verticalAlign: 'middle', maxWidth: '200px', minWidth: 0 }}>
          {item.comment ? (
            <Tooltip label={item.comment} multiline w={300} withArrow>
              <Text
                size='sm'
                lineClamp={1}
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {item.comment}
              </Text>
            </Tooltip>
          ) : (
            <Text size='sm' c='dimmed'>
              -
            </Text>
          )}
        </Table.Td>
        <Table.Td style={{ verticalAlign: 'middle' }}>
          <Menu>
            <Menu.Target>
              <Button variant='subtle' size='xs'>
                <IconDots size='1rem' />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {(item.status === 'invited' || item.status === 'rejected') && (
                <Menu.Item
                  leftSection={<IconRefresh size='0.875rem' />}
                  onClick={() => handleResendInvitation(item.id)}
                  disabled={resendInvitationMutation.isPending}
                >
                  {t('Resend Invitation')}
                </Menu.Item>
              )}
              <Menu.Item
                leftSection={<IconMessage size='0.875rem' />}
                onClick={() => handleAddComment(item.id)}
              >
                {t('edit-comment')}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size='0.875rem' />}
                c='red'
                onClick={() => handleDelete(item.id)}
                disabled={removeMemberMutation.isPending}
              >
                {t('Delete')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    )
  })

  return (
    <Stack p='lg' gap='lg' className={classes.wrapper}>
      <Stack
        align='flex-start'
        gap='lg'
        style={{ flexDirection: isSmallScreen ? 'column' : 'row' }}
      >
        <Stack style={{ width: isSmallScreen ? '100%' : '300px' }}>
          <Select
            data={organizationOptions}
            placeholder={t('Select organization')}
            value={selectedOrg}
            onChange={setSelectedOrg}
            size='md'
            searchable
            styles={{
              option: {
                backgroundColor: 'var(--mantine-color-body)',
              },
              dropdown: {
                backgroundColor: 'var(--mantine-color-body)',
              },
            }}
          />
          <Card p={0} radius='md' withBorder>
            <Stack gap={0}>
              <Progress takenSeats={takenSeats} totalSeats={totalSeats} />
              <Button radius={0} variant='light' component='a' href={'mailto:info@edutime.ch'}>
                {t('Order More Licenses')}
              </Button>
              <Button
                onClick={open}
                radius={0}
                disabled={takenSeats >= totalSeats}
                leftSection={<IconPlus />}
              >
                {t('Add Member')}
              </Button>
            </Stack>
          </Card>
        </Stack>

        <Card
          radius='md'
          withBorder
          style={{ flexGrow: 1, width: isSmallScreen ? '100%' : 'auto' }}
        >
          <Stack gap='sm'>
            <Group justify='apart' wrap='wrap' gap='sm'>
              <TextInput
                placeholder={t('Search by email')}
                value={searchEmail}
                onChange={handleSearch}
                leftSection={<IconSearch size='0.9rem' stroke={1.5} />}
                size='md'
                style={{ flexGrow: 1, minWidth: isSmallScreen ? '100%' : '200px' }}
              />
              <Group gap='xs' wrap='nowrap'>
                <Button
                  variant='subtle'
                  size='sm'
                  onClick={() => refetch()}
                  leftSection={<IconRefresh size='0.875rem' />}
                >
                  {!isSmallScreen && t('Refresh')}
                </Button>
                <Button
                  variant='outline'
                  leftSection={<IconDownload size='0.875rem' />}
                  onClick={exportToCsv}
                  size='sm'
                >
                  {!isSmallScreen && t('export-csv')}
                </Button>
              </Group>
            </Group>
            {selection.length > 0 && (
              <Group gap='xs'>
                <Button
                  variant='outline'
                  color='red'
                  leftSection={<IconTrash size='0.875rem' />}
                  onClick={handleRemove}
                  disabled={removeMultipleMembersMutation.isPending}
                  size='sm'
                >
                  {t('Remove Selected')} ({selection.length})
                </Button>
              </Group>
            )}
            <ScrollArea type='auto' offsetScrollbars>
              {isLoading ? (
                <Center p='xl'>
                  <Loader />
                </Center>
              ) : (
                <Table verticalSpacing='sm' className={classes.table} highlightOnHover striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={40}>
                        <Checkbox
                          onChange={toggleAll}
                          checked={selection.length === users.length && users.length > 0}
                          indeterminate={selection.length > 0 && selection.length !== users.length}
                        />
                      </Table.Th>
                      <Table.Th>
                        <Group
                          gap='xs'
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('email')}
                        >
                          <Text size='sm' fw={500}>
                            {t('email')}
                          </Text>
                          {getSortIcon('email')}
                        </Group>
                      </Table.Th>
                      <Table.Th>
                        <Group
                          gap='xs'
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('status')}
                        >
                          <Text size='sm' fw={500}>
                            {t('status')}
                          </Text>
                          {getSortIcon('status')}
                        </Group>
                      </Table.Th>
                      <Table.Th>
                        <Group
                          gap='xs'
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('created_at')}
                        >
                          <Text size='sm' fw={500}>
                            {t('created_at')}
                          </Text>
                          {getSortIcon('created_at')}
                        </Group>
                      </Table.Th>
                      <Table.Th style={{ maxWidth: '200px', minWidth: 0 }}>
                        <Group
                          gap='xs'
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('comment')}
                        >
                          <Text size='sm' fw={500}>
                            {t('comment')}
                          </Text>
                          {getSortIcon('comment')}
                        </Group>
                      </Table.Th>
                      <Table.Th>{t('Actions')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {rows.length > 0 ? (
                      rows
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Center p='xl'>
                            <Text c='dimmed'>{t('No data available')}</Text>
                          </Center>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              )}
            </ScrollArea>
            {totalPages > 1 && (
              <Group mt='md' justify='center'>
                <Pagination value={activePage} onChange={setActivePage} total={totalPages} />
              </Group>
            )}
          </Stack>
        </Card>
      </Stack>

      <InviteModal
        opened={opened}
        close={close}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        handleInvite={handleInvite}
        users={users}
      />

      <Modal
        opened={commentModalOpened}
        onClose={() => setCommentModalOpened(false)}
        title={t('edit-comment')}
      >
        <Stack>
          <Text size='sm' c='dimmed'>
            {selectedMemberEmail}
          </Text>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            placeholder={t('comment-placeholder')}
            autosize
            minRows={3}
          />
          <Button
            onClick={handleSaveComment}
            disabled={updateCommentMutation.isPending}
            loading={updateCommentMutation.isPending}
          >
            {t('save')}
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={deleteConfirmModalOpened}
        onClose={() => setDeleteConfirmModalOpened(false)}
        title={t('Confirm Removal')}
        centered
      >
        <Stack>
          <Text size='sm'>
            {selection.length === 1
              ? t('Are you sure you want to remove member')
              : t('Are you sure you want to remove members', { count: selection.length })}
          </Text>
          <Text size='sm' c='dimmed'>
            {t('This action cannot be undone')}.
          </Text>
          <Group justify='flex-end' mt='md'>
            <Button variant='subtle' onClick={() => setDeleteConfirmModalOpened(false)}>
              {t('Cancel')}
            </Button>
            <Button
              color='red'
              onClick={confirmRemove}
              disabled={removeMultipleMembersMutation.isPending}
              loading={removeMultipleMembersMutation.isPending}
              leftSection={<IconTrash size='0.875rem' />}
            >
              {t('Remove')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}

export default TableSelection
