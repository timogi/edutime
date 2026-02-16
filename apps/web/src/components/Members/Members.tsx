import React, { useState } from 'react'
import TableSelection from './TableSelection'
import { Organization, UserData } from '@/types/globals'

interface MembersProps {
  organizations: Organization[]
  userData: UserData
  onMembersChanged: () => Promise<void>
}

export const Members = ({ organizations, userData, onMembersChanged }: MembersProps) => {
  const [activePage, setActivePage] = useState(1)
  const [selectedOrg, setSelectedOrg] = useState<string | null>(organizations[0]?.name || null)

  // Update selectedOrg if the current one is no longer available
  const [prevOrgs, setPrevOrgs] = useState(organizations)
  if (prevOrgs !== organizations) {
    setPrevOrgs(organizations)
    if (selectedOrg && !organizations.find((org) => org.name === selectedOrg)) {
      setSelectedOrg(organizations[0]?.name || null)
    } else if (!selectedOrg && organizations.length > 0) {
      setSelectedOrg(organizations[0].name)
    }
  }

  return (
    <TableSelection
      organizations={organizations}
      onMembersChanged={onMembersChanged}
      activePage={activePage}
      setActivePage={setActivePage}
      selectedOrg={selectedOrg}
      setSelectedOrg={setSelectedOrg}
    />
  )
}
