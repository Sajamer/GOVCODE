/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */

import { FC } from 'react'
import DOMPurify from 'dompurify'

interface ISafeHtmlContentProps {
  htmlContent: string
}

const SafeHtmlContent: FC<ISafeHtmlContentProps> = ({ htmlContent }) => {
  const createSanitizedMarkup = () => {
    return { __html: DOMPurify.sanitize(htmlContent) }
  }

  return <div dangerouslySetInnerHTML={createSanitizedMarkup()} />
}

export default SafeHtmlContent
