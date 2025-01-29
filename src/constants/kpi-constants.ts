export const periodsByFrequency = {
  monthly: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ] as const,
  quarterly: ['Q1', 'Q2', 'Q3', 'Q4'] as const,
  semiannual: ['S1', 'S2'] as const,
  yearly: ['Yearly'] as const,
  weekly: Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`),
} as const

// type for months
export type Month = (typeof periodsByFrequency)['monthly'][number]
