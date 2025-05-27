'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { frequencyMapping } from '@/constants/global-constants'
import { periodsByFrequency } from '@/constants/kpi-constants'
import { toast } from '@/hooks/use-toast'
import { saveKPIActualTarget } from '@/lib/actions/kpiActions'
import { cn } from '@/lib/utils'
import { kpiTargetSchema } from '@/schema/kpi-target.schema'
import { useGlobalStore } from '@/stores/global-store'
import { IKpiActualTargetResponse, IKpiTargetManipulator } from '@/types/kpi'
import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'

interface IKpiActualComponentProps {
  data: IKpiActualTargetResponse
}

const KpiActualComponent: FC<IKpiActualComponentProps> = ({ data }) => {
  const { hasPermission } = useGlobalStore((store) => store)

  const { id, code, name, frequency, unit, KPIActual } = data
  const currentYear = new Date().getFullYear()

  const frequencyKey = frequencyMapping[frequency]
  const periods = periodsByFrequency[frequencyKey]

  const { values, dirty, setFieldValue, handleSubmit, setValues, handleBlur } =
    useFormik<IKpiTargetManipulator[]>({
      initialValues:
        KPIActual?.map((target) => ({
          kpiId: id,
          year: target.year || new Date().getFullYear(),
          period: target.period,
          targetValue: target.targetValue,
        })) || [],
      enableReinitialize: true,
      validationSchema: toFormikValidationSchema(kpiTargetSchema),
      onSubmit: async (values) => {
        mutate(values)
      },
    })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: IKpiTargetManipulator[]) =>
      await saveKPIActualTarget(values),
    onSuccess: () => {
      toast({
        variant: 'success',
        title: 'Success',
        description: `Kpi Targets successfully saved`,
      })
    },
    onError: (error: AxiosErrorType) => {
      toast({
        variant: 'destructive',
        title: 'Resend Failed',
        description: error?.message,
      })
    },
  })

  const handleAddYear = () => {
    const existingYears = values.map((target) => target.year)
    const nextYear = existingYears.length
      ? Math.max(...existingYears) + 1
      : currentYear

    const newYearTargets = periods.map((period) => ({
      kpiId: id,
      year: nextYear,
      period,
      targetValue: 0,
    }))

    setValues([...values, ...newYearTargets])
  }

  const handleAddPreviousYear = () => {
    const existingYears = values.map((target) => target.year)
    const previousYear = existingYears.length
      ? Math.min(...existingYears) - 1
      : currentYear - 1

    const newPreviousYearTargets = periods.map((period) => ({
      kpiId: id,
      year: previousYear,
      period,
      targetValue: 0,
    }))

    setValues([...newPreviousYearTargets, ...values])
  }

  const handleInputChange = (
    year: number,
    period: string,
    value: number,
  ): void => {
    const index = values.findIndex(
      (target) => target.year === year && target.period === period,
    )

    if (index >= 0) {
      setFieldValue(`[${index}].targetValue`, value)
    }
  }

  const uniqueYears = Array.from(
    new Set(values.map((target) => target.year)),
  ).sort((a, b) => a - b) // Sort years in ascending order

  return (
    <div className="w-full">
      <div className="flex items-center justify-start gap-7">
        <div className="flex items-end justify-center gap-2">
          <h1 className="text-xl font-semibold text-secondary">Kpi Code:</h1>
          <p className="font-medium text-black">{code}</p>
        </div>
        <div className="flex items-end justify-center gap-2">
          <h1 className="text-xl font-semibold text-secondary">Kpi Name:</h1>
          <p className="font-medium text-black">{name}</p>
        </div>
        <div className="flex items-end justify-center gap-2">
          <h1 className="text-xl font-semibold text-secondary">Unit:</h1>
          <p className="font-medium capitalize text-black">
            {unit?.toLowerCase()}
          </p>
        </div>
        <div className="flex items-end justify-center gap-2">
          <h1 className="text-xl font-semibold text-secondary">Frequency:</h1>
          <p className="font-medium capitalize text-black">{frequencyKey}</p>
        </div>
      </div>
      {hasPermission && (
        <div className="flex w-full items-center justify-end gap-5">
          <Button
            variant={'secondary'}
            type="button"
            className="w-40"
            onClick={handleAddPreviousYear}
          >
            Add previous Actual
          </Button>{' '}
          <Button
            variant={'secondary'}
            type="button"
            className="w-40"
            onClick={handleAddYear}
          >
            Add Actual
          </Button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-14',
          hasPermission ? 'mt-2' : 'mt-10',
        )}
      >
        {uniqueYears.length > 0 ? (
          uniqueYears.map((year) => (
            <div
              key={year}
              className="flex w-full flex-col items-start justify-center gap-5"
            >
              <h3
                className={cn(
                  'text-2xl font-semibold text-secondary',
                  currentYear === year && 'text-primary',
                )}
              >
                <span className="font-bold">Year:</span> {year}
                {currentYear === year && ' (Current Year)'}
              </h3>
              <div className="flex flex-wrap gap-2.5 ">
                {periodsByFrequency[frequencyKey].map((period) => (
                  <div
                    key={period}
                    className="flex flex-col items-start justify-center gap-2"
                  >
                    <Label>{period}</Label>
                    <Input
                      id={`${year}-${period}`}
                      type="number"
                      min={0}
                      step="any"
                      placeholder="Target"
                      className="max-w-28"
                      disabled={isPending || !hasPermission}
                      value={
                        values.find(
                          (target) =>
                            target.year === year && target.period === period,
                        )?.targetValue || 0
                      }
                      onChange={(e) => {
                        const numericValue = parseFloat(e.target.value)
                        handleInputChange(
                          year,
                          period,
                          isNaN(numericValue) ? 0 : numericValue,
                        )
                      }}
                      onBlur={handleBlur}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="mt-5 text-center text-xl font-semibold text-secondary">
            Start adding Actuals for your kpi <br />
            by clicking the add actual button.
          </p>
        )}

        <div className="flex w-full items-center justify-center gap-2">
          {uniqueYears.length > 0 && hasPermission && (
            <Button
              type="submit"
              className="w-40"
              disabled={isPending || !dirty}
            >
              Save Actuals
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default KpiActualComponent
