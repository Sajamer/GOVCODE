'use client'

import EmptyDataComponent from '@/components/shared/EmptyDataComponent'
import LabeledInput from '@/components/shared/inputs/LabeledInput'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { getUserById, updateProfile } from '@/lib/actions/userActions'
import { useUploadThing } from '@/lib/uploadthing'
import { IMyProfileManipulator, myProfileSchema } from '@/schema/user.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { ListChecks, Loader2, Pencil, PencilIcon } from 'lucide-react'
import Image from 'next/image'
import { FC, useRef, useState } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import TasksCard from './TasksCard'

interface IProfileCardProps {
  userId: string
}

const ProfileCard: FC<IProfileCardProps> = ({ userId }) => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [isEdit, setIsEdit] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const { data } = useQuery({
    queryKey: ['my-profile', userId],
    queryFn: async () => await getUserById(userId),
    staleTime: 1000 * 60 * 5,
  })

  const { startUpload } = useUploadThing('imageUploader', {
    onClientUploadComplete: ([data]) => {
      const imageUrl = data.url
      setFieldValue('photo', imageUrl)
      setIsUploading(false)
    },
    onUploadProgress(p) {
      setUploadProgress(p)
    },
    onUploadError() {
      toast({
        title: 'Upload Failed',
        description: 'Something went wrong while uploading the image.',
        variant: 'destructive',
      })
      setIsUploading(false)
    },
  })

  const {
    values,
    errors,
    getFieldProps,
    setFieldValue,
    handleSubmit,
    dirty,
    touched,
  } = useFormik<IMyProfileManipulator>({
    initialValues: {
      fullName: data?.fullName || '',
      phone: data?.phone || null,
      photo: data?.photo || null,
    },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(myProfileSchema),
    onSubmit: () => {
      editMutation()
    },
  })

  const { mutate: editMutation, isPending: editLoading } = useMutation({
    mutationFn: async () => await updateProfile(userId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
      toast({
        variant: 'success',
        title: 'Success',
        description: `${values.fullName} data successfully updated`,
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setIsUploading(true)
      startUpload(Array.from(files), { image: undefined })
    }
  }

  const tasksData = data?.assignedTasks

  return (
    <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-10 lg:pl-10"
      >
        <div className="flex items-center justify-start gap-5">
          <div className="relative">
            <Image
              src={values?.photo || '/assets/images/avatar-placeholder.png'}
              alt="avatar"
              width={80}
              height={80}
              className="rounded-full object-cover shadow-sm"
            />
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              type="button"
              className="group absolute -bottom-1 -right-1 flex size-9 cursor-pointer items-center justify-center rounded-full border border-transparent bg-white transition-all duration-300 ease-in-out hover:scale-105 hover:border-gray-300 hover:bg-white"
              onClick={() => fileInputRef.current?.click()} // Click file input
            >
              {isUploading ? (
                <Loader2 className="size-5 animate-spin text-gray-500" />
              ) : (
                <PencilIcon
                  size={15}
                  className="text-neutral-500 transition-shadow duration-300 group-hover:shadow-sm"
                />
              )}
            </Button>
          </div>
          <span className="text-2xl font-bold italic">{values?.fullName}</span>
        </div>
        {isUploading && (
          <div className="mt-2 w-full">
            <Progress value={uploadProgress} className="h-2 bg-gray-300" />
          </div>
        )}

        <div className="flex h-fit w-full flex-col items-start justify-start gap-6 rounded-[2.5rem] bg-white backdrop-blur-[1.25rem]">
          <div className="flex w-full items-center justify-between gap-3 border-b border-gray-200 px-6 py-7">
            <h4 className="text-xl font-medium">Personal Details</h4>
            {isEdit ? (
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  className="rounded-full bg-white px-5 py-2 text-gray-500 hover:bg-white"
                  onClick={() => setIsEdit(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!dirty || editLoading}
                  className="rounded-full bg-primary px-5 py-2 text-white"
                >
                  Save
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                className="gap-1 rounded-full bg-primary px-3 py-2 text-white"
                onClick={() => setIsEdit(true)}
              >
                <Pencil size={8} className="text-white" />
                Edit
              </Button>
            )}
          </div>
          <div className="grid w-full grid-cols-1 gap-6 px-6 py-7 xl:grid-cols-2">
            {isEdit ? (
              <LabeledInput
                label={'Full Name'}
                placeholder={'Enter full name'}
                {...getFieldProps('fullName')}
                error={
                  touched.fullName && errors.fullName ? errors.fullName : ''
                }
              />
            ) : (
              <div className="flex flex-col gap-1">
                <h5 className="font-medium text-zinc-400">Full Name</h5>
                <span className="text-sm">{values?.fullName}</span>
              </div>
            )}
            {isEdit ? (
              <LabeledInput
                label={'Phone Number'}
                placeholder={'Enter phone number'}
                {...getFieldProps('phone')}
                error={touched.phone && errors.phone ? errors.phone : ''}
              />
            ) : (
              <div className="flex flex-col gap-1">
                <h5 className="font-medium text-zinc-400">Phone Number</h5>
                <span className="text-sm">{values?.phone ?? '-'}</span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <h5 className="font-medium text-zinc-400">Email Address</h5>
              <span className="text-sm">{data?.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h5 className="font-medium text-zinc-400">Role</h5>
              <span className="text-sm">{data?.role}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h5 className="font-medium text-zinc-400">Department Name</h5>
              <span className="text-sm">{data?.department?.name ?? '-'}</span>
            </div>
          </div>
        </div>
      </form>
      <div className="flex h-fit w-full flex-col items-center justify-center gap-6 rounded-[2.5rem] bg-white backdrop-blur-[1.25rem] lg:mt-20">
        <div className="flex flex-col items-start self-stretch">
          <div className="flex w-full items-center justify-between gap-3 border-b border-gray-200 px-7 py-[34px]">
            <h4 className="text-xl font-medium">Your Tasks </h4>
          </div>

          {tasksData?.length === 0 && (
            <div className="flex h-[14.5625rem] w-full flex-col items-center justify-center gap-6 rounded-[2.5rem] p-[1.875rem] backdrop-blur-[1.25rem]">
              <EmptyDataComponent
                icon={<ListChecks className="size-12 text-neutral-400" />}
                title="No tasks for today"
              />
            </div>
          )}
          <div className="remove-scrollbar flex w-full items-center justify-start gap-2 overflow-y-hidden overflow-x-scroll p-7 lg:grid lg:grid-cols-1 lg:gap-4 xl:grid-cols-2">
            {tasksData &&
              tasksData.length > 0 &&
              tasksData.map((item, index) => (
                <TasksCard
                  key={index}
                  comment={item.comment ?? ''}
                  dueDate={item.dueDate}
                  priority={item.priority}
                  status={item.status}
                  taskName={item?.KPI?.name ?? ''}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
