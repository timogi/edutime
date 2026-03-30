import React, { useState, useMemo } from 'react'
import cx from 'clsx'
import {
  Table,
  Checkbox,
  Button,
  TextInput,
  Stack,
  Menu,
  Popover,
  Card,
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
  MultiSelect,
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
  IconFilter,
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery, useClipboard } from '@mantine/hooks'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOrganizationMembers,
  addOrganizationMember,
  updateMembership,
  releaseOrganizationMemberSeat,
  getOrganizationSeatCount,
} from '@/utils/supabase/organizations'
import Progress from './Progress'
import InviteModal from './InviteModal'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { showNotification } from '@mantine/notifications'
import { Organization } from '@/types/globals'
import classes from './TableSelection.module.css'

const MEMBER_STATUSES = ['active', 'invited', 'rejected', 'canceled'] as const

type MemberStatus = (typeof MEMBER_STATUSES)[number]

/** Default: hide canceled (revoked) rows; user can add statuses via filter. */
const DEFAULT_STATUS_FILTER: MemberStatus[] = ['active', 'invited', 'rejected']

interface TableSelectionProps {
  organizations: Organization[]
  currentUserEmail: string | null
  onMembersChanged: () => Promise<void>
  activePage: number
  setActivePage: (page: number) => void
  selectedOrgId: string | null
}

type SortField = 'email' | 'status' | 'created_at' | 'comment'
type SortDirection = 'asc' | 'desc' | null

interface SortState {
  field: SortField | null
  direction: SortDirection
}

