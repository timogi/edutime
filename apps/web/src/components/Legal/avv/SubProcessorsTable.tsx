import { ScrollArea, Table } from '@mantine/core'
import type { SubProcessorRow } from './subProcessors'
import classes from '../Legal.module.css'

interface SubProcessorsTableProps {
  rows: SubProcessorRow[]
  headers: {
    company: string
    address: string
    processingLocation: string
    serviceType: string
  }
}

export function SubProcessorsTable({ rows, headers }: SubProcessorsTableProps) {
  return (
    <ScrollArea type='auto' className={classes.legalTableScroll}>
      <Table
        className={classes.legalTable}
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{headers.company}</Table.Th>
            <Table.Th>{headers.address}</Table.Th>
            <Table.Th>{headers.processingLocation}</Table.Th>
            <Table.Th>{headers.serviceType}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.company}>
              <Table.Td>{row.company}</Table.Td>
              <Table.Td>{row.address}</Table.Td>
              <Table.Td>{row.processingLocation}</Table.Td>
              <Table.Td>{row.serviceType}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  )
}
