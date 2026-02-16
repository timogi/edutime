import React, { useState } from 'react'
import { Card, Group, Button, Text, Stack, Table, Badge } from '@mantine/core'
import { IconPlus, IconPlayerPlay } from '@tabler/icons-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import classes from './TimeRecordingDemo.module.css'

// Mock data for demo - simplified
const mockRecords = [
  {
    id: '1',
    category: 'Unterricht',
    duration: 120,
    startTime: '08:00',
    endTime: '10:00',
  },
  {
    id: '2',
    category: 'Vorbereitung',
    duration: 90,
    startTime: '10:30',
    endTime: '12:00',
  },
]

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}:${String(mins).padStart(2, '0')}`
}

export function TimeRecordingDemo() {
  const [selectedDate] = useState(new Date())

  return (
    <div className={classes.deviceMockup}>
      <div className={classes.deviceFrame}>
        <div className={classes.deviceScreen}>
          <Card className={classes.demoCard} padding='xs' radius='md' withBorder>
            <Stack gap={0} className={classes.cardStack}>
              {/* Date Picker */}
              <Group justify='center' className={classes.datePicker}>
                <Text size='xs' fw={600}>
                  {format(selectedDate, 'd. MMM', { locale: de })}
                </Text>
              </Group>

              {/* Records Table - simplified */}
              <div className={classes.tableContainer}>
                <Table verticalSpacing={0} striped>
                  <Table.Tbody>
                    {mockRecords.map((record) => (
                      <Table.Tr key={record.id}>
                        <Table.Td style={{ padding: '4px 8px' }}>
                          <Badge
                            size='xs'
                            variant='light'
                            color={record.category === 'Unterricht' ? 'green' : 'violet'}
                            style={{ fontSize: '10px', padding: '2px 6px' }}
                          >
                            {record.category}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ padding: '4px 8px' }}>
                          <Text size='xs' c='dimmed' style={{ fontSize: '10px' }}>
                            {record.startTime}-{record.endTime}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ padding: '4px 8px', textAlign: 'right' }}>
                          <Text size='xs' fw={600} style={{ fontSize: '10px' }}>
                            {formatDuration(record.duration)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>

              {/* Total */}
              <Group justify='space-between' className={classes.total}>
                <Text size='xs' fw={600}>
                  Gesamt:
                </Text>
                <Text size='xs' fw={700} c='violet'>
                  {formatDuration(mockRecords.reduce((sum, r) => sum + r.duration, 0))}
                </Text>
              </Group>

              {/* Action Buttons - at the bottom */}
              <Group gap='xs' justify='space-between' className={classes.actionButtons}>
                <Button
                  size='xs'
                  variant='gradient'
                  gradient={{ from: 'red', to: 'violet', deg: 90 }}
                  leftSection={<IconPlayerPlay size={12} />}
                  className={classes.demoButton}
                >
                  Timer
                </Button>
                <Button
                  size='xs'
                  variant='filled'
                  color='violet'
                  leftSection={<IconPlus size={12} />}
                  className={classes.demoButton}
                >
                  Eintrag
                </Button>
              </Group>
            </Stack>
          </Card>
        </div>
      </div>
    </div>
  )
}