const TableSelection = ({
  organizations,
  currentUserEmail,
  onMembersChanged,
  activePage,
  setActivePage,
  selectedOrgId,
}: TableSelectionProps) => {
  const router = useRouter()
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
  const [statusFilter, setStatusFilter] = useState<MemberStatus[]>(DEFAULT_STATUS_FILTER)
  const [statusFilterPopoverOpened, setStatusFilterPopoverOpened] = useState(false)

  const t = useTranslations('Index')
  const isSmallScreen = useMediaQuery('(max-width: 768px)')
  const isMediumScreen = useMediaQuery('(max-width: 1200px)')
  const queryClient = useQueryClient()

  // Get current organization
  const currentOrg = useMemo(
    () => organizations.find((org) => String(org.id) === selectedOrgId),
    [organizations, selectedOrgId],
  )

  React.useEffect(() => {
    setStatusFilter(DEFAULT_STATUS_FILTER)
  }, [currentOrg?.id])

  // React Query: Fetch members
  const {
    data: users = [],
    isLoading,
  } = useQuery({
    queryKey: ['organizationMembers', currentOrg?.id],
    queryFn: () => {
      if (!currentOrg?.id) return []
      return getOrganizationMembers(currentOrg.id)
    },
    enabled: !!currentOrg?.id,
  })

  const { data: orgSeatCount } = useQuery({
    queryKey: ['organizationSeatCount', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return null
      return getOrganizationSeatCount(currentOrg.id)
    },
    enabled: !!currentOrg?.id,
  })

  // React Query: Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: ({ email, comment }: { email: string; comment?: string }) => {
      if (!currentOrg?.id) throw new Error('No organization selected')
      return addOrganizationMember(currentOrg.id, email, comment)
    },
    onSuccess: (payload, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', currentOrg?.id] })
      onMembersChanged()
      setInviteEmail('')
      close()
      if (payload.emailSkippedSelf) {
        showNotification({
          title: t('invite-notification-self-title'),
          color: 'teal',
        })
      } else if (payload.emailSent === false) {
        showNotification({
          title: t('invite-notification-no-email-title'),
          message: t('invite-notification-no-email-message'),
          color: 'yellow',
        })
      } else {
        showNotification({
          title: t('invite-notification-sent-title'),
          message: t('invite-notification-sent-message', { email: variables.email }),
          color: 'teal',
        })
      }
    },
    onError: (err: Error) => {
      showNotification({
        title: t('invite-notification-error-title'),
        message: err.message || t('invite-notification-error-message'),
        color: 'red',
      })
    },
  })

  // React Query: Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) => {
      if (!currentOrg?.id) throw new Error('No organization selected')
      return releaseOrganizationMemberSeat(currentOrg.id, memberId)
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
      return Promise.all(memberIds.map((id) => releaseOrganizationMemberSeat(currentOrg.id, id)))
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
    mutationFn: (membershipId: number) => {
      if (!currentOrg?.id) throw new Error('No organization selected')
      const member = users.find((user) => user.id === membershipId)
      if (!member) throw new Error('Member not found')
      return addOrganizationMember(currentOrg.id, member.email, member.comment || undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', currentOrg?.id] })
    },
  })

  const itemsPerPage = 10
  const takenSeats = users.filter((user) => user.status === 'active' || user.status === 'invited').length
  const totalSeats = orgSeatCount ?? currentOrg?.seats ?? 0
  const normalizedCurrentUserEmail = (currentUserEmail || '').trim().toLowerCase()
  const hasOwnActiveLicense =
    normalizedCurrentUserEmail.length > 0 &&
    users.some(
      (user) => user.status === 'active' && user.email.trim().toLowerCase() === normalizedCurrentUserEmail,
    )

  const effectiveStatusFilter = useMemo(
    () => (statusFilter.length > 0 ? statusFilter : [...MEMBER_STATUSES]),
    [statusFilter],
  )

  const statusFilterOptions = useMemo(
    () => MEMBER_STATUSES.map((s) => ({ value: s, label: t(s) })),
    [t],
  )

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users]

    result = result.filter((user) => effectiveStatusFilter.includes(user.status))

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
  }, [users, searchEmail, sortState, effectiveStatusFilter])

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

  const filteredIds = useMemo(
    () => filteredAndSortedUsers.map((item) => item.id.toString()),
    [filteredAndSortedUsers],
  )

  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selection.includes(id))
  const someFilteredSelected = filteredIds.some((id) => selection.includes(id))

  const toggleAll = () => {
    setSelection((current) => {
      if (filteredIds.length === 0) return current
      if (filteredIds.every((id) => current.includes(id))) {
        return current.filter((id) => !filteredIds.includes(id))
      }
      return Array.from(new Set([...current, ...filteredIds]))
    })
  }

  const handleInvite = async (comment: string) => {
    if (takenSeats < totalSeats) {
      addMemberMutation.mutate({ email: inviteEmail, comment })
    }
  }

  const handleAssignSelfLicense = () => {
    if (!normalizedCurrentUserEmail) return
    setInviteEmail(normalizedCurrentUserEmail)
    open()
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

  const handleStatusFilterChange = (values: string[]) => {
    setStatusFilter(values as MemberStatus[])
    setActivePage(1)
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
    const csvData = filteredAndSortedUsers.map((user) => [
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
        <Table.Td style={{ verticalAlign: 'middle' }} className={classes.emailCell}>
          <Group gap='sm' wrap='nowrap'>
            <Text size='sm' className={classes.emailText}>
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
        <Table.Td style={{ verticalAlign: 'middle' }} className={classes.commentCell}>
          {item.comment ? (
            <Tooltip label={item.comment} multiline w={300} withArrow>
              <Text size='sm' lineClamp={3} className={classes.commentText}>
                {item.comment}
              </Text>
            </Tooltip>
          ) : (
            <Text size='sm' c='dimmed'>
              -
            </Text>
          )}
        </Table.Td>
        <Table.Td style={{ verticalAlign: 'middle' }} className={classes.actionsCell}>
          <Menu>
            <Menu.Target>
              <Button variant='subtle' size='xs'>
                <IconDots size='1rem' />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {(item.status === 'invited' || item.status === 'rejected' || item.status === 'canceled') && (
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
    <Stack gap='lg' className={classes.wrapper} w='100%' maw='100%'>
      <Stack
        align='stretch'
        gap='lg'
        w='100%'
        style={{ flexDirection: isMediumScreen ? 'column' : 'row' }}
      >
        <Stack
          w={isSmallScreen ? '100%' : 300}
          maw={isSmallScreen ? '100%' : 300}
          mx={isMediumScreen ? 'auto' : undefined}
          flex='none'
        >
          <Card p={0} radius='md' withBorder>
            <Stack gap={0}>
              <Progress takenSeats={takenSeats} totalSeats={totalSeats} />
              <Button
                radius={0}
                variant='light'
                onClick={() => {
                  if (!currentOrg?.id) return
                  void router.push(`/app/organization-management?organizationId=${currentOrg.id}`)
                }}
              >
                {t('org-management-seat-plan-title')}
              </Button>
              <Button
                onClick={open}
                radius={0}
                disabled={takenSeats >= totalSeats}
                leftSection={<IconPlus />}
              >
                {t('Add Member')}
              </Button>
              {!hasOwnActiveLicense && normalizedCurrentUserEmail ? (
                <Button
                  onClick={handleAssignSelfLicense}
                  radius={0}
                  variant='subtle'
                  disabled={takenSeats >= totalSeats}
                >
                  {t('Assign License To Myself')}
                </Button>
              ) : null}
            </Stack>
          </Card>
        </Stack>

        <Card radius='md' withBorder style={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Stack gap='sm'>
            <div className={classes.toolbar}>
              <div className={classes.toolbarTop}>
                <div className={classes.toolbarSearch}>
                  <TextInput
                    placeholder={t('Search by email')}
                    value={searchEmail}
                    onChange={handleSearch}
                    leftSection={<IconSearch size='0.9rem' stroke={1.5} />}
                    size='md'
                  />
                </div>
                <Popover
                  opened={statusFilterPopoverOpened}
                  onChange={setStatusFilterPopoverOpened}
                  position='bottom-end'
                  withArrow
                  shadow='md'
                  withinPortal
                >
                  <Popover.Target>
                    <ActionIcon
                      variant='default'
                      size='input-md'
                      onClick={() => setStatusFilterPopoverOpened((open) => !open)}
                      className={classes.statusFilterIconButton}
                      aria-label={t('members-status-filter-label')}
                      title={t('members-status-filter-label')}
                    >
                      <IconFilter size='1rem' />
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <MultiSelect
                      label={t('members-status-filter-label')}
                      placeholder={t('members-status-filter-placeholder')}
                      data={statusFilterOptions}
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      size='md'
                      clearable
                      searchable
                      w={isSmallScreen ? 260 : 320}
                      styles={{
                        dropdown: { backgroundColor: 'var(--mantine-color-body)' },
                        option: { backgroundColor: 'var(--mantine-color-body)' },
                      }}
                    />
                  </Popover.Dropdown>
                </Popover>
              </div>
              <Group gap='xs' wrap='nowrap' className={classes.toolbarActions}>
                {!isSmallScreen && (
                  <Button
                    variant='outline'
                    leftSection={<IconDownload size='0.875rem' />}
                    onClick={exportToCsv}
                    size='sm'
                  >
                    {t('export-csv')}
                  </Button>
                )}
              </Group>
            </div>
            {selection.length > 0 && !isSmallScreen && (
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
            <Table.ScrollContainer minWidth={920}>
              {isLoading ? (
                <Center p='xl'>
                  <Loader />
                </Center>
              ) : (
                <Table
                  verticalSpacing='sm'
                  className={classes.table}
                  highlightOnHover
                  striped
                  style={{ width: '100%', tableLayout: 'fixed' }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={40}>
                        <Checkbox
                          onChange={toggleAll}
                          checked={allFilteredSelected}
                          indeterminate={someFilteredSelected && !allFilteredSelected}
                        />
                      </Table.Th>
                      <Table.Th className={classes.emailHeader}>
                        <Group
                          gap='xs'
                          wrap='nowrap'
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
                          wrap='nowrap'
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
                          wrap='nowrap'
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('created_at')}
                        >
                          <Text size='sm' fw={500}>
                            {t('created_at')}
                          </Text>
                          {getSortIcon('created_at')}
                        </Group>
                      </Table.Th>
                      <Table.Th className={classes.commentHeader}>
                        <Group
                          gap='xs'
                          wrap='nowrap'
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('comment')}
                        >
                          <Text size='sm' fw={500}>
                            {t('comment')}
                          </Text>
                          {getSortIcon('comment')}
                        </Group>
                      </Table.Th>
                      <Table.Th className={classes.actionsHeader}>{t('Actions')}</Table.Th>
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
            </Table.ScrollContainer>
            {totalPages > 1 && (
              <Group mt='md' justify='center'>
                <Pagination value={activePage} onChange={setActivePage} total={totalPages} />
              </Group>
            )}
            {isSmallScreen && (
              <Group className={classes.mobileBottomActions} justify='space-between' wrap='nowrap'>
                {selection.length > 0 ? (
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
                ) : (
                  <div />
                )}
                <Button
                  variant='outline'
                  leftSection={<IconDownload size='0.875rem' />}
                  onClick={exportToCsv}
                  size='sm'
                >
                  {t('export-csv')}
                </Button>
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
        isInviting={addMemberMutation.isPending}
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
              {t('cancel')}
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
