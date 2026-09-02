export const CHART_THEME = {
  primary: '#216354',
  border: '#dfe4e2',
  text: '#6d7773',
  textStrong: '#34403b',
} as const

export function createTemporalAreaFill() {
  return {
    type: 'gradient' as const,
    gradient: {
      type: 'vertical' as const,
      shadeIntensity: 0,
      opacityFrom: 0.26,
      opacityTo: 0.02,
      stops: [0, 72, 100],
    },
  }
}
