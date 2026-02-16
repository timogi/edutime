import React, { useState } from 'react'
import { Text, Card, NumberInput, Stack, Group, Table, Badge, Button, Alert } from '@mantine/core'
import { useTranslations } from 'next-intl'
import classes from './PriceCalculator.module.css'
import {
  calculateOrgPrice,
  MIN_ORG_LICENSES,
  MAX_AUTO_PRICING_LICENSES,
} from '@/utils/payments/pricing'

export function PriceCalculator() {
  const t = useTranslations('PriceCalculator')
  const [licenseCount, setLicenseCount] = useState(MIN_ORG_LICENSES)

  const orgPrice = calculateOrgPrice(licenseCount)
  const total = orgPrice.totalChf
  const breakdown = orgPrice.breakdown.map((item) => ({
    tier: item.pricePerLicense > 0 ? `${item.tierLabel} ${t('licenses')}` : t('moreThan100'),
    count: item.count,
    price: item.pricePerLicense,
    subtotal: item.subtotal,
  }))

  return (
    <div>
      <Stack gap='lg' ta='center'>
        <Card withBorder radius='md' p='xl' className={classes.calculatorCard}>
          <Stack gap='lg'>
            <Group justify='center' align='flex-end' gap='md'>
              <div style={{ flex: 1, maxWidth: 200 }}>
                <Text size='sm' fw={500} mb='xs'>
                  {t('numberOfLicenses')}
                </Text>
                <NumberInput
                  value={licenseCount}
                  onChange={(value) =>
                    setLicenseCount(
                      typeof value === 'number'
                        ? Math.max(MIN_ORG_LICENSES, value)
                        : MIN_ORG_LICENSES,
                    )
                  }
                  min={MIN_ORG_LICENSES}
                  step={1}
                  size='md'
                />
              </div>
            </Group>

            {licenseCount < MIN_ORG_LICENSES && (
              <Alert color='yellow' variant='light'>
                {t('minimumLicenses')}
              </Alert>
            )}

            {licenseCount >= MIN_ORG_LICENSES && (
              <>
                <Table striped highlightOnHover withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t('tier')}</Table.Th>
                      <Table.Th ta='center'>{t('count')}</Table.Th>
                      <Table.Th ta='center'>{t('pricePerLicense')}</Table.Th>
                      <Table.Th ta='right'>{t('subtotal')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {breakdown.map((item, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>{item.tier}</Table.Td>
                        <Table.Td ta='center'>{item.count}</Table.Td>
                        <Table.Td ta='center'>
                          {item.price > 0 ? (
                            <>
                              {item.price} CHF
                              <Text size='xs' c='dimmed'>
                                {' '}
                                / {t('year')}
                              </Text>
                            </>
                          ) : (
                            <Text c='dimmed'>{t('onRequest')}</Text>
                          )}
                        </Table.Td>
                        <Table.Td ta='right'>
                          {item.subtotal > 0 ? (
                            <>
                              <strong>{item.subtotal} CHF</strong>
                              <Text size='xs' c='dimmed'>
                                {' '}
                                / {t('year')}
                              </Text>
                            </>
                          ) : (
                            <Text c='dimmed'>{t('onRequest')}</Text>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                  <Table.Tfoot>
                    <Table.Tr>
                      <Table.Td colSpan={3}>
                        <Text fw={700} size='lg'>
                          {t('total')}
                        </Text>
                      </Table.Td>
                      <Table.Td ta='right'>
                        {total > 0 ? (
                          <>
                            <Text fw={700} size='lg' c='violet'>
                              {total} CHF
                            </Text>
                            <Text size='xs' c='dimmed'>
                              {' '}
                              / {t('year')}
                            </Text>
                          </>
                        ) : (
                          <Text fw={700} size='lg' c='dimmed'>
                            {t('onRequest')}
                          </Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tfoot>
                </Table>

                {licenseCount > MAX_AUTO_PRICING_LICENSES && (
                  <Alert color='violet' variant='light'>
                    {t('contactForPricing')}
                  </Alert>
                )}

                <Group justify='center' mt='md'>
                  <Button component='a' href='/register' size='md' variant='filled'>
                    {t('registerNow')}
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Card>
      </Stack>
    </div>
  )
}
